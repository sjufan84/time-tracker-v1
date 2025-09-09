import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory path for the database file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path - store in project root
const dbPath = path.join(process.cwd(), 'time-tracker.db');

// Create database connection
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables if they don't exist
const createTables = () => {
  // Projects table
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT DEFAULT '#3B82F6',
      billing_rate REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tasks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
    )
  `);

  // Time entries table
  db.exec(`
    CREATE TABLE IF NOT EXISTS time_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      description TEXT,
      start_time DATETIME NOT NULL,
      end_time DATETIME,
      duration INTEGER, -- duration in seconds
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
    CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);
    CREATE INDEX IF NOT EXISTS idx_time_entries_start_time ON time_entries(start_time);
  `);
};

// Initialize database
createTables();

// Export database instance
export default db;

// Export prepared statements for better performance
export const queries = {
  // Projects
  insertProject: db.prepare(`
    INSERT INTO projects (name, description, color, billing_rate)
    VALUES (?, ?, ?, ?)
  `),
  
  getAllProjects: db.prepare(`
    SELECT * FROM projects 
    ORDER BY created_at DESC
  `),
  
  getProjectById: db.prepare(`
    SELECT * FROM projects WHERE id = ?
  `),
  
  updateProject: db.prepare(`
    UPDATE projects 
    SET name = ?, description = ?, color = ?, billing_rate = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),
  
  deleteProject: db.prepare(`
    DELETE FROM projects WHERE id = ?
  `),

  // Tasks
  insertTask: db.prepare(`
    INSERT INTO tasks (project_id, name, description, status)
    VALUES (?, ?, ?, ?)
  `),
  
  getTasksByProject: db.prepare(`
    SELECT t.*, SUM(te.duration) as total_duration
    FROM tasks t
    LEFT JOIN time_entries te ON t.id = te.task_id
    WHERE t.project_id = ?
    GROUP BY t.id
    ORDER BY t.created_at DESC
  `),
  
  getAllTasks: db.prepare(`
    SELECT t.*, p.name as project_name, p.color as project_color, SUM(te.duration) as total_duration
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    LEFT JOIN time_entries te ON t.id = te.task_id
    GROUP BY t.id
    ORDER BY t.created_at DESC
  `),
  
  getTaskById: db.prepare(`
    SELECT t.*, p.name as project_name, p.color as project_color
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    WHERE t.id = ?
  `),
  
  updateTask: db.prepare(`
    UPDATE tasks 
    SET name = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),
  
  deleteTask: db.prepare(`
    DELETE FROM tasks WHERE id = ?
  `),

  // Time entries
  insertTimeEntry: db.prepare(`
    INSERT INTO time_entries (task_id, description, start_time, end_time, duration)
    VALUES (?, ?, ?, ?, ?)
  `),
  
  getTimeEntriesByTask: db.prepare(`
    SELECT * FROM time_entries 
    WHERE task_id = ? 
    ORDER BY start_time DESC
  `),
  
  getTimeEntriesByDateRange: db.prepare(`
    SELECT te.*, t.name as task_name, p.name as project_name, p.color as project_color
    FROM time_entries te
    JOIN tasks t ON te.task_id = t.id
    JOIN projects p ON t.project_id = p.id
    WHERE te.start_time >= ? AND te.start_time <= ?
    ORDER BY te.start_time DESC
  `),
  
  getActiveTimeEntry: db.prepare(`
    SELECT te.*, t.name as task_name, p.name as project_name
    FROM time_entries te
    JOIN tasks t ON te.task_id = t.id
    JOIN projects p ON t.project_id = p.id
    WHERE te.end_time IS NULL
    ORDER BY te.start_time DESC
    LIMIT 1
  `),
  
  updateTimeEntry: db.prepare(`
    UPDATE time_entries 
    SET description = ?, start_time = ?, end_time = ?, duration = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),
  
  stopTimeEntry: db.prepare(`
    UPDATE time_entries 
    SET end_time = ?, duration = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),
  
  deleteTimeEntry: db.prepare(`
    DELETE FROM time_entries WHERE id = ?
  `),

  // Statistics
  getTotalTimeByProject: db.prepare(`
    SELECT p.id, p.name, p.color, SUM(te.duration) as total_duration
    FROM projects p
    LEFT JOIN tasks t ON p.id = t.project_id
    LEFT JOIN time_entries te ON t.id = te.task_id
    WHERE te.duration IS NOT NULL
    GROUP BY p.id, p.name, p.color
    ORDER BY total_duration DESC
  `),
  
  getTotalTimeByTask: db.prepare(`
    SELECT t.id, t.name, p.name as project_name, p.color as project_color, SUM(te.duration) as total_duration
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    LEFT JOIN time_entries te ON t.id = te.task_id
    WHERE te.duration IS NOT NULL
    GROUP BY t.id, t.name, p.name, p.color
    ORDER BY total_duration DESC
  `)
};
