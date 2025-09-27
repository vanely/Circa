import { Link, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Flex, 
  Text, 
  Button, 
  HStack
} from '@chakra-ui/react';
import { useAuthStore } from '@/stores/authStore';
import { useLogout } from '@/hooks/auth';

const Header = () => {
  const { user, isAuthenticated } = useAuthStore();
  const logoutMutation = useLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <Box
      as="header"
      position="sticky"
      top={0}
      zIndex={50}
      w="full"
      borderBottom="1px"
      borderColor="gray.200"
      bg="white"
      backdropFilter="blur(10px)"
    >
      <Box maxW="container.xl" mx="auto" px={4}>
        <Flex h={14} align="center" justify="space-between">
          {/* Logo */}
          <Link to="/">
            <HStack spacing={2}>
              <Box
                w={6}
                h={6}
                borderRadius="md"
                bg="brand.600"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text color="white" fontSize="sm" fontWeight="bold">
                  C
                </Text>
              </Box>
              <Text fontSize="xl" fontWeight="bold">
                Circa
              </Text>
            </HStack>
          </Link>

          {/* Right side */}
          <HStack spacing={2}>
            {isAuthenticated ? (
              <>
                {/* Create Event Button */}
                <Button as={Link} to="/create-event" size="sm">
                  ➕ Create Event
                </Button>

                {/* User Menu */}
                <Button variant="ghost" size="sm">
                  {user?.displayName}
                </Button>
                
                <Button onClick={handleLogout} variant="ghost" size="sm" color="red.500">
                  Logout
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate('/login')} colorScheme="brand">
                Sign In
              </Button>
            )}
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
};

export default Header;