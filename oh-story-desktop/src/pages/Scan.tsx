import { useState, useEffect } from 'react'
import { useTask } from '../hooks/useTask'
import { Search, Play, Pause, X, ExternalLink } from 'lucide-react'

const platforms = [
  { id: 'qidian', name: '起点' },
  { id: 'fanqie', name: '番茄' },
  { id: 'jjwxc', name: '晋江' },
  { id: 'qimao', name: '七猫' },
]

const lists = ['月票榜', '畅销榜', '签约新书榜', '三江推荐']

interface ScanResult {
  rank: number
  title: string
  votes: string
  genre: string
  trend: string
}

function Scan() {
  const [activePlatform, setActivePlatform] = useState('qidian')
  const [selectedLists, setSelectedLists] = useState<string[]>(['月票榜'])
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)
  const [scanResults, setScanResults] = useState<ScanResult[]>([])
  const { queueTask, cancelTask, tasks } = useTask()

  // Get current scan task if any
  const currentTask = tasks.find(t => t.id === currentTaskId)
  const isScanning = currentTask?.status === 'running' || currentTask?.status === 'pending'
  const progress = currentTask?.progress || 0

  const handleListToggle = (list: string) => {
    setSelectedLists(prev =>
      prev.includes(list)
        ? prev.filter(l => l !== list)
        : [...prev, list]
    )
  }

  const startScan = async () => {
    const result = await queueTask({
      type: 'scan',
      platform: activePlatform,
      list: selectedLists.join(',')
    })
    setCurrentTaskId(result.id)
    setScanResults([])

    // For demo, simulate scan progress
    // In production, this would be driven by actual script output
  }

  const handleCancel = async () => {
    if (currentTaskId) {
      await cancelTask(currentTaskId)
      setCurrentTaskId(null)
    }
  }

  // Mock scan results when progress reaches certain points
  useEffect(() => {
    if (progress > 0.3 && scanResults.length === 0) {
      setScanResults([
        { rank: 1, title: '《宿命之环》', votes: '42.8万票', genre: '玄幻', trend: '△2' },
        { rank: 2, title: '《夜泳》', votes: '31.2万票', genre: '都市', trend: '─' },
        { rank: 3, title: '《文豪1978》', votes: '28.6万票', genre: '都市', trend: '▲5' },
        { rank: 4, title: '《灵气复苏》', votes: '25.1万票', genre: '都市', trend: '▼1' },
      ])
    }
  }, [progress, scanResults.length])

  return (
    <div className="h-full overflow-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">扫榜</h1>

      {/* Platform selector */}
      <div className="mb-6">
        <div className="text-sm text-gray-500 mb-2">平台</div>
        <div className="flex gap-2">
          {platforms.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePlatform(p.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activePlatform === p.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* List selector */}
      <div className="mb-6">
        <div className="text-sm text-gray-500 mb-2">榜单</div>
        <div className="flex flex-wrap gap-2">
          {lists.map(list => (
            <button
              key={list}
              onClick={() => handleListToggle(list)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedLists.includes(list)
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {list}
            </button>
          ))}
          <button
            onClick={() => setSelectedLists([...lists])}
            className="px-4 py-2 rounded-lg font-medium bg-gray-800 text-white hover:bg-gray-700"
          >
            一键扫全部
          </button>
        </div>
      </div>

      {/* Scan results */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <span className="font-medium text-gray-700">
            {platforms.find(p => p.id === activePlatform)?.name} · {selectedLists.join(', ') || '未选择'}
          </span>
          {isScanning && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <span>{Math.round(progress * 100)}%</span>
            </div>
          )}
        </div>

        <div className="p-4">
          {isScanning && scanResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Search size={48} className="mx-auto mb-4 animate-pulse opacity-50" />
              <p>采集中，请稍候...</p>
            </div>
          ) : scanResults.length > 0 ? (
            <div className="space-y-2">
              {scanResults.map((book) => (
                <div key={book.rank} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg">
                  <span className="w-8 text-center font-bold text-gray-400">#{book.rank}</span>
                  <span className="flex-1 font-medium text-gray-800">{book.title}</span>
                  <span className="text-gray-500">{book.votes}</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-600">{book.genre}</span>
                  <span className={`text-sm ${
                    book.trend.startsWith('△') ? 'text-green-600' :
                    book.trend.startsWith('▼') ? 'text-red-600' :
                    'text-gray-400'
                  }`}>{book.trend}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Search size={48} className="mx-auto mb-4 opacity-20" />
              <p>点击「开始扫描」获取榜单数据</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 flex gap-2">
          {isScanning ? (
            <>
              <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg flex items-center gap-2">
                <Pause size={16} /> 暂停
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 hover:bg-red-100"
              >
                <X size={16} /> 取消
              </button>
            </>
          ) : (
            <button
              onClick={startScan}
              disabled={selectedLists.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
            >
              <Play size={16} /> 开始扫描
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Scan