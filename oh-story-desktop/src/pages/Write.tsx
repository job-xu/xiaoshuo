import { useState } from 'react'
import { Play, Save, Send, Sparkles, CheckCircle, FileText, ChevronRight } from 'lucide-react'

function Write() {
  const [content, setContent] = useState('')
  const [writing, setWriting] = useState(false)
  const [progress, setProgress] = useState(0)

  const chapters = [
    { id: 20, name: '第 20 章', status: 'published' },
    { id: 21, name: '第 21 章', status: 'published' },
    { id: 22, name: '第 22 章', status: 'pending' },
    { id: 23, name: '第 23 章', status: 'editing', active: true },
    { id: 24, name: '第 24 章', status: 'blank' },
  ]

  const handleAIWrite = async () => {
    setWriting(true)
    setProgress(0)

    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval)
          setWriting(false)
          return 100
        }
        return p + 3
      })
    }, 300)
  }

  return (
    <div className="h-full flex">
      {/* Chapter list */}
      <div className="w-48 bg-gray-50 border-r border-gray-200 p-4 overflow-auto">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">章节列表</h3>
        <div className="space-y-1">
          {chapters.map(ch => (
            <button
              key={ch.id}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                ch.active
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {ch.status === 'published' && <CheckCircle size={14} className="text-green-500" />}
              {ch.status === 'pending' && <FileText size={14} className="text-amber-500" />}
              {ch.status === 'editing' && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
              {ch.status === 'blank' && <span className="w-2 h-2 bg-gray-300 rounded-full" />}
              {ch.name}
            </button>
          ))}
        </div>
        <button className="w-full mt-4 px-3 py-2 text-sm text-blue-600 border border-dashed border-blue-300 rounded-lg hover:bg-blue-50">
          + 新建章节
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-800">第 23 章：重逢</h2>
            <p className="text-sm text-gray-400">字数：{content.length || 0} / 3,000</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 flex items-center gap-1">
              <Sparkles size={14} /> AI续写
            </button>
            <button className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
              去AI味
            </button>
            <button className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
              质量检查
            </button>
          </div>
        </div>

        <div className="flex-1 p-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="开始写作..."
            className="w-full h-full resize-none border-0 focus:outline-none text-gray-700 leading-relaxed"
          />
        </div>

        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          {writing && (
            <div className="flex items-center gap-3">
              <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm text-gray-500">AI 续写中... {progress}%</span>
            </div>
          )}

          <div className="flex gap-2 ml-auto">
            <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg flex items-center gap-2 hover:bg-gray-200">
              <Save size={16} /> 保存草稿
            </button>
            <button
              onClick={handleAIWrite}
              disabled={writing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 hover:bg-blue-700"
            >
              <Play size={16} /> 续写当前章
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700">
              <Send size={16} /> 提交审稿
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Write