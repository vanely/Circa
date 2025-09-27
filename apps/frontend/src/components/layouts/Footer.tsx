import { Link } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Grid, 
  GridItem, 
  Text, 
  VStack, 
  HStack
} from '@chakra-ui/react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box as="footer" bg="gray.50" borderTop="1px" borderColor="gray.200" py={8}>
      <Container maxW="container.xl" px={4}>
               <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={8}>
          {/* Logo and brief description */}
          <GridItem>
            <Link to="/">
              <HStack spacing={3}>
                <Box
                  w={8}
                  h={8}
                  borderRadius="lg"
                  bg="brand.600"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text color="white" fontSize="lg" fontWeight="bold">
                    C
                  </Text>
                </Box>
                <Text fontSize="xl" fontWeight="semibold">
                  Circa
                </Text>
              </HStack>
            </Link>
            <Text mt={2} fontSize="sm" color="gray.500">
              Community driven interactive events platform
            </Text>
          </GridItem>

          {/* Quick links */}
          <GridItem>
            <Text fontSize="sm" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" mb={4}>
              Explore
            </Text>
            <VStack spacing={2} align="start">
              <Link to="/">
                <Text fontSize="base" color="gray.500">
                  Home
                </Text>
              </Link>
              <Link to="/events">
                <Text fontSize="base" color="gray.500">
                  Events
                </Text>
              </Link>
              <Link to="/create-event">
                <Text fontSize="base" color="gray.500">
                  Create Event
                </Text>
              </Link>
            </VStack>
          </GridItem>

          {/* Resources */}
          <GridItem>
            <Text fontSize="sm" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" mb={4}>
              Resources
            </Text>
            <VStack spacing={2} align="start">
              <Link to="/about">
                <Text fontSize="base" color="gray.500">
                  About Us
                </Text>
              </Link>
              <Link to="/faq">
                <Text fontSize="base" color="gray.500">
                  FAQ
                </Text>
              </Link>
              <Link to="/privacy">
                <Text fontSize="base" color="gray.500">
                  Privacy Policy
                </Text>
              </Link>
              <Link to="/terms">
                <Text fontSize="base" color="gray.500">
                  Terms of Service
                </Text>
              </Link>
            </VStack>
          </GridItem>

          {/* Contact */}
          <GridItem>
            <Text fontSize="sm" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" mb={4}>
              Contact
            </Text>
            <VStack spacing={2} align="start">
              <Text fontSize="base" color="gray.500" as="a" href="mailto:support@circa.app">
                support@circa.app
              </Text>
              <HStack spacing={4} mt={4}>
                {/* Social media icons */}
                <Box as="a" href="#" color="gray.500">
                  <Text fontSize="xl">🐦</Text>
                </Box>
                <Box as="a" href="#" color="gray.500">
                  <Text fontSize="xl">📷</Text>
                </Box>
              </HStack>
            </VStack>
          </GridItem>
        </Grid>

        {/* Copyright */}
        <Box mt={8} pt={8} borderTop="1px" borderColor="gray.200" textAlign="center">
          <Text fontSize="sm" color="gray.500">
            &copy; {currentYear} Circa. All rights reserved.
          </Text>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;