import { queries } from './database';
import type { 
  Project, 
  Task, 
  TimeEntry, 
  CreateProjectRequest, 
  UpdateProjectRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateTimeEntryRequest,
  UpdateTimeEntryRequest,
  StartTimerRequest,
  StopTimerRequest,
  TimeStats,
  DateRange,
  TimeEntryWithDetails,
  TaskWithProject,
  ProjectWithTime,
  TaskWithTime
} from './types';

// Project utilities
export const projectUtils = {
  create: (data: CreateProjectRequest): Project => {
    const result = queries.insertProject.run(
      data.name,
      data.description || null,
      data.color || '#3B82F6',
      data.billing_rate || null
    );
    return queries.getProjectById.get(result.lastInsertRowid) as Project;
  },

  getAll: (): Project[] => {
    return queries.getAllProjects.all() as Project[];
  },

  getById: (id: number): Project | null => {
    return queries.getProjectById.get(id) as Project | null;
  },

  update: (id: number, data: UpdateProjectRequest): Project | null => {
    const project = queries.getProjectById.get(id) as Project | null;
    if (!project) return null;

    queries.updateProject.run(
      data.name || project.name,
      data.description !== undefined ? data.description : project.description,
      data.color || project.color,
      data.billing_rate !== undefined ? data.billing_rate : project.billing_rate,
      id
    );

    return queries.getProjectById.get(id) as Project;
  },

  delete: (id: number): boolean => {
    const result = queries.deleteProject.run(id);
    return result.changes > 0;
  }
};

// Task utilities
export const taskUtils = {
  create: (data: CreateTaskRequest): Task => {
    const result = queries.insertTask.run(
      data.project_id,
      data.name,
      data.description || null,
      data.status || 'active'
    );
    return queries.getTaskById.get(result.lastInsertRowid) as Task;
  },

  getByProject: (projectId: number): TaskWithProject[] => {
    return queries.getTasksByProject.all(projectId) as TaskWithProject[];
  },

  getAll: (): TaskWithProject[] => {
    return queries.getAllTasks.all() as TaskWithProject[];
  },

  getById: (id: number): Task | null => {
    return queries.getTaskById.get(id) as Task | null;
  },

  update: (id: number, data: UpdateTaskRequest): Task | null => {
    const task = queries.getTaskById.get(id) as Task | null;
    if (!task) return null;

    queries.updateTask.run(
      data.name || task.name,
      data.description !== undefined ? data.description : task.description,
      data.status || task.status,
      id
    );

    return queries.getTaskById.get(id) as Task;
  },

  delete: (id: number): boolean => {
    const result = queries.deleteTask.run(id);
    return result.changes > 0;
  }
};

// Time entry utilities
export const timeEntryUtils = {
  create: (data: CreateTimeEntryRequest): TimeEntry => {
    queries.insertTimeEntry.run(
      data.task_id,
      data.description || null,
      data.start_time,
      data.end_time || null,
      data.duration || null
    );
    return queries.getTimeEntriesByTask.all(data.task_id)[0] as TimeEntry;
  },

  getByTask: (taskId: number): TimeEntry[] => {
    return queries.getTimeEntriesByTask.all(taskId) as TimeEntry[];
  },

  getByDateRange: (dateRange: DateRange): TimeEntryWithDetails[] => {
    return queries.getTimeEntriesByDateRange.all(
      dateRange.start_date,
      dateRange.end_date
    ) as TimeEntryWithDetails[];
  },

  getActive: (): TimeEntryWithDetails[] => {
    return queries.getActiveTimeEntries.all() as TimeEntryWithDetails[];
  },

  update: (id: number, data: UpdateTimeEntryRequest): TimeEntry | null => {
    const allEntries = queries.getTimeEntriesByTask.all(data.task_id || 0) as TimeEntry[];
    const entry = allEntries.find((e: TimeEntry) => e.id === id) as TimeEntry | null;
    
    if (!entry) return null;

    queries.updateTimeEntry.run(
      data.description !== undefined ? data.description : entry.description,
      data.start_time || entry.start_time,
      data.end_time !== undefined ? data.end_time : entry.end_time,
      data.duration !== undefined ? data.duration : entry.duration,
      id
    );

    const updatedEntries = queries.getTimeEntriesByTask.all(entry.task_id) as TimeEntry[];
    return updatedEntries.find((e: TimeEntry) => e.id === id) as TimeEntry;
  },

  stop: (id: number): TimeEntry | null => {
    const entry = queries.getTimeEntryById.get(id) as TimeEntry | null;
    
    if (!entry || entry.end_time) return null;

    const endTime = new Date().toISOString();
    const startTime = new Date(entry.start_time);
    const duration = Math.floor((new Date(endTime).getTime() - startTime.getTime()) / 1000);

    queries.stopTimeEntry.run(endTime, duration, id);

    return queries.getTimeEntryById.get(id) as TimeEntry;
  },

  delete: (id: number): boolean => {
    const result = queries.deleteTimeEntry.run(id);
    return result.changes > 0;
  }
};

// Timer utilities
export const timerUtils = {
  start: (data: StartTimerRequest): TimeEntry => {
    const startTime = new Date().toISOString();
    return timeEntryUtils.create({
      task_id: data.task_id,
      description: data.description,
      start_time: startTime
    });
  },

  stop: (data: StopTimerRequest): TimeEntry | null => {
    return timeEntryUtils.stop(data.time_entry_id);
  },

  getActive: (): TimeEntryWithDetails[] => {
    return timeEntryUtils.getActive();
  }
};

// Statistics utilities
export const statsUtils = {
  getProjectStats: (): ProjectWithTime[] => {
    return queries.getTotalTimeByProject.all() as ProjectWithTime[];
  },

  getTaskStats: (): TaskWithTime[] => {
    return queries.getTotalTimeByTask.all() as TaskWithTime[];
  },

  getTimeStats: (entries: TimeEntry[]): TimeStats => {
    const totalDuration = entries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    const entriesCount = entries.length;
    const averageDuration = entriesCount > 0 ? totalDuration / entriesCount : 0;

    return {
      total_duration: totalDuration,
      entries_count: entriesCount,
      average_duration: averageDuration
    };
  },

  formatDuration: (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  },

  formatDurationShort: (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }
};
