import { X, Minus, RotateCcw, Trash2 } from 'lucide-react'

interface Task {
  id: string
  type: string
  status: string
  progress: number
  createdAt: string
  result?: any
}

interface TaskPanelProps {
  tasks: Task[]
  onClose: () => void
  onCancel: (id: string) => void
}

function TaskPanel({ tasks, onClose, onCancel }: TaskPanelProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
      case 'pending':
        return <RotateCcw size={14} className="animate-spin text-blue-500" />
      case 'completed':
        return <span className="text-green-500">✓</span>
      case 'cancelled':
        return <span className="text-gray-400">×</span>
      default:
        return null
    }
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h2 className="font-semibold text-gray-700">任务队列</h2>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="p-4 text-center text-gray-400 text-sm">
            暂无任务
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {tasks.map((task) => (
              <div key={task.id} className="p-3 hover:bg-gray-50">
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(task.status)}
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {task.type === 'cli' ? `CLI: ${task.cmd}` :
                     task.type === 'script' ? `脚本: ${task.script}` :
                     `任务: ${task.type}`}
                  </span>
                </div>

                <div className="text-xs text-gray-400 mb-2">
                  {formatTime(task.createdAt)}
                </div>

                {/* Progress bar */}
                {(task.status === 'running' || task.status === 'pending') && (
                  <div className="mb-2">
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${(task.progress || 0) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {Math.round((task.progress || 0) * 100)}%
                    </div>
                  </div>
                )}

                {/* Status text */}
                {task.status === 'completed' && task.result && (
                  <div className="text-xs text-green-600">
                    完成 · {task.result.output?.substring(0, 50) || ''}...
                  </div>
                )}

                {/* Actions */}
                {(task.status === 'running' || task.status === 'pending') && (
                  <button
                    onClick={() => onCancel(task.id)}
                    className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                  >
                    <Trash2 size={12} /> 取消
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TaskPanel