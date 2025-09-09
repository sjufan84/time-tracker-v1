# Time Entries API

This directory contains the complete Time Entries API with advanced filtering, pagination, search, and bulk operations.

## Endpoints

### Main Time Entries Route (`/api/time-entries`)

#### GET `/api/time-entries`
Retrieve time entries with advanced filtering and pagination.

**Query Parameters:**
- `start_date` (string): Filter entries from this date (ISO format)
- `end_date` (string): Filter entries to this date (ISO format)
- `project_id` (number): Filter by project ID
- `task_id` (number): Filter by task ID
- `status` (string): Filter by status (`active`, `completed`, `all`)
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Items per page (default: 50, max: 100)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "task_id": 1,
      "description": "Working on feature",
      "start_time": "2024-01-01T09:00:00Z",
      "end_time": "2024-01-01T10:30:00Z",
      "duration": 5400,
      "task_name": "Implement login",
      "project_name": "Web App",
      "project_color": "#3B82F6",
      "project_id": 1
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "pages": 2,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### POST `/api/time-entries`
Create a new time entry.

**Request Body:**
```json
{
  "task_id": 1,
  "description": "Working on feature",
  "start_time": "2024-01-01T09:00:00Z",
  "end_time": "2024-01-01T10:30:00Z",
  "duration": 5400
}
```

**Response:**
```json
{
  "id": 1,
  "task_id": 1,
  "description": "Working on feature",
  "start_time": "2024-01-01T09:00:00Z",
  "end_time": "2024-01-01T10:30:00Z",
  "duration": 5400,
  "created_at": "2024-01-01T09:00:00Z",
  "updated_at": "2024-01-01T09:00:00Z"
}
```

### Individual Time Entry (`/api/time-entries/[id]`)

#### PUT `/api/time-entries/[id]`
Update a time entry.

#### DELETE `/api/time-entries/[id]`
Delete a time entry.

### Statistics (`/api/time-entries/stats`)

#### GET `/api/time-entries/stats`
Get time entry statistics.

**Query Parameters:**
- `project_id` (number): Get stats for specific project
- `start_date` (string): Filter stats from this date
- `end_date` (string): Filter stats to this date

**Response:**
```json
{
  "total_entries": 150,
  "active_entries": 3,
  "completed_entries": 147,
  "total_duration": 324000,
  "avg_duration": 2160
}
```

### Search (`/api/time-entries/search`)

#### GET `/api/time-entries/search`
Search time entries by text.

**Query Parameters:**
- `q` (string): Search query (min 2 characters)
- `project_id` (number): Filter by project
- `task_id` (number): Filter by task
- `start_date` (string): Filter from date
- `end_date` (string): Filter to date
- `page` (number): Page number
- `limit` (number): Items per page

**Response:**
```json
{
  "data": [...],
  "query": "login feature",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### Bulk Operations (`/api/time-entries/bulk`)

#### POST `/api/time-entries/bulk`
Perform bulk operations on multiple time entries.

**Request Body:**
```json
{
  "action": "stop|delete|update",
  "time_entry_ids": [1, 2, 3],
  "data": {
    "description": "Updated description"
  }
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    { "id": 1, "success": true, "data": {...} }
  ],
  "errors": [],
  "summary": {
    "total": 3,
    "successful": 3,
    "failed": 0
  }
}
```

## Features

### ✅ **Advanced Filtering**
- Filter by date range, project, task, or status
- Combine multiple filters for precise results
- Optimized database queries for performance

### ✅ **Pagination**
- Configurable page size (max 100 items)
- Complete pagination metadata
- Efficient offset-based pagination

### ✅ **Search Functionality**
- Full-text search across descriptions, task names, and project names
- Case-insensitive search with LIKE queries
- Combined with filtering options

### ✅ **Bulk Operations**
- Stop multiple active timers at once
- Delete multiple entries
- Update multiple entries with same data
- Detailed success/error reporting

### ✅ **Statistics**
- Overall and project-specific statistics
- Active vs completed entry counts
- Total and average duration calculations
- Date range filtering support

### ✅ **Error Handling**
- Comprehensive input validation
- Detailed error messages
- Proper HTTP status codes
- Type-safe TypeScript implementation

### ✅ **Performance Optimizations**
- Prepared SQL statements
- Efficient database indexes
- Optimized query selection based on filters
- Minimal data transfer with pagination

## Usage Examples

### Get active timers
```bash
GET /api/time-entries?status=active
```

### Get entries for a project in date range
```bash
GET /api/time-entries?project_id=1&start_date=2024-01-01&end_date=2024-01-31
```

### Search for specific work
```bash
GET /api/time-entries/search?q=login&project_id=1
```

### Get project statistics
```bash
GET /api/time-entries/stats?project_id=1&start_date=2024-01-01&end_date=2024-01-31
```

### Stop all active timers
```bash
POST /api/time-entries/bulk
{
  "action": "stop",
  "time_entry_ids": [1, 2, 3]
}
```

## Database Schema

The API works with the following database structure:

```sql
-- Time entries table
CREATE TABLE time_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL,
  description TEXT,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  duration INTEGER, -- in seconds
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX idx_time_entries_start_time ON time_entries(start_time);
```

## Error Codes

- `400` - Bad Request (validation errors, missing parameters)
- `404` - Not Found (time entry, task, or project not found)
- `409` - Conflict (task already has active timer)
- `500` - Internal Server Error (database or server errors)
