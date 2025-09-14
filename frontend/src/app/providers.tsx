'use client'

import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/contexts/ThemeContext'

export function Providers({ 
  children,
  session 
}: {
  children: React.ReactNode
  session?: any
}) {
  return (
    <SessionProvider session={session}>
      <ChakraProvider value={defaultSystem}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </ChakraProvider>
    </SessionProvider>
  )
}
