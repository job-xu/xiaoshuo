import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Search,
  BookOpen,
  PenTool,
  Image,
  Sparkles,
  Settings,
  FolderOpen,
  ListTodo
} from 'lucide-react'

interface SidebarProps {
  pendingTasks: number
  onTaskClick: () => void
}

const navItems = [
  { path: '/', icon: LayoutDashboard, label: '看板' },
  { path: '/scan', icon: Search, label: '扫榜' },
  { path: '/deconstruct', icon: BookOpen, label: '拆文' },
  { path: '/write', icon: PenTool, label: '写作' },
  { path: '/cover', icon: Image, label: '封面' },
  { path: '/deslop', icon: Sparkles, label: '去味' },
]

function Sidebar({ pendingTasks, onTaskClick }: SidebarProps) {
  return (
    <aside className="w-16 bg-gray-900 text-white flex flex-col items-center py-4 shrink-0">
      {/* Logo */}
      <div className="mb-6 text-xl font-bold text-blue-400">oh</div>

      {/* Main nav */}
      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
            title={label}
          >
            <Icon size={20} />
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="flex flex-col gap-2">
        {/* Task indicator */}
        <button
          onClick={onTaskClick}
          className="w-12 h-12 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-800 hover:text-white transition-colors relative"
          title="任务队列"
        >
          <ListTodo size={20} />
          {pendingTasks > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {pendingTasks > 9 ? '9+' : pendingTasks}
            </span>
          )}
        </button>

        {/* Project switcher */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
              isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`
          }
          title="设置"
        >
          <Settings size={20} />
        </NavLink>
      </div>
    </aside>
  )
}

export default Sidebar