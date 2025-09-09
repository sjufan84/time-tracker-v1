import DashboardClient from '@/components/DashboardClient';
import { queries } from '@/lib/database';
import { Project, Task } from '@/lib/types';

async function getStats() {
  try {
    // This fetch needs to be aligned with your API deployment
    const res = await fetch('http://localhost:3000/api/stats', { cache: 'no-store' });
    if (!res.ok) {
      throw new Error('Failed to fetch stats');
    }
    return res.json();
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    // Return default stats in case of an error
    return {
      today: 0,
      this_week: 0,
    };
  }
}

export default async function Home() {
  const allTasks = queries.getAllTasks.all() as Task[];
  const allProjects = queries.getAllProjects.all() as Project[];
  const stats = await getStats();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>
      <DashboardClient
        initialTasks={allTasks}
        initialStats={stats}
        projects={allProjects}
      />
    </div>
  );
}
