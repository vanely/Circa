import { useState, useEffect } from 'react';
import { 
  Box, 
  Input, 
  InputGroup, 
  InputLeftElement, 
  Button, 
  Text, 
  HStack, 
  Wrap, 
  WrapItem, 
  Badge, 
  useColorModeValue,
  Show,
  Hide,
  Collapse
} from '@chakra-ui/react';
import { EventFilters as FilterType } from '@/types/event';

interface EventFiltersProps {
  className?: string;
  initialFilters: FilterType;
  onFilterChange: (filters: FilterType) => void;
  categories?: string[];
}

const EventFilters = ({
  className,
  initialFilters,
  onFilterChange,
  categories = ['Music', 'Tech', 'Sports', 'Art', 'Food', 'Community', 'Education', 'Social', 'Business']
}: EventFiltersProps) => {
  const [filters, setFilters] = useState<FilterType>(initialFilters);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Apply filters when they change
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  // Handle search query change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, q: e.target.value }));
  };

  // Handle category selection
  const handleCategoryChange = (category: string) => {
    setFilters(prev => {
      const currentCategories = prev.categories || [];
      
      if (currentCategories.includes(category)) {
        // Remove category if already selected
        return {
          ...prev,
          categories: currentCategories.filter(c => c !== category)
        };
      } else {
        // Add category if not selected
        return {
          ...prev,
          categories: [...currentCategories, category]
        };
      }
    });
  };

  // Handle date range change
  const handleDateChange = (field: 'startAtFrom' | 'startAtTo', value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Reset all filters
  const handleReset = () => {
    setFilters({ q: '', categories: [], startAtFrom: undefined, startAtTo: undefined });
  };

  const hasActiveFilters = filters.categories?.length || filters.startAtFrom || filters.startAtTo;

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box bg={bg} border="1px" borderColor={borderColor} borderRadius="lg" className={className}>
      {/* Search input */}
      <Box p={3} borderBottom="1px" borderColor={borderColor}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <Text color="gray.500">🔍</Text>
          </InputLeftElement>
          <Input
            type="text"
            placeholder="Search events..."
            value={filters.q || ''}
            onChange={handleSearchChange}
          />
        </InputGroup>
      </Box>

      {/* Filters toggle on mobile */}
      <Hide above="md">
        <Box p={3} display="flex" justifyContent="space-between" alignItems="center" borderBottom="1px" borderColor={borderColor}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            leftIcon={<Text>{isExpanded ? '🔽' : '🔼'}</Text>}
          >
            {isExpanded ? 'Hide Filters' : 'Show Filters'}
            {hasActiveFilters && (
              <Box ml={2} w={2} h={2} bg="brand.500" borderRadius="full" />
            )}
          </Button>
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              leftIcon={<Text>🔄</Text>}
            >
              Reset All
            </Button>
          )}
        </Box>
      </Hide>
      
      {/* Filter content */}
      <Collapse in={isExpanded} animateOpacity>
        <Box borderBottom="1px" borderColor={borderColor}>
          {/* Category filters */}
          <Box p={3}>
            <Text fontSize="sm" fontWeight="medium" mb={3} display="flex" alignItems="center">
              <Text mr={2}>🏷️</Text>
              Categories
            </Text>
            <Wrap spacing={2}>
              {categories.map(category => (
                <WrapItem key={category}>
                  <Badge
                    cursor="pointer"
                    colorScheme={filters.categories?.includes(category) ? 'brand' : 'gray'}
                    variant={filters.categories?.includes(category) ? 'solid' : 'outline'}
                    onClick={() => handleCategoryChange(category)}
                    _hover={{ bg: filters.categories?.includes(category) ? 'brand.600' : 'gray.100' }}
                    transition="all 0.2s"
                  >
                    {category}
                  </Badge>
                </WrapItem>
              ))}
            </Wrap>
          </Box>

          {/* Date filters */}
          <Box p={3}>
            <Text fontSize="sm" fontWeight="medium" mb={3} display="flex" alignItems="center">
              <Text mr={2}>📅</Text>
              Date Range
            </Text>
            <HStack spacing={3}>
              <Box flex="1">
                <Text fontSize="xs" color="gray.500" mb={1}>
                  From
                </Text>
                <Input
                  type="date"
                  size="sm"
                  value={filters.startAtFrom || ''}
                  onChange={(e) => handleDateChange('startAtFrom', e.target.value)}
                />
              </Box>
              <Box flex="1">
                <Text fontSize="xs" color="gray.500" mb={1}>
                  To
                </Text>
                <Input
                  type="date"
                  size="sm"
                  value={filters.startAtTo || ''}
                  onChange={(e) => handleDateChange('startAtTo', e.target.value)}
                />
              </Box>
            </HStack>
          </Box>
        </Box>
      </Collapse>

      {/* Filter actions - visible only on desktop */}
      <Show above="md">
        <Box p={3} display="flex" justifyContent="flex-end">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              leftIcon={<Text>🔄</Text>}
            >
              Reset All
            </Button>
          )}
        </Box>
      </Show>
    </Box>
  );
};

export default EventFilters;