import { NextRequest, NextResponse } from 'next/server';
import { statsUtils } from '@/lib/db-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    let stats;

    switch (type) {
      case 'projects':
        stats = statsUtils.getProjectStats();
        break;
      case 'tasks':
        stats = statsUtils.getTaskStats();
        break;
      case 'all':
      default:
        stats = {
          projects: statsUtils.getProjectStats(),
          tasks: statsUtils.getTaskStats()
        };
        break;
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
