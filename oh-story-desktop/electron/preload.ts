import { contextBridge, ipcRenderer } from 'electron'

// Types for the API
export type TaskType =
  | { type: 'cli'; cmd: string }
  | { type: 'script'; script: string; args: string[] }
  | { type: 'scan'; platform: string; list: string }

export type ElectronAPI = {
  // CLI commands
  runCli: (cmd: string) => Promise<{ success: boolean; output: string; error?: string }>

  // Script execution
  runScript: (script: string, args: string[]) => Promise<{ success: boolean; output: string; error?: string }>

  // Task queue
  queueTask: (task: TaskType) => Promise<{ id: string }>
  getTasks: () => Promise<any[]>
  cancelTask: (id: string) => Promise<boolean>

  // Dialog
  selectProjectDir: () => Promise<string | null>

  // Events
  onTaskProgress: (callback: (data: { id: string; progress: number; status: string }) => void) => () => void
  onTaskComplete: (callback: (data: { id: string; result: any }) => void) => () => void
}

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // CLI commands
  runCli: (cmd: string) => ipcRenderer.invoke('cli:run', cmd),

  // Script execution
  runScript: (script: string, args: string[]) => ipcRenderer.invoke('script:run', script, args),

  // Task queue
  queueTask: (task: TaskType) => ipcRenderer.invoke('task:queue', task),
  getTasks: () => ipcRenderer.invoke('task:list'),
  cancelTask: (id: string) => ipcRenderer.invoke('task:cancel', id),

  // Project directory selection
  selectProjectDir: () => ipcRenderer.invoke('dialog:selectDir'),

  // Task events
  onTaskProgress: (callback: (data: { id: string; progress: number; status: string }) => void) => {
    const handler = (_: any, data: any) => callback(data)
    ipcRenderer.on('task:progress', handler)
    return () => ipcRenderer.removeListener('task:progress', handler)
  },

  onTaskComplete: (callback: (data: { id: string; result: any }) => void) => {
    const handler = (_: any, data: any) => callback(data)
    ipcRenderer.on('task:complete', handler)
    return () => ipcRenderer.removeListener('task:complete', handler)
  }
} as ElectronAPI)