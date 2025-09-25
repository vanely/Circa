import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { MapProvider, useMap } from '@/contexts/MapContext';
import MapContainer from '@/components/map/MapContainer';
import EventList from '@/components/events/EventList';
import EventFilters from '@/components/events/EventFilters';
import { eventService } from '@/services/eventService';
import { EventFilters as FilterType } from '@/types/event';
import { cn } from '@/utils/cn';

// Main content with Map and Event integration
const HomeContent = () => {
  // Access map context
  const { 
    position, 
    showList, 
    toggleShowList, 
    setEvents, 
    setIsLoading, 
    getUserLocation 
  } = useMap();
  
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
  const { data, isLoading, isError } = useQuery({
    queryKey: ['events', combinedFilters],
    queryFn: () => eventService.getEvents(combinedFilters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
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
  
  return (
    <div className="flex flex-col md:flex-row h-screen-minus-header">
      {/* Sidebar with filters and event list */}
      <div 
        className={cn(
          'w-full md:w-96 flex flex-col border-r border-gray-200 bg-gray-50 z-10',
          !showList && 'hidden md:flex'
        )}
      >
        {/* Filters */}
        <EventFilters 
          className="m-3"
          initialFilters={filters}
          onFilterChange={handleFilterChange}
        />
        
        {/* Event list */}
        <div className="flex-1 overflow-hidden">
          <EventList />
        </div>
      </div>
      
      {/* Map */}
      <div 
        className={cn(
          'flex-1 relative',
          showList && 'hidden md:block'
        )}
      >
        <MapContainer />
        
        {/* Mobile toggle for list view */}
        <div className="md:hidden absolute bottom-20 right-4 z-10">
          <button
            onClick={toggleShowList}
            className="bg-white p-3 rounded-full shadow-lg"
          >
            {showList ? (
              <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// HomePage wrapper with MapProvider
const HomePage = () => {
  return (
    <MapProvider>
      <HomeContent />
    </MapProvider>
  );
};

export default HomePage;