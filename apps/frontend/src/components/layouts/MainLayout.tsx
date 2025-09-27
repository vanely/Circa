import { Outlet } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';

const MainLayout = () => {
  return (
    <Box minH="100vh" bg="white" display="flex" flexDirection="column">
      {/* Header */}
      <Header />

      {/* Main content */}
      <Box as="main" flex="1" display="flex" flexDirection="column">
        <Outlet />
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default MainLayout;