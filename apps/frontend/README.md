# Circa - Community Driven Interactive Events Platform

Circa is a web application that serves as a community-driven interactive events platform. It allows users to discover, create, and join events in their local area.

## Features

- **Interactive Map**: View events around your area on an interactive map

- **Event Discovery**: Find events based on location, categories, and date

- **Event Creation**: Create and manage your own events

- **RSVP System**: RSVP to events and manage your attendance

- **Waitlist Functionality**: Join waitlists for events at capacity

- **Real-time Chat**: Communicate with event organizers and attendees

- **Collectibles**: Collect limited avatars from events

## Technology Stack

### Frontend

- React with TypeScript

- Vite for fast development

- TailwindCSS for styling

- MapLibre GL / Google Maps for mapping

- React Router for navigation

- TanStack Query for data fetching

- Zustand for state management

- React Hook Form for forms

### Backend

- Node.js with Fastify

- PostgreSQL with PostGIS for geo-queries

- Prisma ORM for database access

- JWT for authentication

- WebSockets for real-time features

- Cloudflare R2 for file storage

## Getting Started

### Prerequisites

- Node.js (v18.0.0 or later)

- pnpm package manager

- PostgreSQL database with PostGIS extension

### Installation

1. $1

```
   git clone https://github.com/yourusername/circa.git
   cd circa
```

1. $1

```
   pnpm install
```

Set up environment variables:

- Create a `.env` file in the root directory based on `.env.example`

- Set the database connection URL

- Configure Cloudflare R2 credentials (for file uploads)

1. $1

```
   pnpm -w apps/api db:migrate
```

1. $1

```
   pnpm dev
```

1. $1

## Project Structure

```
circa/
├── apps/
│   ├── api/            # Backend Fastify API
│   │   ├── prisma/     # Database schema and migrations
│   │   └── src/        # API source code
│   └── web/            # React frontend
│       ├── public/     # Static assets
│       └── src/        # Frontend source code
├── packages/           # Shared packages (if needed)
└── README.md           # This file
```

## License

MIT

## Acknowledgements

- OpenStreetMap for map data

- MapLibre GL for open-source mapping

- Tailwind for styling

- All the amazing open-source packages that made this project possible