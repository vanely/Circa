import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Sample data
const users = [
  {
    email: 'jane@example.com',
    displayName: 'Jane Smith',
    bio: 'Event enthusiast and community builder',
  },
  {
    email: 'alex@example.com',
    displayName: 'Alex Johnson',
    bio: 'Love discovering new experiences',
  },
  {
    email: 'sam@example.com',
    displayName: 'Sam Wilson',
    bio: 'Photographer and adventurer',
  },
];

// Categories and tags for events
const categories = ['Music', 'Tech', 'Food', 'Art', 'Outdoors', 'Sports', 'Education'];
const tags = [
  'concert', 'workshop', 'meetup', 'conference', 'party', 'networking',
  'free', 'paid', 'family-friendly', 'adults-only', 'beginner-friendly',
];

// Venue locations (example coordinates for different cities)
const locations = [
  // New York
  { lat: 40.7128, lng: -74.0060, city: 'New York' },
  { lat: 40.7580, lng: -73.9855, city: 'New York' },
  { lat: 40.7488, lng: -73.9857, city: 'New York' },
  
  // San Francisco
  { lat: 37.7749, lng: -122.4194, city: 'San Francisco' },
  { lat: 37.7833, lng: -122.4167, city: 'San Francisco' },
  { lat: 37.7694, lng: -122.4862, city: 'San Francisco' },
  
  // Chicago
  { lat: 41.8781, lng: -87.6298, city: 'Chicago' },
  { lat: 41.8825, lng: -87.6234, city: 'Chicago' },
  { lat: 41.9023, lng: -87.6345, city: 'Chicago' },
];

// Event names
const eventNameParts = {
  prefixes: ['Annual', 'Summer', 'Winter', 'Spring', 'Fall', 'Community', 'Local', 'International', 'Virtual'],
  subjects: ['Tech', 'Music', 'Food', 'Art', 'Film', 'Book', 'Fitness', 'Wellness', 'Business', 'Science'],
  events: ['Festival', 'Conference', 'Meetup', 'Workshop', 'Party', 'Expo', 'Summit', 'Retreat', 'Gathering', 'Showcase'],
};

// Generate random event names
function generateEventName() {
  const prefix = eventNameParts.prefixes[Math.floor(Math.random() * eventNameParts.prefixes.length)];
  const subject = eventNameParts.subjects[Math.floor(Math.random() * eventNameParts.subjects.length)];
  const event = eventNameParts.events[Math.floor(Math.random() * eventNameParts.events.length)];
  
  return `${prefix} ${subject} ${event}`;
}

// Generate a random date in the future
function getRandomFutureDate(minDays = 1, maxDays = 180) {
  const daysInFuture = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
  const date = new Date();
  date.setDate(date.getDate() + daysInFuture);
  return date;
}

// Get a random duration for an event
function getRandomDuration() {
  const durations = [60, 90, 120, 180, 240, 300]; // minutes
  return durations[Math.floor(Math.random() * durations.length)];
}

// Generate random event theme
function generateRandomTheme() {
  const colors = ['#7C3AED', '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#EC4899'];
  const fonts = ['Inter', 'Poppins', 'Space Grotesk', 'Montserrat', 'Roboto', 'Open Sans'];
  const blocks = ['hero', 'about', 'schedule', 'map', 'gallery', 'faq', 'rules', 'sponsors'];
  const stickers = ['sparkles', 'waves', 'dots', 'hearts', 'stars'];
  
  return {
    palette: {
      primary: colors[Math.floor(Math.random() * colors.length)],
      bg: '#0B0B10',
      fg: '#F6F6F6',
    },
    fonts: {
      heading: fonts[Math.floor(Math.random() * fonts.length)],
      body: 'Inter',
    },
    blocks: blocks.filter(() => Math.random() > 0.3), // Randomly include some blocks
    stickers: stickers.filter(() => Math.random() > 0.5), // Randomly include some stickers
    motion: { hover: Math.random() > 0.3 },
  };
}

// Generate sample event descriptions
function generateEventDescription() {
  return `Join us for this exciting event where you'll connect with like-minded individuals, learn new skills, and have a great time.

## What to Expect

- Networking opportunities with industry professionals
- Interactive workshops and presentations
- Food and refreshments provided
- Swag and giveaways

## Schedule

- **5:00 PM** - Doors Open & Registration
- **5:30 PM** - Welcome and Introduction
- **6:00 PM** - Main Presentation
- **7:00 PM** - Networking Session
- **8:00 PM** - Event Concludes

We can't wait to see you there!`;
}

// Main seed function
async function seed() {
  console.log('🌱 Starting database seeding...');
  
  // Create users
  console.log('Creating users...');
  const createdUsers = [];
  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    });
    
    createdUsers.push(user);
    
    // Create organizer profile for each user
    await prisma.organizerProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        brandName: `${user.displayName}'s Events`,
        verificationStatus: 'verified',
      },
    });
  }
  
  // Create organizer profiles
  console.log('Creating organizer profiles...');
  const organizerProfiles = await prisma.organizerProfile.findMany();
  
  // Create venues
  console.log('Creating venues...');
  const venues = [];
  
  for (const location of locations) {
    const venue = await prisma.venue.create({
      data: {
        label: `${location.city} Venue ${crypto.randomBytes(2).toString('hex')}`,
        address: `123 Main St, ${location.city}`,
        location: JSON.stringify({ lat: location.lat, lng: location.lng }),
        visibility: 'public',
      },
    });
    
    venues.push(venue);
  }
  
  // Create events
  console.log('Creating events...');
  const events = [];
  
  for (let i = 0; i < 15; i++) {
    // Pick a random organizer
    const organizer = organizerProfiles[Math.floor(Math.random() * organizerProfiles.length)];
    
    // Pick a random venue
    const venue = venues[Math.floor(Math.random() * venues.length)];
    
    // Generate random event dates
    const startAt = getRandomFutureDate();
    const durationMinutes = getRandomDuration();
    const endAt = new Date(startAt.getTime() + durationMinutes * 60 * 1000);
    
    // Pick random categories and tags
    const eventCategories = [categories[Math.floor(Math.random() * categories.length)]];
    const eventTags = [];
    for (let j = 0; j < 3; j++) {
      if (Math.random() > 0.5) {
        const tag = tags[Math.floor(Math.random() * tags.length)];
        if (!eventTags.includes(tag)) {
          eventTags.push(tag);
        }
      }
    }
    
    // Generate event name
    const title = generateEventName();
    
    // Create event
    const event = await prisma.event.create({
      data: {
        organizerId: organizer.id,
        title,
        summary: `Join us for ${title} in ${venue.label.split(' ')[0]}.`,
        description: generateEventDescription(),
        startAt,
        endAt,
        timezone: 'America/New_York',
        venueId: venue.id,
        categories: eventCategories,
        tags: eventTags,
        capacity: Math.floor(Math.random() * 100) + 20,
        visibility: Math.random() > 0.8 ? 'unlisted' : 'public',
        modules: {
          chat: Math.random() > 0.2,
          polls: Math.random() > 0.5,
          photoWall: Math.random() > 0.5,
        },
        theme: generateRandomTheme(),
      },
    });
    
    events.push(event);
    
    // Create ticket types for each event
    await prisma.ticketType.create({
      data: {
        eventId: event.id,
        name: 'General Admission',
        kind: 'free',
      },
    });
    
    // Add paid ticket types to some events
    if (Math.random() > 0.6) {
      await prisma.ticketType.create({
        data: {
          eventId: event.id,
          name: 'VIP',
          kind: 'paid',
          priceCents: Math.floor(Math.random() * 5000) + 1000,
          capacity: Math.floor(Math.random() * 20) + 5,
        },
      });
      
      // Update event price range
      await prisma.event.update({
        where: { id: event.id },
        data: {
          priceMinCents: Math.floor(Math.random() * 5000) + 1000,
          priceMaxCents: Math.floor(Math.random() * 10000) + 6000,
        },
      });
    }
  }
  
  // Create RSVPs
  console.log('Creating RSVPs...');
  for (const user of createdUsers) {
    // User attends some events
    const eventsToAttend = events
      .filter(() => Math.random() > 0.5)
      .slice(0, Math.floor(Math.random() * 5) + 1);
    
    for (const event of eventsToAttend) {
      const ticketType = await prisma.ticketType.findFirst({
        where: { eventId: event.id },
      });
      
      if (ticketType) {
        await prisma.ticket.create({
          data: {
            eventId: event.id,
            userId: user.id,
            ticketTypeId: ticketType.id,
            status: 'going',
            plusOnes: Math.random() > 0.7 ? 1 : 0,
          },
        });
      }
    }
  }
  
  // Create messages for events
  console.log('Creating messages...');
  for (const event of events) {
    // Only add messages to events with chat enabled
    const eventData = await prisma.event.findUnique({
      where: { id: event.id },
      select: { modules: true },
    });
    
    if (eventData?.modules.chat) {
      const messageCount = Math.floor(Math.random() * 10);
      
      for (let i = 0; i < messageCount; i++) {
        const user = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        
        await prisma.message.create({
          data: {
            eventId: event.id,
            userId: user.id,
            channel: 'general',
            body: [
              'Looking forward to this event!',
              'Does anyone know if there\'s parking nearby?',
              'What time does registration open?',
              'Can\'t wait to meet everyone!',
              'Is there a dress code?',
              'This is going to be amazing!',
              'First time attending, any tips?',
              'Who else is coming from downtown?',
              'Will there be food?',
              'See you all there!',
            ][Math.floor(Math.random() * 10)],
          },
        });
      }
    }
  }
  
  console.log('✅ Database seeding completed!');
}

// Execute seed function
seed()
  .catch(e => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
