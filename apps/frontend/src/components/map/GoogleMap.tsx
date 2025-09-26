import { useRef, useEffect, useState } from 'react';
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { createRoot } from 'react-dom/client';
import { useMapStore } from '@/stores/mapStore';
import { cn } from '@/utils/cn';
import EventPopup from '@/components/map/EventPopup';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface GoogleMapProps {
  className?: string;
}

const GoogleMap = ({ className }: GoogleMapProps) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  
  const renderMap = (status: Status) => {
    switch (status) {
      case Status.LOADING:
        return <div className="flex items-center justify-center h-full"><LoadingSpinner size="lg" /></div>;
      case Status.FAILURE:
        return <div className="flex items-center justify-center h-full text-red-500">Error loading map</div>;
      case Status.SUCCESS:
        return <MapComponent className={className} />;
    }
  };
  
  return (
    <Wrapper apiKey={apiKey} render={renderMap} />
  );
};

const MapComponent = ({ className }: { className?: string }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<{ [id: string]: google.maps.Marker }>({});
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  
  const { 
    position, 
    events, 
    selectedEvent,
    isLoading,
    setPosition, 
    selectEvent 
  } = useMapStore();
  
  const [mapReady, setMapReady] = useState(false);

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapRef.current) return;
    
    mapInstance.current = new google.maps.Map(mapRef.current, {
      center: { lat: position.center[1], lng: position.center[0] },
      zoom: position.zoom,
      mapTypeControl: true,
      fullscreenControl: false,
      streetViewControl: false,
      mapTypeControlOptions: {
        position: google.maps.ControlPosition.TOP_RIGHT,
      },
    });
    
    // Set map ready when loaded
    mapInstance.current.addListener('tilesloaded', () => {
      setMapReady(true);
    });
    
    // Update position state when map moves
    mapInstance.current.addListener('idle', () => {
      if (!mapInstance.current) return;
      
      const center = mapInstance.current.getCenter();
      const zoom = mapInstance.current.getZoom();
      
      if (center && zoom !== undefined) {
        setPosition({
          center: [center.lng(), center.lat()],
          zoom,
        });
      }
    });
    
    // Create info window for popups
    infoWindowRef.current = new google.maps.InfoWindow();
    
    // Cleanup on unmount
    return () => {
      markersRef.current = {};
      infoWindowRef.current = null;
    };
  }, []);

  // Update map when position changes
  useEffect(() => {
    if (mapInstance.current) {
      mapInstance.current.panTo({ 
        lat: position.center[1], 
        lng: position.center[0] 
      });
      mapInstance.current.setZoom(position.zoom);
    }
  }, [position]);

  // Update markers when events or mapReady changes
  useEffect(() => {
    if (!mapInstance.current || !mapReady) return;
    
    // Remove existing markers
    Object.values(markersRef.current).forEach(marker => {
      marker.setMap(null);
    });
    markersRef.current = {};
    
    // Create new markers for each event
    events.forEach(event => {
      if (!event.venue?.location) return;
      
      const { lat, lng } = event.venue.location;
      
      // Define marker style
      const isSelected = selectedEvent?.id === event.id;
      
      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.className = cn(
        'flex items-center justify-center',
        isSelected ? 'scale-125' : ''
      );
      
      const markerPin = document.createElement('div');
      markerPin.className = cn(
        'w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold',
        isSelected ? 'ring-2 ring-white ring-offset-1 ring-offset-primary-600' : ''
      );
      markerPin.innerHTML = `<span>${event.title.charAt(0)}</span>`;
      
      markerElement.appendChild(markerPin);
      
      // Create marker and add to map
      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: { lat, lng },
        map: mapInstance.current,
        content: markerElement,
      });
      
      // Add click event to marker
      marker.addListener('click', () => {
        selectEvent(event);
      });
      
      // Store marker reference
      markersRef.current[event.id] = marker as unknown as google.maps.Marker;
    });
  }, [events, mapReady, selectedEvent]);

  // Show info window for selected event
  useEffect(() => {
    if (!mapInstance.current || !infoWindowRef.current || !mapReady) return;
    
    // Close existing info window
    infoWindowRef.current.close();
    
    if (selectedEvent?.venue?.location) {
      const { lat, lng } = selectedEvent.venue.location;
      
      // Create info window content
      const infoWindowContent = document.createElement('div');
      infoWindowContent.className = 'event-info-window';
      
      // Create React root and render popup component
      const infoWindowRoot = createRoot(infoWindowContent);
      infoWindowRoot.render(<EventPopup event={selectedEvent} />);
      
      // Open info window
      infoWindowRef.current.setContent(infoWindowContent);
      infoWindowRef.current.setPosition({ lat, lng });
      infoWindowRef.current.open(mapInstance.current);
      
      // Add close listener
      google.maps.event.addListenerOnce(infoWindowRef.current, 'closeclick', () => {
        selectEvent(null);
      });
    }
  }, [selectedEvent, mapReady]);

  return (
    <div className={cn('relative w-full h-full', className)}>
      <div ref={mapRef} className="w-full h-full" />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <LoadingSpinner size="lg" color="white" />
        </div>
      )}
    </div>
  );
};

export default GoogleMap;