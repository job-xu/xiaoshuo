import { useState, useEffect } from 'react'
import { FolderOpen, RefreshCw, Check, ExternalLink, Info, Github } from 'lucide-react'

const CURRENT_VERSION = '1.0.0-alpha'

interface VersionInfo {
  tag_name?: string
  html_url?: string
  body?: string
}

function Settings() {
  const [projectPath, setProjectPath] = useState('')
  const [version, setVersion] = useState(CURRENT_VERSION)
  const [checkingUpdate, setCheckingUpdate] = useState(false)
  const [updateStatus, setUpdateStatus] = useState<'ok' | 'update' | 'error' | null>(null)
  const [latestVersion, setLatestVersion] = useState<string | null>(null)
  const [releaseNotes, setReleaseNotes] = useState<string | null>(null)

  const selectProject = async () => {
    const path = await window.electronAPI?.selectProjectDir()
    if (path) setProjectPath(path)
  }

  const checkUpdate = async () => {
    setCheckingUpdate(true)
    setUpdateStatus(null)
    setReleaseNotes(null)

    try {
      const response = await fetch('https://api.github.com/repos/job-xu/xiaoshuo/releases/latest')

      if (!response.ok) {
        throw new Error('Failed to fetch releases')
      }

      const data: VersionInfo = await response.json()

      if (data.tag_name) {
        setLatestVersion(data.tag_name)

        // Compare versions (simple comparison, real impl would use semver)
        const current = CURRENT_VERSION.replace(/[^0-9.]/g, '')
        const latest = data.tag_name.replace(/[^0-9.]/g, '')

        if (latest > current) {
          setUpdateStatus('update')
          setReleaseNotes(data.body || null)
        } else {
          setUpdateStatus('ok')
        }
      }
    } catch (error) {
      console.error('Version check failed:', error)
      setUpdateStatus('error')
    } finally {
      setCheckingUpdate(false)
    }
  }

  const openReleasePage = () => {
    if (latestVersion) {
      window.open(`https://github.com/job-xu/xiaoshuo/releases/tag/${latestVersion}`, '_blank')
    }
  }

  const commands = [
    { name: '/story-long-scan', mode: 'API 直调' },
    { name: '/story-long-write', mode: 'API 直调' },
    { name: '/story-long-analyze', mode: 'API 直调' },
    { name: '/story-deslop', mode: 'API 直调' },
    { name: '/story-setup', mode: 'CLI 包装' },
    { name: '/story-cover', mode: 'CLI 包装' },
    { name: '/story-review', mode: 'CLI 包装' },
  ]

  return (
    <div className="h-full overflow-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">设置</h1>

      {/* Project */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">项目管理</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1 px-4 py-3 bg-gray-50 rounded-lg text-gray-600 truncate">
            {projectPath || '未选择项目目录'}
          </div>
          <button
            onClick={selectProject}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 shrink-0"
          >
            <FolderOpen size={16} /> 切换项目
          </button>
        </div>
      </div>

      {/* Skills version */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">技能版本</h2>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-gray-800 font-medium">oh-story-desktop</span>
            <span className="text-gray-500">{version}</span>
            {updateStatus === 'ok' && (
              <span className="inline-flex items-center gap-1 text-green-600 text-sm bg-green-50 px-2 py-1 rounded">
                <Check size={14} /> 已是最新
              </span>
            )}
            {updateStatus === 'update' && (
              <span className="inline-flex items-center gap-1 text-blue-600 text-sm bg-blue-50 px-2 py-1 rounded">
                <RefreshCw size={14} /> 发现新版本 {latestVersion}
              </span>
            )}
            {updateStatus === 'error' && (
              <span className="inline-flex items-center gap-1 text-gray-500 text-sm bg-gray-100 px-2 py-1 rounded">
                检查更新失败
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {updateStatus === 'update' && (
              <button
                onClick={openReleasePage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
              >
                <ExternalLink size={16} /> 查看更新
              </button>
            )}
            <button
              onClick={checkUpdate}
              disabled={checkingUpdate}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg flex items-center gap-2 hover:bg-gray-200 disabled:opacity-50"
            >
              <RefreshCw size={16} className={checkingUpdate ? 'animate-spin' : ''} />
              检查更新
            </button>
          </div>
        </div>

        {/* Release notes */}
        {releaseNotes && updateStatus === 'update' && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="text-sm font-medium text-blue-800 mb-2">更新内容</div>
            <div className="text-sm text-blue-700 whitespace-pre-wrap max-h-40 overflow-auto">
              {releaseNotes}
            </div>
          </div>
        )}

        <div className="border-t border-gray-100 pt-4">
          <div className="text-sm text-gray-500 mb-3">可用命令</div>
          <div className="space-y-2">
            {commands.map(cmd => (
              <div key={cmd.name} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <code className="text-sm text-gray-700">{cmd.name}</code>
                <span className={`text-xs px-2 py-1 rounded ${
                  cmd.mode === 'API 直调' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {cmd.mode}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Browser config */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">浏览器配置</h2>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">CDP 端口</span>
          <span className="px-3 py-1 bg-gray-100 rounded text-gray-700">9222</span>
          <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
            启动 Chrome
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
            检查连接
          </button>
        </div>
      </div>

      {/* Writing preferences */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">写作偏好</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">默认单章字数</span>
            <span className="px-3 py-1 bg-gray-100 rounded text-gray-700">3,000 字</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">自动保存</span>
            <span className="text-green-600">✓ 每30秒</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">AI 续写模型</span>
            <span className="px-3 py-1 bg-gray-100 rounded text-gray-700">Claude Sonnet 4</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">去AI味</span>
            <span className="text-green-600">✓ 自动应用</span>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">关于</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-500">
            <Info size={16} />
            <span>桌面端 {version} · oh-story-claudecode</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.open('https://github.com/job-xu/xiaoshuo/issues', '_blank')}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
            >
              <Github size={14} /> 反馈问题
            </button>
            <button
              onClick={() => window.open('https://github.com/job-xu/xiaoshuo/releases', '_blank')}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              更新日志
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings