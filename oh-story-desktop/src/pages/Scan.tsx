import { useState } from 'react'
import { Search, Play, Pause, X, ExternalLink } from 'lucide-react'

const platforms = [
  { id: 'qidian', name: '起点', active: true },
  { id: 'fanqie', name: '番茄', active: false },
  { id: 'jjwxc', name: '晋江', active: false },
  { id: 'qimao', name: '七猫', active: false },
]

const lists = ['月票榜', '畅销榜', '签约新书榜', '三江推荐']

function Scan() {
  const [activePlatform, setActivePlatform] = useState('qidian')
  const [selectedLists, setSelectedLists] = useState<string[]>(['月票榜'])
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleListToggle = (list: string) => {
    setSelectedLists(prev =>
      prev.includes(list)
        ? prev.filter(l => l !== list)
        : [...prev, list]
    )
  }

  const startScan = async () => {
    setScanning(true)
    setProgress(0)

    const result = await window.electronAPI?.queueTask({
      type: 'scan',
      platform: activePlatform,
      list: selectedLists.join(',')
    })

    // Simulate progress
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval)
          setScanning(false)
          return 100
        }
        return p + 5
      })
    }, 500)
  }

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
          {scanning && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span>{progress}%</span>
            </div>
          )}
        </div>

        <div className="p-4">
          {scanning ? (
            <div className="text-center py-8 text-gray-500">
              采集中，请稍候...
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Search size={48} className="mx-auto mb-4 opacity-20" />
              <p>点击「开始扫描」获取榜单数据</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 flex gap-2">
          {scanning ? (
            <>
              <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg flex items-center gap-2">
                <Pause size={16} /> 暂停
              </button>
              <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
                <X size={16} /> 取消
              </button>
            </>
          ) : (
            <button
              onClick={startScan}
              disabled={selectedLists.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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