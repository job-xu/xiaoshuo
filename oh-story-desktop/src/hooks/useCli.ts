import { useState, useCallback } from 'react'

interface CliResult {
  success: boolean
  output: string
  error?: string
}

interface UseCliReturn {
  running: boolean
  result: CliResult | null
  error: string | null
  run: (cmd: string) => Promise<CliResult>
}

/**
 * Hook for executing CLI commands via claude --print
 */
export function useCli(): UseCliReturn {
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<CliResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async (cmd: string): Promise<CliResult> => {
    setRunning(true)
    setError(null)
    setResult(null)

    try {
      const res = await window.electronAPI.runCli(cmd)
      setResult(res)
      if (!res.success && res.error) {
        setError(res.error)
      }
      return res
    } catch (err: any) {
      const errorMsg = err.message || 'Unknown error'
      setError(errorMsg)
      return { success: false, output: '', error: errorMsg }
    } finally {
      setRunning(false)
    }
  }, [])

  return { running, result, error, run }
}