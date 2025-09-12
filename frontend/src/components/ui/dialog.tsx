'use client'

import {
  Box,
  Portal,
  CloseButton,
  Flex,
} from '@chakra-ui/react'
import { ReactNode, createContext, useContext } from 'react'

interface DialogContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DialogContext = createContext<DialogContextValue | null>(null)

const useDialogContext = () => {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error('Dialog components must be used within DialogRoot')
  }
  return context
}

export interface DialogRootProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: ReactNode
}

export interface DialogContentProps {
  children: ReactNode
}

export interface DialogHeaderProps {
  children: ReactNode
}

export interface DialogBodyProps {
  children: ReactNode
}

export interface DialogFooterProps {
  children: ReactNode
}

export interface DialogTriggerProps {
  children: ReactNode
}

export interface DialogOverlayProps {}

export interface DialogCloseProps {}

export function DialogRoot({ open = false, onOpenChange, children }: DialogRootProps) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange: onOpenChange || (() => {}) }}>
      {children}
    </DialogContext.Provider>
  )
}

export function DialogTrigger({ children }: DialogTriggerProps) {
  return <>{children}</>
}

export function DialogContent({ children }: DialogContentProps) {
  const { open, onOpenChange } = useDialogContext()
  
  if (!open) return null

  return (
    <Portal>
      <Box
        position="fixed"
        top="0"
        left="0"
        width="100%"
        height="100%"
        bg="blackAlpha.600"
        display="flex"
        alignItems="center"
        justifyContent="center"
        zIndex="modal"
        onClick={() => onOpenChange(false)}
      >
        <Box
          bg="white"
          borderRadius="lg"
          boxShadow="xl"
          maxWidth="500px"
          width="90%"
          maxHeight="90%"
          overflow="auto"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </Box>
      </Box>
    </Portal>
  )
}

export function DialogOverlay({}: DialogOverlayProps) {
  return null // Overlay is handled in DialogContent
}

export function DialogHeader({ children }: DialogHeaderProps) {
  return (
    <Flex justify="space-between" align="center" p="6" borderBottomWidth="1px">
      <Box fontWeight="semibold" fontSize="lg">
        {children}
      </Box>
      <DialogClose />
    </Flex>
  )
}

export function DialogBody({ children }: DialogBodyProps) {
  return (
    <Box p="6">
      {children}
    </Box>
  )
}

export function DialogFooter({ children }: DialogFooterProps) {
  return (
    <Flex justify="flex-end" gap="3" p="6" borderTopWidth="1px">
      {children}
    </Flex>
  )
}

export function DialogClose({}: DialogCloseProps) {
  const { onOpenChange } = useDialogContext()
  
  return (
    <CloseButton
      size="md"
      onClick={() => onOpenChange(false)}
    />
  )
}
