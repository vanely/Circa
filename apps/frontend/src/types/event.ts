export interface Venue {
  id: string;
  label?: string;
  address?: string;
  location?: {
    lat: number;
    lng: number;
  };
  visibility: 'public' | 'fuzzy' | 'private_until_rsvp';
}

export interface Media {
  id: string;
  mimeType: string;
  width?: number;
  height?: number;
  blurhash?: string;
  url: string;
}

export interface TicketType {
  id: string;
  name: string;
  kind: 'free' | 'paid' | 'donation' | 'approval';
  priceCents?: number;
  capacity?: number;
  section?: string;
  salesStart?: string;
  salesEnd?: string;
}

export interface Organizer {
  id: string;
  brandName?: string;
  displayName: string;
  avatarMediaId?: string;
}

export interface Event {
  id: string;
  title: string;
  summary?: string;
  description?: string;
  startAt: string;
  endAt: string;
  timezone: string;
  venue?: Venue;
  coverMedia?: Media;
  categories: string[];
  tags: string[];
  visibility: 'public' | 'unlisted' | 'invite_only' | 'approval_only';
  attendeeCount: number;
  capacity?: number;
  userRsvpStatus?: 'going' | 'maybe' | 'waitlist' | 'not_going';
  organizer: Organizer;
  ticketTypes?: TicketType[];
}

export interface EventList {
  events: Event[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface EventFilters {
  q?: string;
  categories?: string[];
  tags?: string[];
  lat?: number;
  lng?: number;
  radius?: number;
  startAtFrom?: string;
  startAtTo?: string;
  visibility?: 'public' | 'unlisted';
  limit?: number;
  offset?: number;
}

export interface RsvpRequest {
  status: 'going' | 'maybe' | 'waitlist' | 'not_going';
  ticketTypeId?: string;
  plusOnes?: number;
}

export interface RsvpResponse {
  ticket: {
    id: string;
    status: 'going' | 'maybe' | 'waitlist' | 'not_going';
    plusOnes: number;
  };
  message: string;
}