import { NextResponse } from 'next/server';
import { queries } from '@/lib/database';
import { startOfToday, endOfToday, startOfWeek, endOfWeek } from 'date-fns';
import { TimeEntry } from '@/lib/types';

export async function GET() {
  try {
    const todayStart = startOfToday();
    const todayEnd = endOfToday();
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());

    const todayEntries = queries.getTimeEntriesByDateRange.all(
      todayStart.toISOString(),
      todayEnd.toISOString()
    ) as TimeEntry[];
    const weekEntries = queries.getTimeEntriesByDateRange.all(
      weekStart.toISOString(),
      weekEnd.toISOString()
    ) as TimeEntry[];

    const todayDuration = todayEntries.reduce((sum, entry) => sum + (entry?.duration || 0), 0);
    const weekDuration = weekEntries.reduce((sum, entry) => sum + (entry?.duration || 0), 0);

    return NextResponse.json({
      today: todayDuration,
      this_week: weekDuration,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
