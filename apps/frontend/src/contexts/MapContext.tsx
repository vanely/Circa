import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Event } from '@/types/event';

interface MapPosition {
  center: [number, number];
  zoom: number;
}

interface MapState {
  position: MapPosition;
  events: Event[];
  selectedEvent: Event | null;
  isLoading: boolean;
  mapProvider: 'maplibre' | 'google';
  showList: boolean;
}

interface MapContextType extends MapState {
  setPosition: (position: MapPosition) => void;
  setEvents: (events: Event[]) => void;
  selectEvent: (event: Event | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  toggleMapProvider: () => void;
  toggleShowList: () => void;
  flyToEvent: (event: Event) => void;
  getUserLocation: () => Promise<void>;
}

const DEFAULT_CENTER: [number, number] = [-74.0060, 40.7128]; // New York City
const DEFAULT_ZOOM = 13;

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider = ({ children }: { children: ReactNode }) => {
  const [position, setPosition] = useState<MapPosition>({
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
  });
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mapProvider, setMapProvider] = useState<'maplibre' | 'google'>(
    () => (localStorage.getItem('mapProvider') as 'maplibre' | 'google') || 'maplibre'
  );
  const [showList, setShowList] = useState<boolean>(() => {
    const saved = localStorage.getItem('showList');
    return saved ? saved === 'true' : true;
  });
  
  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('mapProvider', mapProvider);
  }, [mapProvider]);
  
  useEffect(() => {
    localStorage.setItem('showList', showList.toString());
  }, [showList]);

  const selectEvent = (event: Event | null) => {
    setSelectedEvent(event);
    
    if (event?.venue?.location) {
      setPosition({
        center: [event.venue.location.lng, event.venue.location.lat],
        zoom: 15,
      });
    }
  };

  const toggleMapProvider = () => {
    setMapProvider(prev => prev === 'maplibre' ? 'google' : 'maplibre');
  };

  const toggleShowList = () => {
    setShowList(prev => !prev);
  };

  const flyToEvent = (event: Event) => {
    if (event?.venue?.location) {
      setPosition({
        center: [event.venue.location.lng, event.venue.location.lat],
        zoom: 15,
      });
      setSelectedEvent(event);
    }
  };

  const getUserLocation = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition({
            center: [longitude, latitude],
            zoom: 13,
          });
          resolve();
        },
        (error) => {
          console.error('Error getting location:', error);
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    });
  };

  return (
    <MapContext.Provider
      value={{
        position,
        events,
        selectedEvent,
        isLoading,
        mapProvider,
        showList,
        setPosition,
        setEvents,
        selectEvent,
        setIsLoading,
        toggleMapProvider,
        toggleShowList,
        flyToEvent,
        getUserLocation,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export const useMap = () => {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
};