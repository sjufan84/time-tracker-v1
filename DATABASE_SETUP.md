# SQLite Database Setup for Time Tracker

This document explains how the SQLite database has been integrated into your Next.js time tracker application.

## Database Structure

The database includes three main tables:

### 1. Projects Table
- `id` (INTEGER, PRIMARY KEY)
- `name` (TEXT, NOT NULL)
- `description` (TEXT, OPTIONAL)
- `color` (TEXT, DEFAULT: '#3B82F6')
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

### 2. Tasks Table
- `id` (INTEGER, PRIMARY KEY)
- `project_id` (INTEGER, FOREIGN KEY)
- `name` (TEXT, NOT NULL)
- `description` (TEXT, OPTIONAL)
- `status` (TEXT, DEFAULT: 'active' - 'active'|'completed'|'paused')
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

### 3. Time Entries Table
- `id` (INTEGER, PRIMARY KEY)
- `task_id` (INTEGER, FOREIGN KEY)
- `description` (TEXT, OPTIONAL)
- `start_time` (DATETIME, NOT NULL)
- `end_time` (DATETIME, OPTIONAL)
- `duration` (INTEGER, in seconds)
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

## Files Created

### Core Database Files
- `lib/database.ts` - Database connection and prepared statements
- `lib/types.ts` - TypeScript type definitions
- `lib/db-utils.ts` - Utility functions for database operations

### API Routes
- `app/api/projects/route.ts` - CRUD operations for projects
- `app/api/projects/[id]/route.ts` - Individual project operations
- `app/api/tasks/route.ts` - CRUD operations for tasks
- `app/api/tasks/[id]/route.ts` - Individual task operations
- `app/api/time-entries/route.ts` - CRUD operations for time entries
- `app/api/time-entries/[id]/route.ts` - Individual time entry operations
- `app/api/timer/route.ts` - Timer start/stop functionality
- `app/api/stats/route.ts` - Statistics and analytics
- `app/api/test/route.ts` - Test endpoint for creating sample data

## Usage Examples

### Creating a Project
```typescript
const response = await fetch('/api/projects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My Project',
    description: 'Project description',
    color: '#10B981'
  })
});
```

### Creating a Task
```typescript
const response = await fetch('/api/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    project_id: 1,
    name: 'My Task',
    description: 'Task description',
    status: 'active'
  })
});
```

### Starting a Timer
```typescript
const response = await fetch('/api/timer', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    task_id: 1,
    description: 'Working on feature X'
  })
});
```

### Stopping a Timer
```typescript
const response = await fetch('/api/timer', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    time_entry_id: 1
  })
});
```

### Getting Statistics
```typescript
const response = await fetch('/api/stats?type=projects');
const projectStats = await response.json();
```

## Database File Location

The SQLite database file (`time-tracker.db`) will be created in your project root directory when you first run the application.

## Testing the Setup

1. Start your development server: `npm run dev`
2. Visit `http://localhost:3000/api/test` to create sample data
3. Use the API endpoints to interact with your database

## Key Features

- **Foreign Key Constraints**: Ensures data integrity
- **Prepared Statements**: Better performance and security
- **TypeScript Support**: Full type safety
- **RESTful API**: Standard HTTP methods for all operations
- **Timer Functionality**: Start/stop timers with automatic duration calculation
- **Statistics**: Built-in analytics for projects and tasks
- **Date Range Queries**: Filter time entries by date ranges

## Next Steps

You can now build your frontend components to interact with these API endpoints. The database is ready to handle all your time tracking needs!
