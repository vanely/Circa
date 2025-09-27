import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Text, 
  HStack, 
  Badge, 
  useColorModeValue 
} from '@chakra-ui/react';
import { Event } from '@/types/event';

interface EventCardProps {
  event: Event;
  isSelected?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

const EventCard = ({ event, isSelected = false, onClick, compact = false }: EventCardProps) => {
  const startDate = new Date(event.startAt);
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const selectedBorderColor = useColorModeValue('brand.500', 'brand.400');

  return (
    <Box
      cursor="pointer"
      transition="all 0.2s"
      _hover={{ shadow: 'md' }}
      border="1px"
      borderColor={isSelected ? selectedBorderColor : borderColor}
      borderRadius="lg"
      bg={bg}
      p={compact ? 3 : 4}
      onClick={onClick}
      boxShadow={isSelected ? 'lg' : 'none'}
      borderWidth={isSelected ? '2px' : '1px'}
    >
      <HStack spacing={3} align="start">
        {/* Date block */}
        <Box
          flexShrink={0}
          w={12}
          h={12}
          bg="gray.100"
          borderRadius="lg"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
        >
          <Text fontSize="sm" fontWeight="bold" color="brand.600" lineHeight="none">
            {format(startDate, 'd')}
          </Text>
          <Text fontSize="xs" color="gray.500" textTransform="uppercase" lineHeight="none" mt={1}>
            {format(startDate, 'MMM')}
          </Text>
        </Box>

        {/* Event details */}
        <Box flex="1" minW={0}>
                 <Text
                   fontSize={compact ? 'base' : 'lg'}
                   fontWeight="semibold"
                   isTruncated
                   mb={1}
                 >
                   <Link
                     to={`/events/${event.id}`}
                     onClick={(e) => e.stopPropagation()}
                   >
                     {event.title}
                   </Link>
                 </Text>

          {/* Time */}
          <Text
            fontSize={compact ? 'xs' : 'sm'}
            color="gray.500"
            mb={1}
          >
            {format(startDate, 'E, MMM d • h:mm a')}
          </Text>

          {/* Location - only display if exists */}
          {event.venue?.label && (
            <HStack spacing={1} mb={1}>
              <Text fontSize="xs">📍</Text>
              <Text
                fontSize={compact ? 'xs' : 'sm'}
                color="gray.500"
                isTruncated
              >
                {event.venue.label}
              </Text>
            </HStack>
          )}

          {/* Summary - only in non-compact mode */}
          {!compact && event.summary && (
            <Text
              fontSize="sm"
              color="gray.500"
              mt={1}
              noOfLines={2}
            >
              {event.summary}
            </Text>
          )}

          {/* Tags and attendees - only in non-compact mode */}
          {!compact && (
            <HStack spacing={2} mt={2} wrap="wrap">
              {event.tags && event.tags.length > 0 && (
                event.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="subtle" colorScheme="gray" fontSize="xs">
                    {tag}
                  </Badge>
                ))
              )}

              <HStack spacing={1}>
                <Text fontSize="xs">👥</Text>
                <Text fontSize="xs" color="gray.500">
                  {event.attendeeCount} going
                </Text>
              </HStack>
            </HStack>
          )}
        </Box>

        {/* Selection indicator */}
        {isSelected && (
          <Box
            flexShrink={0}
            w={6}
            h={6}
            borderRadius="full"
            bg="brand.600"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize="xs" color="white">✓</Text>
          </Box>
        )}
      </HStack>
    </Box>
  );
};

export default EventCard;