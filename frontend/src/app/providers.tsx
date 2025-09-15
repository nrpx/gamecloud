'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { SessionProvider } from 'next-auth/react'
import { ColorModeProvider } from '@/components/ui/color-mode'
import { system } from '@/lib/theme'

export function Providers({ 
  children,
  session 
}: {
  children: React.ReactNode
  session?: any
}) {
  return (
    <SessionProvider session={session}>
      <ChakraProvider value={system}>
        <ColorModeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ColorModeProvider>
      </ChakraProvider>
    </SessionProvider>
  )
}
