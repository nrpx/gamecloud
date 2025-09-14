import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';

interface ProgressUpdate {
  id: string;
  info_hash: string;
  name: string;
  size: number;
  downloaded: number;
  download_rate: number;
  upload_rate: number;
  progress: number;
  status: string;
  eta: number;
  peers: number;
  seeds: number;
  updated_at: string;
}

interface ProgressMessage {
  type: string;
  data: ProgressUpdate;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [progressUpdates, setProgressUpdates] = useState<Map<string, ProgressUpdate>>(new Map());
  const { data: session } = useSession();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const getToken = async () => {
    try {
      const response = await fetch('/api/token');
      if (response.ok) {
        const data = await response.json();
        return data.token;
      }
    } catch (error) {
      console.error('Failed to get token:', error);
    }
    return null;
  };

  const connect = async () => {
    if (!session) {
      console.log('WebSocket: No session available');
      return;
    }

    try {
      // Получаем JWT токен
      const token = await getToken();
      if (!token) {
        console.log('WebSocket: No token available');
        return;
      }

      // Закрываем существующее соединение если есть
      if (wsRef.current) {
        wsRef.current.close();
      }

      const wsUrl = `ws://localhost:8080/api/v1/ws?token=${token}`;
      console.log('WebSocket: Connecting to', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket: Connected successfully');
        setIsConnected(true);
        setLastError(null);
      };

      ws.onmessage = (event) => {
        try {
          const message: ProgressMessage = JSON.parse(event.data);
          console.log('WebSocket: Received message', message);
          
          if (message.type === 'download_progress') {
            setProgressUpdates(prev => {
              const newMap = new Map(prev);
              newMap.set(message.data.id, message.data);
              return newMap;
            });
          }
        } catch (error) {
          console.error('WebSocket: Failed to parse message', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket: Error occurred', error);
        setLastError('WebSocket connection error');
      };

      ws.onclose = (event) => {
        console.log('WebSocket: Connection closed', event.code, event.reason);
        setIsConnected(false);
        wsRef.current = null;

        // Автоматическое переподключение если соединение было закрыто неожиданно
        if (event.code !== 1000 && session) {
          console.log('WebSocket: Attempting to reconnect in 3 seconds...');
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 3000);
        }
      };

    } catch (error) {
      console.error('WebSocket: Failed to connect', error);
      setLastError('Failed to establish WebSocket connection');
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Disconnecting manually');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setProgressUpdates(new Map());
  };

  useEffect(() => {
    if (session) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [session]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    progressUpdates,
    lastError,
    connect,
    disconnect,
  };
}