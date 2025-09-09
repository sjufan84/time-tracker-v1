import DashboardClient from '@/components/DashboardClient';
import { queries } from '@/lib/database';
import { Task } from '@/lib/types';

async function getStats() {
  try {
    const res = await fetch('http://localhost:3000/api/stats', { cache: 'no-store' });
    if (!res.ok) {
      throw new Error('Failed to fetch stats');
    }
    return res.json();
  } catch (error) {
    console.error(error);
    return {
      today: 0,
      this_week: 0,
    };
  }
}

export default async function Home() {
  const recentTasks = queries.getAllTasks.all().slice(0, 5) as Task[];
  const stats = await getStats();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <DashboardClient initialTasks={recentTasks} initialStats={stats} />
    </div>
  );
}
