import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useMapStore } from '@/stores/mapStore';
import MapContainer from '@/components/map/MapContainer';
import EventList from '@/components/events/EventList';
import EventFilters from '@/components/events/EventFilters';
import { useEvents } from '@/hooks/events';
import { EventFilters as FilterType } from '@/types/event';
import { cn } from '@/utils/cn';

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
  
  return (
    <div className="flex flex-col lg:flex-row h-screen-minus-header">
      {/* Sidebar with filters and event list */}
      <div 
        className={cn(
          'w-full lg:w-96 flex flex-col border-r border-primary bg-secondary z-10 transition-all duration-300',
          !showList && 'hidden lg:flex'
        )}
      >
        {/* Filters */}
        <div className="p-4 border-b border-primary">
          <EventFilters 
            initialFilters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>
        
        {/* Event list */}
        <div className="flex-1 overflow-hidden">
          <EventList />
        </div>
      </div>
      
      {/* Map */}
      <div 
        className={cn(
          'flex-1 relative bg-tertiary',
          showList && 'hidden lg:block'
        )}
      >
        <MapContainer />
        
        {/* Mobile toggle for list view */}
        <div className="lg:hidden absolute bottom-4 right-4 z-20">
          <button
            onClick={toggleShowList}
            className="btn btn-primary btn-lg glass glow-primary"
            aria-label={showList ? 'Show map' : 'Show events'}
          >
            {showList ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Map overlay with event count */}
        <div className="absolute top-4 left-4 z-10">
          <div className="glass rounded-lg px-3 py-2">
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-primary font-medium">
                {data?.events.length || 0} events nearby
              </span>
            </div>
          </div>
        </div>
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-overlay flex items-center justify-center z-20">
            <div className="glass rounded-lg p-6 flex items-center gap-3">
              <div className="spinner"></div>
              <span className="text-primary font-medium">Loading events...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// HomePage component
const HomePage = () => {
  return <HomeContent />;
};

export default HomePage;