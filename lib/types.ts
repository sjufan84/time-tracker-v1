export interface Project {
  id: number;
  name: string;
  description?: string;
  color: string;
  billing_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  project_id: number;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'paused';
  created_at: string;
  updated_at: string;
  project_name?: string;
  project_color?: string;
  total_duration?: number;
}

export interface TimeEntry {
  id: number;
  task_id: number;
  description?: string;
  start_time: string;
  end_time?: string;
  duration?: number;
  created_at: string;
  updated_at: string;
  task_name?: string;
  project_name?: string;
  project_color?: string;
  project_id?: number;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  color?: string;
  billing_rate?: number;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  color?: string;
  billing_rate?: number;
}

export interface CreateTaskRequest {
  project_id: number;
  name: string;
  description?: string;
  status?: 'active' | 'completed' | 'paused';
}

export interface UpdateTaskRequest {
  name?: string;
  description?: string;
  status?: 'active' | 'completed' | 'paused';
}

export interface CreateTimeEntryRequest {
  task_id: number;
  description?: string;
  start_time: string;
  end_time?: string;
  duration?: number;
}

export interface UpdateTimeEntryRequest {
  task_id?: number;
  description?: string;
  start_time?: string;
  end_time?: string;
  duration?: number;
}

export interface StartTimerRequest {
  task_id: number;
  description?: string;
}

export interface StopTimerRequest {
  time_entry_id: number;
}

export interface TimeStats {
  total_duration: number;
  entries_count: number;
  average_duration: number;
}

export interface DateRange {
  start_date: string;
  end_date: string;
}

// Database Query Result Types
export interface TimeEntryWithDetails extends TimeEntry {
  task_name: string;
  project_name: string;
  project_color: string;
  project_id: number;
}

export interface TimeEntryStats {
  total_entries: number;
  active_entries: number;
  completed_entries: number;
  total_duration: number;
  avg_duration: number | null;
}

export interface ProjectTimeStats {
  project_id: number;
  project_name: string;
  project_color: string;
  total_entries: number;
  active_entries: number;
  completed_entries: number;
  total_duration: number;
  avg_duration: number | null;
}

export interface TaskWithProject extends Omit<Task, 'total_duration'> {
  project_name: string;
  project_color: string;
  total_duration: number | null;
}

export interface ProjectWithTime {
  id: number;
  name: string;
  color: string;
  total_duration: number | null;
}

export interface TaskWithTime {
  id: number;
  name: string;
  project_name: string;
  project_color: string;
  total_duration: number | null;
}

export interface TimeEntryCount {
  count: number;
}

export type TimeEntrySearchResult = TimeEntryWithDetails

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SearchResponse<T> extends PaginatedResponse<T> {
  query: string;
}

export interface StatsResponse extends TimeEntryStats {
  date_range?: DateRange;
}

export interface BulkOperationResult {
  success: boolean;
  results: Array<{
    id: number;
    success: boolean;
    data?: TimeEntry;
  }>;
  errors: Array<{
    id: number;
    error: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

// Search and filter types
export interface SearchParams {
  q: string;
  project_id?: string;
  task_id?: string;
  start_date?: string;
  end_date?: string;
  page?: string;
  limit?: string;
}

export interface TimeEntryFilters {
  projectId?: number;
  taskId?: number;
  startDate?: string;
  endDate?: string;
  status?: 'active' | 'completed' | 'all';
  page: number;
  limit: number;
}

// Bulk operation types
export interface BulkOperationRequest {
  action: 'stop' | 'delete' | 'update';
  time_entry_ids: number[];
  data?: UpdateTimeEntryRequest;
}