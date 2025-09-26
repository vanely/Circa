import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import { useRefreshUser } from '@/hooks/auth';
import { usersApi } from '@/api/users';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

interface ProfileFormData {
  displayName: string;
  bio?: string;
}

interface OrganizerFormData {
  brandName: string;
}

const ProfilePage = () => {
  const { user } = useAuthStore();
  const refreshUserMutation = useRefreshUser();
  const navigate = useNavigate();
  const [showOrganizerForm, setShowOrganizerForm] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    defaultValues: {
      displayName: user?.displayName || '',
      bio: user?.bio || '',
    }
  });
  
  const { register: registerOrganizer, handleSubmit: handleOrganizerSubmit, formState: { errors: organizerErrors } } = useForm<OrganizerFormData>();

  // Query to get user's attending events
  const { data: attendingEvents, isPending: eventsLoading } = useQuery({
    queryKey: ['userEvents', 'attending'],
    queryFn: () => usersApi.getUserAttendingEvents(),
  });

  // Query to get user's organizing events
  const { data: organizingEvents, isPending: organizingEventsLoading } = useQuery({
    queryKey: ['userEvents', 'organizing'],
    queryFn: () => usersApi.getUserOrganizingEvents(),
    enabled: !!user?.organizer,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) => usersApi.updateCurrentUser(data),
    onSuccess: () => {
      toast.success('Profile updated successfully');
      refreshUserMutation.mutate();
    },
    onError: () => {
      toast.error('Failed to update profile');
    }
  });

  // Create organizer profile mutation
  const createOrganizerMutation = useMutation({
    mutationFn: (data: OrganizerFormData) => usersApi.createOrganizerProfile(data),
    onSuccess: () => {
      toast.success('Organizer profile created successfully');
      refreshUserMutation.mutate();
      setShowOrganizerForm(false);
    },
    onError: () => {
      toast.error('Failed to create organizer profile');
    }
  });

  const onSubmitProfile = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const onSubmitOrganizer = (data: OrganizerFormData) => {
    createOrganizerMutation.mutate(data);
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen-minus-header">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-heading font-bold text-gray-900 mb-8">Your Profile</h1>
        
        <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-8">
          {/* Profile form */}
          <div className="p-6">
            <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">Personal Information</h2>
            
            <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-6">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                    errors.displayName ? 'border-red-300' : ''
                  }`}
                  {...register('displayName', { required: 'Display name is required' })}
                />
                {errors.displayName && (
                  <p className="mt-2 text-sm text-red-600">{errors.displayName.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Tell us a bit about yourself..."
                  {...register('bio')}
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {updateProfileMutation.isPending ? <LoadingSpinner size="sm" color="white" className="mr-2" /> : null}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
          
          {/* Organizer section */}
          <div className="border-t border-gray-200 p-6">
            <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">Organizer Profile</h2>
            
            {user.organizer ? (
              <div>
                <div className="flex items-center mb-6">
                  <div className="bg-primary-100 text-primary-600 p-2 rounded-full mr-3">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">{user.organizer.brandName || user.displayName}</p>
                    <p className="text-sm text-gray-600">
                      Verification status: <span className="capitalize">{user.organizer.verificationStatus}</span>
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => navigate('/create-event')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Create New Event
                </button>
              </div>
            ) : showOrganizerForm ? (
              <form onSubmit={handleOrganizerSubmit(onSubmitOrganizer)} className="space-y-6">
                <div>
                  <label htmlFor="brandName" className="block text-sm font-medium text-gray-700">
                    Brand/Organization Name
                  </label>
                  <input
                    id="brandName"
                    type="text"
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                      organizerErrors.brandName ? 'border-red-300' : ''
                    }`}
                    {...registerOrganizer('brandName', { required: 'Brand name is required' })}
                  />
                  {organizerErrors.brandName && (
                    <p className="mt-2 text-sm text-red-600">{organizerErrors.brandName.message}</p>
                  )}
                </div>
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setShowOrganizerForm(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={createOrganizerMutation.isPending}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {createOrganizerMutation.isPending ? <LoadingSpinner size="sm" color="white" className="mr-2" /> : null}
                    Create Organizer Profile
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">
                  Want to create events on Circa? Create an organizer profile to get started.
                </p>
                <button
                  onClick={() => setShowOrganizerForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Become an Organizer
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Events section */}
        <div className="space-y-8">
          {/* Events you're attending */}
          <div>
            <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">Events You're Attending</h2>
            
            {eventsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : attendingEvents?.events && attendingEvents.events.length > 0 ? (
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {attendingEvents.events.map((event: any) => (
                    <div key={event.id} className="p-4 hover:bg-gray-50">
                      <a 
                        href={`/events/${event.id}`}
                        className="block"
                      >
                        <h3 className="text-lg font-medium text-gray-900 mb-1">{event.title}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(event.startAt).toLocaleDateString()} • 
                          <span className="ml-2 capitalize">{event.ticketStatus}</span>
                        </p>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white shadow-sm rounded-lg p-8 text-center">
                <p className="text-gray-600">You're not attending any events yet.</p>
                <button
                  onClick={() => navigate('/')}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Discover Events
                </button>
              </div>
            )}
          </div>
          
          {/* Events you're organizing */}
          {user.organizer && (
            <div>
              <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">Events You're Organizing</h2>
              
              {organizingEventsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : organizingEvents?.events && organizingEvents.events.length > 0 ? (
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                  <div className="divide-y divide-gray-200">
                    {organizingEvents.events.map((event: any) => (
                      <div key={event.id} className="p-4 hover:bg-gray-50">
                        <a 
                          href={`/events/${event.id}`}
                          className="block"
                        >
                          <h3 className="text-lg font-medium text-gray-900 mb-1">{event.title}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(event.startAt).toLocaleDateString()} • 
                            <span className="ml-2">{event.attendeeCount} attendees</span>
                          </p>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white shadow-sm rounded-lg p-8 text-center">
                  <p className="text-gray-600">You haven't created any events yet.</p>
                  <button
                    onClick={() => navigate('/create-event')}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Create Your First Event
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;