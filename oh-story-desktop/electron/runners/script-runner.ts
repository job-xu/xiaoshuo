import { spawn, SpawnSyncOptions } from 'child_process'
import { join, dirname } from 'path'
import { app } from 'electron'
import log from 'electron-log'

/**
 * Get the skills directory path
 * In development: {project}/skills
 * In production: {app}/resources/skills
 */
function getSkillsDir(): string {
  const appPath = app.getAppPath()
  const appDir = dirname(appPath)

  // Check if running in development
  if (appPath.includes('app.asar') === false) {
    // Development: skills are in parent directory
    return join(appDir, '..', 'skills')
  }

  // Production: skills bundled in resources
  return join(appDir, 'resources', 'skills')
}

/**
 * Run a skill script directly via Node.js
 * Used for high-frequency commands requiring progress feedback
 */
export async function runSkillScript(
  scriptPath: string,
  args: string[] = []
): Promise<{
  success: boolean
  output: string
  error?: string
}> {
  log.info(`[script-runner] Executing: ${scriptPath} with args:`, args)

  return new Promise((resolve) => {
    try {
      const fullPath = join(getSkillsDir(), scriptPath)
      log.info(`[script-runner] Full path: ${fullPath}`)

      const result = spawn('node', [fullPath, ...args], {
        encoding: 'utf-8',
        timeout: 120_000,
        stdio: ['pipe', 'pipe', 'pipe']
      } as SpawnSyncOptions)

      let stdout = ''
      let stderr = ''

      result.stdout?.on('data', (data) => {
        const line = data.toString()
        stdout += line
        // Emit progress to main process
        log.info(`[script-runner] stdout: ${line.trim()}`)
      })

      result.stderr?.on('data', (data) => {
        stderr += data.toString()
        log.warn(`[script-runner] stderr: ${data.toString().trim()}`)
      })

      result.on('close', (code) => {
        log.info(`[script-runner] Script completed with code ${code}`)
        resolve({
          success: code === 0,
          output: stdout,
          error: stderr || undefined
        })
      })

      result.on('error', (err) => {
        log.error(`[script-runner] Script error:`, err)
        resolve({
          success: false,
          output: '',
          error: err.message
        })
      })
    } catch (error: any) {
      log.error('[script-runner] Exception:', error)
      resolve({
        success: false,
        output: '',
        error: error.message || 'Unknown error'
      })
    }
  })
}