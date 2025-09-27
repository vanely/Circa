import { ChakraProvider as BaseChakraProvider } from '@chakra-ui/react'
import theme from '@/theme'

interface ChakraProviderProps {
  children: React.ReactNode
}

export const ChakraProvider = ({ children }: ChakraProviderProps) => {
  return (
    <BaseChakraProvider theme={theme}>
      {children}
    </BaseChakraProvider>
  )
}
