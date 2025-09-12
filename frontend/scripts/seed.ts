import { prisma } from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('🌱 Создаем начальных пользователей...')

  // Создаем админа
  const adminPassword = await bcrypt.hash('admin', 12)
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      name: 'Administrator',
      email: 'admin@gamecloud.local',
      password: adminPassword,
      role: 'admin',
    },
  })

  // Создаем обычного пользователя
  const userPassword = await bcrypt.hash('user123', 12)
  const user = await prisma.user.upsert({
    where: { username: 'user' },
    update: {},
    create: {
      username: 'user',
      name: 'Regular User',
      email: 'user@gamecloud.local',
      password: userPassword,
      role: 'user',
    },
  })

  console.log('✅ Пользователи созданы:')
  console.log('   Admin: admin/admin')
  console.log('   User: user/user123')
  console.log({ admin: admin.username, user: user.username })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
