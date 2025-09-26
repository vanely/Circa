## **Project Context Setup for Circa**

### **1. Project Overview Documentation**

Create a `.cursorrules` file in the project root:

```markdown
# Circa - Community Events Platform

## Project Architecture
- **Monorepo**: pnpm workspace with backend and frontend apps
- **Backend**: Node.js + TypeScript + Fastify + Prisma + PostgreSQL + PostGIS
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + MapLibre GL JS
- **Database**: PostgreSQL with PostGIS for geospatial data
- **Storage**: Cloudflare R2 for media files
- **Real-time**: WebSockets for chat and live updates

## Key Features
- Interactive map-based event discovery
- Event creation and management
- Ticket system (free/paid/donation)
- Real-time chat and messaging
- Collectible avatars and badges
- Location-based filtering with PostGIS
- User profiles and organizer verification

## Development Workflow
- Use `make dev` to start Docker development environment
- Backend runs on port 3333, frontend on port 3000
- Database migrations: `make db-migrate`
- All services containerized with Docker Compose

## Code Style
- TypeScript strict mode
- ESLint + Prettier for formatting
- Prisma for database operations
- Zod for validation
- React Hook Form for forms
- TanStack Query for data fetching
```

### **2. Cursor App Locations for Project Context**

#### **A. Chat Panel Context (Bottom Panel)**
- **Location**: Bottom chat panel in Cursor
- **Usage**: Reference files with `@filename` or `@folder`
- **Examples**:
  - `@prisma/schema.prisma` - Database schema
  - `@apps/backend/src/controllers` - API controllers
  - `@apps/frontend/src/components` - React components
  - `@docker/docker-compose.yml` - Container setup

#### **B. File Explorer Context**
- **Location**: Left sidebar file explorer
- **Usage**: Right-click files → "Add to Chat Context"
- **Best for**: Specific files you're working on

#### **C. Codebase Search**
- **Location**: `Ctrl+Shift+F` (or `Cmd+Shift+F` on Mac)
- **Usage**: Search for functions, components, or patterns
- **Examples**:
  - Search "Event" to find event-related code
  - Search "WebSocket" for real-time features
  - Search "Prisma" for database operations

#### **D. Command Palette Context**
- **Location**: `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
- **Usage**: Access project-specific commands and context

### **3. All Agents Tab - Multi-Agent Workflow**

#### **A. Agent Specialization Strategy**

Create specialized agents for different aspects of your project:

**1. Backend API Agent**
```
Role: Backend Development Specialist
Focus: Fastify, Prisma, PostgreSQL, WebSockets
Context: @apps/backend/src
Tasks: API endpoints, database operations, authentication
```

**2. Frontend UI Agent**
```
Role: React Frontend Specialist  
Focus: React, TypeScript, Tailwind, MapLibre
Context: @apps/frontend/src
Tasks: Components, pages, state management, UI/UX
```

**3. Database Schema Agent**
```
Role: Database Architecture Specialist
Focus: Prisma, PostgreSQL, PostGIS, data modeling
Context: @apps/backend/prisma
Tasks: Schema design, migrations, queries, optimization
```

**4. DevOps Agent**
```
Role: Infrastructure Specialist
Focus: Docker, deployment, CI/CD, monitoring
Context: @docker, @Makefile
Tasks: Containerization, deployment, environment setup
```

**5. Testing Agent**
```
Role: Quality Assurance Specialist
Focus: Testing, validation, code quality
Context: All test files, validation schemas
Tasks: Unit tests, integration tests, validation
```

#### **B. Multi-Agent Workflow Examples**

**Example 1: Adding a New Event Feature**
```
1. Database Agent: Design schema changes for new event fields
2. Backend Agent: Create API endpoints and business logic
3. Frontend Agent: Build UI components and forms
4. Testing Agent: Write tests for all layers
5. DevOps Agent: Update Docker configs if needed
```

**Example 2: Performance Optimization**
```
1. Backend Agent: Analyze API performance bottlenecks
2. Database Agent: Optimize queries and indexes
3. Frontend Agent: Implement caching and lazy loading
4. DevOps Agent: Configure monitoring and alerts
```

**Example 3. Bug Fixing**
```
1. Testing Agent: Reproduce and isolate the bug
2. Backend/Frontend Agent: Fix the specific issue
3. Database Agent: Check for data integrity issues
4. Testing Agent: Verify fix and add regression tests
```

### **4. Advanced Context Sharing Techniques**

#### **A. Project-Wide Context Files**

Create these files for better agent understanding:

**`PROJECT_CONTEXT.md`** (in root):
```markdown
# Circa Project Context

## Current Development State
- [ ] Feature X in progress
- [ ] Bug Y needs fixing
- [ ] Performance issue Z

## Recent Changes
- Added WebSocket support for real-time chat
- Implemented PostGIS for location queries
- Updated Docker configuration

## Known Issues
- Map rendering performance on mobile
- WebSocket connection drops on network changes
- File upload size limits need adjustment
```

**`DEVELOPMENT_NOTES.md`** (in root):
```markdown
# Development Notes

## Architecture Decisions
- Why we chose Fastify over Express
- PostGIS for geospatial queries
- Cloudflare R2 for media storage

## Performance Considerations
- Database query optimization strategies
- Frontend bundle size optimization
- WebSocket connection management

## Security Considerations
- JWT token handling
- File upload validation
- SQL injection prevention
```

#### **B. Agent Communication Protocol**

Set up a communication system between agents:

**`AGENT_COMMUNICATION.md`**:
```markdown
# Agent Communication Protocol

## Message Format
```
Agent: [AgentName]
Task: [Specific task description]
Context: [Relevant files/areas]
Dependencies: [What other agents need to do first]
Output: [Expected deliverable]
```

## Workflow Examples
1. Feature Request → Database Agent → Backend Agent → Frontend Agent → Testing Agent
2. Bug Report → Testing Agent → Backend/Frontend Agent → Testing Agent
3. Performance Issue → All Agents → DevOps Agent
```

### **5. Cursor-Specific Optimizations**

#### **A. Workspace Settings**

Create `.vscode/settings.json`:
```json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "files.associations": {
    "*.prisma": "prisma"
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.turbo": true
  }
}
```

#### **B. Snippet Library**

Create `.vscode/snippets.json`:
```json
{
  "Fastify Route": {
    "prefix": "fastify-route",
    "body": [
      "fastify.get('/${1:path}', async (request, reply) => {",
      "  try {",
      "    ${2:// Implementation}",
      "    return reply.send({ success: true, data: ${3:result} });",
      "  } catch (error) {",
      "    return reply.status(500).send({ error: error.message });",
      "  }",
      "});"
    ]
  },
  "Prisma Query": {
    "prefix": "prisma-query",
    "body": [
      "const ${1:result} = await prisma.${2:model}.${3:findMany}({",
      "  where: { ${4:condition} },",
      "  include: { ${5:relations} }",
      "});"
    ]
  }
}
```

### **6. Real-Time Collaboration Setup**

#### **A. Agent Status Dashboard**

Create a simple status file that agents can update:

**`AGENT_STATUS.md`**:
```markdown
# Agent Status Dashboard

## Current Tasks
- [ ] Backend Agent: Implementing event search API
- [ ] Frontend Agent: Building event filters component
- [ ] Database Agent: Optimizing location queries
- [ ] Testing Agent: Writing integration tests

## Completed Tasks
- [x] Database Agent: Added PostGIS extensions
- [x] Backend Agent: Implemented WebSocket chat
- [x] Frontend Agent: Created map component

## Blockers
- None currently

## Next Steps
1. Complete event search functionality
2. Add real-time event updates
3. Implement user notifications
```

#### **B. Code Review Workflow**

Set up a multi-agent code review process:

```
1. Development Agent: Creates feature/bugfix
2. Testing Agent: Reviews and adds tests
3. Security Agent: Checks for vulnerabilities
4. Performance Agent: Analyzes performance impact
5. Documentation Agent: Updates documentation
6. DevOps Agent: Reviews deployment impact
```

### **7. Performance Monitoring for Agent Swarm**

#### **A. Agent Efficiency Metrics**

Track agent performance:
- Response time
- Code quality
- Test coverage
- Bug resolution time

#### **B. Context Sharing Optimization**

- Use file references instead of copying code
- Create focused context files for specific features
- Implement context versioning for different development phases

### **8. Advanced Multi-Agent Patterns**

#### **A. Parallel Development**
```
Feature: User Profile Enhancement
├── Agent 1: Database schema changes
├── Agent 2: Backend API endpoints
├── Agent 3: Frontend components
└── Agent 4: Integration tests
```

#### **B. Iterative Refinement**
```
Cycle 1: Basic implementation
Cycle 2: Performance optimization
Cycle 3: Security hardening
Cycle 4: User experience polish
```

#### **C. Cross-Validation**
```
Agent A: Implements feature
Agent B: Reviews and suggests improvements
Agent C: Tests edge cases
Agent D: Validates security implications
```

This setup enables fast iteration and coordinated work across the Circa project.