"use client";

import { useState } from 'react';
import { Project, Task, TimeEntryWithDetails } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateRangePicker } from './DateRangePicker';
import { format } from 'date-fns';
import { formatDuration } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TimeEntryForm from './TimeEntryForm';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

export default function ReportsClient({ initialTimeEntries, projects, tasks }: { initialTimeEntries: TimeEntryWithDetails[], projects: Project[], tasks: Task[] }) {
  const [timeEntries, setTimeEntries] = useState<TimeEntryWithDetails[]>(initialTimeEntries);
  const [projectId, setProjectId] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(1)),
    to: new Date(),
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntryWithDetails | null>(null);

  const handleFilterChange = async () => {
    let url = `/api/time-entries?start_date=${dateRange?.from?.toISOString()}&end_date=${dateRange?.to?.toISOString()}`;
    if (projectId !== 'all') {
      url += `&project_id=${projectId}`;
    }
    const response = await fetch(url);
    const { data } = await response.json();
    setTimeEntries(data);
  };

  const handleOpenForm = (entry: TimeEntryWithDetails | null = null) => {
    setEditingEntry(entry);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingEntry(null);
  };

  const handleSave = () => {
    handleFilterChange(); // Refresh data after save
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this time entry?')) {
      await fetch(`/api/time-entries/${id}`, { method: 'DELETE' });
      handleFilterChange(); // Refresh data after delete
    }
  };

  const totalDuration = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <DateRangePicker date={dateRange} onDateChange={setDateRange} />
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={String(project.id)}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleFilterChange}>Apply Filters</Button>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Manual Entry
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total Time</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatDuration(totalDuration)}</p>
        </CardContent>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Duration</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeEntries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{format(new Date(entry.start_time), 'PP')}</TableCell>
                <TableCell>{entry.project_name}</TableCell>
                <TableCell>{entry.task_name}</TableCell>
                <TableCell className="max-w-[300px] truncate">{entry.description}</TableCell>
                <TableCell className="text-right">{formatDuration(entry.duration || 0)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenForm(entry)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <TimeEntryForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        timeEntry={editingEntry}
        projects={projects}
        tasks={tasks}
        onSave={handleSave}
      />
    </div>
  );
}
