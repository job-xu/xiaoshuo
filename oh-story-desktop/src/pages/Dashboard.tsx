import { useNavigate } from 'react-router-dom'
import { Search, BookOpen, PenTool, Sparkles, Image, TrendingUp, Clock, FileText, Zap } from 'lucide-react'

function Dashboard() {
  const navigate = useNavigate()

  const quickActions = [
    { icon: Search, label: '扫榜', path: '/scan', color: 'bg-blue-500' },
    { icon: BookOpen, label: '拆文', path: '/deconstruct', color: 'bg-green-500' },
    { icon: PenTool, label: '写作', path: '/write', color: 'bg-purple-500' },
    { icon: Sparkles, label: '去味', path: '/deslop', color: 'bg-amber-500' },
    { icon: Image, label: '封面', path: '/cover', color: 'bg-pink-500' },
  ]

  const stats = [
    { label: '今日写作', value: '1,240 字', sub: '+380 今日', icon: PenTool },
    { label: '上次扫榜', value: '2026/06/26', sub: '番茄金榜TOP', icon: TrendingUp },
    { label: '待拆新书', value: '3 本', sub: '点击查看', icon: BookOpen },
    { label: '去味待审', value: '5 章', sub: '点击处理', icon: Sparkles },
  ]

  const recentTasks = [
    { status: 'running', name: '扫榜 · 番茄月票榜', progress: 65, time: '14:30' },
    { status: 'completed', name: '去味 · 第23章', result: '1,243字已处理', time: '14:20' },
    { status: 'completed', name: '拆文 · 《深海余烬》', result: '黄金三章报告', time: '06-25' },
  ]

  return (
    <div className="h-full overflow-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">欢迎回来</h1>
        <p className="text-gray-500">都市 · 连载中 · 第 23 章</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, sub, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={16} className="text-gray-400" />
              <span className="text-sm text-gray-500">{label}</span>
            </div>
            <div className="text-xl font-semibold text-gray-800">{value}</div>
            <div className="text-xs text-gray-400">{sub}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">快捷入口</h2>
        <div className="flex gap-3">
          {quickActions.map(({ icon: Icon, label, path, color }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`${color} text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity`}
            >
              <Icon size={18} />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Tasks */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">最近任务</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {recentTasks.map((task, i) => (
            <div key={i} className="p-4 flex items-center gap-4">
              <div className={`w-2 h-2 rounded-full ${
                task.status === 'running' ? 'bg-blue-500 animate-pulse' :
                task.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
              }`} />
              <div className="flex-1">
                <div className="font-medium text-gray-700">{task.name}</div>
                <div className="text-xs text-gray-400">
                  {task.status === 'running' ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-gray-200 rounded-full max-w-xs">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <span>{task.progress}%</span>
                    </div>
                  ) : task.result}
                </div>
              </div>
              <div className="text-xs text-gray-400">{task.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard