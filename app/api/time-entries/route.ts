import { NextRequest, NextResponse } from 'next/server';
import { queries } from '@/lib/database';
import { 
  TimeEntry, 
  CreateTimeEntryRequest, 
  TimeEntryWithDetails, 
  PaginatedResponse,
  TimeEntryCount,
  TimeEntryFilters
} from '@/lib/types';
import { timeEntryUtils } from '@/lib/db-utils';

// Helper function to parse query parameters
function parseQueryParams(searchParams: URLSearchParams): TimeEntryFilters {
  const startDate = searchParams.get('start_date') || undefined;
  const endDate = searchParams.get('end_date') || undefined;
  const projectId = searchParams.get('project_id');
  const taskId = searchParams.get('task_id');
  const status = searchParams.get('status') as 'active' | 'completed' | 'all' | undefined;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

  return {
    startDate,
    endDate,
    projectId: projectId && projectId !== 'all' ? Number(projectId) : undefined,
    taskId: taskId ? Number(taskId) : undefined,
    status,
    page,
    limit
  };
}

// Validation helper
function validateTimeEntryData(data: unknown): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data || typeof data !== 'object') {
    errors.push('Data must be an object');
    return { isValid: false, errors };
  }

  const entryData = data as Record<string, unknown>;
  
  if (!entryData.task_id || typeof entryData.task_id !== 'number') {
    errors.push('task_id is required and must be a number');
  }
  
  if (entryData.description && typeof entryData.description !== 'string') {
    errors.push('description must be a string');
  }
  
  if (entryData.start_time && typeof entryData.start_time !== 'string') {
    errors.push('start_time must be a valid ISO string');
  }
  
  if (entryData.end_time && typeof entryData.end_time !== 'string') {
    errors.push('end_time must be a valid ISO string');
  }
  
  if (entryData.duration && (typeof entryData.duration !== 'number' || entryData.duration < 0)) {
    errors.push('duration must be a positive number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Create a new time entry
export async function POST(request: NextRequest) {
  try {
    const body: CreateTimeEntryRequest = await request.json();
    
    // Validate input data
    const validation = validateTimeEntryData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // Check if task exists
    const task = queries.getTaskById.get(body.task_id);
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check if there's already an active timer for this task
    const activeEntries = queries.getActiveTimeEntries.all() as TimeEntry[];
    const hasActiveTimer = activeEntries.some(entry => entry.task_id === body.task_id);
    
    if (hasActiveTimer) {
      return NextResponse.json(
        { error: 'Task already has an active timer' },
        { status: 409 }
      );
    }

    const newTimeEntry = timeEntryUtils.create(body);
    return NextResponse.json(newTimeEntry, { status: 201 });
  } catch (error) {
    console.error('Error creating time entry:', error);
    return NextResponse.json(
      { error: 'Failed to create time entry' },
      { status: 500 }
    );
  }
}

// Get time entries with advanced filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const {
      startDate,
      endDate,
      projectId,
      taskId,
      status,
      page,
      limit
    } = parseQueryParams(searchParams);
    
    const offset = (page - 1) * limit;

    let entries: TimeEntryWithDetails[] = [];
    let totalCount = 0;

    // Build query based on parameters for optimal performance
    if (status === 'active') {
      // Get only active time entries
      entries = queries.getActiveTimeEntries.all() as TimeEntryWithDetails[];
      totalCount = entries.length;
    } else if (startDate && endDate) {
      // Use optimized queries based on additional filters
      if (projectId) {
        entries = queries.getTimeEntriesByProjectAndDateRange.all(
          projectId, startDate, endDate
        ) as TimeEntryWithDetails[];
        totalCount = entries.length;
      } else if (taskId) {
        entries = queries.getTimeEntriesByTaskAndDateRange.all(
          taskId, startDate, endDate
        ) as TimeEntryWithDetails[];
        totalCount = entries.length;
      } else {
        entries = queries.getTimeEntriesByDateRange.all(startDate, endDate) as TimeEntryWithDetails[];
        totalCount = entries.length;
      }
    } else if (projectId) {
      // Get entries by project
      entries = queries.getTimeEntriesByProject.all(projectId) as TimeEntryWithDetails[];
      totalCount = entries.length;
    } else if (taskId) {
      // Get entries by task
      entries = queries.getTimeEntriesByTask.all(taskId) as TimeEntryWithDetails[];
      totalCount = entries.length;
    } else {
      // Get all entries with pagination
      entries = queries.getAllTimeEntries.all(limit, offset) as TimeEntryWithDetails[];
      const countResult = queries.getTimeEntriesCount.get() as TimeEntryCount | undefined;
      totalCount = countResult?.count || 0;
    }

    // Apply pagination for queries that don't handle it natively
    if (status === 'active' || (startDate && endDate) || projectId || taskId) {
      const paginatedEntries = entries.slice(offset, offset + limit);
      
      const response: PaginatedResponse<TimeEntryWithDetails> = {
        data: paginatedEntries,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
          hasNext: offset + limit < totalCount,
          hasPrev: page > 1
        }
      };
      
      return NextResponse.json(response);
    }

    const response: PaginatedResponse<TimeEntryWithDetails> = {
      data: entries,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        hasNext: offset + limit < totalCount,
        hasPrev: page > 1
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching time entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time entries' },
      { status: 500 }
    );
  }
}
