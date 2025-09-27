import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { eventService } from '@/services/eventService';
import { useAuthStore } from '@/stores/authStore';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { RsvpRequest } from '@/types/event';
import { cn } from '@/utils/cn';

const EventDetailPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [selectedRsvpStatus, setSelectedRsvpStatus] = useState<string | null>(null);

  // Fetch event details
  const { 
    data: event, 
    isPending, 
    isError,
    refetch
  } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventId ? eventService.getEventById(eventId) : Promise.reject('No event ID'),
    enabled: !!eventId,
  });

  // Set initial RSVP status from event data
  useEffect(() => {
    if (event?.userRsvpStatus) {
      setSelectedRsvpStatus(event.userRsvpStatus);
    }
  }, [event?.userRsvpStatus]);

  // RSVP mutation
  const rsvpMutation = useMutation({
    mutationFn: (rsvpData: RsvpRequest) => 
      eventId ? eventService.rsvpToEvent(eventId, rsvpData) : Promise.reject('No event ID'),
    onSuccess: (data) => {
      toast.success(data.message);
      refetch(); // Refresh event data
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update RSVP');
    }
  });

  // Handle RSVP action
  const handleRsvp = (status: 'going' | 'maybe' | 'waitlist' | 'not_going') => {
    if (!isAuthenticated) {
      toast.error('Please sign in to RSVP');
      navigate('/login');
      return;
    }

    setSelectedRsvpStatus(status);
    rsvpMutation.mutate({
      status,
      ticketTypeId: event?.ticketTypes?.[0]?.id, // Default to first ticket type
    });
  };

  if (isPending) {
    return (
      <div className="min-h-screen-minus-header bg-primary flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" variant="accent" />
          <p className="mt-4 text-secondary font-medium">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="min-h-screen-minus-header bg-primary flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-danger flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-heading font-bold text-primary mb-2">
            Event Not Found
          </h1>
          <p className="text-secondary mb-6">
            The event you're looking for doesn't exist or has been removed.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="btn btn-primary w-full"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Discover Events
            </button>
            <button
              onClick={() => navigate(-1)}
              className="btn btn-secondary w-full"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Format dates
  const startDate = new Date(event.startAt);
  const endDate = new Date(event.endAt);
  const formattedDate = format(startDate, 'EEEE, MMMM d, yyyy');
  const formattedStartTime = format(startDate, 'h:mm a');
  const formattedEndTime = format(endDate, 'h:mm a');

  // Check if the event is created by current user
  const isOrganizer = user?.id === event.organizer?.id;

  return (
    <div className="min-h-screen-minus-header bg-primary">
      {/* Event header with cover image */}
      <div className="relative w-full h-56 md:h-96 bg-tertiary overflow-hidden">
        {event.coverMedia ? (
          <img
            src={event.coverMedia.url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full gradient-primary flex items-center justify-center">
            <h1 className="text-3xl md:text-5xl font-heading font-bold text-white text-center px-4">
              {event.title}
            </h1>
          </div>
        )}
        
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-overlay hover:bg-overlay/80 rounded-full p-2 text-white transition-all backdrop-blur-sm"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-4">
              {event.title}
            </h1>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              {/* Date and time */}
              <div className="flex items-center text-secondary">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formattedDate} • {formattedStartTime} - {formattedEndTime}</span>
              </div>
              
              {/* Location - only if venue exists */}
              {event.venue && (
                <div className="flex items-center text-secondary">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{event.venue.label || 'View location on map'}</span>
                </div>
              )}
            </div>
            
            {/* Organizer */}
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full bg-secondary text-accent flex items-center justify-center mr-3 font-semibold">
                {event.organizer.displayName.charAt(0)}
              </div>
              <div>
                <p className="text-sm text-tertiary">Hosted by</p>
                <p className="font-medium text-primary">{event.organizer.brandName || event.organizer.displayName}</p>
              </div>
            </div>
            
            {/* Categories and tags */}
            {(event.categories.length > 0 || event.tags.length > 0) && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {event.categories.map(category => (
                    <span 
                      key={category}
                      className="badge badge-primary"
                    >
                      {category}
                    </span>
                  ))}
                  {event.tags.map(tag => (
                    <span 
                      key={tag}
                      className="badge badge-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Description */}
            <div className="prose max-w-none mb-8">
              <h2 className="text-xl font-heading font-bold text-primary mb-4">About this event</h2>
              {event.description ? (
                <div 
                  className="text-secondary"
                  dangerouslySetInnerHTML={{ __html: event.description }} 
                />
              ) : (
                event.summary ? (
                  <p className="text-secondary">{event.summary}</p>
                ) : (
                  <p className="text-tertiary">No description provided</p>
                )
              )}
            </div>
            
            {/* Location map */}
            {event.venue?.location && (
              <div className="mb-8">
                <h2 className="text-xl font-heading font-bold text-primary mb-4">Location</h2>
                <div className="h-64 bg-tertiary rounded-lg overflow-hidden mb-2">
                  {/* Map iframe - using OpenStreetMap */}
                  <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight={0} 
                    marginWidth={0} 
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${event.venue.location.lng-0.01}%2C${event.venue.location.lat-0.01}%2C${event.venue.location.lng+0.01}%2C${event.venue.location.lat+0.01}&layer=mapnik&marker=${event.venue.location.lat}%2C${event.venue.location.lng}`} 
                    style={{ border: '1px solid var(--color-border-primary)' }}
                  ></iframe>
                </div>
                {event.venue.label && (
                  <div className="text-primary font-medium">{event.venue.label}</div>
                )}
                {event.venue.address && (
                  <div className="text-secondary">{event.venue.address}</div>
                )}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${event.venue.location.lat},${event.venue.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-accent hover:text-primary transition-colors"
                >
                  Get directions
                </a>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="w-full lg:w-80 xl:w-96">
            <div className="card p-6 sticky top-20">
              {/* Ticket info */}
              <div className="mb-6">
                <h3 className="font-heading font-bold text-lg mb-3 text-primary">Tickets</h3>
                <div>
                  {event.ticketTypes && event.ticketTypes.length > 0 ? (
                    <div className="space-y-3">
                      {event.ticketTypes.map(ticket => (
                        <div key={ticket.id} className="flex justify-between items-center py-2 border-b border-primary">
                          <div>
                            <div className="font-medium text-primary">{ticket.name}</div>
                            <div className="text-sm text-tertiary capitalize">{ticket.kind}</div>
                          </div>
                          <div className="font-medium text-accent">
                            {ticket.priceCents ? `$${(ticket.priceCents / 100).toFixed(2)}` : 'Free'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-secondary">Free entry</div>
                  )}
                </div>
              </div>
              
              {/* Attendees count */}
              <div className="mb-6">
                <div className="flex items-center text-secondary">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>{event.attendeeCount} people going</span>
                </div>
              </div>
              
              {/* RSVP buttons */}
              {!isOrganizer && (
                <div className="space-y-3">
                  <button
                    onClick={() => handleRsvp('going')}
                    disabled={rsvpMutation.isPending}
                    className={cn(
                      'btn w-full',
                      selectedRsvpStatus === 'going' ? 'btn-primary' : 'btn-secondary'
                    )}
                  >
                    {selectedRsvpStatus === 'going' ? (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Going ✓
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Going
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleRsvp('maybe')}
                    disabled={rsvpMutation.isPending}
                    className={cn(
                      'btn w-full',
                      selectedRsvpStatus === 'maybe' ? 'btn-primary' : 'btn-secondary'
                    )}
                  >
                    {selectedRsvpStatus === 'maybe' ? (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Maybe ✓
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Maybe
                      </>
                    )}
                  </button>
                  
                  {event.attendeeCount >= (event.capacity || Infinity) && (
                    <button
                      onClick={() => handleRsvp('waitlist')}
                      disabled={rsvpMutation.isPending}
                      className={cn(
                        'btn w-full',
                        selectedRsvpStatus === 'waitlist' ? 'btn-primary' : 'btn-secondary'
                      )}
                    >
                      {selectedRsvpStatus === 'waitlist' ? (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                          </svg>
                          On Waitlist ✓
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                          </svg>
                          Join Waitlist
                        </>
                      )}
                    </button>
                  )}
                  
                  {selectedRsvpStatus && (
                    <button
                      onClick={() => handleRsvp('not_going')}
                      disabled={rsvpMutation.isPending}
                      className="btn btn-ghost w-full text-sm"
                    >
                      Can't go
                    </button>
                  )}
                </div>
              )}
              
              {/* Edit buttons for organizers */}
              {isOrganizer && (
                <div className="space-y-3">
                  <button
                    onClick={() => navigate(`/edit-event/${eventId}`)}
                    className="btn btn-primary w-full"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Event
                  </button>
                  
                  <button
                    onClick={() => navigate(`/event/${eventId}/manage`)}
                    className="btn btn-secondary w-full"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    Manage Attendees
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;