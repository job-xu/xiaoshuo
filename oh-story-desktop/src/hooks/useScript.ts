import { useState, useCallback } from 'react'

interface ScriptResult {
  success: boolean
  output: string
  error?: string
}

interface UseScriptReturn {
  running: boolean
  result: ScriptResult | null
  error: string | null
  run: (script: string, args?: string[]) => Promise<ScriptResult>
}

/**
 * Hook for running skill scripts directly via Node.js
 */
export function useScript(): UseScriptReturn {
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<ScriptResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async (script: string, args: string[] = []): Promise<ScriptResult> => {
    setRunning(true)
    setError(null)
    setResult(null)

    try {
      const res = await window.electronAPI.runScript(script, args)
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