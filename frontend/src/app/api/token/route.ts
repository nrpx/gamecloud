import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import jwt from 'jsonwebtoken'

// Получение JWT токена для бэкенда
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Создаем JWT токен для бэкенда
    const token = jwt.sign(
      {
        user_id: session.user.id,
        username: session.user.username,
        email: session.user.email,
        role: session.user.role,
      },
      process.env.AUTH_SECRET || (() => {
        console.warn('⚠️ AUTH_SECRET не установлен! Используется небезопасный fallback.')
        return 'unsafe-fallback-secret-change-in-production'
      })(),
      {
        expiresIn: '1h',
        issuer: 'gamecloud-frontend',
        audience: 'gamecloud-backend',
      }
    )

    return NextResponse.json({ 
      token,
      user: {
        id: session.user.id,
        username: session.user.username,
        email: session.user.email,
        role: session.user.role,
      }
    })
  } catch (error) {
    console.error('Token generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
