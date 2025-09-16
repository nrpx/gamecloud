'use client'

import React from 'react'
import {
  VStack,
  Text,
  Box,
} from '@chakra-ui/react'
import { FormFieldWrapperProps } from './types'

export const FormFieldWrapper: React.FC<FormFieldWrapperProps> = ({
  label,
  isRequired,
  error,
  helperText,
  children,
}) => {
  return (
    <Box>
      <VStack align="stretch" gap={1}>
        {label && (
          <Text fontWeight="semibold" fontSize="sm" color="fg.default">
            {label}
            {isRequired && (
              <Text as="span" color="red.500" ml={1}>
                *
              </Text>
            )}
          </Text>
        )}
        
        {children}
        
        {error ? (
          <Text color="red.500" fontSize="sm">
            {error}
          </Text>
        ) : (
          helperText && (
            <Text color="fg.muted" fontSize="sm">
              {helperText}
            </Text>
          )
        )}
      </VStack>
    </Box>
  )
}