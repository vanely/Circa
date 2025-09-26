import { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMapStore } from '@/stores/mapStore';
import { cn } from '@/utils/cn';
import EventPopup from '@/components/map/EventPopup';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface MapLibreMapProps {
  className?: string;
}

const MapLibreMap = ({ className }: MapLibreMapProps) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<{ [id: string]: maplibregl.Marker }>({});
  const popupRef = useRef<maplibregl.Popup | null>(null);
  
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
    if (!mapContainer.current) return;
    
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: [
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }
        },
        layers: [
          {
            id: 'osm-tiles',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      },
      center: position.center,
      zoom: position.zoom,
    });
    
    // Add navigation control
    map.current.addControl(
      new maplibregl.NavigationControl({ showCompass: true })
    );
    
    // Add geolocate control
    map.current.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      })
    );
    
    map.current.on('load', () => {
      setMapReady(true);
    });
    
    // Update position state when map moves
    map.current.on('moveend', () => {
      if (!map.current) return;
      
      const center = map.current.getCenter();
      const zoom = map.current.getZoom();
      
      setPosition({
        center: [center.lng, center.lat],
        zoom,
      });
    });
    
    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update map when position changes
  useEffect(() => {
    if (map.current) {
      map.current.flyTo({
        center: position.center,
        zoom: position.zoom,
        duration: 800,
      });
    }
  }, [position]);

  // Update markers when events or mapReady changes
  useEffect(() => {
    if (!map.current || !mapReady) return;
    
    // Remove existing markers
    Object.values(markersRef.current).forEach(marker => {
      marker.remove();
    });
    markersRef.current = {};
    
    // Create new markers for each event
    events.forEach(event => {
      if (!event.venue?.location) return;
      
      const { lat, lng } = event.venue.location;
      
      // Create marker element
      const el = document.createElement('div');
      el.className = cn(
        'w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold cursor-pointer',
        selectedEvent?.id === event.id && 'ring-2 ring-white ring-offset-2 ring-offset-primary-600 transform scale-125',
      );
      el.innerHTML = `<span>${event.title.charAt(0)}</span>`;
      
      // Create marker and add to map
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(map.current!);
      
      // Add click event to marker
      marker.getElement().addEventListener('click', () => {
        selectEvent(event);
      });
      
      // Store marker reference
      markersRef.current[event.id] = marker;
    });
  }, [events, mapReady, selectedEvent]);

  // Show popup for selected event
  useEffect(() => {
    if (!map.current || !mapReady) return;
    
    // Remove existing popup
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }
    
    if (selectedEvent?.venue?.location) {
      const { lat, lng } = selectedEvent.venue.location;
      
      // Create popup element
      const popupNode = document.createElement('div');
      
      // Create popup and add to map
      popupRef.current = new maplibregl.Popup({ closeButton: true, closeOnClick: false })
        .setLngLat([lng, lat])
        .setDOMContent(popupNode)
        .addTo(map.current);
      
      // Render React component to popup
      const popupRoot = createRoot(popupNode);
      popupRoot.render(<EventPopup event={selectedEvent} />);
      
      // Remove popup when closed
      popupRef.current.on('close', () => {
        selectEvent(null);
      });
    }
  }, [selectedEvent, mapReady]);

  return (
    <div className={cn('relative w-full h-full', className)}>
      <div ref={mapContainer} className="w-full h-full" />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <LoadingSpinner size="lg" color="white" />
        </div>
      )}
    </div>
  );
};

// Helper to create React roots for popups
function createRoot(container: HTMLElement) {
  return {
    render(element: React.ReactNode) {
      import('react-dom/client').then(({ createRoot }) => {
        const root = createRoot(container);
        root.render(element);
      });
    }
  };
}

export default MapLibreMap;