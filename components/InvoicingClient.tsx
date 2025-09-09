"use client";

import { useState } from 'react';
import { Project, TimeEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateRangePicker } from './DateRangePicker';
import { DateRange } from 'react-day-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDuration } from '@/lib/utils';

export default function InvoicingClient({ projects }: { projects: Project[] }) {
  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [invoice, setInvoice] = useState<{
    totalHours: number;
    totalAmount: number;
    entries: TimeEntry[];
  } | null>(null);

  const handleGenerateInvoice = async () => {
    if (!projectId || !dateRange?.from || !dateRange?.to) {
      return;
    }
    const response = await fetch(
      `/api/invoice?project_id=${projectId}&start_date=${dateRange.from.toISOString()}&end_date=${dateRange.to.toISOString()}`
    );
    const data = await response.json();
    setInvoice(data);
  };

  const handleExportCsv = () => {
    if (!invoice) return;
    const headers = ['Date', 'Task', 'Duration (hours)', 'Amount'];
    const rows = invoice.entries.map(entry => [
      new Date(entry.start_time).toLocaleDateString(),
      entry.task_name,
      (entry.duration / 3600).toFixed(2),
      ((entry.duration / 3600) * (projects.find(p => p.id === parseInt(projectId!))?.billing_rate || 0)).toFixed(2)
    ]);
    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "invoice.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <Select value={projectId} onValueChange={setProjectId}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={String(project.id)}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DateRangePicker date={dateRange} onDateChange={setDateRange} />
        <Button onClick={handleGenerateInvoice}>Generate Invoice</Button>
      </div>

      {invoice && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Invoice</CardTitle>
            <Button variant="outline" onClick={handleExportCsv}>Export CSV</Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="font-semibold">Total Hours</p>
                <p>{formatDuration(invoice.totalHours * 3600)}</p>
              </div>
              <div>
                <p className="font-semibold">Total Amount</p>
                <p>${invoice.totalAmount.toFixed(2)}</p>
              </div>
            </div>
            {/* Further details can be displayed here */}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
