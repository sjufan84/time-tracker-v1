import { NextResponse } from 'next/server';
import { queries } from '@/lib/database';
import { TimeEntry } from '@/lib/types';
import { timeEntryUtils } from '@/lib/db-utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { task_id, description } = body;

    if (!task_id) {
      return NextResponse.json({ error: 'task_id is required' }, { status: 400 });
    }

    const newTimeEntry = timeEntryUtils.start({ task_id, description });

    return NextResponse.json(newTimeEntry, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create time entry' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');
  const projectId = searchParams.get('project_id');

  try {
    let entries: TimeEntry[];
    if (startDate && endDate) {
      if (projectId && projectId !== 'all') {
        // This is a placeholder as there is no direct query for this.
        // In a real application, you would add a query for this.
        entries = queries.getTimeEntriesByDateRange.all(startDate, endDate) as TimeEntry[];
        entries = entries.filter(e => e.project_id === Number(projectId));
      } else {
        entries = queries.getTimeEntriesByDateRange.all(startDate, endDate) as TimeEntry[];
      }
    } else {
      // In a real application, you would add a query for all time entries.
      // For now, we return an empty array if no date range is provided.
      entries = [];
    }
    return NextResponse.json(entries);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch time entries' }, { status: 500 });
  }
}
