import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Box, 
  Flex, 
  Button, 
  Text, 
  HStack, 
  Hide,
  Spinner,
  useColorModeValue
} from '@chakra-ui/react';
import { useMapStore } from '@/stores/mapStore';
import MapContainer from '@/components/map/MapContainer';
import EventList from '@/components/events/EventList';
import EventFilters from '@/components/events/EventFilters';
import { useEvents } from '@/hooks/events';
import { EventFilters as FilterType } from '@/types/event';

// Main content with Map and Event integration
const HomeContent = () => {
  // Access map store
  const { 
    position, 
    showList, 
    toggleShowList, 
    setEvents, 
    setIsLoading, 
    getUserLocation 
  } = useMapStore();
  
  // Event filters state
  const [filters, setFilters] = useState<FilterType>({
    q: '',
    categories: [],
    startAtFrom: undefined,
    startAtTo: undefined,
    limit: 50
  });
  
  // Combine position with filters
  const combinedFilters = {
    ...filters,
    lat: position.center[1],
    lng: position.center[0],
    radius: 25, // Default radius in km
  };
  
  // Fetch events based on filters and position
  const { data, isLoading, isError } = useEvents(combinedFilters);
  
  // Update loading state in map context
  useEffect(() => {
    setIsLoading(isLoading);
  }, [isLoading, setIsLoading]);
  
  // Update events in map context when data changes
  useEffect(() => {
    if (data) {
      setEvents(data.events);
    }
  }, [data, setEvents]);
  
  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: FilterType) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
  }, []);
  
  // Handle error
  useEffect(() => {
    if (isError) {
      toast.error('Failed to load events. Please try again.');
    }
  }, [isError]);
  
  // Get user's location on mount
  useEffect(() => {
    getUserLocation().catch(() => {
      toast.error('Unable to access your location. Using default location instead.');
    });
  }, [getUserLocation]);
  
  const bg = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Flex direction={{ base: 'column', lg: 'row' }} h="calc(100vh - 3.5rem)">
      {/* Sidebar with filters and event list */}
      <Box
        w={{ base: 'full', lg: '320px' }}
        display={{ base: showList ? 'flex' : 'none', lg: 'flex' }}
        flexDirection="column"
        borderRight="1px"
        borderColor={borderColor}
        bg={bg}
        zIndex={10}
        transition="all 0.3s"
      >
        {/* Filters */}
        <Box p={3} borderBottom="1px" borderColor={borderColor}>
          <EventFilters 
            initialFilters={filters}
            onFilterChange={handleFilterChange}
          />
        </Box>
        
        {/* Event list */}
        <Box flex="1" overflow="hidden">
          <EventList />
        </Box>
      </Box>
      
      {/* Map */}
      <Box
        flex="1"
        position="relative"
        bg="gray.100"
        display={{ base: showList ? 'none' : 'block', lg: 'block' }}
      >
        <MapContainer />
        
        {/* Mobile toggle for list view */}
        <Hide above="lg">
          <Box position="absolute" bottom={4} right={4} zIndex={20}>
            <Button
              onClick={toggleShowList}
              colorScheme="brand"
              size="lg"
              borderRadius="full"
              boxShadow="lg"
              aria-label={showList ? 'Show map' : 'Show events'}
            >
              {showList ? '🗺️' : '📋'}
            </Button>
          </Box>
        </Hide>
        
        {/* Map overlay with event count */}
        <Box position="absolute" top={4} left={4} zIndex={10}>
          <Box
            bg="whiteAlpha.800"
            backdropFilter="blur(10px)"
            border="1px"
            borderColor={borderColor}
            borderRadius="lg"
            px={3}
            py={2}
          >
            <HStack spacing={2}>
              <Text fontSize="sm">📍</Text>
              <Text fontSize="sm" fontWeight="medium">
                {data?.events.length || 0} events nearby
              </Text>
            </HStack>
          </Box>
        </Box>
        
        {/* Loading overlay */}
        {isLoading && (
          <Box
            position="absolute"
            inset={0}
            bg="whiteAlpha.800"
            backdropFilter="blur(10px)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={20}
          >
            <Box
              bg="white"
              border="1px"
              borderColor={borderColor}
              borderRadius="lg"
              p={6}
              display="flex"
              alignItems="center"
              gap={3}
            >
              <Spinner size="sm" color="brand.500" />
              <Text fontWeight="medium">Loading events...</Text>
            </Box>
          </Box>
        )}
      </Box>
    </Flex>
  );
};

// HomePage component
const HomePage = () => {
  return <HomeContent />;
};

export default HomePage;