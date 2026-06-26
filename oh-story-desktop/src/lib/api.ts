/**
 * API wrapper for electronAPI
 * Provides type-safe access to Electron APIs from the renderer
 */

export interface TaskType {
  type: 'cli' | 'script' | 'scan'
  cmd?: string
  script?: string
  args?: string[]
  platform?: string
  list?: string
}

export interface Task {
  id: string
  type: string
  status: 'pending' | 'running' | 'completed' | 'cancelled'
  progress: number
  createdAt: string
  result?: any
}

export interface CliResult {
  success: boolean
  output: string
  error?: string
}

export interface ScriptResult {
  success: boolean
  output: string
  error?: string
}

/**
 * Run a CLI command via claude --print
 */
export async function runCli(cmd: string): Promise<CliResult> {
  return window.electronAPI.runCli(cmd)
}

/**
 * Run a skill script directly via Node.js
 */
export async function runScript(script: string, args: string[] = []): Promise<ScriptResult> {
  return window.electronAPI.runScript(script, args)
}

/**
 * Queue a new task
 */
export async function queueTask(task: TaskType): Promise<{ id: string }> {
  return window.electronAPI.queueTask(task)
}

/**
 * Get all tasks
 */
export async function getTasks(): Promise<Task[]> {
  return window.electronAPI.getTasks()
}

/**
 * Cancel a task
 */
export async function cancelTask(id: string): Promise<boolean> {
  return window.electronAPI.cancelTask(id)
}

/**
 * Select a project directory
 */
export async function selectProjectDir(): Promise<string | null> {
  return window.electronAPI.selectProjectDir()
}

/**
 * Subscribe to task progress updates
 */
export function onTaskProgress(
  callback: (data: { id: string; progress: number; status: string }) => void
): () => void {
  return window.electronAPI.onTaskProgress(callback)
}

/**
 * Subscribe to task completion
 */
export function onTaskComplete(
  callback: (data: { id: string; result: any }) => void
): () => void {
  return window.electronAPI.onTaskComplete(callback)
}