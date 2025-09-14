import { render, screen } from '@testing-library/react'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { RealTimeProgress } from '../RealTimeProgress'

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider value={defaultSystem}>
    {children}
  </ChakraProvider>
)

describe('RealTimeProgress', () => {
  const mockProgressData = {
    id: 'test-download',
    info_hash: 'test-hash',
    name: 'Test Game',
    size: 1000000,
    downloaded: 500000,
    download_rate: 1024000,
    upload_rate: 102400,
    progress: 50,
    status: 'downloading',
    eta: 300,
    peers: 5,
    seeds: 2,
    updated_at: '2024-01-01T10:00:00Z'
  }

  it('отображает прогресс загрузки', () => {
    render(
      <TestWrapper>
        <RealTimeProgress progress={mockProgressData} />
      </TestWrapper>
    )

    expect(screen.getByText('50.0%')).toBeInTheDocument()
  })

  it('показывает правильное значение прогресса', () => {
    render(
      <TestWrapper>
        <RealTimeProgress progress={mockProgressData} />
      </TestWrapper>
    )

    expect(screen.getByText('Прогресс')).toBeInTheDocument()
    expect(screen.getByText('50.0%')).toBeInTheDocument()
  })

  it('отображает скорость загрузки', () => {
    render(
      <TestWrapper>
        <RealTimeProgress progress={mockProgressData} />
      </TestWrapper>
    )

    expect(screen.getByText('1000 KB/s')).toBeInTheDocument()
  })
})