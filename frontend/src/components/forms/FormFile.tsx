'use client'

import React, { useRef } from 'react'
import { FieldValues } from 'react-hook-form'
import { Box, Button, Text, HStack, VStack } from '@chakra-ui/react'
import { Icon } from '@/components/ui/Icon'
import { FormFieldWrapper } from './FormFieldWrapper'
import { BaseFormFieldProps } from './types'

interface FormFileProps<T extends FieldValues> extends BaseFormFieldProps<T> {
  accept?: string
  multiple?: boolean
  placeholder?: string
  buttonText?: string
  maxSizeMB?: number
  allowedTypes?: string[]
}

export function FormFile<T extends FieldValues>({
  name,
  label,
  helperText,
  isRequired,
  isDisabled,
  form,
  rules,
  accept,
  multiple = false,
  placeholder = "Выберите файл...",
  buttonText = "Выбрать файл",
  maxSizeMB,
  allowedTypes,
}: FormFileProps<T>) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const {
    register,
    formState: { errors },
    setValue,
    watch,
    clearErrors,
  } = form

  const fieldError = errors[name]?.message as string | undefined
  const currentFiles = watch(name) as FileList | null

  const validateFile = (files: FileList | null) => {
    if (!files || files.length === 0) return true

    const file = files[0]
    
    // Проверка типа файла
    if (allowedTypes) {
      const isValidType = allowedTypes.some(type => 
        file.type.includes(type) || file.name.toLowerCase().endsWith(type)
      )
      if (!isValidType) {
        return `Разрешены только файлы: ${allowedTypes.join(', ')}`
      }
    }
    
    // Проверка размера файла
    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
      return `Размер файла не должен превышать ${maxSizeMB}MB`
    }
    
    return true
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    
    // Валидируем файл
    const validationResult = validateFile(files)
    if (typeof validationResult === 'string') {
      // Есть ошибка валидации
      form.setError(name, { message: validationResult })
      return
    }

    // Очищаем ошибки если файл валидный
    clearErrors(name)
    setValue(name, files as any, { shouldValidate: true, shouldDirty: true })
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveFile = () => {
    setValue(name, null as any, { shouldValidate: true, shouldDirty: true })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <FormFieldWrapper
      label={label}
      isRequired={isRequired}
      error={fieldError}
      helperText={helperText}
    >
      <VStack align="stretch" gap={2}>
        <HStack>
          <input
            {...register(name, {
              ...rules,
              validate: validateFile,
            })}
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={isDisabled}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          
          <Button
            onClick={handleButtonClick}
            disabled={isDisabled}
            variant="outline"
            size="md"
            borderColor={fieldError ? "red.500" : "border"}
            _hover={{
              borderColor: fieldError ? "red.500" : "gamecloud.primary",
            }}
          >
            <Icon name="upload" size={16} style={{ marginRight: '8px' }} />
            {buttonText}
          </Button>
          
          {currentFiles && currentFiles.length > 0 && (
            <Button
              onClick={handleRemoveFile}
              disabled={isDisabled}
              variant="ghost"
              size="md"
              colorScheme="red"
            >
              <Icon name="delete" size={16} style={{ marginRight: '8px' }} />
              Удалить
            </Button>
          )}
        </HStack>

        {currentFiles && currentFiles.length > 0 ? (
          <Box
            p={3}
            bg="green.50"
            borderRadius="md"
            border="1px solid"
            borderColor="green.200"
          >
            <HStack justify="space-between">
              <VStack align="start" gap={1}>
                <Text fontSize="sm" fontWeight="medium" color="green.700">
                  📎 {currentFiles[0].name}
                </Text>
                <Text fontSize="xs" color="green.600">
                  Размер: {formatFileSize(currentFiles[0].size)}
                </Text>
              </VStack>
              <Icon name="check" size={16} color="green.500" />
            </HStack>
          </Box>
        ) : (
          <Box
            p={4}
            border="2px dashed"
            borderColor={fieldError ? "red.200" : "border"}
            borderRadius="md"
            textAlign="center"
            bg={fieldError ? "red.50" : "bg"}
            cursor={isDisabled ? "not-allowed" : "pointer"}
            onClick={!isDisabled ? handleButtonClick : undefined}
            _hover={!isDisabled ? {
              borderColor: fieldError ? "red.300" : "gamecloud.primary",
              bg: fieldError ? "red.100" : "bg.subtle"
            } : {}}
          >
            <VStack gap={2}>
              <Icon 
                name="upload" 
                size={24} 
                color={fieldError ? "red.400" : "fg.muted"} 
              />
              <Text 
                fontSize="sm" 
                color={fieldError ? "red.600" : "fg.muted"}
              >
                {placeholder}
              </Text>
              {accept && (
                <Text fontSize="xs" color="fg.muted">
                  Поддерживаемые форматы: {accept}
                </Text>
              )}
            </VStack>
          </Box>
        )}
      </VStack>
    </FormFieldWrapper>
  )
}