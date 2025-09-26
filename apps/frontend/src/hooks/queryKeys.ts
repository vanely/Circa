// Centralized query key mappings for TanStack Query
// This ensures consistent query key structure across all hooks

export const queryKeys = {
  // Auth queries
  auth: {
    all: ['auth'] as const,
    currentUser: () => [...queryKeys.auth.all, 'currentUser'] as const,
  },

  // User queries
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    profile: (id: string) => [...queryKeys.users.all, 'profile', id] as const,
  },

  // Event queries
  events: {
    all: ['events'] as const,
    lists: () => [...queryKeys.events.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.events.lists(), { filters }] as const,
    details: () => [...queryKeys.events.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.events.details(), id] as const,
    featured: () => [...queryKeys.events.all, 'featured'] as const,
    nearby: (lat: number, lng: number, radius?: number) => 
      [...queryKeys.events.all, 'nearby', { lat, lng, radius }] as const,
    byVenue: (venueId: string) => [...queryKeys.events.all, 'venue', venueId] as const,
    byUser: (userId: string) => [...queryKeys.events.all, 'user', userId] as const,
  },

  // Venue queries
  venues: {
    all: ['venues'] as const,
    lists: () => [...queryKeys.venues.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.venues.lists(), { filters }] as const,
    details: () => [...queryKeys.venues.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.venues.details(), id] as const,
    nearby: (lat: number, lng: number, radius?: number) => 
      [...queryKeys.venues.all, 'nearby', { lat, lng, radius }] as const,
    search: (query: string) => [...queryKeys.venues.all, 'search', query] as const,
  },

  // Ticket queries
  tickets: {
    all: ['tickets'] as const,
    lists: () => [...queryKeys.tickets.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.tickets.lists(), { filters }] as const,
    details: () => [...queryKeys.tickets.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.tickets.details(), id] as const,
    byUser: (userId: string) => [...queryKeys.tickets.all, 'user', userId] as const,
    byEvent: (eventId: string) => [...queryKeys.tickets.all, 'event', eventId] as const,
  },

  // Message queries
  messages: {
    all: ['messages'] as const,
    lists: () => [...queryKeys.messages.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.messages.lists(), { filters }] as const,
    details: () => [...queryKeys.messages.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.messages.details(), id] as const,
    byEvent: (eventId: string) => [...queryKeys.messages.all, 'event', eventId] as const,
    byUser: (userId: string) => [...queryKeys.messages.all, 'user', userId] as const,
  },

  // Collectible queries
  collectibles: {
    all: ['collectibles'] as const,
    lists: () => [...queryKeys.collectibles.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.collectibles.lists(), { filters }] as const,
    details: () => [...queryKeys.collectibles.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.collectibles.details(), id] as const,
    byUser: (userId: string) => [...queryKeys.collectibles.all, 'user', userId] as const,
    byEvent: (eventId: string) => [...queryKeys.collectibles.all, 'event', eventId] as const,
  },

  // Upload queries
  uploads: {
    all: ['uploads'] as const,
    lists: () => [...queryKeys.uploads.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.uploads.lists(), { filters }] as const,
    details: () => [...queryKeys.uploads.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.uploads.details(), id] as const,
    byUser: (userId: string) => [...queryKeys.uploads.all, 'user', userId] as const,
  },
} as const;
