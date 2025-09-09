// Database types for the time tracker application

export interface Project {
  id: number;
  name: string;
  description?: string;
  color: string;
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
  // Joined fields
  project_name?: string;
  project_color?: string;
}

export interface TimeEntry {
  id: number;
  task_id: number;
  description?: string;
  start_time: string;
  end_time?: string;
  duration?: number; // in seconds
  created_at: string;
  updated_at: string;
  // Joined fields
  task_name?: string;
  project_name?: string;
  project_color?: string;
}

export interface ProjectWithStats extends Project {
  total_duration?: number;
}

export interface TaskWithStats extends Task {
  total_duration?: number;
}

// API request/response types
export interface CreateProjectRequest {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  color?: string;
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

// Utility types
export interface TimeStats {
  total_duration: number;
  entries_count: number;
  average_duration: number;
}

export interface DateRange {
  start_date: string;
  end_date: string;
}
