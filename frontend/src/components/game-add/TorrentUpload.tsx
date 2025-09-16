'use client'

import React from 'react'
import {
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Box,
  Badge
} from '@chakra-ui/react'
import { Icon } from '@/components/ui/Icon'

interface TorrentUploadProps {
  uploadMethod: 'url' | 'file'
  onUploadMethodChange: (method: 'url' | 'file') => void
  torrentUrl: string | undefined
  onTorrentUrlChange: (url: string) => void
  torrentFile: File | null
  onTorrentFileChange: (file: File | null) => void
  errors?: {
    torrentUrl?: string
    torrentFile?: string
  }
}

export const TorrentUpload: React.FC<TorrentUploadProps> = ({
  uploadMethod,
  onUploadMethodChange,
  torrentUrl,
  onTorrentUrlChange,
  torrentFile,
  onTorrentFileChange,
  errors = {}
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    onTorrentFileChange(file)
  }

  return (
    <VStack gap={4} align="stretch">
      <Box>
        <Text mb={3} fontWeight="semibold">Способ загрузки торрента</Text>
        <HStack gap={2}>
          <Button
            size="sm"
            variant={uploadMethod === 'url' ? 'solid' : 'outline'}
            colorScheme={uploadMethod === 'url' ? 'blue' : 'gray'}
            onClick={() => onUploadMethodChange('url')}
          >
            <Icon name="link" size={16} />
            <Text ml={2}>URL</Text>
          </Button>
          <Button
            size="sm"
            variant={uploadMethod === 'file' ? 'solid' : 'outline'}
            colorScheme={uploadMethod === 'file' ? 'blue' : 'gray'}
            onClick={() => onUploadMethodChange('file')}
          >
            <Icon name="upload" size={16} />
            <Text ml={2}>Файл</Text>
          </Button>
        </HStack>
      </Box>

      {uploadMethod === 'url' ? (
        <Box>
          <Text mb={2} fontWeight="semibold">URL торрент-файла</Text>
          <Input
            placeholder="https://example.com/file.torrent"
            value={torrentUrl || ''}
            onChange={(e) => onTorrentUrlChange(e.target.value)}
            bg="bg"
            border="1px solid"
            borderColor={errors.torrentUrl ? "red" : "border"}
            _focus={{
              borderColor: errors.torrentUrl ? "red" : "gamecloud.primary",
              boxShadow: `0 0 0 1px var(--chakra-colors-${errors.torrentUrl ? "red" : "gamecloud-primary"})`
            }}
          />
          {errors.torrentUrl && <Text color="red" fontSize="sm" mt={1}>{errors.torrentUrl}</Text>}
        </Box>
      ) : (
        <Box>
          <Text mb={2} fontWeight="semibold">Загрузить торрент-файл</Text>
          <Input
            type="file"
            accept=".torrent"
            onChange={handleFileChange}
            bg="bg"
            border="1px solid"
            borderColor={errors.torrentFile ? "red" : "border"}
            p={1}
            _focus={{
              borderColor: errors.torrentFile ? "red" : "gamecloud.primary",
              boxShadow: `0 0 0 1px var(--chakra-colors-${errors.torrentFile ? "red" : "gamecloud-primary"})`
            }}
          />
          {torrentFile && (
            <HStack mt={2} p={2} bg="bg.subtle" borderRadius="md">
              <Icon name="file" size={16} />
              <Text fontSize="sm">{torrentFile.name}</Text>
              <Badge colorScheme="green" size="sm">
                {(torrentFile.size / 1024).toFixed(1)} KB
              </Badge>
            </HStack>
          )}
          {errors.torrentFile && <Text color="red" fontSize="sm" mt={1}>{errors.torrentFile}</Text>}
        </Box>
      )}
    </VStack>
  )
}