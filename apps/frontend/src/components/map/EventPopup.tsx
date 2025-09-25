import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Event } from '@/types/event';

interface EventPopupProps {
  event: Event;
}

const EventPopup = ({ event }: EventPopupProps) => {
  const startDate = new Date(event.startAt);
  
  return (
    <div className="p-1 max-w-xs">
      <div className="font-heading font-bold text-lg text-gray-900 mb-2">
        {event.title}
      </div>
      
      <div className="mb-2 text-sm text-gray-700">
        <div>
          <span className="font-medium">When:</span>{' '}
          {format(startDate, 'E, MMM d, yyyy • h:mm a')}
        </div>
        {event.venue?.label && (
          <div>
            <span className="font-medium">Where:</span> {event.venue.label}
          </div>
        )}
      </div>
      
      {event.summary && (
        <p className="text-sm text-gray-600 mb-2 line-clamp-3">
          {event.summary}
        </p>
      )}
      
      {event.tags && event.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {event.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800"
            >
              {tag}
            </span>
          ))}
          {event.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{event.tags.length - 3} more</span>
          )}
        </div>
      )}
      
      <div className="mt-2">
        <Link
          to={`/events/${event.id}`}
          className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default EventPopup;