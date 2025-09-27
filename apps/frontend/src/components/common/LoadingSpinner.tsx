import { Spinner, Box } from '@chakra-ui/react'

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: string
  className?: string
  variant?: string // Add variant prop for compatibility
}

const LoadingSpinner = ({ size = 'md', color = 'brand.500', className }: LoadingSpinnerProps) => {
  return (
    <Box display="flex" alignItems="center" justifyContent="center" className={className}>
      <Spinner size={size} color={color} />
    </Box>
  )
}

export default LoadingSpinner
