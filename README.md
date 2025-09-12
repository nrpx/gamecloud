# GameCloud - Веб-приложение для управления библиотекой игр

GameCloud - это веб-приложение для управления библиотекой компьютерных игр с возможностью скачивания через торренты.

## Архитектура

- **Backend**: Go (Gin framework) на порту 8080
- **Frontend**: Next.js (React) на порту 3000
- **База данных**: SQLite
- **Торрент-клиент**: Встроенный Go торрент-клиент

## Требования

- Go 1.21+
- Node.js 18+
- npm или yarn

## Быстрый старт

### 1. Установка зависимостей

#### Backend
```bash
cd backend
go mod tidy
```

#### Frontend
```bash
cd frontend
npm install
```

### 2. Запуск через VS Code

Откройте проект в VS Code и используйте одну из конфигураций запуска:

1. **Запуск всего стека**: `Ctrl+Shift+P` → "Tasks: Run Task" → "Start Full Stack"
2. **Запуск только бэкенда**: `Ctrl+Shift+P` → "Tasks: Run Task" → "Run Backend"
3. **Запуск только фронтенда**: `Ctrl+Shift+P` → "Tasks: Run Task" → "Run Frontend Dev"

Или используйте панель отладки:
- **Launch Full Stack**: Запускает и бэкенд, и фронтенд одновременно
- **Debug Backend**: Запускает только бэкенд с отладкой
- **Debug Frontend**: Запускает только фронтенд с отладкой

### 3. Ручной запуск

#### Backend
```bash
cd backend
go run main.go
```

Backend будет доступен на http://localhost:8080

#### Frontend
```bash
cd frontend
npm run dev
```

Frontend будет доступен на http://localhost:3000

## 🔒 Настройка безопасности

### Переменные окружения

**ВАЖНО**: Перед запуском скопируйте и настройте переменные окружения:

```bash
# Backend
cp backend/.env.example backend/.env
# Отредактируйте backend/.env - замените AUTH_SECRET на случайную строку

# Frontend  
cp frontend/.env.example frontend/.env.local
# Отредактируйте frontend/.env.local - используйте тот же AUTH_SECRET
```

### Генерация секретного ключа

Используйте команду для генерации безопасного AUTH_SECRET:

```bash
# Linux/macOS
openssl rand -base64 32

# Windows (PowerShell)
[System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Безопасность в production

- ✅ Замените демо-пароли в `frontend/auth.ts`
- ✅ Используйте HTTPS
- ✅ Настройте правильную базу данных (не SQLite)
- ✅ Используйте реальную систему аутентификации
- ✅ Настройте CORS правильно
- ✅ Добавьте rate limiting
- ✅ Используйте reverse proxy (nginx)
- ✅ Настройте MCP: скопируйте `.vscode/mcp.json.example` в `.vscode/mcp.json` и добавьте свой API ключ

## API Endpoints

### Игры
- `GET /api/games` - Получить список игр
- `POST /api/games` - Добавить новую игру
- `GET /api/games/:id` - Получить игру по ID
- `PUT /api/games/:id` - Обновить игру
- `DELETE /api/games/:id` - Удалить игру

### Загрузки
- `GET /api/downloads` - Получить список загрузок
- `POST /api/downloads` - Начать новую загрузку
- `GET /api/downloads/:id` - Получить статус загрузки
- `POST /api/downloads/:id/pause` - Приостановить загрузку
- `POST /api/downloads/:id/resume` - Возобновить загрузку
- `POST /api/downloads/:id/cancel` - Отменить загрузку

### Поиск
- `GET /api/search?q=query` - Поиск игр

### Аутентификация
- `POST /api/auth/login` - Войти в систему
- `POST /api/auth/register` - Зарегистрироваться
- `POST /api/auth/logout` - Выйти из системы

## Структура проекта

```
gamecloud/
├── backend/                 # Go backend
│   ├── internal/
│   │   ├── api/            # API handlers
│   │   ├── config/         # Configuration
│   │   ├── database/       # Database setup
│   │   ├── download/       # Download manager
│   │   ├── models/         # Data models
│   │   └── torrent/        # Torrent client
│   ├── main.go             # Entry point
│   └── go.mod              # Go dependencies
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # Next.js app router
│   │   ├── components/    # React components
│   │   ├── stores/        # Zustand stores
│   │   └── types/         # TypeScript types
│   ├── package.json       # Node dependencies
│   └── next.config.js     # Next.js config
└── .vscode/               # VS Code configuration
    ├── launch.json        # Debug configurations
    ├── tasks.json         # Build tasks
    └── settings.json      # Workspace settings
```

## Переменные окружения

### Backend
- `PORT` - Порт сервера (по умолчанию: 8080)
- `DATABASE_PATH` - Путь к файлу базы данных (по умолчанию: ./gamecloud.db)
- `DOWNLOAD_DIR` - Папка для загрузок (по умолчанию: ./downloads)
- `JWT_SECRET` - Секретный ключ для JWT токенов
- `GIN_MODE` - Режим Gin (debug/release)

### Frontend
- `PORT` - Порт фронтенда (по умолчанию: 3000)
- `NEXT_PUBLIC_API_URL` - URL API бэкенда (по умолчанию: http://localhost:8080)

## Разработка

### Горячая перезагрузка
- Backend: Используйте `air` для горячей перезагрузки Go кода
- Frontend: Next.js автоматически перезагружает изменения

### Отладка
Используйте конфигурации VS Code для отладки с точками останова.

### Линтинг
```bash
# Backend
cd backend
go fmt ./...
go vet ./...

# Frontend
cd frontend
npm run lint
```

## Сборка для продакшна

### Backend
```bash
cd backend
go build -o gamecloud main.go
```

### Frontend
```bash
cd frontend
npm run build
npm run start
```

## Особенности

- 🎮 Управление библиотекой игр
- 📥 Интеграция торрент-клиента для скачивания игр
- 🔄 Фоновая обработка очереди загрузок
- 🔍 Поиск игр с интеграцией внешних сервисов
- 📊 Отслеживание состояния загрузки
- 🎨 Современный интерфейс с ChakraUI
- 🔐 Аутентификация пользователей

## Технологии

### Бэкенд
- **Golang** - основной язык программирования
- **Gin** - веб-фреймворк
- **GORM** - ORM для работы с базой данных
- **SQLite** - база данных
- **anacrolix/torrent** - торрент-клиент
- **JWT** - аутентификация

### Фронтенд
- **Next.js 15** - React фреймворк
- **TypeScript** - типизированный JavaScript
- **ChakraUI v3** - CSS фреймворк
- **NextAuth** - аутентификация
- **Zustand** - управление состоянием
- **Axios** - HTTP клиент

## Структура проекта

```
gamecloud/
├── backend/                    # Golang API сервер
│   ├── main.go                # Точка входа
│   ├── go.mod                 # Go модули
│   └── internal/              # Внутренние пакеты
│       ├── api/               # API роуты и обработчики
│       ├── config/            # Конфигурация
│       ├── database/          # Работа с БД
│       ├── download/          # Менеджер загрузок
│       ├── models/            # Модели данных
│       └── torrent/           # Торрент клиент
└── frontend/                  # Next.js приложение
    ├── src/                   # Исходный код
    │   ├── app/               # App Router страницы
    │   ├── stores/            # Zustand стейт
    │   └── types/             # TypeScript типы
    ├── package.json           # Node.js зависимости
    └── next.config.js         # Next.js конфигурация
```

## Установка и запуск

### Требования
- Go 1.21+
- Node.js 18+
- npm или yarn

### Запуск бэкенда

```bash
cd backend
go mod tidy
go run main.go
```

Сервер запустится на порту 8080.

### Запуск фронтенда

```bash
cd frontend
npm install
npm run dev
```

Приложение будет доступно на http://localhost:3000

### Переменные окружения

Создайте файл `.env` в корне проекта:

```bash
# Backend
PORT=8080
DATABASE_PATH=./gamecloud.db
DOWNLOAD_DIR=./downloads
JWT_SECRET=your-secret-key

# Frontend
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

## API Endpoints

### Игры
- `GET /api/v1/games` - Получить все игры
- `GET /api/v1/games/:id` - Получить игру по ID
- `POST /api/v1/games` - Создать новую игру
- `PUT /api/v1/games/:id` - Обновить игру
- `DELETE /api/v1/games/:id` - Удалить игру

### Загрузки
- `GET /api/v1/downloads` - Получить все загрузки
- `GET /api/v1/downloads/:id` - Получить загрузку по ID
- `POST /api/v1/downloads` - Создать новую загрузку
- `PUT /api/v1/downloads/:id/pause` - Приостановить загрузку
- `PUT /api/v1/downloads/:id/resume` - Возобновить загрузку
- `DELETE /api/v1/downloads/:id` - Отменить загрузку

### Поиск
- `GET /api/v1/search/games?q=query` - Поиск игр

### Аутентификация
- `POST /api/v1/auth/login` - Вход в систему
- `POST /api/v1/auth/register` - Регистрация
- `POST /api/v1/auth/logout` - Выход из системы

## Разработка

### Планы развития

1. **Интеграция с игровыми API**
   - Steam API для метаданных игр
   - IGDB для обложек и скриншотов
   - Интеграция с сервисами типа Sonarr/Radarr для автоматического поиска

2. **Улучшения торрент-клиента**
   - Настройка лимитов скорости
   - Поддержка DHT и PEX
   - Статистика пиров и сидов

3. **Пользовательский интерфейс**
   - Темная тема
   - Мобильная адаптация
   - Продвинутые фильтры и сортировка

4. **Безопасность**
   - Полноценная JWT аутентификация
   - Роли и права доступа
   - Rate limiting

5. **Мониторинг**
   - Логирование
   - Метрики производительности
   - Уведомления

## Лицензия

MIT License
