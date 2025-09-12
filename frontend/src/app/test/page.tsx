'use client'

import { Box, Container, Heading, Text, Button } from '@chakra-ui/react'

export default function TestPage() {
  return (
    <Container maxW="lg" py={8}>
      <Box textAlign="center">
        <Heading as="h1" size="2xl" mb={4} color="blue.500">
          GameCloud - Тест
        </Heading>
        <Text mb={6}>
          Эта страница работает без аутентификации
        </Text>
        <Button colorScheme="green" size="lg">
          Тест пройден!
        </Button>
      </Box>
    </Container>
  )
}
