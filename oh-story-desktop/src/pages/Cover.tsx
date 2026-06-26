import { Image, Download, Settings } from 'lucide-react'

function Cover() {
  return (
    <div className="h-full overflow-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">封面</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="text-center py-12">
          <Image size={64} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">封面生成</h2>
          <p className="text-gray-400 mb-6">支持起点、番茄、晋江等平台尺寸</p>

          <div className="flex justify-center gap-4">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-xl flex items-center gap-2 hover:bg-blue-700">
              <Image size={18} /> 生成封面
            </button>
            <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl flex items-center gap-2 hover:bg-gray-200">
              <Settings size={18} /> 设置尺寸
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cover