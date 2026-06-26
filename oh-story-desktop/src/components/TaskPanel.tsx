import { useState } from 'react'
import { X, RotateCcw, Trash2, CheckCircle, Clock, AlertCircle, Play, Minus } from 'lucide-react'

interface Task {
  id: string
  type: string
  status: 'pending' | 'running' | 'completed' | 'cancelled'
  progress: number
  createdAt: string
  result?: any
  data?: any
}

interface TaskPanelProps {
  tasks: Task[]
  onClose: () => void
  onCancel: (id: string) => void
  onRetry?: (task: Task) => void
}

function TaskPanel({ tasks, onClose, onCancel, onRetry }: TaskPanelProps) {
  const [expandedTask, setExpandedTask] = useState<string | null>(null)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <RotateCcw size={14} className="animate-spin text-blue-500" />
      case 'pending':
        return <Clock size={14} className="text-amber-500" />
      case 'completed':
        return <CheckCircle size={14} className="text-green-500" />
      case 'cancelled':
        return <Minus size={14} className="text-gray-400" />
      default:
        return null
    }
  }

  const getTaskName = (task: Task) => {
    switch (task.type) {
      case 'cli':
        return `CLI: ${task.data?.cmd || task.result?.cmd || '命令'}`
      case 'script':
        return `脚本: ${task.data?.script || task.result?.script || '脚本'}`
      case 'scan':
        return `扫榜: ${task.data?.platform || ''} ${task.data?.list || ''}`
      default:
        return `任务: ${task.type}`
    }
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }

  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'running')
  const completedTasks = tasks.filter(t => t.status === 'completed' || t.status === 'cancelled')

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h2 className="font-semibold text-gray-700">
          任务队列
          {pendingTasks.length > 0 && (
            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              {pendingTasks.length}
            </span>
          )}
        </h2>
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
          <>
            {/* Running/Pending tasks first */}
            {pendingTasks.length > 0 && (
              <div className="divide-y divide-gray-100">
                {pendingTasks.map((task) => (
                  <div key={task.id} className="p-3 hover:bg-gray-50">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(task.status)}
                      <span className="text-sm font-medium text-gray-700 truncate flex-1">
                        {getTaskName(task)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                      <span>{formatTime(task.createdAt)}</span>
                      <span className={task.status === 'running' ? 'text-blue-600' : 'text-amber-600'}>
                        {task.status === 'running' ? '进行中' : '等待中'}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-2">
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${task.progress * 100}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-400 mt-1 flex justify-end">
                        {Math.round(task.progress * 100)}%
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => onCancel(task.id)}
                        className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                      >
                        <Trash2 size={12} /> 取消
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Completed/Cancelled tasks */}
            {completedTasks.length > 0 && (
              <div className="border-t border-gray-200">
                <div className="px-3 py-2 text-xs text-gray-400 bg-gray-50">
                  已完成 ({completedTasks.length})
                </div>
                <div className="divide-y divide-gray-100">
                  {completedTasks.slice(0, 10).map((task) => (
                    <div
                      key={task.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(task.status)}
                        <span className="text-sm text-gray-600 truncate flex-1">
                          {getTaskName(task)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{formatTime(task.createdAt)}</span>
                        <span className={task.status === 'completed' ? 'text-green-600' : 'text-gray-400'}>
                          {task.status === 'completed' ? '已完成' : '已取消'}
                        </span>
                      </div>

                      {/* Expanded result */}
                      {expandedTask === task.id && task.result && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 font-mono overflow-auto max-h-32">
                          {task.result.output?.substring(0, 200) || '无输出'}
                        </div>
                      )}

                      {/* Retry button for cancelled tasks */}
                      {task.status === 'cancelled' && onRetry && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onRetry(task)
                          }}
                          className="mt-1 text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
                        >
                          <Play size={12} /> 重试
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default TaskPanel