import { useState, useEffect, useCallback } from 'react'

export interface Task {
  id: string
  type: string
  status: 'pending' | 'running' | 'completed' | 'cancelled'
  progress: number
  createdAt: string
  result?: any
}

interface UseTaskReturn {
  tasks: Task[]
  loading: boolean
  queueTask: (task: any) => Promise<string>
  cancelTask: (id: string) => Promise<boolean>
  refreshTasks: () => Promise<void>
}

/**
 * Hook for managing the task queue
 */
export function useTask(): UseTaskReturn {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  // Load initial tasks
  const refreshTasks = useCallback(async () => {
    try {
      const loaded = await window.electronAPI.getTasks()
      setTasks(loaded)
    } catch (err) {
      console.error('Failed to load tasks:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshTasks()

    // Subscribe to task events
    const unsubProgress = window.electronAPI.onTaskProgress((data) => {
      setTasks(prev =>
        prev.map(t =>
          t.id === data.id
            ? { ...t, progress: data.progress, status: data.status as Task['status'] }
            : t
        )
      )
    })

    const unsubComplete = window.electronAPI.onTaskComplete((data) => {
      setTasks(prev =>
        prev.map(t =>
          t.id === data.id
            ? { ...t, status: 'completed' as const, progress: 100, result: data.result }
            : t
        )
      )
    })

    return () => {
      unsubProgress?.()
      unsubComplete?.()
    }
  }, [refreshTasks])

  const queueTask = useCallback(async (task: any): Promise<string> => {
    const result = await window.electronAPI.queueTask(task)
    await refreshTasks()
    return result.id
  }, [refreshTasks])

  const cancelTask = useCallback(async (id: string): Promise<boolean> => {
    const result = await window.electronAPI.cancelTask(id)
    if (result) {
      setTasks(prev =>
        prev.map(t =>
          t.id === id ? { ...t, status: 'cancelled' as const } : t
        )
      )
    }
    return result
  }, [])

  return { tasks, loading, queueTask, cancelTask, refreshTasks }
}