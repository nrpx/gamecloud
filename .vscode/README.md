# Конфигурация VS Code для GameCloud

Эта папка содержит конфигурацию VS Code для разработки и отладки приложения GameCloud.

## Файлы конфигурации

### `.vscode/tasks.json`
Определяет задачи для сборки и запуска:

- **Build Backend** - Сборка Go бэкенда
- **Run Backend** - Запуск бэкенда в режиме разработки (порт 8080)
- **Install Frontend Dependencies** - Установка зависимостей фронтенда
- **Build Frontend** - Сборка Next.js фронтенда
- **Run Frontend Dev** - Запуск фронтенда в режиме разработки (порт 3001)
- **Start Full Stack** - Запуск всего стека одновременно

### `.vscode/launch.json`
Конфигурации отладки:

- **Debug Backend** - Отладка бэкенда
- **Debug Frontend** - Отладка фронтенда
- **Launch Full Stack** - Запуск и отладка всего стека

### `.vscode/settings.json`
Настройки рабочего пространства для Go и TypeScript разработки.

## Как использовать

### Запуск через Tasks

1. Откройте палитру команд: `Ctrl+Shift+P` (Linux/Windows) или `Cmd+Shift+P` (macOS)
2. Введите "Tasks: Run Task"
3. Выберите нужную задачу:
   - "Start Full Stack" для запуска всего приложения
   - "Run Backend" для запуска только бэкенда
   - "Run Frontend Dev" для запуска только фронтенда

### Запуск через Debug

1. Откройте панель отладки: `Ctrl+Shift+D` (Linux/Windows) или `Cmd+Shift+D` (macOS)
2. Выберите конфигурацию:
   - "Launch Full Stack" - запускает и бэкенд, и фронтенд
   - "Debug Backend" - только бэкенд с возможностью отладки
   - "Debug Frontend" - только фронтенд с возможностью отладки
3. Нажмите F5 или кнопку "Start Debugging"

### Горячие клавиши

- `Ctrl+Shift+P` → "Tasks: Run Task" → "Start Full Stack" - быстрый запуск всего стека
- `F5` - запуск выбранной конфигурации отладки
- `Ctrl+F5` - запуск без отладки

## Порты

- **Backend**: http://localhost:8080
- **Frontend**: http://localhost:3001

API бэкенда доступно по адресу `http://localhost:8080/api/v1/`

## Переменные окружения

Переменные окружения настроены в задачах и конфигурациях отладки:

- `PORT=8080` для бэкенда
- `PORT=3001` для фронтенда
- `GIN_MODE=debug` для режима отладки Gin

## Устранение проблем

### Порты заняты
Если порты 8080 или 3001 заняты, можно:

1. Остановить процессы, использующие эти порты:
   ```bash
   lsof -i :8080
   lsof -i :3001
   kill <PID>
   ```

2. Или изменить порты в конфигурации:
   - В `tasks.json` измените аргументы `-p` для фронтенда
   - В `backend/internal/config/config.go` измените значение по умолчанию для бэкенда

### Проблемы с Go
Убедитесь, что Go установлен и настроен:
```bash
go version
go mod tidy
```

### Проблемы с Node.js
Убедитесь, что Node.js и npm установлены:
```bash
node --version
npm --version
npm install
```

## Рекомендуемые расширения

В файле настроек рабочего пространства указаны рекомендуемые расширения:

- **golang.go** - поддержка Go
- **ms-vscode.vscode-typescript-next** - TypeScript
- **esbenp.prettier-vscode** - форматирование кода
- **dbaeumer.vscode-eslint** - линтинг
- **bradlc.vscode-tailwindcss** - поддержка Tailwind CSS (если используется)

VS Code предложит установить эти расширения при открытии проекта.
