import { NextRequest, NextResponse } from 'next/server';
import { timerUtils } from '@/lib/db-utils';
import type { StartTimerRequest, StopTimerRequest } from '@/lib/types';

export async function GET() {
  try {
    const activeEntry = timerUtils.getActive();
    return NextResponse.json(activeEntry);
  } catch (error) {
    console.error('Error fetching active timer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active timer' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: StartTimerRequest = await request.json();
    
    if (!body.task_id || isNaN(body.task_id)) {
      return NextResponse.json(
        { error: 'Valid task ID is required' },
        { status: 400 }
      );
    }

    const timeEntry = timerUtils.start(body);
    return NextResponse.json(timeEntry, { status: 201 });
  } catch (error) {
    console.error('Error starting timer:', error);
    return NextResponse.json(
      { error: 'Failed to start timer' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body: StopTimerRequest = await request.json();
    
    if (!body.time_entry_id || isNaN(body.time_entry_id)) {
      return NextResponse.json(
        { error: 'Valid time entry ID is required' },
        { status: 400 }
      );
    }

    const timeEntry = timerUtils.stop(body);
    if (!timeEntry) {
      return NextResponse.json(
        { error: 'Time entry not found or already stopped' },
        { status: 404 }
      );
    }

    return NextResponse.json(timeEntry);
  } catch (error) {
    console.error('Error stopping timer:', error);
    return NextResponse.json(
      { error: 'Failed to stop timer' },
      { status: 500 }
    );
  }
}
