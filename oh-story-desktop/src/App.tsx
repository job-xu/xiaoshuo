import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import TaskPanel from './components/TaskPanel'
import Dashboard from './pages/Dashboard'
import Scan from './pages/Scan'
import Deconstruct from './pages/Deconstruct'
import Write from './pages/Write'
import Cover from './pages/Cover'
import Deslop from './pages/Deslop'
import Settings from './pages/Settings'

function App() {
  const [taskPanelOpen, setTaskPanelOpen] = useState(false)
  const [tasks, setTasks] = useState<any[]>([])

  useEffect(() => {
    // Load initial tasks
    window.electronAPI?.getTasks().then(setTasks)

    // Subscribe to task updates
    const unsubProgress = window.electronAPI?.onTaskProgress((data) => {
      setTasks(prev => prev.map(t => t.id === data.id ? { ...t, progress: data.progress, status: data.status } : t))
    })

    const unsubComplete = window.electronAPI?.onTaskComplete((data) => {
      setTasks(prev => prev.map(t => t.id === data.id ? { ...t, status: 'completed', result: data.result } : t))
    })

    return () => {
      unsubProgress?.()
      unsubComplete?.()
    }
  }, [])

  const pendingTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length

  return (
    <HashRouter>
      <div className="flex h-screen bg-gray-100">
        <Sidebar
          pendingTasks={pendingTasks}
          onTaskClick={() => setTaskPanelOpen(true)}
        />

        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/deconstruct" element={<Deconstruct />} />
            <Route path="/write" element={<Write />} />
            <Route path="/cover" element={<Cover />} />
            <Route path="/deslop" element={<Deslop />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {taskPanelOpen && (
          <TaskPanel
            tasks={tasks}
            onClose={() => setTaskPanelOpen(false)}
            onCancel={(id) => window.electronAPI?.cancelTask(id)}
          />
        )}
      </div>
    </HashRouter>
  )
}

export default App