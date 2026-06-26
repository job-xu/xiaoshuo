import { useState } from 'react'
import { useScript } from '../hooks/useScript'
import { useTask } from '../hooks/useTask'
import { Play, Copy, Check, Trash2, Wand2, ArrowRight } from 'lucide-react'

function Deslop() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'standard' | 'light' | 'deep'>('standard')
  const [copied, setCopied] = useState(false)
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)
  const { run, running } = useScript()
  const { tasks } = useTask()

  const currentTask = tasks.find(t => t.id === currentTaskId)
  const isProcessing = currentTask?.status === 'running' || currentTask?.status === 'pending'

  const handleProcess = async () => {
    if (!input.trim()) return

    setCurrentTaskId(null)
    setOutput('')

    // Run the deslop script
    const result = await run('story-deslop/scripts/normalize-punctuation.js', [input, mode])

    if (result.success) {
      setOutput(result.output)
    } else {
      // Show error or use input as placeholder
      setOutput(result.error || '处理失败')
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setCurrentTaskId(null)
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">去AI味</h1>
        {currentTask && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${currentTask.progress * 100}%` }}
              />
            </div>
            <span>{Math.round(currentTask.progress * 100)}%</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <span className="font-medium text-gray-700">输入文本</span>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>{input.length} 字</span>
              <button
                onClick={handleClear}
                className="p-1 hover:text-gray-600"
                title="清空"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          <div className="flex-1 p-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="粘贴需要去AI味的文本..."
              className="w-full h-full resize-none border-0 focus:outline-none text-gray-700 leading-relaxed"
            />
          </div>
        </div>

        {/* Output */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <span className="font-medium text-gray-700">处理结果</span>
            {output && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? '已复制' : '复制结果'}
              </button>
            )}
          </div>
          <div className="flex-1 p-4">
            {isProcessing ? (
              <div className="h-full flex items-center justify-center text-gray-400">
                <Wand2 size={24} className="animate-pulse mr-2 text-blue-500" />
                AI 检测中...
              </div>
            ) : output ? (
              <div className="w-full h-full overflow-auto text-gray-700 leading-relaxed whitespace-pre-wrap">
                {output}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-300">
                <div className="text-center">
                  <ArrowRight size={24} className="mx-auto mb-2 opacity-30" />
                  <p>处理结果将显示在这里</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">处理模式</span>
          {(['standard', 'light', 'deep'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === m
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {m === 'standard' ? '标准去味' : m === 'light' ? '轻度优化' : '深度改写'}
            </button>
          ))}
        </div>

        <button
          onClick={handleProcess}
          disabled={!input.trim() || isProcessing}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl flex items-center gap-2 disabled:opacity-50 hover:bg-blue-700"
        >
          <Play size={18} /> 开始处理
        </button>
      </div>
    </div>
  )
}

export default Deslop