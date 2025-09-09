import { NextResponse } from 'next/server';
import { queries } from '@/lib/database';
import { Project, TimeEntry } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('project_id');
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');

  if (!projectId || !startDate || !endDate) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    const project = queries.getProjectById.get(projectId) as Project;
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const entries = queries.getTimeEntriesByDateRange.all(startDate, endDate) as TimeEntry[];
    const projectEntries = entries.filter(e => e.project_id === Number(projectId));

    const totalDuration = projectEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    const totalHours = totalDuration / 3600;
    const totalAmount = totalHours * (project.billing_rate || 0);

    return NextResponse.json({
      totalHours,
      totalAmount,
      entries: projectEntries,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 });
  }
}
