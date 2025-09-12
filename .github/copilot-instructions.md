<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# GameCloud - Game Library Management System

## Architecture Overview

### Technology Stack
- **Frontend**: Next.js 15.5.3 + NextAuth.js v5 + Chakra UI v3 + TypeScript + Zustand
- **Backend**: Golang with Gin framework + SQLite
- **Database**: 
  - Frontend: SQLite with Prisma ORM (user management & authentication)
  - Backend: SQLite (game library & business logic)
- **Package Manager**: Yarn (switched from npm)

### Responsibilities Split
- **Next.js Frontend**: User authentication, session management, user profiles
- **Golang Backend**: Game library management, torrent processing, business logic, authorization

## Development Guidelines

### Package Management
- **Always use `yarn` instead of `npm`**
- Frontend dependencies: `cd frontend && yarn add <package>`
- Install global tools: `yarn global add <package>`

### Frontend Development (Next.js)
- **Authentication**: NextAuth.js v5 with custom basePath `/auth/api`
- **Database**: Prisma with SQLite for user management
- **API Routes**: 
  - NextAuth: `/auth/api/*` (authentication)
  - App API: `/api/*` (proxied to Golang backend)
  - Token API: `/api/token` (JWT for backend authorization)

### Backend Development (Golang)
- **Authentication**: JWT tokens from frontend
- **API Prefix**: `/api/v1/`
- **No user management** - only authorization based on JWT tokens

### Key Commands
```bash
# Frontend
cd frontend
yarn install          # Install dependencies
yarn dev              # Start development server (port 3001)
yarn build            # Build for production
yarn db:push          # Push Prisma schema to database
yarn db:seed          # Create initial users (admin/admin, user/user123)
yarn db:studio        # Open Prisma Studio

# Backend  
cd backend
go mod tidy           # Install dependencies
go run main.go        # Start development server (port 8080)
```

### Authentication Flow
1. User logs in via NextAuth.js on frontend
2. Frontend generates JWT token with user info
3. Frontend sends JWT to backend for API requests
4. Backend validates JWT and authorizes actions based on user role

### Environment Variables
- Frontend: `.env.local` with AUTH_SECRET, AUTH_URL
- Backend: Standard Go environment variables

## Project Status
- [x] Verify copilot-instructions.md created
- [x] Clarify Project Requirements (Game library with authentication split)
- [x] Scaffold the Project (Golang backend + Next.js frontend)
- [x] Customize the Project (NextAuth.js v5 + Prisma + JWT integration)
- [x] Compile the Project (Both frontend and backend building successfully)
- [x] Authentication System (Working with database-backed users)
- [ ] Backend JWT Authorization Implementation
- [ ] Game Library API Integration
- [ ] Complete Documentation
