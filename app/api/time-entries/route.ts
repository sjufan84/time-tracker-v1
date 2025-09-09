import { NextRequest, NextResponse } from 'next/server';
import { timeEntryUtils } from '@/lib/db-utils';
import type { CreateTimeEntryRequest, DateRange } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('task_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    let timeEntries;

    if (taskId) {
      const id = parseInt(taskId);
      if (isNaN(id)) {
        return NextResponse.json(
          { error: 'Invalid task ID' },
          { status: 400 }
        );
      }
      timeEntries = timeEntryUtils.getByTask(id);
    } else if (startDate && endDate) {
      const dateRange: DateRange = {
        start_date: startDate,
        end_date: endDate
      };
      timeEntries = timeEntryUtils.getByDateRange(dateRange);
    } else {
      return NextResponse.json(
        { error: 'Either task_id or date range (start_date, end_date) is required' },
        { status: 400 }
      );
    }

    return NextResponse.json(timeEntries);
  } catch (error) {
    console.error('Error fetching time entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateTimeEntryRequest = await request.json();
    
    if (!body.task_id || isNaN(body.task_id)) {
      return NextResponse.json(
        { error: 'Valid task ID is required' },
        { status: 400 }
      );
    }

    if (!body.start_time) {
      return NextResponse.json(
        { error: 'Start time is required' },
        { status: 400 }
      );
    }

    const timeEntry = timeEntryUtils.create(body);
    return NextResponse.json(timeEntry, { status: 201 });
  } catch (error) {
    console.error('Error creating time entry:', error);
    return NextResponse.json(
      { error: 'Failed to create time entry' },
      { status: 500 }
    );
  }
}
