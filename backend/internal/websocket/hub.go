package websocket

import (
	"encoding/json"
	"gamecloud/internal/torrent"
	"log"
	"net/http"
	"sync"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/golang-jwt/jwt/v4"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// Разрешаем подключения с localhost и нашего домена
		return true // В production нужно настроить более строгую проверку
	},
}

// Client представляет WebSocket клиента
type Client struct {
	conn   *websocket.Conn
	send   chan []byte
	userID string
	hub    *Hub
	mu     sync.Mutex
}

// Hub управляет WebSocket соединениями
type Hub struct {
	clients     map[*Client]bool
	broadcast   chan []byte
	register    chan *Client
	unregister  chan *Client
	userClients map[string][]*Client // группировка клиентов по пользователям
	jwtSecret   string               // JWT secret для валидации токенов
	mu          sync.RWMutex
}

// ProgressMessage представляет сообщение о прогрессе
type ProgressMessage struct {
	Type string                   `json:"type"`
	Data torrent.ProgressUpdate  `json:"data"`
}

// NewHub создаёт новый WebSocket hub
func NewHub(jwtSecret string) *Hub {
	return &Hub{
		clients:     make(map[*Client]bool),
		broadcast:   make(chan []byte),
		register:    make(chan *Client),
		unregister:  make(chan *Client),
		userClients: make(map[string][]*Client),
		jwtSecret:   jwtSecret,
	}
}

// validateJWTToken валидирует JWT токен и возвращает user_id
func validateJWTToken(tokenString, jwtSecret string) (string, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(jwtSecret), nil
	})

	if err != nil {
		return "", err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		if userID, exists := claims["user_id"]; exists {
			if userIDStr, ok := userID.(string); ok {
				return userIDStr, nil
			}
		}
		return "", fmt.Errorf("user_id not found in token")
	}

	return "", fmt.Errorf("invalid token")
}

// Run запускает главный цикл hub'а
func (h *Hub) Run() {
	log.Println("Starting WebSocket Hub")
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			
			// Добавляем клиента в группу пользователя
			if h.userClients[client.userID] == nil {
				h.userClients[client.userID] = make([]*Client, 0)
			}
			h.userClients[client.userID] = append(h.userClients[client.userID], client)
			
			h.mu.Unlock()
			
			log.Printf("Client connected for user: %s", client.userID)

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
				
				// Удаляем клиента из группы пользователя
				if clients, exists := h.userClients[client.userID]; exists {
					for i, c := range clients {
						if c == client {
							h.userClients[client.userID] = append(clients[:i], clients[i+1:]...)
							break
						}
					}
					// Если больше нет клиентов для этого пользователя, удаляем запись
					if len(h.userClients[client.userID]) == 0 {
						delete(h.userClients, client.userID)
					}
				}
			}
			h.mu.Unlock()
			
			log.Printf("Client disconnected for user: %s", client.userID)

		case message := <-h.broadcast:
			h.mu.RLock()
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
			h.mu.RUnlock()
		}
	}
}

// BroadcastProgress отправляет обновление прогресса конкретному пользователю
func (h *Hub) BroadcastProgress(userID string, progress torrent.ProgressUpdate) {
	message := ProgressMessage{
		Type: "download_progress",
		Data: progress,
	}
	
	data, err := json.Marshal(message)
	if err != nil {
		log.Printf("Error marshaling progress message: %v", err)
		return
	}
	
	h.mu.RLock()
	clients := h.userClients[userID]
	h.mu.RUnlock()
	
	for _, client := range clients {
		select {
		case client.send <- data:
		default:
			// Клиент не готов принимать сообщения
		}
	}
}

// HandleWebSocket обрабатывает WebSocket подключения
func (h *Hub) HandleWebSocket(c *gin.Context) {
	log.Printf("WebSocket: Connection attempt from %s", c.ClientIP())
	
	// Пытаемся получить user_id из контекста (если JWT middleware уже обработал)
	userIDVal, exists := c.Get("user_id")
	if !exists {
		// Если нет в контексте, пытаемся извлечь из параметров запроса
		token := c.Query("token")
		if token == "" {
			log.Printf("WebSocket: No token provided")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "No token provided"})
			return
		}
		
		log.Printf("WebSocket: Validating token: %s...", token[:20])
		
		// Валидируем JWT токен
		userID, err := validateJWTToken(token, h.jwtSecret)
		if err != nil {
			log.Printf("WebSocket authentication failed: %v", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}
		
		log.Printf("WebSocket: Token validated for user: %s", userID)
		c.Set("user_id", userID)
		userIDVal = userID
	}
	
	userID := userIDVal.(string)
	log.Printf("WebSocket: Upgrading connection for user: %s", userID)
	
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Failed to upgrade WebSocket connection: %v", err)
		return
	}
	
	log.Printf("WebSocket: Successfully upgraded connection for user: %s", userID)
	
	client := &Client{
		conn:   conn,
		send:   make(chan []byte, 256),
		userID: userID,
		hub:    h,
	}
	
	client.hub.register <- client
	log.Printf("WebSocket: Registered client for user: %s", userID)
	
	// Запускаем горутины для чтения и записи
	go client.writePump()
	go client.readPump()
}

// readPump обрабатывает сообщения от клиента
func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()
	
	// Настраиваем лимиты
	c.conn.SetReadLimit(512)
	
	for {
		_, _, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}
	}
}

// writePump отправляет сообщения клиенту
func (c *Client) writePump() {
	defer c.conn.Close()
	
	for {
		select {
		case message, ok := <-c.send:
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			
			c.mu.Lock()
			err := c.conn.WriteMessage(websocket.TextMessage, message)
			c.mu.Unlock()
			
			if err != nil {
				log.Printf("WebSocket write error: %v", err)
				return
			}
		}
	}
}