import { BrowserWindow } from 'electron'
import log from 'electron-log'

export type TaskType =
  | { type: 'cli'; cmd: string }
  | { type: 'script'; script: string; args: string[] }
  | { type: 'scan'; platform: string; list: string }

export interface Task {
  id: string
  type: string
  status: 'pending' | 'running' | 'completed' | 'cancelled'
  progress: number
  createdAt: string
  result?: any
  data: TaskType
}

// In-memory task storage (would use SQLite/better-sqlite3 in production)
const tasks = new Map<string, Task>()

/**
 * Generate a unique task ID
 */
function generateTaskId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Queue a new task
 */
export function queueTask(data: TaskType): string {
  const id = generateTaskId()
  const task: Task = {
    id,
    type: data.type,
    status: 'pending',
    progress: 0,
    createdAt: new Date().toISOString(),
    data
  }
  tasks.set(id, task)
  log.info(`[task-queue] Task queued: ${id}`, data)
  return id
}

/**
 * Get all tasks
 */
export function getAllTasks(): Task[] {
  return Array.from(tasks.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

/**
 * Get a single task
 */
export function getTask(id: string): Task | undefined {
  return tasks.get(id)
}

/**
 * Cancel a task
 */
export function cancelTask(id: string): boolean {
  const task = tasks.get(id)
  if (task && (task.status === 'pending' || task.status === 'running')) {
    task.status = 'cancelled'
    tasks.set(id, task)
    emitTaskProgress(id, task.progress, 'cancelled')
    log.info(`[task-queue] Task cancelled: ${id}`)
    return true
  }
  return false
}

/**
 * Update task progress and emit to renderer
 */
export function updateTaskProgress(id: string, progress: number, status?: string): void {
  const task = tasks.get(id)
  if (task) {
    task.progress = progress
    if (status) task.status = status as Task['status']
    tasks.set(id, task)
    emitTaskProgress(id, progress, task.status)
  }
}

/**
 * Complete a task
 */
export function completeTask(id: string, result: any): void {
  const task = tasks.get(id)
  if (task) {
    task.status = 'completed'
    task.progress = 100
    task.result = result
    tasks.set(id, task)
    emitTaskComplete(id, result)
    log.info(`[task-queue] Task completed: ${id}`)
  }
}

/**
 * Emit progress event to all renderer windows
 */
function emitTaskProgress(id: string, progress: number, status: string): void {
  BrowserWindow.getAllWindows().forEach(win => {
    win.webContents.send('task:progress', { id, progress, status })
  })
}

/**
 * Emit completion event to all renderer windows
 */
function emitTaskComplete(id: string, result: any): void {
  BrowserWindow.getAllWindows().forEach(win => {
    win.webContents.send('task:complete', { id, result })
  })
}