import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { eventService } from '@/services/eventService';

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
  const { user } = useAuth();
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
      toast.success('Event created successfully');
      navigate(`/events/${data.id}`);
    },
    onError: (error) => {
      toast.error('Failed to create event');
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
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="bg-white shadow rounded-lg p-8">
          <div className="text-center mb-6">
            <svg className="mx-auto h-16 w-16 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-heading font-bold text-center text-gray-900 mb-4">
            Create an Organizer Profile First
          </h1>
          
          <p className="text-gray-600 mb-6 text-center">
            You need to create an organizer profile before you can host events.
            This helps attendees know who's behind the event.
          </p>
          
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/profile')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Create Organizer Profile
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-heading font-bold text-gray-900 mb-8">Create a New Event</h1>
      
      {/* Steps indicator */}
      <div className="mb-8">
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            1
          </div>
          <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            2
          </div>
          <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            3
          </div>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <div className="w-10 text-center">Basics</div>
          <div className="w-10 text-center">Location</div>
          <div className="w-10 text-center">Publish</div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-sm rounded-lg overflow-hidden">
        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="p-6">
            <h2 className="text-xl font-heading font-bold text-gray-900 mb-6">Event Details</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                    errors.title ? 'border-red-300' : ''
                  }`}
                  {...register('title', { required: 'Title is required' })}
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="summary" className="block text-sm font-medium text-gray-700">
                  Short Summary
                </label>
                <input
                  id="summary"
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  {...register('summary')}
                />
                <p className="mt-2 text-sm text-gray-500">
                  A brief description that will appear in search results and cards
                </p>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={5}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  {...register('description')}
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="startAt" className="block text-sm font-medium text-gray-700">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="startAt"
                    type="date"
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                      errors.startAt ? 'border-red-300' : ''
                    }`}
                    {...register('startAt', { required: 'Start date is required' })}
                  />
                  {errors.startAt && (
                    <p className="mt-2 text-sm text-red-600">{errors.startAt.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="startTime"
                    type="time"
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                      errors.startTime ? 'border-red-300' : ''
                    }`}
                    {...register('startTime', { required: 'Start time is required' })}
                  />
                  {errors.startTime && (
                    <p className="mt-2 text-sm text-red-600">{errors.startTime.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="endAt" className="block text-sm font-medium text-gray-700">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="endAt"
                    type="date"
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                      errors.endAt ? 'border-red-300' : ''
                    }`}
                    {...register('endAt', { required: 'End date is required' })}
                  />
                  {errors.endAt && (
                    <p className="mt-2 text-sm text-red-600">{errors.endAt.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="endTime"
                    type="time"
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                      errors.endTime ? 'border-red-300' : ''
                    }`}
                    {...register('endTime', { required: 'End time is required' })}
                  />
                  {errors.endTime && (
                    <p className="mt-2 text-sm text-red-600">{errors.endTime.message}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                  Timezone <span className="text-red-500">*</span>
                </label>
                <select
                  id="timezone"
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                    errors.timezone ? 'border-red-300' : ''
                  }`}
                  {...register('timezone', { required: 'Timezone is required' })}
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
                {errors.timezone && (
                  <p className="mt-2 text-sm text-red-600">{errors.timezone.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                              field.value.includes(category)
                                ? 'bg-primary-100 text-primary-800'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
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
            <h2 className="text-xl font-heading font-bold text-gray-900 mb-6">Location</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="venueName" className="block text-sm font-medium text-gray-700">
                  Venue Name
                </label>
                <input
                  id="venueName"
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="e.g. Central Park, The Grand Hall"
                  {...register('venueName')}
                />
              </div>
              
              <div>
                <label htmlFor="venueAddress" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  id="venueAddress"
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="123 Main St, New York, NY 10001"
                  {...register('venueAddress')}
                />
              </div>
              
              <div>
                <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center mb-2">
                  <p className="text-gray-600">
                    Map pin selector will be implemented here
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  Click on the map to set the exact location, or search for an address.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 3: Publish */}
        {step === 3 && (
          <div className="p-6">
            <h2 className="text-xl font-heading font-bold text-gray-900 mb-6">Final Details & Publish</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                  Event Capacity
                </label>
                <input
                  id="capacity"
                  type="number"
                  min="1"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  {...register('capacity', { valueAsNumber: true })}
                />
                <p className="mt-2 text-sm text-gray-500">
                  Leave blank for unlimited capacity
                </p>
              </div>
              
              <div>
                <label htmlFor="visibility" className="block text-sm font-medium text-gray-700">
                  Event Visibility
                </label>
                <select
                  id="visibility"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  {...register('visibility')}
                >
                  <option value="public">Public - Listed in search and visible to everyone</option>
                  <option value="unlisted">Unlisted - Not in search, but visible with the link</option>
                  <option value="invite_only">Invite Only - Only visible to invited guests</option>
                  <option value="approval_only">Approval Required - Attendees need approval</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                  Tags (comma separated)
                </label>
                <input
                  id="tags"
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="e.g. workshop, beginners, networking"
                  {...register('tags')}
                />
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Ready to publish?
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
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
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
          )}
          
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={createEventMutation.isPending}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {createEventMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" color="white" className="mr-2" />
                  Creating...
                </>
              ) : (
                'Create Event'
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateEventPage;