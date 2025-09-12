'use client'

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import Link from 'next/link'
import { 
  Box, 
  Flex, 
  Heading, 
  Text, 
  Button, 
  VStack,
  HStack,
  Badge,
  Spinner,
  Input
} from '@chakra-ui/react'
import { formatFileSize, formatSpeed, formatETA } from '@/lib/api'
import {
  useTorrentsLoading,
  useTorrentsData,
  useTorrentsInitialized,
  useTorrentsError,
  useFetchDownloads,
  useRefreshDownloads,
  usePauseDownload,
  useResumeDownload,
  useCancelDownload,
  useClearDownloads
} from '@/stores/torrentsStore'

export default function TorrentsPage() {
  const { data: session, status } = useSession()
  
  // Используем Zustand hooks
  const downloads = useTorrentsData()
  const isLoading = useTorrentsLoading()
  const isInitialized = useTorrentsInitialized()
  const error = useTorrentsError()
  const fetchDownloads = useFetchDownloads()
  const refreshDownloads = useRefreshDownloads()
  const pauseDownload = usePauseDownload()
  const resumeDownload = useResumeDownload()
  const cancelDownload = useCancelDownload()
  const clearDownloads = useClearDownloads()

  // Единственный useEffect для инициализации/очистки данных при изменении сессии
  useEffect(() => {
    console.log('🌐 [TorrentsPage] Session status changed:', {
      status,
      hasUser: !!session?.user,
      username: session?.user?.username
    })
    
    if (session?.user && status === 'authenticated') {
      console.log('✅ [TorrentsPage] User authenticated, loading downloads...')
      fetchDownloads()
    } else if (status === 'unauthenticated') {
      console.log('❌ [TorrentsPage] User unauthenticated, clearing downloads...')
      clearDownloads()
    }
  }, [session, status, fetchDownloads, clearDownloads])

  const handleAction = async (downloadId: string, action: 'pause' | 'resume' | 'cancel') => {
    try {
      switch (action) {
        case 'pause':
          await pauseDownload(downloadId)
          break
        case 'resume':
          await resumeDownload(downloadId)
          break
        case 'cancel':
          await cancelDownload(downloadId)
          break
      }
    } catch (error) {
      console.error(`Ошибка выполнения действия ${action}:`, error)
      alert(`Ошибка: ${error}`)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'downloading': return 'blue'
      case 'seeding': return 'green'
      case 'completed': return 'green'
      case 'paused': return 'orange'
      case 'error': return 'red'
      default: return 'gray'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'downloading': return 'Загружается'
      case 'seeding': return 'Раздается'
      case 'completed': return 'Завершено'
      case 'paused': return 'Пауза'
      case 'error': return 'Ошибка'
      default: return 'Неизвестно'
    }
  }

  if (status === 'loading') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
        <VStack gap={4}>
          <Spinner size="xl" />
          <Text>Загрузка...</Text>
        </VStack>
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
                ← Главная
              </Button>
            </Link>
            <Heading size="lg" color="blue.600">
              🌐 Торрент-менеджер
            </Heading>
          </HStack>
          <HStack gap={4}>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => refreshDownloads()}
              loading={isLoading}
              disabled={isLoading}
            >
              🔄 Обновить
            </Button>
            <Button colorScheme="green" size="sm">
              ⏵ Запустить все
            </Button>
            <Button colorScheme="orange" size="sm">
              ⏸ Пауза все
            </Button>
            <Badge colorScheme="green">{session?.user.role}</Badge>
            <Text fontSize="sm">@{session?.user.username}</Text>
          </HStack>
        </Flex>
      </Box>

      {/* Content */}
      <Box maxW="7xl" mx="auto" px={6} py={8}>
        <VStack gap={8} align="stretch">
          {/* Stats */}
          <HStack gap={6} wrap="wrap">
            <Box bg="white" p={4} borderRadius="lg" shadow="sm">
              <VStack gap={1}>
                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                  {downloads.filter(d => d.status === 'downloading').length}
                </Text>
                <Text fontSize="sm" color="gray.600">Загружается</Text>
              </VStack>
            </Box>
            <Box bg="white" p={4} borderRadius="lg" shadow="sm">
              <VStack gap={1}>
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  {downloads.filter(d => d.status === 'seeding' || d.status === 'completed').length}
                </Text>
                <Text fontSize="sm" color="gray.600">Раздается/Завершено</Text>
              </VStack>
            </Box>
            <Box bg="white" p={4} borderRadius="lg" shadow="sm">
              <VStack gap={1}>
                <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                  {downloads.filter(d => d.status === 'paused').length}
                </Text>
                <Text fontSize="sm" color="gray.600">Остановлено</Text>
              </VStack>
            </Box>
          </HStack>

          {/* Torrents Table */}
          <Box bg="white" borderRadius="lg" shadow="sm" overflow="hidden">
            <Box p={4} borderBottom="1px" borderColor="gray.200">
              <Heading size="md">Активные торренты</Heading>
            </Box>
            
            {!isInitialized || isLoading ? (
              <Box textAlign="center" py={12}>
                <Spinner size="xl" />
                <Text mt={4}>Загрузка торрентов...</Text>
              </Box>
            ) : error ? (
              <Box textAlign="center" py={12}>
                <Text fontSize="lg" color="red.500">⚠️ Ошибка загрузки торрентов</Text>
                <Text color="gray.500" mt={2}>{error}</Text>
                <Button mt={4} onClick={() => fetchDownloads()} size="sm" colorScheme="blue">
                  Попробовать снова
                </Button>
              </Box>
            ) : downloads.length === 0 ? (
              <Box textAlign="center" py={12}>
                <Text fontSize="lg" color="gray.500">Нет активных торрентов</Text>
                <Link href="/games/add">
                  <Button colorScheme="blue" mt={4}>
                    Добавить торрент
                  </Button>
                </Link>
              </Box>
            ) : (
              <Box overflow="auto">
                <Box as="table" w="full" borderCollapse="collapse">
                  <Box as="thead">
                    <Box as="tr">
                      <Box as="th" textAlign="left" p={3} borderBottom="1px" borderColor="gray.200" fontSize="sm" fontWeight="bold">Название</Box>
                      <Box as="th" textAlign="left" p={3} borderBottom="1px" borderColor="gray.200" fontSize="sm" fontWeight="bold">Статус</Box>
                      <Box as="th" textAlign="left" p={3} borderBottom="1px" borderColor="gray.200" fontSize="sm" fontWeight="bold">Прогресс</Box>
                      <Box as="th" textAlign="left" p={3} borderBottom="1px" borderColor="gray.200" fontSize="sm" fontWeight="bold">Скорость</Box>
                      <Box as="th" textAlign="left" p={3} borderBottom="1px" borderColor="gray.200" fontSize="sm" fontWeight="bold">Размер</Box>
                      <Box as="th" textAlign="left" p={3} borderBottom="1px" borderColor="gray.200" fontSize="sm" fontWeight="bold">S/L</Box>
                      <Box as="th" textAlign="left" p={3} borderBottom="1px" borderColor="gray.200" fontSize="sm" fontWeight="bold">Рейтинг</Box>
                      <Box as="th" textAlign="left" p={3} borderBottom="1px" borderColor="gray.200" fontSize="sm" fontWeight="bold">Действия</Box>
                    </Box>
                  </Box>
                  <Box as="tbody">
                    {downloads.map((download) => (
                      <Box as="tr" key={download.id} _hover={{ bg: 'gray.50' }}>
                        <Box as="td" p={3} borderBottom="1px" borderColor="gray.100" maxW="300px">
                          <Text css={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {download.torrent_url.split('/').pop() || `Download ${download.id}`}
                          </Text>
                        </Box>
                        <Box as="td" p={3} borderBottom="1px" borderColor="gray.100">
                          <Badge colorScheme={getStatusColor(download.status)}>
                            {getStatusText(download.status)}
                          </Badge>
                        </Box>
                        <Box as="td" p={3} borderBottom="1px" borderColor="gray.100">
                          <VStack gap={1} align="start">
                            <Text fontSize="sm">{download.progress}%</Text>
                            <Box w="100px" bg="gray.200" borderRadius="full" h={2}>
                              <Box
                                bg={getStatusColor(download.status) === 'blue' ? 'blue.500' : 'green.500'}
                                h={2}
                                borderRadius="full"
                                width={`${download.progress}%`}
                              />
                            </Box>
                          </VStack>
                        </Box>
                        <Box as="td" p={3} borderBottom="1px" borderColor="gray.100">
                          <Text fontSize="sm">{formatSpeed(download.download_speed)}</Text>
                          <Text fontSize="xs" color="gray.500">
                            ETA: {download.eta ? formatETA(download.eta) : 'Неизвестно'}
                          </Text>
                        </Box>
                        <Box as="td" p={3} borderBottom="1px" borderColor="gray.100">
                          <Text fontSize="sm">{formatFileSize(download.total_size)}</Text>
                        </Box>
                        <Box as="td" p={3} borderBottom="1px" borderColor="gray.100">
                          <Text fontSize="sm" color="green.600">{download.seeds_connected}</Text>
                          <Text fontSize="sm" color="red.600">{download.peers_connected}</Text>
                        </Box>
                        <Box as="td" p={3} borderBottom="1px" borderColor="gray.100">
                          <Text fontSize="sm" fontWeight="normal" color="orange.600">
                            {download.upload_speed > 0 ? 
                              `${(download.downloaded_size / download.total_size).toFixed(2)}` : '0.00'}
                          </Text>
                        </Box>
                        <Box as="td" p={3} borderBottom="1px" borderColor="gray.100">
                          <HStack gap={1}>
                            {download.status === 'downloading' && (
                              <Button size="xs" colorScheme="orange" 
                                      onClick={() => handleAction(download.id, 'pause')}>
                                ⏸
                              </Button>
                            )}
                            {download.status === 'paused' && (
                              <Button size="xs" colorScheme="green" 
                                      onClick={() => handleAction(download.id, 'resume')}>
                                ⏵
                              </Button>
                            )}
                            <Button size="xs" colorScheme="red" 
                                    onClick={() => handleAction(download.id, 'cancel')}>
                              🗑
                            </Button>
                          </HStack>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </VStack>
      </Box>
    </Box>
  )
}
