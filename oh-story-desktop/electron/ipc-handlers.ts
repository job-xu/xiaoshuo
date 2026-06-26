import { ipcMain, dialog, app } from 'electron'
import { spawn, SpawnOptions } from 'child_process'
import { join, dirname } from 'path'
import log from 'electron-log'

// Get the skills directory - either from the app itself or from project directory
function getSkillsDir(): string {
  // In development, skills are in the parent directory
  // In production, they would be bundled with the app
  const appDir = dirname(app.getAppPath())
  const devSkillsDir = join(appDir, '..', 'skills')
  return devSkillsDir
}

export function setupIpcHandlers(): void {
  log.info('Setting up IPC handlers...')

  // CLI command runner
  ipcMain.handle('cli:run', async (_, cmd: string) => {
    log.info(`CLI command: ${cmd}`)
    return new Promise((resolve) => {
      try {
        const result = spawnSync('claude', ['--print', cmd], {
          cwd: app.getPath('home'),
          encoding: 'utf-8',
          timeout: 120000,
          shell: true
        } as SpawnOptions)

        resolve({
          success: result.status === 0,
          output: result.stdout || '',
          error: result.stderr || ''
        })
      } catch (error: any) {
        log.error('CLI error:', error)
        resolve({
          success: false,
          output: '',
          error: error.message || 'Unknown error'
        })
      }
    })
  })

  // Script runner
  ipcMain.handle('script:run', async (_, script: string, args: string[]) => {
    log.info(`Running script: ${script} with args:`, args)
    return new Promise((resolve) => {
      try {
        const scriptPath = join(getSkillsDir(), script)
        const result = spawnSync('node', [scriptPath, ...args], {
          encoding: 'utf-8',
          timeout: 120000
        } as SpawnOptions)

        resolve({
          success: result.status === 0,
          output: result.stdout || '',
          error: result.stderr || ''
        })
      } catch (error: any) {
        log.error('Script error:', error)
        resolve({
          success: false,
          output: '',
          error: error.message || 'Unknown error'
        })
      }
    })
  })

  // Task queue handlers (simplified in-memory implementation)
  const tasks = new Map<string, any>()

  ipcMain.handle('task:queue', async (_, task: any) => {
    const id = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const taskData = {
      id,
      ...task,
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString()
    }
    tasks.set(id, taskData)
    log.info(`Task queued: ${id}`)
    return { id }
  })

  ipcMain.handle('task:list', async () => {
    return Array.from(tasks.values())
  })

  ipcMain.handle('task:cancel', async (_, id: string) => {
    const task = tasks.get(id)
    if (task) {
      task.status = 'cancelled'
      tasks.set(id, task)
      return true
    }
    return false
  })

  // Directory selection dialog
  ipcMain.handle('dialog:selectDir', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (result.canceled || result.filePaths.length === 0) {
      return null
    }
    return result.filePaths[0]
  })

  log.info('IPC handlers setup complete')
}

// Helper to emit task events (call this from task processing)
export function emitTaskProgress(id: string, progress: number, status: string): void {
  const { BrowserWindow } = require('electron')
  BrowserWindow.getAllWindows().forEach(win => {
    win.webContents.send('task:progress', { id, progress, status })
  })
}

export function emitTaskComplete(id: string, result: any): void {
  const { BrowserWindow } = require('electron')
  BrowserWindow.getAllWindows().forEach(win => {
    win.webContents.send('task:complete', { id, result })
  })
}