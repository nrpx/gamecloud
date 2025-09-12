'use client'

import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { SessionProvider } from 'next-auth/react'

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
        {children}
      </ChakraProvider>
    </SessionProvider>
  )
}
