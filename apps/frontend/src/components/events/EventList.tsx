import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Text, 
  VStack, 
  HStack, 
  Button, 
  Spinner, 
  useColorModeValue 
} from '@chakra-ui/react';
import { useMapStore } from '@/stores/mapStore';
import { Event } from '@/types/event';
import EventCard from '@/components/events/EventCard';

interface EventListProps {
  className?: string;
  onEventClick?: (event: Event) => void;
}

const EventList = ({ className, onEventClick }: EventListProps) => {
  const { events, selectedEvent, isLoading, selectEvent, flyToEvent } = useMapStore();
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bg = useColorModeValue('gray.50', 'gray.800');
  
  const handleEventClick = useCallback((event: Event) => {
    if (onEventClick) {
      onEventClick(event);
    } else {
      selectEvent(event);
      flyToEvent(event);
    }
  }, [onEventClick, selectEvent, flyToEvent]);

  return (
    <Box h="full" overflow="hidden" display="flex" flexDirection="column" className={className}>
      {/* Header */}
      <Box p={3} borderBottom="1px" borderColor={borderColor}>
        <HStack justify="space-between">
          <Text fontSize="lg" fontWeight="semibold">
            {events.length} {events.length === 1 ? 'Event' : 'Events'} Found
          </Text>
          {events.length > 0 && (
            <HStack spacing={1}>
              <Text fontSize="sm" color="gray.500">⚡</Text>
              <Text fontSize="sm" color="gray.500">
                Click to view on map
              </Text>
            </HStack>
          )}
        </HStack>
      </Box>
      
      {/* Content */}
      {isLoading ? (
        <Box flex="1" display="flex" alignItems="center" justifyContent="center">
          <VStack spacing={4}>
            <Spinner size="lg" color="brand.500" />
            <Text color="gray.500" fontWeight="medium">Loading events...</Text>
          </VStack>
        </Box>
      ) : events.length === 0 ? (
        <Box flex="1" display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={6} textAlign="center">
          <Box w={16} h={16} mx="auto" mb={4} borderRadius="full" bg={bg} display="flex" alignItems="center" justifyContent="center">
            <Text fontSize="2xl">📅</Text>
          </Box>
          <Text fontSize="base" fontWeight="semibold" mb={2}>
            No events found
          </Text>
          <Text color="gray.500" mb={2}>
            No events match your current search criteria
          </Text>
          <Text color="gray.500" fontSize="sm" mb={6}>
            Try adjusting your filters or zooming out on the map
          </Text>
          <VStack spacing={3}>
            <Button as={Link} to="/create-event" colorScheme="brand" leftIcon={<Text>➕</Text>}>
              Create Event
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              leftIcon={<Text>🔄</Text>}
            >
              Refresh
            </Button>
          </VStack>
        </Box>
      ) : (
        <Box flex="1" overflowY="auto">
          <VStack spacing={3} p={2}>
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isSelected={selectedEvent?.id === event.id}
                onClick={() => handleEventClick(event)}
              />
            ))}
          </VStack>
          
          {/* Load more indicator */}
          {events.length >= 50 && (
            <Box p={4} textAlign="center" borderTop="1px" borderColor={borderColor}>
              <Text fontSize="sm" color="gray.500">
                Showing first 50 events. Adjust filters to see more.
              </Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default EventList;