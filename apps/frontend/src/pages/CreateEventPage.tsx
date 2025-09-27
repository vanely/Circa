import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { eventService } from '@/services/eventService';
import { cn } from '@/utils/cn';

interface CreateEventFormData {
  title: string;
  summary?: string;
  description?: string;
  startAt: string;
  startTime: string;
  endAt: string;
  endTime: string;
  timezone: string;
  venueName?: string;
  venueAddress?: string;
  venueLocation?: {
    lat: number;
    lng: number;
  };
  categories: string[];
  tags: string[];
  capacity?: number;
  visibility: 'public' | 'unlisted' | 'invite_only' | 'approval_only';
}

// List of timezones for the form
const timezones = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'America/Honolulu',
  'America/Toronto',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
  'Pacific/Auckland',
];

// Available categories
const availableCategories = [
  'Music',
  'Technology',
  'Business',
  'Arts',
  'Sports',
  'Health',
  'Education',
  'Social',
  'Food',
  'Community',
  'Gaming',
  'Travel',
  'Outdoors',
  'Career',
  'Wellness',
];

const CreateEventPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  // Check if user has an organizer profile
  const hasOrganizerProfile = !!user?.organizer;
  
  const { 
    register, 
    handleSubmit, 
    watch, 
    control,
    formState: { errors } 
  } = useForm<CreateEventFormData>({
    defaultValues: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      visibility: 'public',
      categories: [],
      tags: [],
    },
    mode: 'onChange'
  });
  
  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: (data: any) => eventService.createEvent(data),
    onSuccess: (data) => {
      toast.success('Event created successfully!');
      navigate(`/events/${data.id}`);
    },
    onError: (error) => {
      toast.error('Failed to create event. Please try again.');
      console.error(error);
    }
  });
  
  // Format form data for API submission
  const processFormData = (data: CreateEventFormData) => {
    // Combine date and time fields
    const startAt = new Date(`${data.startAt}T${data.startTime}`);
    const endAt = new Date(`${data.endAt}T${data.endTime}`);
    
    // Build venue object if venue details provided
    let venue;
    if (data.venueName || data.venueAddress || data.venueLocation) {
      venue = {
        label: data.venueName,
        address: data.venueAddress,
        location: data.venueLocation,
        visibility: 'public' as const,
      };
    }
    
    // Return formatted data
    return {
      title: data.title,
      summary: data.summary,
      description: data.description,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      timezone: data.timezone,
      venue,
      categories: data.categories,
      tags: data.tags,
      capacity: data.capacity,
      visibility: data.visibility,
      modules: {
        chat: true,
        photoWall: true,
        polls: true,
      },
      theme: {
        primaryColor: '#7C3AED',
        fontHeading: 'Space Grotesk',
        fontBody: 'Inter',
      },
    };
  };
  
  const onSubmit = (data: CreateEventFormData) => {
    const processedData = processFormData(data);
    createEventMutation.mutate(processedData);
  };
  
  // Handle category selection
  const selectedCategories = watch('categories');
  
  const toggleCategory = (category: string) => {
    const current = selectedCategories || [];
    const newCategories = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    
    return newCategories;
  };
  
  // If user doesn't have an organizer profile, redirect to create one
  if (!hasOrganizerProfile) {
    return (
      <div className="min-h-screen-minus-header bg-primary flex items-center justify-center p-4">
        <div className="max-w-md w-full card p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-warning flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-heading font-bold text-primary mb-4">
            Create an Organizer Profile First
          </h1>
          
          <p className="text-secondary mb-6">
            You need to create an organizer profile before you can host events.
            This helps attendees know who's behind the event.
          </p>
          
          <button
            onClick={() => navigate('/profile')}
            className="btn btn-primary w-full"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Create Organizer Profile
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen-minus-header bg-primary py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-primary mb-2">Create a New Event</h1>
          <p className="text-secondary">Share your event with the community</p>
        </div>
        
        {/* Steps indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-accent text-white' : 'bg-secondary text-tertiary'} transition-colors`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-accent' : 'bg-secondary'} transition-colors`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-accent text-white' : 'bg-secondary text-tertiary'} transition-colors`}>
              2
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-accent' : 'bg-secondary'} transition-colors`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 3 ? 'bg-accent text-white' : 'bg-secondary text-tertiary'} transition-colors`}>
              3
            </div>
          </div>
          <div className="flex justify-between text-sm mt-2 max-w-md mx-auto">
            <div className="text-center">Basics</div>
            <div className="text-center">Location</div>
            <div className="text-center">Publish</div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="card overflow-hidden">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="p-6">
              <h2 className="text-xl font-heading font-bold text-primary mb-6">Event Details</h2>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="form-label">
                    Event Title <span className="text-danger">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    className={`form-control ${errors.title ? 'border-danger' : ''}`}
                    placeholder="Enter your event title"
                    {...register('title', { required: 'Title is required' })}
                  />
                  {errors.title && (
                    <p className="form-error">{errors.title.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="summary" className="form-label">
                    Short Summary
                  </label>
                  <input
                    id="summary"
                    type="text"
                    className="form-control"
                    placeholder="A brief description for search results"
                    {...register('summary')}
                  />
                  <p className="text-tertiary text-sm mt-1">
                    A brief description that will appear in search results and cards
                  </p>
                </div>
                
                <div>
                  <label htmlFor="description" className="form-label">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={5}
                    className="form-control"
                    placeholder="Tell attendees what to expect..."
                    {...register('description')}
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="startAt" className="form-label">
                      Start Date <span className="text-danger">*</span>
                    </label>
                    <input
                      id="startAt"
                      type="date"
                      className={`form-control ${errors.startAt ? 'border-danger' : ''}`}
                      {...register('startAt', { required: 'Start date is required' })}
                    />
                    {errors.startAt && (
                      <p className="form-error">{errors.startAt.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="startTime" className="form-label">
                      Start Time <span className="text-danger">*</span>
                    </label>
                    <input
                      id="startTime"
                      type="time"
                      className={`form-control ${errors.startTime ? 'border-danger' : ''}`}
                      {...register('startTime', { required: 'Start time is required' })}
                    />
                    {errors.startTime && (
                      <p className="form-error">{errors.startTime.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="endAt" className="form-label">
                      End Date <span className="text-danger">*</span>
                    </label>
                    <input
                      id="endAt"
                      type="date"
                      className={`form-control ${errors.endAt ? 'border-danger' : ''}`}
                      {...register('endAt', { required: 'End date is required' })}
                    />
                    {errors.endAt && (
                      <p className="form-error">{errors.endAt.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="endTime" className="form-label">
                      End Time <span className="text-danger">*</span>
                    </label>
                    <input
                      id="endTime"
                      type="time"
                      className={`form-control ${errors.endTime ? 'border-danger' : ''}`}
                      {...register('endTime', { required: 'End time is required' })}
                    />
                    {errors.endTime && (
                      <p className="form-error">{errors.endTime.message}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="timezone" className="form-label">
                    Timezone <span className="text-danger">*</span>
                  </label>
                  <select
                    id="timezone"
                    className={`form-control ${errors.timezone ? 'border-danger' : ''}`}
                    {...register('timezone', { required: 'Timezone is required' })}
                  >
                    {timezones.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                  {errors.timezone && (
                    <p className="form-error">{errors.timezone.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="form-label mb-3">
                    Categories
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Controller
                      name="categories"
                      control={control}
                      render={({ field }) => (
                        <>
                          {availableCategories.map((category) => (
                            <button
                              key={category}
                              type="button"
                              onClick={() => field.onChange(toggleCategory(category))}
                              className={cn(
                                'badge transition-colors',
                                field.value.includes(category)
                                  ? 'badge-primary'
                                  : 'badge-secondary hover:bg-secondary-hover'
                              )}
                            >
                              {category}
                            </button>
                          ))}
                        </>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 2: Location */}
          {step === 2 && (
            <div className="p-6">
              <h2 className="text-xl font-heading font-bold text-primary mb-6">Location</h2>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="venueName" className="form-label">
                    Venue Name
                  </label>
                  <input
                    id="venueName"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Central Park, The Grand Hall"
                    {...register('venueName')}
                  />
                </div>
                
                <div>
                  <label htmlFor="venueAddress" className="form-label">
                    Address
                  </label>
                  <input
                    id="venueAddress"
                    type="text"
                    className="form-control"
                    placeholder="123 Main St, New York, NY 10001"
                    {...register('venueAddress')}
                  />
                </div>
                
                <div>
                  <div className="bg-tertiary h-64 rounded-lg flex items-center justify-center mb-2">
                    <div className="text-center">
                      <svg className="w-12 h-12 mx-auto mb-2 text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-tertiary">
                        Map pin selector will be implemented here
                      </p>
                    </div>
                  </div>
                  <p className="text-tertiary text-sm">
                    Click on the map to set the exact location, or search for an address.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 3: Publish */}
          {step === 3 && (
            <div className="p-6">
              <h2 className="text-xl font-heading font-bold text-primary mb-6">Final Details & Publish</h2>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="capacity" className="form-label">
                    Event Capacity
                  </label>
                  <input
                    id="capacity"
                    type="number"
                    min="1"
                    className="form-control"
                    placeholder="Leave blank for unlimited"
                    {...register('capacity', { valueAsNumber: true })}
                  />
                  <p className="text-tertiary text-sm mt-1">
                    Leave blank for unlimited capacity
                  </p>
                </div>
                
                <div>
                  <label htmlFor="visibility" className="form-label">
                    Event Visibility
                  </label>
                  <select
                    id="visibility"
                    className="form-control"
                    {...register('visibility')}
                  >
                    <option value="public">Public - Listed in search and visible to everyone</option>
                    <option value="unlisted">Unlisted - Not in search, but visible with the link</option>
                    <option value="invite_only">Invite Only - Only visible to invited guests</option>
                    <option value="approval_only">Approval Required - Attendees need approval</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="tags" className="form-label">
                    Tags (comma separated)
                  </label>
                  <input
                    id="tags"
                    type="text"
                    className="form-control"
                    placeholder="e.g. workshop, beginners, networking"
                    {...register('tags')}
                  />
                </div>
                
                <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-warning">
                        Ready to publish?
                      </h3>
                      <div className="mt-2 text-sm text-secondary">
                        <p>
                          Once published, your event will be visible according to your visibility settings.
                          You can edit most details after publishing.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Navigation buttons */}
          <div className="px-6 py-4 bg-secondary border-t border-primary flex justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="btn btn-secondary"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn btn-secondary"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
            )}
            
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="btn btn-primary"
              >
                Next
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                type="submit"
                disabled={createEventMutation.isPending}
                className="btn btn-primary"
              >
                {createEventMutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" variant="accent" className="mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Event
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventPage;