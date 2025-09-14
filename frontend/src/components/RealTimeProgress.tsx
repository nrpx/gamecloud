'use client';

import React from 'react';
import {
  Box,
  Text,
  Badge,
  Icon,
} from '@chakra-ui/react';
import { FiDownload, FiUpload, FiUsers, FiClock } from 'react-icons/fi';

interface ProgressUpdate {
  id: string;
  info_hash: string;
  name: string;
  size: number;
  downloaded: number;
  download_rate: number;
  upload_rate: number;
  progress: number;
  status: string;
  eta: number;
  peers: number;
  seeds: number;
  updated_at: string;
}

interface RealTimeProgressProps {
  progress: ProgressUpdate;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatSpeed = (bytesPerSecond: number): string => {
  return formatBytes(bytesPerSecond) + '/s';
};

const formatTime = (seconds: number): string => {
  if (seconds <= 0) return '--';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}ч ${minutes}м`;
  } else if (minutes > 0) {
    return `${minutes}м ${secs}с`;
  } else {
    return `${secs}с`;
  }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'downloading':
      return 'blue';
    case 'completed':
      return 'green';
    case 'paused':
      return 'yellow';
    case 'failed':
      return 'red';
    case 'waiting':
      return 'gray';
    default:
      return 'gray';
  }
};

const getStatusText = (status: string): string => {
  switch (status) {
    case 'downloading':
      return 'Скачивается';
    case 'completed':
      return 'Завершено';
    case 'paused':
      return 'Приостановлено';
    case 'failed':
      return 'Ошибка';
    case 'waiting':
      return 'Ожидание';
    default:
      return status;
  }
};

export const RealTimeProgress: React.FC<RealTimeProgressProps> = ({ progress }) => {
  return (
    <Box 
      p={4} 
      border="1px" 
      borderColor="border.muted" 
      borderRadius="md" 
      bg="bg.surface"
      shadow="sm"
    >
      <Box mb={3}>
        {/* Заголовок и статус */}
        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
          <Box flex={1}>
            <Text 
              fontSize="sm" 
              fontWeight="medium" 
              color="fg.default"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              {progress.name || 'Неизвестный торрент'}
            </Text>
            <Text fontSize="xs" color="fg.muted">
              {formatBytes(progress.downloaded)} / {formatBytes(progress.size)}
            </Text>
          </Box>
          <Badge colorScheme={getStatusColor(progress.status)} size="sm">
            {getStatusText(progress.status)}
          </Badge>
        </Box>

        {/* Прогресс-бар */}
        <Box mb={3}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Text fontSize="xs" color="fg.muted">
              Прогресс
            </Text>
            <Text fontSize="xs" fontWeight="medium">
              {progress.progress.toFixed(1)}%
            </Text>
          </Box>
          <Box
            w="full"
            bg="gray.100"
            borderRadius="md"
            h={2}
            overflow="hidden"
          >
            <Box
              h="full"
              bg={`${getStatusColor(progress.status)}.500`}
              width={`${progress.progress}%`}
              transition="width 0.3s ease"
            />
          </Box>
        </Box>

        {/* Статистика */}
        <Box display="flex" gap={4} fontSize="xs" color="fg.muted" flexWrap="wrap">
          <Box display="flex" alignItems="center" gap={1}>
            <Icon as={FiDownload} />
            <Text>{formatSpeed(progress.download_rate)}</Text>
          </Box>
          
          <Box display="flex" alignItems="center" gap={1}>
            <Icon as={FiUpload} />
            <Text>{formatSpeed(progress.upload_rate)}</Text>
          </Box>
          
          <Box display="flex" alignItems="center" gap={1}>
            <Icon as={FiUsers} />
            <Text>{progress.peers}/{progress.seeds}</Text>
          </Box>
          
          {progress.eta > 0 && (
            <Box display="flex" alignItems="center" gap={1}>
              <Icon as={FiClock} />
              <Text>{formatTime(progress.eta)}</Text>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};