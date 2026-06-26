import { BookOpen, Upload, FileText } from 'lucide-react'

function Deconstruct() {
  return (
    <div className="h-full overflow-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">拆文</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="text-center py-12">
          <BookOpen size={64} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">拆文库</h2>
          <p className="text-gray-400 mb-6">深度拆解爆款小说的黄金三章、人设架构、爽点设计</p>

          <div className="flex justify-center gap-4">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-xl flex items-center gap-2 hover:bg-blue-700">
              <Upload size={18} /> 导入新书
            </button>
            <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl flex items-center gap-2 hover:bg-gray-200">
              <FileText size={18} /> 查看报告
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Deconstruct