import { ipcMain, dialog } from 'electron'
import log from 'electron-log'
import { runCliCommand } from './runners/cli-runner'
import { runSkillScript } from './runners/script-runner'
import {
  queueTask as addTask,
  getAllTasks,
  getTask,
  cancelTask,
  updateTaskProgress,
  completeTask,
  TaskType
} from './services/task-queue'

export function setupIpcHandlers(): void {
  log.info('Setting up IPC handlers...')

  // CLI command runner
  ipcMain.handle('cli:run', async (_, cmd: string) => {
    log.info(`[IPC] cli:run - ${cmd}`)
    return runCliCommand(cmd)
  })

  // Script runner
  ipcMain.handle('script:run', async (_, script: string, args: string[]) => {
    log.info(`[IPC] script:run - ${script}`)
    return runSkillScript(script, args)
  })

  // Task queue - queue a new task
  ipcMain.handle('task:queue', async (_, taskData: TaskType) => {
    log.info('[IPC] task:queue', taskData)
    const id = addTask(taskData)
    return { id }
  })

  // Task queue - list all tasks
  ipcMain.handle('task:list', async () => {
    return getAllTasks()
  })

  // Task queue - get single task
  ipcMain.handle('task:get', async (_, id: string) => {
    return getTask(id)
  })

  // Task queue - cancel a task
  ipcMain.handle('task:cancel', async (_, id: string) => {
    log.info(`[IPC] task:cancel - ${id}`)
    return cancelTask(id)
  })

  // Task queue - update progress (internal use)
  ipcMain.handle('task:updateProgress', async (_, id: string, progress: number, status?: string) => {
    updateTaskProgress(id, progress, status)
    return true
  })

  // Task queue - complete task (internal use)
  ipcMain.handle('task:complete', async (_, id: string, result: any) => {
    completeTask(id, result)
    return true
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