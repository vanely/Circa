import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { eventService } from '@/services/eventService';
import { useAuthStore } from '@/stores/authStore';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { RsvpRequest } from '@/types/event';

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
      <div className="flex justify-center items-center min-h-screen-minus-header">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-heading font-bold text-gray-900 mb-4">
          Event Not Found
        </h1>
        <p className="text-gray-600 mb-8">
          The event you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Discover Events
        </button>
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
    <div className="bg-white">
      {/* Event header with cover image */}
      <div className="relative w-full h-56 md:h-96 bg-gray-200 overflow-hidden">
        {event.coverMedia ? (
          <img
            src={event.coverMedia.url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary-600 to-primary-800 flex items-center justify-center">
            <h1 className="text-3xl md:text-5xl font-heading font-bold text-white">
              {event.title}
            </h1>
          </div>
        )}
        
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full p-2 text-white transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
              {event.title}
            </h1>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              {/* Date and time */}
              <div className="flex items-center text-gray-700">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formattedDate} • {formattedStartTime} - {formattedEndTime}</span>
              </div>
              
              {/* Location - only if venue exists */}
              {event.venue && (
                <div className="flex items-center text-gray-700">
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
              <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3">
                {event.organizer.displayName.charAt(0)}
              </div>
              <div>
                <p className="text-sm text-gray-500">Hosted by</p>
                <p className="font-medium">{event.organizer.brandName || event.organizer.displayName}</p>
              </div>
            </div>
            
            {/* Categories and tags */}
            {(event.categories.length > 0 || event.tags.length > 0) && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {event.categories.map(category => (
                    <span 
                      key={category}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                    >
                      {category}
                    </span>
                  ))}
                  {event.tags.map(tag => (
                    <span 
                      key={tag}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Description */}
            <div className="prose max-w-none mb-8">
              <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">About this event</h2>
              {event.description ? (
                <div dangerouslySetInnerHTML={{ __html: event.description }} />
              ) : (
                event.summary ? (
                  <p>{event.summary}</p>
                ) : (
                  <p className="text-gray-500">No description provided</p>
                )
              )}
            </div>
            
            {/* Location map */}
            {event.venue?.location && (
              <div className="mb-8">
                <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">Location</h2>
                <div className="h-64 bg-gray-200 rounded-lg overflow-hidden mb-2">
                  {/* Map iframe - using OpenStreetMap */}
                  <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight={0} 
                    marginWidth={0} 
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${event.venue.location.lng-0.01}%2C${event.venue.location.lat-0.01}%2C${event.venue.location.lng+0.01}%2C${event.venue.location.lat+0.01}&layer=mapnik&marker=${event.venue.location.lat}%2C${event.venue.location.lng}`} 
                    style={{ border: '1px solid #ddd' }}
                  ></iframe>
                </div>
                {event.venue.label && (
                  <div className="text-gray-700">{event.venue.label}</div>
                )}
                {event.venue.address && (
                  <div className="text-gray-600">{event.venue.address}</div>
                )}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${event.venue.location.lat},${event.venue.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-primary-600 hover:text-primary-700"
                >
                  Get directions
                </a>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="w-full md:w-80 lg:w-96">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sticky top-20">
              {/* Ticket info */}
              <div className="mb-6">
                <h3 className="font-heading font-bold text-lg mb-2">Tickets</h3>
                <div>
                  {event.ticketTypes && event.ticketTypes.length > 0 ? (
                    <div>
                      {event.ticketTypes.map(ticket => (
                        <div key={ticket.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                          <div>
                            <div className="font-medium">{ticket.name}</div>
                            <div className="text-sm text-gray-500 capitalize">{ticket.kind}</div>
                          </div>
                          <div className="font-medium">
                            {ticket.priceCents ? `$${(ticket.priceCents / 100).toFixed(2)}` : 'Free'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-600">Free entry</div>
                  )}
                </div>
              </div>
              
              {/* Attendees count */}
              <div className="mb-6">
                <div className="flex items-center text-gray-700">
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
                    className={`w-full py-2 px-4 rounded-md shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                      selectedRsvpStatus === 'going'
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {selectedRsvpStatus === 'going' ? 'Going ✓' : 'Going'}
                  </button>
                  
                  <button
                    onClick={() => handleRsvp('maybe')}
                    disabled={rsvpMutation.isPending}
                    className={`w-full py-2 px-4 rounded-md shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                      selectedRsvpStatus === 'maybe'
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {selectedRsvpStatus === 'maybe' ? 'Maybe ✓' : 'Maybe'}
                  </button>
                  
                  {event.attendeeCount >= (event.capacity || Infinity) && (
                    <button
                      onClick={() => handleRsvp('waitlist')}
                      disabled={rsvpMutation.isPending}
                      className={`w-full py-2 px-4 rounded-md shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                        selectedRsvpStatus === 'waitlist'
                          ? 'bg-primary-600 text-white hover:bg-primary-700'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {selectedRsvpStatus === 'waitlist' ? 'On Waitlist ✓' : 'Join Waitlist'}
                    </button>
                  )}
                  
                  {selectedRsvpStatus && (
                    <button
                      onClick={() => handleRsvp('not_going')}
                      disabled={rsvpMutation.isPending}
                      className="w-full py-2 px-4 rounded-md text-sm text-gray-500 hover:text-gray-700 focus:outline-none"
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
                    className="w-full py-2 px-4 rounded-md shadow-sm font-medium bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Edit Event
                  </button>
                  
                  <button
                    onClick={() => navigate(`/event/${eventId}/manage`)}
                    className="w-full py-2 px-4 rounded-md shadow-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
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