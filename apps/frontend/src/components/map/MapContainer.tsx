import { useMapStore } from '@/stores/mapStore';
import MapLibreMap from '@/components/map/MapLibreMap';
import GoogleMap from '@/components/map/GoogleMap';
import { cn } from '@/utils/cn';

interface MapContainerProps {
  className?: string;
}

const MapContainer = ({ className }: MapContainerProps) => {
  const { mapProvider, toggleMapProvider } = useMapStore();

  return (
    <div className={cn('relative w-full h-full', className)}>
      {mapProvider === 'maplibre' ? (
        <MapLibreMap />
      ) : (
        <GoogleMap />
      )}
      
      {/* Map provider toggle button */}
      <div className="absolute bottom-4 left-4 z-10">
        <button
          onClick={toggleMapProvider}
          className="bg-white p-2 rounded-lg shadow-md text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          {mapProvider === 'maplibre' ? 'Switch to Google Maps' : 'Switch to MapLibre'}
        </button>
      </div>
      
      {/* Map attribution */}
      <div className="absolute bottom-4 right-4 z-10 text-xs text-gray-700 bg-white bg-opacity-75 px-2 py-1 rounded">
        {mapProvider === 'maplibre' ? (
          <span>© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors</span>
        ) : (
          <span>© Google Maps</span>
        )}
      </div>
    </div>
  );
};

export default MapContainer;