"use client";

import { useState } from 'react';
import { Project, TimeEntry } from '@/lib/types';
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

export default function ReportsClient({ initialTimeEntries, projects }: { initialTimeEntries: TimeEntry[], projects: Project[] }) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(initialTimeEntries);
  const [projectId, setProjectId] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(1)),
    to: new Date(),
  });

  const handleFilterChange = async () => {
    let url = `/api/time-entries?start_date=${dateRange?.from?.toISOString()}&end_date=${dateRange?.to?.toISOString()}`;
    if (projectId !== 'all') {
      url += `&project_id=${projectId}`;
    }
    const response = await fetch(url);
    const data = await response.json();
    setTimeEntries(data);
  };

  const totalDuration = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);

  return (
    <div className="space-y-8">
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
              <TableHead>Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeEntries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{format(new Date(entry.start_time), 'PPP')}</TableCell>
                <TableCell>{entry.project_name}</TableCell>
                <TableCell>{entry.task_name}</TableCell>
                <TableCell>{formatDuration(entry.duration || 0)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
