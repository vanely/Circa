# Circa API

This is the backend API for the Circa application, a community-driven interactive events platform.

## Features

- Authentication with magic links

- Event creation, management, and discovery

- Location-based filtering with PostGIS

- RSVP and ticket management

- Real-time messaging using WebSockets

- Media uploads with Cloudflare R2

- Collectible avatars and badges

## Tech Stack

- Node.js + TypeScript

- Fastify

- PostgreSQL + PostGIS

- Prisma ORM

- JWT Authentication

- WebSockets for real-time features

## Getting Started

### Prerequisites

- Node.js 18+

- pnpm

- PostgreSQL with PostGIS extensions

### Environment Setup

Create a `.env` file in the `apps/api` directory using the `.env.example` as a template:

```
cp .env.example .env
```

Update the values in `.env` with your own configuration.

### Install Dependencies

```
pnpm install
```

### Database Setup

```
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database with sample data
npx prisma db seed
```

### Start Development Server

```
pnpm dev
```

The API server will start on [http://localhost:3000](http://localhost:3000).

## API Documentation

The API documentation is available at [http://localhost:3000/docs](http://localhost:3000/docs) when the server is running.

## Database Schema

The database schema is defined in `prisma/schema.prisma`. Key models include:

- User: Users of the platform

- Event: Community events with location, time, and details

- Venue: Locations where events take place

- Ticket/RSVP: User RSVPs to events

- Message: Chat messages for events

- Collectible: Custom avatars and badges

## Docker

To run the entire application using Docker:

```
docker-compose up -d
```

This will start the PostgreSQL database, API server, and web application.

## Testing

```
# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage
```