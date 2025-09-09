"use client";

import { useEffect, useState } from 'react';
import { Task, TimeEntry } from '@/lib/types';
import { useTimer } from '@/hooks/useTimer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Square, Clock, Activity, TrendingUp, Calendar } from 'lucide-react';
import Link from 'next/link';
import { formatDuration } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface TimerWithElapsed extends TimeEntry {
  elapsed: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function DashboardClient({ initialTasks, initialStats }: { initialTasks: Task[], initialStats: any }) {
  const { activeTimers, startTimer, stopTimer } = useTimer();
  const [tasks] = useState<Task[]>(initialTasks);
  const [stats] = useState(initialStats);
  const [timersWithElapsed, setTimersWithElapsed] = useState<TimerWithElapsed[]>([]);

  useEffect(() => {
    if (activeTimers.length > 0) {
      const interval = setInterval(() => {
        const now = new Date();
        const updatedTimers = activeTimers.map(timer => {
          const start = new Date(timer.start_time);
          const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000);
          return { ...timer, elapsed };
        });
        setTimersWithElapsed(updatedTimers);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setTimersWithElapsed([]);
    }
  }, [activeTimers]);

  const totalElapsedToday = timersWithElapsed.reduce((total, timer) => total + timer.elapsed, 0);

  return (
    <div className="space-y-8">
      {/* Active Timers Section */}
      {timersWithElapsed.length > 0 ? (
        <Card className="border-l-4 border-l-green-500 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                Active Timers
                <Badge variant="secondary" className="ml-2">
                  {timersWithElapsed.length}
                </Badge>
              </CardTitle>
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Total: {formatDuration(totalElapsedToday)}
                </div>
                {timersWithElapsed.length > 1 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      timersWithElapsed.forEach(timer => stopTimer(timer.id));
                    }}
                    className="text-red-600 hover:bg-red-50 hover:border-red-300"
                  >
                    Stop All
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {timersWithElapsed.map((timer, index) => (
              <div
                key={timer.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:shadow-md",
                  index === 0 ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full animate-pulse"
                      style={{ backgroundColor: timer.project_color || '#3B82F6' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-lg truncate">{timer.task_name}</p>
                      <p className="text-sm text-muted-foreground truncate">{timer.project_name}</p>
                      {timer.description && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">{timer.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Started {new Date(timer.start_time).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-mono font-bold text-green-600">
                      {formatDuration(timer.elapsed)}
                    </p>
                    <p className="text-xs text-muted-foreground">elapsed</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => stopTimer(timer.id)}
                    className="h-10 w-10 hover:bg-red-100 hover:text-red-600 transition-colors"
                  >
                    <Square className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-l-4 border-l-blue-500 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Ready to Start Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <Play className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No active timers</h3>
              <p className="text-muted-foreground mb-4">
                Start tracking time on any task below to begin your productivity session.
              </p>
              <div className="text-sm text-muted-foreground">
                You can track multiple tasks simultaneously!
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(stats.today)}</div>
            <p className="text-xs text-muted-foreground">
              {timersWithElapsed.length > 0 && `+${formatDuration(totalElapsedToday)} active`}
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(stats.this_week)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.this_week > stats.today ? 'Weekly progress' : 'Keep it up!'}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timersWithElapsed.length}</div>
            <p className="text-xs text-muted-foreground">
              {timersWithElapsed.length === 0 ? 'No active timers' : 'Currently tracking'}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
            <p className="text-xs text-muted-foreground">
              Available to track
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks */}
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Quick Start Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tasks.slice(0, 8).map((task) => {
              const isActive = timersWithElapsed.some(timer => timer.task_id === task.id);
              return (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-all duration-200 hover:shadow-md",
                    isActive 
                      ? "bg-green-50 border-green-200" 
                      : "hover:bg-gray-50 border-gray-200"
                  )}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: task.project_color || '#3B82F6' }}
                    />
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/projects/${task.project_id}`} 
                        className="font-semibold hover:underline truncate block"
                      >
                        {task.name}
                      </Link>
                      <p className="text-sm text-muted-foreground truncate">{task.project_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isActive && (
                      <Badge variant="secondary" className="text-green-600 bg-green-100">
                        Active
                      </Badge>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => startTimer(task.id)}
                      disabled={isActive}
                      className={cn(
                        "h-8 w-8 transition-colors",
                        isActive 
                          ? "text-green-600 cursor-not-allowed" 
                          : "hover:bg-green-100 hover:text-green-600"
                      )}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          {tasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tasks available. Create a project and add tasks to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
