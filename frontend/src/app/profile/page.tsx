'use client'

import { useSession } from 'next-auth/react'
import { 
  Box, 
  Flex, 
  Heading, 
  Text, 
  Button, 
  VStack,
  HStack,
  Badge,
  Spinner
} from '@chakra-ui/react'
import Link from 'next/link'

export default function ProfilePage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
        <VStack gap={4}>
          <Spinner size="xl" />
          <Text>Загрузка профиля...</Text>
        </VStack>
      </Box>
    )
  }

  if (!session) {
    return (
      <Box maxW="md" mx="auto" mt={8} p={6} textAlign="center">
        <Text>Вы не авторизованы. Пожалуйста, войдите в систему.</Text>
      </Box>
    )
  }

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box bg="white" shadow="sm" borderBottom="1px" borderColor="gray.200">
        <Flex maxW="7xl" mx="auto" px={6} py={4} justify="space-between" align="center">
          <HStack gap={4}>
            <Link href="/">
              <Button variant="ghost" size="sm">
                ← Назад к главной
              </Button>
            </Link>
            <Heading size="lg" color="blue.600">
              Профиль пользователя
            </Heading>
          </HStack>
        </Flex>
      </Box>

      {/* Profile Content */}
      <Box maxW="4xl" mx="auto" px={6} py={8}>
        <VStack gap={8} align="stretch">
          {/* User Info Card */}
          <Box p={8} bg="white" borderRadius="lg" shadow="sm">
            <VStack gap={6} align="center">
              <Box
                w="120px"
                h="120px"
                borderRadius="full"
                bg="blue.500"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                fontSize="48px"
                fontWeight="bold"
              >
                {session.user?.name?.charAt(0) || session.user.username?.charAt(0)}
              </Box>
              
              <VStack gap={2} textAlign="center">
                <Heading size="xl">{session.user?.name}</Heading>
                <Text fontSize="lg" color="gray.600">@{session.user.username}</Text>
                <Badge colorScheme="green" size="lg" px={3} py={1}>
                  {session.user.role}
                </Badge>
              </VStack>
            </VStack>
          </Box>

          {/* Profile Details */}
          <Box p={6} bg="white" borderRadius="lg" shadow="sm">
            <Heading size="lg" mb={6}>Информация о профиле</Heading>
            <VStack gap={4} align="stretch">
              <HStack justify="space-between">
                <Text fontWeight="bold">ID пользователя:</Text>
                <Text fontFamily="mono" bg="gray.100" px={2} py={1} borderRadius="md">
                  {session.user?.id}
                </Text>
              </HStack>
              
              <Box h="1px" bg="gray.200" />
              
              <HStack justify="space-between">
                <Text fontWeight="bold">Имя:</Text>
                <Text>{session.user?.name}</Text>
              </HStack>
              
              <Box h="1px" bg="gray.200" />
              
              <HStack justify="space-between">
                <Text fontWeight="bold">Имя пользователя:</Text>
                <Text>@{session.user.username}</Text>
              </HStack>
              
              <Box h="1px" bg="gray.200" />
              
              <HStack justify="space-between">
                <Text fontWeight="bold">Email:</Text>
                <Text>{session.user?.email}</Text>
              </HStack>
              
              <Box h="1px" bg="gray.200" />
              
              <HStack justify="space-between">
                <Text fontWeight="bold">Роль:</Text>
                <Badge colorScheme="green">{session.user.role}</Badge>
              </HStack>
            </VStack>
          </Box>

          {/* Profile Actions */}
          <Box p={6} bg="white" borderRadius="lg" shadow="sm">
            <Heading size="lg" mb={6}>Действия профиля</Heading>
            <VStack gap={4} align="stretch">
              <Button colorScheme="blue" size="lg">
                Редактировать профиль
              </Button>
              <Button variant="outline" size="lg">
                Изменить пароль
              </Button>
              <Button variant="outline" size="lg">
                Настройки уведомлений
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Box>
    </Box>
  )
}
