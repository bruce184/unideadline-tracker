import { useCallback, useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import { listDeadlines, updateDeadline } from '../../services/deadlineService'
import {
  formatDateTime,
  getEffectiveStatus,
} from '../../utils/deadlineUtils'
import { computeDeadlineRisk } from '../../utils/riskAnalysis'

export default function Tasks() {
  const [deadlines, setDeadlines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusLoadingId, setStatusLoadingId] = useState('')

  // State quản lý tab bộ lọc
  const [activeTab, setActiveTab] = useState('all') // 'all', 'todo', 'doing', 'done'
  const [selectedDeadline, setSelectedDeadline] = useState(null)
  const [showDetailPanel, setShowDetailPanel] = useState(true)

  // State chỉnh sửa ghi chú cá nhân (description)
  const [notes, setNotes] = useState('')
  const [isSavingNotes, setIsSavingNotes] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const res = await listDeadlines()
      const list = res.data || []
      setDeadlines(list)
      
      // Khởi tạo/cập nhật item được chọn trong Detail Panel
      if (list.length > 0) {
        setSelectedDeadline(current => {
          if (current) {
            const updated = list.find(d => d.id === current.id)
            if (updated) {
              setNotes(updated.description || '')
              return updated
            }
          }
          setNotes(list[0].description || '')
          return list[0]
        })
      }
    } catch (err) {
      setError(err?.message || 'Không thể tải danh sách nhiệm vụ')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData()
    }, 0)
    return () => clearTimeout(timer)
  }, [fetchData])

  // Lọc danh sách theo tab
  const filteredDeadlines = useMemo(() => {
    return deadlines.filter(deadline => {
      const status = getEffectiveStatus(deadline)
      if (activeTab === 'todo') return status === 'Not Started'
      if (activeTab === 'doing') return status === 'In Progress'
      if (activeTab === 'done') return status === 'Submitted'
      return true // 'all'
    })
  }, [deadlines, activeTab])

  // Cập nhật trạng thái nộp bài nhanh
  const toggleCompleted = async (deadline) => {
    const isSubmitted = deadline.status === 'Submitted'
    const newStatus = isSubmitted ? 'In Progress' : 'Submitted'
    try {
      setStatusLoadingId(deadline.id)
      await updateDeadline(deadline.id, { status: newStatus })
      await fetchData()
    } catch (err) {
      setError(err?.message || 'Không thể cập nhật trạng thái')
    } finally {
      setStatusLoadingId('')
    }
  }

  // Lưu ghi chú cá nhân (description)
  const handleSaveNotes = async () => {
    if (!selectedDeadline) return
    try {
      setIsSavingNotes(true)
      await updateDeadline(selectedDeadline.id, { description: notes })
      await fetchData()
    } catch (err) {
      setError(err?.message || 'Không thể lưu ghi chú')
    } finally {
      setIsSavingNotes(false)
    }
  }

  // Chọn nhiệm vụ hiển thị chi tiết
  const handleSelectDeadline = (deadline) => {
    setSelectedDeadline(deadline)
    setNotes(deadline.description || '')
    setShowDetailPanel(true)
  }

  // Định dạng ngày hiển thị đơn giản (DD/MM/YYYY)
  const formatDateSimple = (dateStr) => {
    if (!dateStr) return 'Chưa rõ'
    try {
      const d = new Date(dateStr)
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const year = d.getFullYear()
      return `${day}/${month}/${year}`
    } catch {
      return 'Chưa rõ'
    }
  }

  // Thanh tiến độ tiến trình (hoàn thành)
  const getProgressPercent = (status) => {
    if (status === 'Submitted') return 100
    if (status === 'In Progress') return 65
    if (status === 'Overdue') return 92
    return 28
  }

  return (
    <Layout>
      {/* Header */}
      <header className="flex justify-between items-center px-4 py-3 w-full bg-white rounded-2xl border border-[#e9e2fb] mb-6 shadow-[0_14px_40px_rgba(91,69,170,0.03)]">
        <h2 className="text-xl font-bold text-slate-900">Nhiệm vụ</h2>
        <div className="flex items-center gap-2">
          <Link 
            to="/deadlines/new" 
            className="bg-[#3b309e] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#2e2482] transition-all flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Thêm Deadline
          </Link>
        </div>
      </header>

      {error && (
        <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
          <button onClick={fetchData} className="mt-2 font-semibold text-red-800 hover:underline">
            Thử lại
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col xl:flex-row gap-6 items-start relative min-h-[600px]">
        {/* Task List View */}
        <div className="flex-1 w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5">
          {/* Tabs Filter */}
          <div className="flex border-b border-slate-100 mb-6 gap-6">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'todo', label: 'Chưa làm' },
              { id: 'doing', label: 'Đang làm' },
              { id: 'done', label: 'Hoàn thành' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-sm font-semibold relative transition-colors cursor-pointer ${
                  activeTab === tab.id 
                    ? 'text-[#3b309e] border-b-2 border-[#3b309e]' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* List items */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                Đang tải danh sách nhiệm vụ...
              </div>
            ) : filteredDeadlines.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                Không tìm thấy nhiệm vụ nào trong danh mục này.
              </div>
            ) : (
              filteredDeadlines.map((deadline) => {
                const isSelected = selectedDeadline?.id === deadline.id
                const isSubmitted = deadline.status === 'Submitted'
                const risk = computeDeadlineRisk(deadline)

                // Tính badge màu theo rủi ro/trạng thái
                let badgeClass = 'bg-amber-500/10 text-amber-800'
                let badgeLabel = 'Sắp tới'

                if (isSubmitted) {
                  badgeClass = 'bg-slate-100 text-slate-500'
                  badgeLabel = 'Đã xong'
                } else if (risk.score >= 70) {
                  badgeClass = 'bg-red-500/10 text-red-800'
                  badgeLabel = 'Khẩn cấp'
                } else if (risk.score < 30) {
                  badgeClass = 'bg-teal-500/10 text-teal-800'
                  badgeLabel = 'Ổn định'
                }

                return (
                  <div
                    key={deadline.id}
                    onClick={() => handleSelectDeadline(deadline)}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer hover:bg-slate-50/50 ${
                      isSelected 
                        ? 'border-[#3b309e] bg-[#3b309e]/5' 
                        : 'border-slate-100 bg-[#fbfaff]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Checkbox tròn */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleCompleted(deadline)
                        }}
                        disabled={statusLoadingId === deadline.id}
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition ${
                          isSubmitted
                            ? 'bg-[#3b309e] border-[#3b309e] text-white'
                            : 'border-slate-300 hover:border-[#3b309e] bg-white'
                        }`}
                      >
                        {isSubmitted && (
                          <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                        )}
                      </button>

                      {/* Thông tin nhiệm vụ */}
                      <div className="min-w-0">
                        <h4 className={`font-bold text-sm text-slate-900 truncate ${isSubmitted ? 'line-through text-slate-400' : ''}`}>
                          {deadline.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          <span className="text-[#3b309e] font-semibold">
                            {deadline.course?.course_name || 'Chưa gán môn'}
                          </span>
                          {' — '}
                          Hạn: {formatDateTime(deadline.due_date)}
                        </p>
                      </div>
                    </div>

                    {/* Badge độ ưu tiên/trạng thái */}
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${badgeClass}`}>
                      {badgeLabel}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Mobile Detail Panel Backdrop */}
        {showDetailPanel && selectedDeadline && (
          <div 
            className="fixed inset-0 z-30 bg-black/30 backdrop-blur-xs xl:hidden"
            onClick={() => setShowDetailPanel(false)}
          />
        )}

        {/* Detail Panel bên phải */}
        {selectedDeadline && (
          <aside 
            className={`w-[320px] bg-white border border-slate-200 rounded-2xl p-5 overflow-y-auto max-h-[600px] xl:sticky xl:top-[80px] z-40 transition-all duration-300 ${
              showDetailPanel ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none xl:hidden'
            } fixed inset-y-4 right-4 shadow-2xl xl:static xl:shadow-none xl:translate-x-0 xl:opacity-100 xl:pointer-events-auto`}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-bold text-lg text-slate-900">{selectedDeadline.title}</h3>
                <p className="text-xs text-[#3b309e] font-semibold mt-1">
                  Học phần: {selectedDeadline.course?.course_name || 'Chưa gán môn'}
                </p>
              </div>
              <button 
                onClick={() => setShowDetailPanel(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <span className="material-symbols-outlined block">close</span>
              </button>
            </div>

            <div className="space-y-6">
              {/* Tiến độ hoàn thành */}
              <div>
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="text-slate-500 font-semibold">Tiến độ thực hiện:</span>
                  <span className="text-[#3b309e] font-bold">
                    {getProgressPercent(selectedDeadline.status)}%
                  </span>
                </div>
                <div className="risk-bar-track">
                  <div 
                    className="risk-bar-fill bg-[#3b309e]"
                    style={{ width: `${getProgressPercent(selectedDeadline.status)}%` }}
                  ></div>
                  {selectedDeadline.status !== 'Submitted' && (
                    <div className="ai-marker left-[65%]" title="Mục tiêu hoàn thành"></div>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px] font-bold text-[#3b309e]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  AI dự báo hoàn thành vào tuần này.
                </p>
              </div>

              {/* Grid ngày bắt đầu và hết hạn */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-100 bg-[#fbfaff] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Ngày bắt đầu</p>
                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {formatDateSimple(selectedDeadline.created_at)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-[#fbfaff] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-red-400">Ngày hết hạn</p>
                  <p className="mt-1 text-sm font-bold text-red-600">
                    {formatDateSimple(selectedDeadline.due_date)}
                  </p>
                </div>
              </div>

              {/* Textarea Ghi chú cá nhân */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5" htmlFor="personal-notes">
                  Ghi chú cá nhân
                </label>
                <textarea
                  id="personal-notes"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Thêm ghi chú, tài liệu tham khảo hoặc link drive..."
                  className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-[#6b5bd6] focus:bg-white resize-none"
                />
                <button
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes || notes === (selectedDeadline.description || '')}
                  className="mt-2 w-full bg-slate-900 text-white rounded-lg py-1.5 text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 transition"
                >
                  {isSavingNotes ? 'Đang lưu...' : 'Lưu ghi chú'}
                </button>
              </div>

              {/* Nút hành động */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => toggleCompleted(selectedDeadline)}
                  disabled={statusLoadingId === selectedDeadline.id}
                  className="w-full bg-[#3b309e] text-white rounded-xl py-2.5 text-sm font-bold hover:bg-[#2e2482] transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {selectedDeadline.status === 'Submitted' ? 'check_box_outline_blank' : 'check_box'}
                  </span>
                  {selectedDeadline.status === 'Submitted' ? 'Hủy hoàn thành' : 'Đánh dấu hoàn thành'}
                </button>
                <div className="flex gap-2">
                  {selectedDeadline.submission_link && (
                    <a
                      href={selectedDeadline.submission_link}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 text-center bg-slate-100 text-slate-700 rounded-xl py-2 text-xs font-semibold hover:bg-slate-200 transition"
                    >
                      Mở link nộp bài
                    </a>
                  )}
                  <Link
                    to={`/deadlines/${selectedDeadline.id}/edit`}
                    className="flex-1 text-center border border-slate-200 text-slate-600 rounded-xl py-2 text-xs font-semibold hover:bg-slate-50 transition"
                  >
                    Sửa thông tin
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </Layout>
  )
}
