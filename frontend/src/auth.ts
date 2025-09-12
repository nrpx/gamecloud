import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log("🔐 Попытка авторизации:", credentials?.username)
        
        if (!credentials?.username || !credentials?.password) {
          console.log("❌ Отсутствуют учетные данные")
          return null
        }

        try {
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { username: credentials.username },
                { email: credentials.username }
              ]
            }
          })

          console.log("👤 Найден пользователь:", user ? user.username : "не найден")

          if (!user || !user.password) {
            console.log("❌ Пользователь не найден или нет пароля")
            return null
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password as string, 
            user.password
          )

          console.log("🔑 Проверка пароля:", isValidPassword)

          if (!isValidPassword) {
            console.log("❌ Неверный пароль")
            return null
          }

          console.log("✅ Успешная авторизация:", user.username)
          return {
            id: user.id,
            name: user.name || user.username || 'User',
            email: user.email,
            username: user.username,
            role: user.role,
          }
        } catch (error) {
          console.error('🔥 Ошибка авторизации:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
})
