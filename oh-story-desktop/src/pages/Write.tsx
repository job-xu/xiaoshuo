import { useState } from 'react'
import { useTask } from '../hooks/useTask'
import { Play, Save, Send, Sparkles, CheckCircle, FileText, ChevronRight, Wand2 } from 'lucide-react'

interface Chapter {
  id: number
  name: string
  status: 'published' | 'pending' | 'editing' | 'blank'
  active?: boolean
  content?: string
}

function Write() {
  const [chapters, setChapters] = useState<Chapter[]>([
    { id: 20, name: '第 20 章', status: 'published', content: '已发布内容...' },
    { id: 21, name: '第 21 章', status: 'published', content: '已发布内容...' },
    { id: 22, name: '第 22 章', status: 'pending', content: '待审核内容...' },
    { id: 23, name: '第 23 章', status: 'editing', active: true, content: '' },
    { id: 24, name: '第 24 章', status: 'blank', content: '' },
  ])

  const [activeChapterId, setActiveChapterId] = useState(23)
  const [content, setContent] = useState('')
  const [writingTaskId, setWritingTaskId] = useState<string | null>(null)
  const { tasks, queueTask } = useTask()

  const activeChapter = chapters.find(ch => ch.id === activeChapterId)
  const writingTask = tasks.find(t => t.id === writingTaskId)
  const isWriting = writingTask?.status === 'running' || writingTask?.status === 'pending'
  const progress = writingTask?.progress || 0

  const handleChapterSelect = (chapter: Chapter) => {
    // Save current chapter content
    setChapters(prev => prev.map(ch =>
      ch.id === activeChapterId ? { ...ch, content } : ch
    ))
    setActiveChapterId(chapter.id)
    setContent(chapter.content || '')
    setWritingTaskId(null)
  }

  const handleAIWrite = async () => {
    const taskId = await queueTask({
      type: 'cli',
      cmd: '/story-long-write'
    })
    setWritingTaskId(taskId)
  }

  const handleSaveDraft = () => {
    // Save current content
    setChapters(prev => prev.map(ch =>
      ch.id === activeChapterId ? { ...ch, content } : ch
    ))
    console.log('Draft saved')
  }

  const handleDeslop = async () => {
    if (!content.trim()) return

    // Queue deslop task
    await queueTask({
      type: 'script',
      script: 'story-deslop/scripts/normalize-punctuation.js',
      args: [content]
    })
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
              onClick={() => handleChapterSelect(ch)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                ch.id === activeChapterId
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
            <h2 className="font-semibold text-gray-800">{activeChapter?.name || '章节'}</h2>
            <p className="text-sm text-gray-400">字数：{content.length || 0} / 3,000</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDeslop}
              disabled={!content.trim() || isWriting}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 flex items-center gap-1 disabled:opacity-50"
            >
              <Sparkles size={14} /> 去AI味
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
          {isWriting && (
            <div className="flex items-center gap-3">
              <Wand2 size={16} className="text-blue-500 animate-pulse" />
              <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-500">AI 续写中... {Math.round(progress * 100)}%</span>
            </div>
          )}

          <div className="flex gap-2 ml-auto">
            <button
              onClick={handleSaveDraft}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg flex items-center gap-2 hover:bg-gray-200"
            >
              <Save size={16} /> 保存草稿
            </button>
            <button
              onClick={handleAIWrite}
              disabled={isWriting}
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