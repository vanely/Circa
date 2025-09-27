import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

// Theme configuration
const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

// Custom theme with your brand colors
const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: '#f3e8ff',
      100: '#e9d5ff',
      200: '#d8b4fe',
      300: '#c084fc',
      400: '#a855f7',
      500: '#9333ea',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
    },
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  styles: {
    global: {
      body: {
        bg: 'white',
        color: 'gray.800',
      },
    },
  },
})

export default theme
