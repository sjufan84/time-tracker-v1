"use client";

import { useEffect, useState } from 'react';
import { Project, Task, TimeEntry, TimeEntryWithDetails } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

interface TimeEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  timeEntry?: TimeEntryWithDetails | null;
  projects: Project[];
  tasks: Task[];
  onSave: () => void;
}

export default function TimeEntryForm({
  isOpen,
  onClose,
  timeEntry,
  projects,
  tasks,
  onSave,
}: TimeEntryFormProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (timeEntry) {
      const task = tasks.find(t => t.id === timeEntry.task_id);
      if (task) {
        setSelectedProjectId(String(task.project_id));
        setFilteredTasks(tasks.filter(t => t.project_id === task.project_id));
        setSelectedTaskId(String(timeEntry.task_id));
      }
      setStartTime(format(new Date(timeEntry.start_time), "yyyy-MM-dd'T'HH:mm"));
      setEndTime(timeEntry.end_time ? format(new Date(timeEntry.end_time), "yyyy-MM-dd'T'HH:mm") : '');
      setDescription(timeEntry.description || '');
    } else {
      // Reset form for new entry
      setSelectedProjectId('');
      setFilteredTasks([]);
      setSelectedTaskId('');
      setStartTime('');
      setEndTime('');
      setDescription('');
    }
  }, [timeEntry, tasks, isOpen]);

  useEffect(() => {
    if (selectedProjectId) {
      setFilteredTasks(tasks.filter(t => t.project_id === Number(selectedProjectId)));
      setSelectedTaskId('');
    } else {
      setFilteredTasks([]);
    }
  }, [selectedProjectId, tasks]);

  const handleSubmit = async () => {
    setError(null);
    if (!selectedTaskId || !startTime || !endTime) {
      setError('Please fill out all required fields.');
      return;
    }

    const body = {
      task_id: Number(selectedTaskId),
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
      description,
    };

    const url = timeEntry ? `/api/time-entries/${timeEntry.id}` : '/api/time-entries';
    const method = timeEntry ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save time entry');
      }

      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{timeEntry ? 'Edit Time Entry' : 'Add Manual Entry'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="project" className="text-right">Project</Label>
            <Select
              value={selectedProjectId}
              onValueChange={setSelectedProjectId}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project.id} value={String(project.id)}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="task" className="text-right">Task</Label>
            <Select
              value={selectedTaskId}
              onValueChange={setSelectedTaskId}
              disabled={!selectedProjectId}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a task" />
              </SelectTrigger>
              <SelectContent>
                {filteredTasks.map(task => (
                  <SelectItem key={task.id} value={String(task.id)}>
                    {task.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start-time" className="text-right">Start Time</Label>
            <Input
              id="start-time"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end-time" className="text-right">End Time</Label>
            <Input
              id="end-time"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Optional description"
            />
          </div>
          {error && <p className="text-red-500 text-sm col-span-4 text-center">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
