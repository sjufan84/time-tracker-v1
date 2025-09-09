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
  DateRange
} from './types';

// Project utilities
export const projectUtils = {
  create: (data: CreateProjectRequest): Project => {
    const result = queries.insertProject.run(
      data.name,
      data.description || null,
      data.color || '#3B82F6'
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

  getByProject: (projectId: number): Task[] => {
    return queries.getTasksByProject.all(projectId) as Task[];
  },

  getAll: (): Task[] => {
    return queries.getAllTasks.all() as Task[];
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
    const result = queries.insertTimeEntry.run(
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

  getByDateRange: (dateRange: DateRange): TimeEntry[] => {
    return queries.getTimeEntriesByDateRange.all(
      dateRange.start_date,
      dateRange.end_date
    ) as TimeEntry[];
  },

  getActive: (): TimeEntry | null => {
    return queries.getActiveTimeEntry.get() as TimeEntry | null;
  },

  update: (id: number, data: UpdateTimeEntryRequest): TimeEntry | null => {
    const entry = queries.getTimeEntriesByTask.all(data.task_id || 0)
      .find((e: any) => e.id === id) as TimeEntry | null;
    
    if (!entry) return null;

    queries.updateTimeEntry.run(
      data.description !== undefined ? data.description : entry.description,
      data.start_time || entry.start_time,
      data.end_time !== undefined ? data.end_time : entry.end_time,
      data.duration !== undefined ? data.duration : entry.duration,
      id
    );

    return queries.getTimeEntriesByTask.all(entry.task_id)
      .find((e: any) => e.id === id) as TimeEntry;
  },

  stop: (id: number): TimeEntry | null => {
    const entry = queries.getTimeEntriesByTask.all(0)
      .find((e: any) => e.id === id) as TimeEntry | null;
    
    if (!entry || entry.end_time) return null;

    const endTime = new Date().toISOString();
    const startTime = new Date(entry.start_time);
    const duration = Math.floor((new Date(endTime).getTime() - startTime.getTime()) / 1000);

    queries.stopTimeEntry.run(endTime, duration, id);

    return queries.getTimeEntriesByTask.all(entry.task_id)
      .find((e: any) => e.id === id) as TimeEntry;
  },

  delete: (id: number): boolean => {
    const result = queries.deleteTimeEntry.run(id);
    return result.changes > 0;
  }
};

// Timer utilities
export const timerUtils = {
  start: (data: StartTimerRequest): TimeEntry => {
    // Stop any active timer first
    const activeEntry = timeEntryUtils.getActive();
    if (activeEntry) {
      timeEntryUtils.stop(activeEntry.id);
    }

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

  getActive: (): TimeEntry | null => {
    return timeEntryUtils.getActive();
  }
};

// Statistics utilities
export const statsUtils = {
  getProjectStats: () => {
    return queries.getTotalTimeByProject.all() as any[];
  },

  getTaskStats: () => {
    return queries.getTotalTimeByTask.all() as any[];
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
