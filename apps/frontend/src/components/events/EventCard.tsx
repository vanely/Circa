import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Event } from '@/types/event';
import { cn } from '@/utils/cn';

interface EventCardProps {
  event: Event;
  isSelected?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

const EventCard = ({ event, isSelected = false, onClick, compact = false }: EventCardProps) => {
  const startDate = new Date(event.startAt);
  
  return (
    <div 
      className={cn(
        'event-card',
        isSelected && 'ring-2 ring-primary-600',
        'transition-all duration-200',
        compact ? 'p-3' : 'p-4'
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Date block */}
        <div className="flex-shrink-0 w-14 h-14 bg-primary-50 rounded-md flex flex-col items-center justify-center text-center">
          <span className="text-primary-700 font-bold text-lg leading-none">
            {format(startDate, 'd')}
          </span>
          <span className="text-primary-600 text-sm uppercase leading-none mt-1">
            {format(startDate, 'MMM')}
          </span>
        </div>
        
        {/* Event details */}
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-heading font-bold text-gray-900 truncate",
            compact ? 'text-base' : 'text-lg'
          )}>
            <Link
              to={`/events/${event.id}`}
              className="hover:text-primary-600 focus:outline-none focus:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {event.title}
            </Link>
          </h3>
          
          {/* Time */}
          <p className={cn(
            "text-gray-600",
            compact ? 'text-xs' : 'text-sm'
          )}>
            {format(startDate, 'E, MMM d • h:mm a')}
          </p>
          
          {/* Location - only display if exists */}
          {event.venue?.label && (
            <p className={cn(
              "flex items-center text-gray-600 mt-0.5 truncate",
              compact ? 'text-xs' : 'text-sm'
            )}>
              <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{event.venue.label}</span>
            </p>
          )}
          
          {/* Summary - only in non-compact mode */}
          {!compact && event.summary && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {event.summary}
            </p>
          )}
          
          {/* Tags and attendees - only in non-compact mode */}
          {!compact && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {event.tags && event.tags.length > 0 && (
                event.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800"
                  >
                    {tag}
                  </span>
                ))
              )}
              
              <span className="inline-flex items-center text-xs text-gray-500">
                <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {event.attendeeCount} going
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;