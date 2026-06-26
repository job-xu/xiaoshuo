import { BrowserWindow } from 'electron'
import log from 'electron-log'
import { runCliCommand } from '../runners/cli-runner'
import { runSkillScript } from '../runners/script-runner'

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

// In-memory task storage
const tasks = new Map<string, Task>()

// Track if we're already processing
let isProcessing = false

/**
 * Generate a unique task ID
 */
function generateTaskId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Queue a new task and start processing
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

  // Start processing if not already
  processTasks()

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
 * Process all pending tasks
 */
async function processTasks(): Promise<void> {
  if (isProcessing) return
  isProcessing = true

  while (true) {
    // Find next pending task
    const pendingTask = Array.from(tasks.values()).find(t => t.status === 'pending')
    if (!pendingTask) break

    // Mark as running
    pendingTask.status = 'running'
    tasks.set(pendingTask.id, pendingTask)
    emitTaskProgress(pendingTask.id, pendingTask.progress, 'running')

    try {
      await executeTask(pendingTask)
    } catch (error: any) {
      log.error(`[task-queue] Task execution error:`, error)
      completeTask(pendingTask.id, { error: error.message })
    }
  }

  isProcessing = false
}

/**
 * Execute a single task
 */
async function executeTask(task: Task): Promise<void> {
  const { data } = task
  log.info(`[task-queue] Executing task ${task.id}:`, data)

  // Update progress to 10%
  updateTaskProgress(task.id, 0.1)

  if (data.type === 'cli') {
    // CLI command via claude --print
    const result = await runCliCommand(data.cmd!)
    updateTaskProgress(task.id, 0.9)
    completeTask(task.id, result)

  } else if (data.type === 'script') {
    // Script execution
    const result = await runSkillScript(data.script!, data.args || [])
    updateTaskProgress(task.id, 0.9)
    completeTask(task.id, result)

  } else if (data.type === 'scan') {
    // Scan task - call the skill script
    // Map platform/list to actual script
    const platform = data.platform || 'qidian'
    const list = data.list || '月票榜'

    updateTaskProgress(task.id, 0.2)

    // For demo, we'll call a CLI command that triggers the scan
    // In production, this would call the actual scan script
    const result = await runCliCommand(`/story-long-scan ${platform} ${list}`)

    updateTaskProgress(task.id, 0.9)
    completeTask(task.id, {
      success: result.success,
      output: result.output || '扫描完成',
      error: result.error
    })
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