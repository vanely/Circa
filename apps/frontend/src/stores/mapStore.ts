import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

interface MapActions {
  setPosition: (position: MapPosition) => void;
  setEvents: (events: Event[]) => void;
  selectEvent: (event: Event | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  toggleMapProvider: () => void;
  toggleShowList: () => void;
  flyToEvent: (event: Event) => void;
  getUserLocation: () => Promise<void>;
}

type MapStore = MapState & MapActions;

const DEFAULT_CENTER: [number, number] = [-74.0060, 40.7128]; // New York City
const DEFAULT_ZOOM = 13;

export const useMapStore = create<MapStore>()(
  persist(
    (set) => ({
      // State
      position: {
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
      },
      events: [],
      selectedEvent: null,
      isLoading: false,
      mapProvider: 'maplibre',
      showList: true,

      // Actions
      setPosition: (position: MapPosition) => set({ position }),

      setEvents: (events: Event[]) => set({ events }),

      selectEvent: (event: Event | null) => {
        set({ selectedEvent: event });
        
        if (event?.venue?.location) {
          set({
            position: {
              center: [event.venue.location.lng, event.venue.location.lat],
              zoom: 15,
            },
          });
        }
      },

      setIsLoading: (isLoading: boolean) => set({ isLoading }),

      toggleMapProvider: () => {
        set((state) => ({
          mapProvider: state.mapProvider === 'maplibre' ? 'google' : 'maplibre',
        }));
      },

      toggleShowList: () => {
        set((state) => ({ showList: !state.showList }));
      },

      flyToEvent: (event: Event) => {
        if (event?.venue?.location) {
          set({
            position: {
              center: [event.venue.location.lng, event.venue.location.lat],
              zoom: 15,
            },
            selectedEvent: event,
          });
        }
      },

      getUserLocation: async (): Promise<void> => {
        return new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
            return;
          }

          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              set({
                position: {
                  center: [longitude, latitude],
                  zoom: 13,
                },
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
      },
    }),
    {
      name: 'map-storage',
      partialize: (state) => ({ 
        mapProvider: state.mapProvider,
        showList: state.showList,
      }),
    }
  )
);
