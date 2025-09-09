"use client";

import { useState } from 'react';
import { Task, Project } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Play, Square } from 'lucide-react';
import TaskForm from './TaskForm'; // I will create this next
import { formatDuration } from '@/lib/utils'; // I will create this later
import { useTimer } from '@/hooks/useTimer'; // I will create this later

export default function TasksClient({ initialTasks, project }: { initialTasks: Task[], project: Project }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { activeTimers, startTimer, stopTimer } = useTimer();

  const handleFormSubmit = (task: Task) => {
    if (selectedTask) {
      // Update
      setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
      toast.success('Task updated successfully.');
    } else {
      // Create
      setTasks([...tasks, task]);
      toast.success('Task created successfully.');
    }
    setIsFormOpen(false);
    setSelectedTask(null);
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    setTasks(tasks.filter((t) => t.id !== id));
    toast.success('Task deleted successfully.');
  };

  const handleStartTimer = (task: Task) => {
    startTimer(task.id);
    toast.info(`Timer started for task: ${task.name}`);
  };

  const handleStopTimer = (timer_id: number) => {
    stopTimer(timer_id);
    toast.info('Timer stopped.');
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => {
          setSelectedTask(null);
          setIsFormOpen(true);
        }}>
          New Task
        </Button>
      </div>
      <TaskForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        task={selectedTask}
        projectId={project.id}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Time</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => {
              const activeTimerForTask = activeTimers.find(
                (timer) => timer.task_id === task.id
              );
              return (
                <TableRow key={task.id}>
                  <TableCell>{task.name}</TableCell>
                  <TableCell>{task.status}</TableCell>
                  <TableCell>{formatDuration(task.total_duration || 0)}</TableCell>
                  <TableCell className="text-right">
                    {activeTimerForTask ? (
                      <Button variant="ghost" size="icon" onClick={() => handleStopTimer(activeTimerForTask.id)}>
                        <Square className="h-4 w-4 text-red-500" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="icon" onClick={() => handleStartTimer(task)}>
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedTask(task);
                          setIsFormOpen(true);
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(task.id)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
