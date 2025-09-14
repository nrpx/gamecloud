'use client'

import React, { useState } from 'react'
import { 
  Box, Button, Container, Flex, HStack, Input, 
  Link, Text, Heading
} from '@chakra-ui/react'
import { 
  MenuRoot, MenuTrigger, MenuContent, MenuItem 
} from '@chakra-ui/react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { Icon } from './Icon'

interface AppHeaderProps {
  title?: string
  onSearch?: (query: string) => void
  showSearch?: boolean
  children?: React.ReactNode
}

export const AppHeader: React.FC<AppHeaderProps> = ({ 
  title,
  onSearch = () => {},
  showSearch = false,
  children 
}) => {
  const { data: session } = useSession()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const { theme, setTheme, effectiveTheme } = useTheme()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const handleToggleTheme = () => {
    const newTheme = effectiveTheme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  return (
    <Box 
      as="header"
      borderBottom="1px solid"
      borderColor={{ base: "gray.200", _dark: "gray.700" }}
      bg={{ base: "white", _dark: "gray.800" }}
      position="sticky"
      top={0}
      zIndex={1000}
    >
      <Container maxW="container.xl" py={2} bg={{ base: "white", _dark: "gray.800" }}>
        <Flex maxW="7xl" mx="auto" px={6} py={4} justify="space-between" align="center">
          <HStack gap={4}>
            <Link href="/">
              <Button
                variant="ghost"
                size="md"
                color={{ base: "indigo.600", _dark: "indigo.400" }}
                fontSize="xl"
                fontWeight="bold"
                _hover={{ 
                  bg: { base: "indigo.50", _dark: "indigo.900" }
                }}
              >
                <HStack gap={2}>
                  <Icon name="gamepad" size={24} />
                  <Text>GameCloud</Text>
                </HStack>
              </Button>
            </Link>
            {title && (
              <>
                <Text color={{ base: "gray.400", _dark: "gray.500" }}>|</Text>
                <Heading size="md" color={{ base: "gray.700", _dark: "gray.300" }}>
                  {title}
                </Heading>
              </>
            )}
          </HStack>

          {showSearch && (
            <Flex flex={1} maxW="md" mx={8}>
              <form onSubmit={handleSearch} style={{ width: '100%' }}>
                <Input
                  placeholder="Поиск игр..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  bg={{ base: "white", _dark: "gray.800" }}
                  border="1px solid"
                  borderColor={{ base: "gray.300", _dark: "gray.600" }}
                  _focus={{ 
                    borderColor: { base: "indigo.500", _dark: "indigo.400" },
                    bg: { base: "white", _dark: "gray.800" },
                    boxShadow: { base: "0 0 0 1px indigo.500", _dark: "0 0 0 1px indigo.400" }
                  }}
                />
              </form>
            </Flex>
          )}

          <HStack gap={3}>
            {children}

            <HStack gap={1}>
              <Link href="/games">
                <Button
                  variant="ghost"
                  size="xs"
                  title="Библиотека игр"
                >
                  <Icon name="library" size={24} />
                </Button>
              </Link>
              
              <Link href="/torrents">
                <Button
                  variant="ghost"
                  size="xs"
                  title="Торренты"
                >
                  <Icon name="download" size={24} />
                </Button>
              </Link>
              
              <Link href="/stats">
                <Button
                  variant="ghost"
                  size="xs"
                  title="Статистика"
                >
                  <Icon name="stats" size={24} />
                </Button>
              </Link>
            </HStack>

            <Button
              variant="ghost"
              size="xs"
              title={`Переключить тему (сейчас: ${effectiveTheme === 'dark' ? 'тёмная' : 'светлая'})`}
              onClick={handleToggleTheme}
            >
              <Icon name={effectiveTheme === 'dark' ? 'light' : 'dark'} size={24} />
            </Button>

            {session && (
              <HStack gap={2}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/profile')}
                  title="Профиль"
                >
                  <Icon name="user" size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/settings')}
                  title="Настройки"
                >
                  <Icon name="settings" size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  title="Выйти"
                  color={{ base: "red.600", _dark: "red.400" }}
                  _hover={{ bg: { base: "red.50", _dark: "red.900" } }}
                >
                  <Icon name="user" size={16} />
                </Button>
              </HStack>
            )}
          </HStack>
        </Flex>
      </Container>
    </Box>
  )
}
