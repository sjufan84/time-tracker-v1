import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';
import type { 
  TimeEntrySearchResult, 
  SearchResponse,
  TimeEntryCount
} from '@/lib/types';

// Type for SQL query parameters
type SQLParam = string | number;

// Helper function to parse search parameters
function parseSearchParams(searchParams: URLSearchParams): {
  query: string;
  projectId?: string;
  taskId?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
  offset: number;
} {
  const query = searchParams.get('q') || '';
  const projectId = searchParams.get('project_id') || undefined;
  const taskId = searchParams.get('task_id') || undefined;
  const startDate = searchParams.get('start_date') || undefined;
  const endDate = searchParams.get('end_date') || undefined;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
  const offset = (page - 1) * limit;

  return {
    query,
    projectId,
    taskId,
    startDate,
    endDate,
    page,
    limit,
    offset
  };
}

// Search time entries with text search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const {
      query,
      projectId,
      taskId,
      startDate,
      endDate,
      page,
      limit,
      offset
    } = parseSearchParams(searchParams);

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters long' },
        { status: 400 }
      );
    }

    // Build search query
    let searchQuery = `
      SELECT te.*, t.name as task_name, p.name as project_name, p.color as project_color, p.id as project_id
      FROM time_entries te
      JOIN tasks t ON te.task_id = t.id
      JOIN projects p ON t.project_id = p.id
      WHERE (
        te.description LIKE ? OR 
        t.name LIKE ? OR 
        p.name LIKE ?
      )
    `;

    const searchTerm = `%${query.trim()}%`;
    const params: SQLParam[] = [searchTerm, searchTerm, searchTerm];

    // Add additional filters
    if (projectId && projectId !== 'all') {
      searchQuery += ' AND p.id = ?';
      params.push(Number(projectId));
    }

    if (taskId) {
      searchQuery += ' AND t.id = ?';
      params.push(Number(taskId));
    }

    if (startDate && endDate) {
      searchQuery += ' AND te.start_time >= ? AND te.start_time <= ?';
      params.push(startDate, endDate);
    }

    searchQuery += ' ORDER BY te.start_time DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    // Execute search
    const entries = db.prepare(searchQuery).all(...params) as TimeEntrySearchResult[];

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as count
      FROM time_entries te
      JOIN tasks t ON te.task_id = t.id
      JOIN projects p ON t.project_id = p.id
      WHERE (
        te.description LIKE ? OR 
        t.name LIKE ? OR 
        p.name LIKE ?
      )
    `;

    const countParams: SQLParam[] = [searchTerm, searchTerm, searchTerm];

    if (projectId && projectId !== 'all') {
      countQuery += ' AND p.id = ?';
      countParams.push(projectId);
    }

    if (taskId) {
      countQuery += ' AND t.id = ?';
      countParams.push(taskId);
    }

    if (startDate && endDate) {
      countQuery += ' AND te.start_time >= ? AND te.start_time <= ?';
      countParams.push(startDate, endDate);
    }

    const countResult = db.prepare(countQuery).get(...countParams) as TimeEntryCount | undefined;
    const totalCount = countResult?.count || 0;

    const response: SearchResponse<TimeEntrySearchResult> = {
      data: entries,
      query,
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
    console.error('Error searching time entries:', error);
    return NextResponse.json(
      { error: 'Failed to search time entries' },
      { status: 500 }
    );
  }
}
