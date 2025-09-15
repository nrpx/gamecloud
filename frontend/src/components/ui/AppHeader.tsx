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
import { ColorModeButton } from './color-mode'
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <Box 
      as="header"
      borderBottom="1px solid"
      borderColor="border"
      bg="bg.surface"
      position="sticky"
      top={0}
      zIndex={1000}
    >
      <Container maxW="container.xl" py={2} bg="bg.surface">
        <Flex maxW="7xl" mx="auto" px={6} py={4} justify="space-between" align="center">
          <HStack gap={4}>
            <Link href="/">
              <Button
                variant="ghost"
                size="md"
                color="gamecloud.primary"
                fontSize="xl"
                fontWeight="bold"
                _hover={{ 
                  bg: "bg.muted"
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
                <Text color="border.emphasized">|</Text>
                <Heading size="md" color="fg">
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
                  bg="bg"
                  border="1px solid"
                  borderColor="border"
                  _focus={{ 
                    borderColor: "gamecloud.primary",
                    bg: "bg",
                    boxShadow: "0 0 0 1px var(--chakra-colors-gamecloud-primary)"
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

            <ColorModeButton size="xs" />

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
                  color="red.solid"
                  _hover={{ bg: "red.subtle" }}
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
