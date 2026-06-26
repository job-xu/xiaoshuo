import { spawn, SpawnSyncOptions } from 'child_process'
import { app } from 'electron'
import log from 'electron-log'

/**
 * Run a CLI command via claude --print
 * Used for low-frequency, stateless commands like /story-setup
 */
export async function runCliCommand(cmd: string): Promise<{
  success: boolean
  output: string
  error?: string
}> {
  log.info(`[cli-runner] Executing: ${cmd}`)

  return new Promise((resolve) => {
    try {
      const result = spawn('claude', ['--print', cmd], {
        cwd: app.getPath('home'),
        encoding: 'utf-8',
        timeout: 120_000,
        shell: true
      } as SpawnSyncOptions)

      let stdout = ''
      let stderr = ''

      result.stdout?.on('data', (data) => {
        stdout += data.toString()
      })

      result.stderr?.on('data', (data) => {
        stderr += data.toString()
      })

      result.on('close', (code) => {
        log.info(`[cli-runner] Command completed with code ${code}`)
        resolve({
          success: code === 0,
          output: stdout,
          error: stderr || undefined
        })
      })

      result.on('error', (err) => {
        log.error(`[cli-runner] Command error:`, err)
        resolve({
          success: false,
          output: '',
          error: err.message
        })
      })
    } catch (error: any) {
      log.error('[cli-runner] Exception:', error)
      resolve({
        success: false,
        output: '',
        error: error.message || 'Unknown error'
      })
    }
  })
}