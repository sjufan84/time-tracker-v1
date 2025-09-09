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
