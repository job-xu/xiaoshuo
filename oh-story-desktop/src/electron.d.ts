export {}

declare global {
  interface Window {
    electronAPI: {
      runCli: (cmd: string) => Promise<{ success: boolean; output: string; error?: string }>
      runScript: (script: string, args: string[]) => Promise<{ success: boolean; output: string; error?: string }>
      queueTask: (task: any) => Promise<{ id: string }>
      getTasks: () => Promise<any[]>
      cancelTask: (id: string) => Promise<boolean>
      selectProjectDir: () => Promise<string | null>
      onTaskProgress: (callback: (data: { id: string; progress: number; status: string }) => void) => () => void
      onTaskComplete: (callback: (data: { id: string; result: any }) => void) => () => void
    }
  }
}