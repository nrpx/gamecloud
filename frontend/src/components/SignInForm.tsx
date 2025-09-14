'use client'

import { signIn } from 'next-auth/react'
import { Box, Button, Input, VStack, Text, Heading } from '@chakra-ui/react'
import { useState } from 'react'

export default function SignInForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        username,
        password,
        callbackUrl: '/',
        redirect: false
      })

      if (result?.error) {
        setError('Неверные учетные данные')
      } else if (result?.ok) {
        window.location.href = '/'
      }
    } catch (error) {
      setError('Произошла ошибка при входе')
    }
    
    setLoading(false)
  }

  return (
    <Box maxW="md" mx="auto" mt={8} p={6} borderWidth="1px" borderRadius="lg">
      <VStack gap={4}>
        <Heading size="lg">Вход в GameCloud</Heading>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <VStack gap={4}>
            <Input
              type="text"
              placeholder="Имя пользователя или email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <Text color="red.500">{error}</Text>}
            <Button
              type="submit"
              colorScheme="blue"
              width="100%"
              loading={loading}
              disabled={loading}
            >
              Войти
            </Button>
          </VStack>
        </form>
        <Text fontSize="sm" color="fg.muted">
          Тестовые данные: admin/admin или user/user123
        </Text>
      </VStack>
    </Box>
  )
}