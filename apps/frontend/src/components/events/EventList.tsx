import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useMap } from '@/contexts/MapContext';
import { Event } from '@/types/event';
import EventCard from '@/components/events/EventCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { cn } from '@/utils/cn';

interface EventListProps {
  className?: string;
  onEventClick?: (event: Event) => void;
}

const EventList = ({ className, onEventClick }: EventListProps) => {
  const { events, selectedEvent, isLoading, selectEvent, flyToEvent } = useMap();
  
  const handleEventClick = useCallback((event: Event) => {
    if (onEventClick) {
      onEventClick(event);
    } else {
      selectEvent(event);
      flyToEvent(event);
    }
  }, [onEventClick, selectEvent, flyToEvent]);

  return (
    <div className={cn('h-full overflow-hidden flex flex-col', className)}>
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-heading font-bold text-gray-900">
          {events.length} {events.length === 1 ? 'Event' : 'Events'} Found
        </h2>
      </div>
      
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : events.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <p className="text-gray-600 mb-4">No events found in this area.</p>
          <p className="text-gray-500 text-sm mb-6">Try zooming out or changing your search filters.</p>
          <Link
            to="/create-event"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Create Event
          </Link>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-4">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isSelected={selectedEvent?.id === event.id}
                onClick={() => handleEventClick(event)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventList;