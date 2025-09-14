'use client'

import {
  Button,
  ButtonProps,
} from '@chakra-ui/react'
import { Icon } from './Icon'
import { ReactNode } from 'react'

interface BrandButtonProps extends ButtonProps {
  icon?: string
  children: ReactNode
  intent?: 'primary' | 'secondary'
}

export default function BrandButton({ 
  icon, 
  children, 
  intent = 'primary',
  colorScheme = intent === 'primary' ? 'blue' : 'gray',
  ...props 
}: BrandButtonProps) {
  return (
    <Button
      colorScheme={colorScheme}
      bg={intent === 'primary' ? `${colorScheme}.500` : `${colorScheme}.100`}
      color={intent === 'primary' ? 'white' : `${colorScheme}.700`}
      _hover={{
        bg: intent === 'primary' ? `${colorScheme}.600` : `${colorScheme}.200`,
        transform: 'translateY(-2px)',
        boxShadow: 'lg'
      }}
      _active={{
        bg: intent === 'primary' ? `${colorScheme}.700` : `${colorScheme}.300`,
        transform: 'translateY(0)',
      }}
      borderRadius="lg"
      fontWeight="semibold"
      transition="all 0.2s"
      {...props}
    >
      {icon && <Icon name={icon} />}
      {children}
    </Button>
  )
}