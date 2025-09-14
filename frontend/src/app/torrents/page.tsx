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
import { useWebSocket } from '@/hooks/useWebSocket'
import { RealTimeProgress } from '@/components/RealTimeProgress'
import { AppHeader } from '@/components/ui/AppHeader'
import { Icon } from '@/components/ui/Icon'
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
  
  // WebSocket для real-time обновлений
  const { isConnected, progressUpdates, lastError } = useWebSocket()
  
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
  // Функция для объединения данных из API и WebSocket
  const getEnhancedDownload = (download: any) => {
    const wsUpdate = progressUpdates.get(download.id);
    if (wsUpdate) {
      // Приоритет WebSocket данным для real-time обновлений
      return {
        ...download,
        progress: wsUpdate.progress,
        download_speed: wsUpdate.download_rate,
        upload_speed: wsUpdate.upload_rate,
        status: wsUpdate.status,
        eta: wsUpdate.eta,
        peers_connected: wsUpdate.peers,
        seeds_connected: wsUpdate.seeds,
        downloaded_size: wsUpdate.downloaded,
        total_size: wsUpdate.size,
        name: wsUpdate.name || download.game?.title,
        // Добавляем флаг что данные real-time
        isRealTime: true,
        lastUpdate: wsUpdate.updated_at
      };
    }
    return {
      ...download,
      isRealTime: false,
      name: download.game?.title
    };
  };

  const clearDownloads = useClearDownloads()

  // Функции для форматирования данных
  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSecond: number): string => {
    if (!bytesPerSecond || bytesPerSecond === 0) return '0 B/s';
    return formatBytes(bytesPerSecond) + '/s';
  };

  const formatETA = (etaSeconds: number): string => {
    if (!etaSeconds || etaSeconds <= 0) return 'Unknown';
    if (etaSeconds === Infinity || etaSeconds > 8640000) return '∞';
    
    const hours = Math.floor(etaSeconds / 3600);
    const minutes = Math.floor((etaSeconds % 3600) / 60);
    const seconds = Math.floor(etaSeconds % 60);
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

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
    <Box minH="100vh" bg="bg.page">
      <AppHeader />
      
      {/* Content */}
      <Box maxW="7xl" mx="auto" px={4} py={4}>
        <VStack gap={8} align="stretch">
          {/* Header for Torrents page */}
          <Flex justify="space-between" align="center">
            <HStack gap={4}>
              <Heading size="lg" color="blue.600">
                <Icon name="cloud" size={28} style={{ marginRight: '8px', display: 'inline' }} />
                Торрент-менеджер
              </Heading>
              {/* WebSocket индикатор */}
              <HStack gap={2}>
                <Box 
                  w={2} 
                  h={2} 
                  borderRadius="full" 
                  bg={isConnected ? 'green.400' : 'red.400'}
                />
                <Text fontSize="sm" color={isConnected ? 'green.600' : 'red.600'}>
                  {isConnected ? 'Real-time' : 'Offline'}
                </Text>
              </HStack>
              {lastError && (
                <Text fontSize="xs" color="red.500">
                  {lastError}
                </Text>
              )}
            </HStack>
            <HStack gap={4}>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => refreshDownloads()}
                loading={isLoading}
                disabled={isLoading}
              >
                <Icon name="download" size={20} />
                <Text ml={2}>Обновить</Text>
              </Button>
              <Button colorScheme="green" size="sm">
                <Icon name="play" size={20} />
                <Text ml={2}>Запустить все</Text>
              </Button>
              <Button colorScheme="orange" size="sm">
                <Icon name="pause" size={20} />
                <Text ml={2}>Пауза все</Text>
              </Button>
            </HStack>
          </Flex>
          {/* Stats */}
          <HStack gap={4} wrap="wrap">
            <Box bg="bg.surface" p={4} borderRadius="lg" shadow="sm">
              <VStack gap={1}>
                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                  {downloads.filter(d => d.status === 'downloading').length}
                </Text>
                <Text fontSize="sm" color="fg.muted">Загружается</Text>
              </VStack>
            </Box>
            <Box bg="bg.surface" p={4} borderRadius="lg" shadow="sm">
              <VStack gap={1}>
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  {downloads.filter(d => d.status === 'seeding' || d.status === 'completed').length}
                </Text>
                <Text fontSize="sm" color="fg.muted">Раздается/Завершено</Text>
              </VStack>
            </Box>
            <Box bg="bg.surface" p={4} borderRadius="lg" shadow="sm">
              <VStack gap={1}>
                <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                  {downloads.filter(d => d.status === 'paused').length}
                </Text>
                <Text fontSize="sm" color="fg.muted">Остановлено</Text>
              </VStack>
            </Box>
          </HStack>

          {/* Torrents Table */}
          <Box bg="bg.surface" borderRadius="lg" shadow="sm" overflow="hidden">
            <Box p={4} borderBottom="1px" borderColor="border.muted">
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
                <Text color="fg.muted" mt={2}>{error}</Text>
                <Button mt={4} onClick={() => fetchDownloads()} size="sm" colorScheme="blue">
                  Попробовать снова
                </Button>
              </Box>
            ) : downloads.length === 0 ? (
              <Box textAlign="center" py={12}>
                <Text fontSize="lg" color="fg.muted">Нет активных торрентов</Text>
                <Link href="/games/add">
                  <Button colorScheme="blue" mt={4}>
                    Добавить торрент
                  </Button>
                </Link>
              </Box>
            ) : (
              <Box overflow="auto">
                <Box as="table" w="full" borderCollapse="collapse" style={{ tableLayout: 'fixed' }}>
                  <Box as="thead">
                    <Box as="tr">
                      <Box as="th" textAlign="left" p={3} borderBottom="1px" borderColor="border.muted" fontSize="sm" fontWeight="bold" w="300px">Название</Box>
                      <Box as="th" textAlign="left" p={3} borderBottom="1px" borderColor="border.muted" fontSize="sm" fontWeight="bold" w="120px">Статус</Box>
                      <Box as="th" textAlign="left" p={3} borderBottom="1px" borderColor="border.muted" fontSize="sm" fontWeight="bold" w="150px">Прогресс</Box>
                      <Box as="th" textAlign="left" p={3} borderBottom="1px" borderColor="border.muted" fontSize="sm" fontWeight="bold" w="120px">Скорость</Box>
                      <Box as="th" textAlign="left" p={3} borderBottom="1px" borderColor="border.muted" fontSize="sm" fontWeight="bold" w="100px">Размер</Box>
                      <Box as="th" textAlign="left" p={3} borderBottom="1px" borderColor="border.muted" fontSize="sm" fontWeight="bold" w="80px">S/L</Box>
                      <Box as="th" textAlign="left" p={3} borderBottom="1px" borderColor="border.muted" fontSize="sm" fontWeight="bold" w="100px">Рейтинг</Box>
                      <Box as="th" textAlign="left" p={3} borderBottom="1px" borderColor="border.muted" fontSize="sm" fontWeight="bold" w="150px">Действия</Box>
                    </Box>
                  </Box>
                  <Box as="tbody">
                    {downloads.map((download) => {
                      const enhancedDownload = getEnhancedDownload(download);
                      return (
                        <Box as="tr" key={download.id} _hover={{ bg: 'gray.50' }}>
                          <Box as="td" p={3} borderBottom="1px" borderColor="border.subtle" w="300px">
                            <VStack align="start" gap={1}>
                              <Text css={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {enhancedDownload.name || download.torrent_url.split('/').pop() || `Download ${download.id}`}
                              </Text>
                              {enhancedDownload.isRealTime && (
                                <HStack gap={1}>
                                  <Box w={2} h={2} bg="green.500" borderRadius="full" />
                                  <Text fontSize="xs" color="green.600">Real-time</Text>
                                </HStack>
                              )}
                            </VStack>
                          </Box>
                          <Box as="td" p={3} borderBottom="1px" borderColor="border.subtle" w="120px">
                            <Badge colorScheme={getStatusColor(enhancedDownload.status)}>
                              {getStatusText(enhancedDownload.status)}
                            </Badge>
                          </Box>
                          <Box as="td" p={3} borderBottom="1px" borderColor="border.subtle" w="150px">
                            <VStack gap={1} align="start">
                              <Text fontSize="sm">{enhancedDownload.progress.toFixed(1)}%</Text>
                              <Box w="100px" bg="gray.200" borderRadius="full" h={2}>
                                <Box
                                  bg={getStatusColor(enhancedDownload.status) === 'blue' ? 'blue.500' : 'green.500'}
                                  h={2}
                                  borderRadius="full"
                                  width={`${Math.min(100, Math.max(0, enhancedDownload.progress))}%`}
                                  transition="width 0.3s ease"
                                />
                              </Box>
                            </VStack>
                          </Box>
                          <Box as="td" p={3} borderBottom="1px" borderColor="border.subtle" w="120px">
                            <VStack align="start" gap={1}>
                              <Text fontSize="sm" color="blue.600">
                                ↓ {formatSpeed(enhancedDownload.download_speed)}
                              </Text>
                              <Text fontSize="sm" color="orange.600">
                                ↑ {formatSpeed(enhancedDownload.upload_speed)}
                              </Text>
                              <Text fontSize="xs" color="fg.muted">
                                ETA: {enhancedDownload.eta ? formatETA(enhancedDownload.eta) : 'Unknown'}
                              </Text>
                            </VStack>
                          </Box>
                          <Box as="td" p={3} borderBottom="1px" borderColor="border.subtle" w="100px">
                            <VStack align="start" gap={1}>
                              <Text fontSize="sm">{formatBytes(enhancedDownload.total_size)}</Text>
                              <Text fontSize="xs" color="fg.muted">
                                {formatBytes(enhancedDownload.downloaded_size)} downloaded
                              </Text>
                            </VStack>
                          </Box>
                          <Box as="td" p={3} borderBottom="1px" borderColor="border.subtle" w="80px">
                            <VStack align="start" gap={1}>
                              <HStack>
                                <Text fontSize="xs" color="fg.muted">Seeds:</Text>
                                <Text fontSize="sm" color="green.600">{enhancedDownload.seeds_connected || 0}</Text>
                              </HStack>
                              <HStack>
                                <Text fontSize="xs" color="fg.muted">Peers:</Text>
                                <Text fontSize="sm" color="blue.600">{enhancedDownload.peers_connected || 0}</Text>
                              </HStack>
                            </VStack>
                          </Box>
                          <Box as="td" p={3} borderBottom="1px" borderColor="border.subtle" w="100px">
                            <Text fontSize="sm" fontWeight="normal" color="orange.600">
                              {enhancedDownload.total_size > 0 ? 
                                ((enhancedDownload.downloaded_size / enhancedDownload.total_size) * 100).toFixed(1) + '%' : '0.0%'}
                            </Text>
                          </Box>
                          <Box as="td" p={3} borderBottom="1px" borderColor="border.subtle" w="150px">
                            <HStack gap={1}>
                              {enhancedDownload.status === 'downloading' && (
                                <Button size="xs" colorScheme="orange" 
                                        onClick={() => handleAction(download.id, 'pause')}>
                                  <Icon name="pause" size={16} />
                                </Button>
                              )}
                              {enhancedDownload.status === 'paused' && (
                                <Button size="xs" colorScheme="green" 
                                        onClick={() => handleAction(download.id, 'resume')}>
                                  <Icon name="play" size={16} />
                                </Button>
                              )}
                              <Button size="xs" colorScheme="red" 
                                      onClick={() => handleAction(download.id, 'cancel')}>
                                <Icon name="stop" size={16} />
                              </Button>
                            </HStack>
                          </Box>
                        </Box>
                      );
                    })}
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
