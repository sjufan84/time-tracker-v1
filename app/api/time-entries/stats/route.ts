import { NextRequest, NextResponse } from 'next/server';
import { queries } from '@/lib/database';
import type { 
  TimeEntryStats, 
  ProjectTimeStats, 
  TimeEntryWithDetails, 
  StatsResponse 
} from '@/lib/types';

// Get time entry statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    let stats: TimeEntryStats | ProjectTimeStats;

    if (projectId && projectId !== 'all') {
      // Get stats for specific project
      const projectStats = queries.getTimeEntriesStatsByProject.all() as ProjectTimeStats[];
      const projectStat = projectStats.find(p => p.project_id === Number(projectId));
      
      if (!projectStat) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }
      stats = projectStat;
    } else {
      // Get overall stats
      stats = queries.getTimeEntriesStats.get() as TimeEntryStats;
    }

    // If date range is specified, filter the stats
    if (startDate && endDate) {
      const entries = queries.getTimeEntriesByDateRange.all(startDate, endDate) as TimeEntryWithDetails[];
      
      const filteredStats: TimeEntryStats = {
        total_entries: entries.length,
        active_entries: entries.filter(e => !e.end_time).length,
        completed_entries: entries.filter(e => e.end_time).length,
        total_duration: entries.reduce((sum, e) => sum + (e.duration || 0), 0),
        avg_duration: entries.length > 0 
          ? entries.reduce((sum, e) => sum + (e.duration || 0), 0) / entries.length 
          : null
      };

      const response: StatsResponse = {
        ...filteredStats,
        date_range: { start_date: startDate, end_date: endDate }
      };

      return NextResponse.json(response);
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching time entry stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time entry statistics' },
      { status: 500 }
    );
  }
}
