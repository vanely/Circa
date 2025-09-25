# Circa

A community-driven interactive events platform that enables users to discover and create events in their area.

## Features

- 🗺️ Interactive map-based event discovery

- 🎭 Fully customizable event pages

- 📍 Location-based filtering

- 🎟️ Free and paid event support

- 👤 Custom collectible avatars

- 💬 Event-specific chat and social features

- 📱 Responsive design for all devices

## Tech Stack

### Backend

- Node.js + TypeScript

- Fastify

- PostgreSQL + PostGIS for geo data

- Prisma ORM

- JWT Authentication

- WebSockets for real-time features

### Frontend

- React + TypeScript

- Tailwind CSS + shadcn/ui

- MapLibre GL JS

- React Hook Form

- TanStack Query

## Project Structure

```
circa/
├── packages/            # Shared packages
│   ├── config/          # Shared configuration
│   └── ui/              # Shared UI components
├── apps/
│   ├── api/             # Backend API
│   │   ├── src/         # Source code
│   │   └── prisma/      # Database schema
│   └── web/             # Frontend application
├── scripts/             # Build and utility scripts
└── docker/              # Docker configuration
```

## Getting Started

### Prerequisites

- Node.js 18+

- pnpm

- PostgreSQL with PostGIS extensions

### Installation

```
# Clone the repository
git clone https://github.com/yourusername/circa.git
cd circa

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize database
cd apps/api
npx prisma migrate dev

# Start development servers
cd ../..
pnpm dev
```

## License

MIT