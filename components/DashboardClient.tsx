"use client";

import { useEffect, useState } from 'react';
import { Task, TimeEntry } from '@/lib/types';
import { useTimer } from '@/hooks/useTimer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Square } from 'lucide-react';
import Link from 'next/link';
import { formatDuration } from '@/lib/utils';

export default function DashboardClient({ initialTasks, initialStats }: { initialTasks: Task[], initialStats: any }) {
  const { activeTimer, startTimer, stopTimer } = useTimer();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [stats, setStats] = useState(initialStats);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (activeTimer) {
      const interval = setInterval(() => {
        const now = new Date();
        const start = new Date(activeTimer.start_time);
        setElapsedTime(Math.floor((now.getTime() - start.getTime()) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeTimer]);

  return (
    <div className="space-y-8">
      {activeTimer && (
        <Card>
          <CardHeader>
            <CardTitle>Currently Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{activeTimer.task_name}</p>
                <p className="text-sm text-gray-500">{activeTimer.project_name}</p>
              </div>
              <div className="flex items-center space-x-4">
                <p className="font-mono">{formatDuration(elapsedTime)}</p>
                <Button variant="ghost" size="icon" onClick={() => stopTimer(activeTimer.id)}>
                  <Square className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatDuration(stats.today)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatDuration(stats.this_week)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {tasks.slice(0, 5).map((task) => (
              <li key={task.id} className="flex items-center justify-between">
                <div>
                  <Link href={`/projects/${task.project_id}`} className="font-semibold hover:underline">
                    {task.name}
                  </Link>
                  <p className="text-sm text-gray-500">{task.project_name}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => startTimer(task.id)}>
                  <Play className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
