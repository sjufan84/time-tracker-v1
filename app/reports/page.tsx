import ReportsClient from '@/components/ReportsClient';
import { queries } from '@/lib/database';
import { Project, TimeEntry } from '@/lib/types';
import { endOfMonth, startOfMonth } from 'date-fns';

export default function ReportsPage() {
  const projects = queries.getAllProjects.all() as Project[];

  const start = startOfMonth(new Date());
  const end = endOfMonth(new Date());

  const timeEntries = queries.getTimeEntriesByDateRange.all(
    start.toISOString(),
    end.toISOString()
  ) as TimeEntry[];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Reports</h1>
      <ReportsClient initialTimeEntries={timeEntries} projects={projects} />
    </div>
  );
}
