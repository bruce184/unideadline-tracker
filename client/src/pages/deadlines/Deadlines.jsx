import { useCallback, useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import { listDeadlines, updateDeadline } from '../../services/deadlineService'
import { listCourses } from '../../services/courseService'
import {
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  statusLabel,
  USER_STATUS_OPTIONS,
  priorityLabel,
} from '../../utils/deadlineUtils'
import { computeDeadlineRisk } from '../../utils/riskAnalysis'

const defaultFilters = {
  q: '',
  course_id: '',
  status: '',
  priority: '',
}

const monthNames = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

// Helper chuyển Date sang YYYY-MM-DD local
const getLocalDateKey = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Helper chuyển ISO due_date sang YYYY-MM-DD local
const getDeadlineDateKey = (dueDateStr) => {
  if (!dueDateStr) return ''
  try {
    const d = new Date(dueDateStr)
    return getLocalDateKey(d)
  } catch {
    return ''
  }
}

export default function Deadlines() {
  const [deadlines, setDeadlines] = useState([])
  const [courses, setCourses] = useState([])
  const [filters, setFilters] = useState(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusLoadingId, setStatusLoadingId] = useState('')

  // State cho bộ Lịch
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showDetailPanel, setShowDetailPanel] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const [deadlineRes, courseRes] = await Promise.all([
        // Gọi API tải tất cả deadline của user
        listDeadlines(appliedFilters),
        listCourses(),
      ])
      setDeadlines(deadlineRes.data || [])
      setCourses(courseRes.data || [])
    } catch (err) {
      setError(err?.message || 'Không thể tải danh sách deadline')
    } finally {
      setLoading(false)
    }
  }, [appliedFilters])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData()
    }, 0)
    return () => clearTimeout(timer)
  }, [fetchData])

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    setAppliedFilters(filters)
  }

  const resetFilters = () => {
    setFilters(defaultFilters)
    setAppliedFilters(defaultFilters)
  }

  const updateStatus = async (deadline, status) => {
    try {
      setStatusLoadingId(deadline.id)
      await updateDeadline(deadline.id, { status })
      await fetchData()
    } catch (err) {
      setError(err?.message || 'Không thể cập nhật trạng thái deadline')
    } finally {
      setStatusLoadingId('')
    }
  }

  // Helper functions moved outside component

  // Phân loại deadline theo YYYY-MM-DD
  const deadlinesByDate = useMemo(() => {
    const groups = {}
    deadlines.forEach((deadline) => {
      const key = getDeadlineDateKey(deadline.due_date)
      if (key) {
        if (!groups[key]) groups[key] = []
        groups[key].push(deadline)
      }
    })
    return groups
  }, [deadlines])

  // Tính toán lưới lịch tháng hiện tại
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // Ngày đầu tiên của tháng
    const firstDay = new Date(year, month, 1)
    const startDayOfWeek = firstDay.getDay() // 0: CN, 1: T2, ..., 6: T7
    // Monday là cột 0, Sunday là cột 6
    const startPadding = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1

    // Tổng số ngày của tháng hiện tại
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate()

    // Tổng số ngày của tháng trước
    const prevMonthYear = month === 0 ? year - 1 : year
    const prevMonth = month === 0 ? 11 : month - 1
    const totalDaysInPrevMonth = new Date(prevMonthYear, prevMonth + 1, 0).getDate()

    const dayList = []

    // Điền các ngày đệm của tháng trước
    for (let i = startPadding - 1; i >= 0; i--) {
      const dayNum = totalDaysInPrevMonth - i
      const date = new Date(prevMonthYear, prevMonth, dayNum)
      dayList.push({
        date,
        dayNumber: dayNum,
        isCurrentMonth: false,
        dateKey: getLocalDateKey(date),
        key: `prev-${dayNum}`,
      })
    }

    // Điền các ngày trong tháng hiện tại
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const date = new Date(year, month, i)
      dayList.push({
        date,
        dayNumber: i,
        isCurrentMonth: true,
        dateKey: getLocalDateKey(date),
        key: `curr-${i}`,
      })
    }

    // Điền các ngày đệm của tháng sau để tròn lưới 7 cột
    const remainingCells = (7 - (dayList.length % 7)) % 7
    const nextMonthYear = month === 11 ? year + 1 : year
    const nextMonth = month === 11 ? 0 : month + 1
    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(nextMonthYear, nextMonth, i)
      dayList.push({
        date,
        dayNumber: i,
        isCurrentMonth: false,
        dateKey: getLocalDateKey(date),
        key: `next-${i}`,
      })
    }

    return dayList
  }, [currentDate])

  // Điều hướng tháng
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  // Lấy các deadline cho ngày đang chọn
  const selectedDateKey = useMemo(() => getLocalDateKey(selectedDate), [selectedDate])
  const selectedDayDeadlines = useMemo(() => {
    return deadlinesByDate[selectedDateKey] || []
  }, [deadlinesByDate, selectedDateKey])

  // Format tiêu đề ngày của Detail Panel (Ví dụ: "Thứ Tư, 10/04")
  const formattedSelectedDateHeader = useMemo(() => {
    try {
      const dayName = new Intl.DateTimeFormat('vi-VN', { weekday: 'long' }).format(selectedDate)
      const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1)
      const day = String(selectedDate.getDate()).padStart(2, '0')
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
      return `${capitalizedDay}, ${day}/${month}`
    } catch {
      return ''
    }
  }, [selectedDate])

  // Helper lấy tên cổng nộp bài
  const getPortalName = (link) => {
    if (!link) return 'Hệ thống'
    try {
      const url = new URL(link)
      if (url.hostname.includes('moodle')) return 'Moodle'
      if (url.hostname.includes('canvas')) return 'Canvas'
      if (url.hostname.includes('classroom.google.com')) return 'Google Classroom'
      if (url.hostname.includes('teams.microsoft.com')) return 'MS Teams'
      let host = url.hostname.replace('www.', '')
      const parts = host.split('.')
      if (parts.length > 0) {
        return parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
      }
      return 'Link'
    } catch {
      return 'Link'
    }
  }

  // Format giờ nộp bài (Ví dụ: "23:59 PM")
  const formatTimeOnly = (dueDateStr) => {
    if (!dueDateStr) return ''
    try {
      const d = new Date(dueDateStr)
      return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(d)
    } catch {
      return ''
    }
  }

  // Sinh gợi ý AI động dựa trên rủi ro của danh sách deadline
  const aiSuggestionText = useMemo(() => {
    if (selectedDayDeadlines.length === 0) {
      return 'Hôm nay bạn không có deadline nào cần hoàn thành. Hãy tận dụng thời gian này để chuẩn bị trước các môn học khác hoặc nghỉ ngơi thư giãn!'
    }

    const active = selectedDayDeadlines.filter(d => d.status !== 'Submitted')
    if (active.length === 0) {
      return 'Tất cả các deadline trong ngày hôm nay đã được bạn hoàn thành xuất sắc! Tinh thần tự giác tuyệt vời!'
    }

    const highPriority = active.find(d => d.priority === 'High')
    const count = active.length

    if (highPriority) {
      const time = formatTimeOnly(highPriority.due_date)
      const portal = getPortalName(highPriority.submission_link)
      return `Bạn có ${count} deadline chưa hoàn thành hôm nay. Gợi ý ưu tiên hoàn thiện bài tập "${highPriority.title}" trước ${time} vì AI dự đoán bài tập này có độ ưu tiên Cao và hệ thống ${portal} có thể quá tải vào giờ cao điểm tối.`
    }

    const first = active[0]
    const time = formatTimeOnly(first.due_date)
    return `Bạn có ${count} deadline hôm nay. Hãy bắt đầu giải quyết bài tập "${first.title}" trước để đảm bảo tiến độ và tránh dồn việc vào sát giờ nộp (${time}).`
  }, [selectedDayDeadlines])

  return (
    <Layout>
      {/* Top Header và Bộ chuyển tháng */}
      <header className="flex flex-col gap-4 justify-between items-start md:items-center md:flex-row px-4 py-3 w-full bg-white rounded-2xl border border-[#e9e2fb] mb-6 shadow-[0_14px_40px_rgba(91,69,170,0.03)]">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-xl font-bold text-slate-900">Lịch deadline</h2>
          <div className="flex items-center bg-[#f0ecf6] rounded-full px-3 py-1 border border-outline-variant/30">
            <button 
              onClick={handlePrevMonth} 
              className="p-1 hover:text-[#3b309e] transition-colors rounded-full hover:bg-white/50"
              title="Tháng trước"
            >
              <span className="material-symbols-outlined text-[20px] block" data-icon="chevron_left">chevron_left</span>
            </button>
            <span className="px-3 font-semibold text-sm text-slate-800 min-w-[120px] text-center">
              {monthNames[currentDate.getMonth()]}, {currentDate.getFullYear()}
            </span>
            <button 
              onClick={handleNextMonth} 
              className="p-1 hover:text-[#3b309e] transition-colors rounded-full hover:bg-white/50"
              title="Tháng sau"
            >
              <span className="material-symbols-outlined text-[20px] block" data-icon="chevron_right">chevron_right</span>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-1 rounded-xl px-4 py-2 text-sm font-semibold border transition-all ${
              showFilters 
                ? 'bg-[#3b309e] text-white border-[#3b309e]' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">filter_alt</span>
            Bộ lọc
          </button>
          <Link 
            to="/deadlines/new" 
            className="flex-1 md:flex-initial bg-[#3b309e] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#2e2482] transition-all flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Thêm Deadline
          </Link>
        </div>
      </header>

      {/* Form bộ lọc tìm kiếm collapsible */}
      {showFilters && (
        <form onSubmit={handleSearchSubmit} className="mb-6 rounded-2xl border border-[#e9e2fb] bg-white p-4 shadow-[0_14px_40px_rgba(91,69,170,0.07)] animate-in fade-in duration-200">
          <div className="grid gap-3 md:grid-cols-[1.3fr_1fr_1fr_1fr_auto]">
            <input
              value={filters.q}
              onChange={(event) => setFilters({ ...filters, q: event.target.value })}
              className="rounded-lg border border-[#e5def8] bg-[#fbfaff] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6] focus:ring-2 focus:ring-[#eee8ff]"
              placeholder="Tìm theo tiêu đề hoặc mô tả"
            />
            <select
              value={filters.course_id}
              onChange={(event) => setFilters({ ...filters, course_id: event.target.value })}
              className="rounded-lg border border-[#e5def8] bg-[#fbfaff] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6] focus:ring-2 focus:ring-[#eee8ff]"
            >
              <option value="">Tất cả môn học</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.course_name}</option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={(event) => setFilters({ ...filters, status: event.target.value })}
              className="rounded-lg border border-[#e5def8] bg-[#fbfaff] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6] focus:ring-2 focus:ring-[#eee8ff]"
            >
              <option value="">Tất cả trạng thái</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{statusLabel(status)}</option>
              ))}
            </select>
            <select
              value={filters.priority}
              onChange={(event) => setFilters({ ...filters, priority: event.target.value })}
              className="rounded-lg border border-[#e5def8] bg-[#fbfaff] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6] focus:ring-2 focus:ring-[#eee8ff]"
            >
              <option value="">Tất cả ưu tiên</option>
              {PRIORITY_OPTIONS.map((priority) => (
                <option key={priority} value={priority}>{priorityLabel(priority)}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-lg bg-[#3b309e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2e2482] transition"
              >
                Tìm
              </button>
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-lg bg-[#f0ebff] px-4 py-2 text-sm font-semibold text-[#5140b6] hover:bg-[#e8e0ff] transition"
              >
                Xóa lọc
              </button>
            </div>
          </div>
        </form>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
          <button onClick={fetchData} className="mt-2 font-semibold text-red-800 hover:underline">
            Thử lại
          </button>
        </div>
      )}

      {/* Vùng Lưới Lịch và Bảng Chi Tiết */}
      <div className="flex flex-col xl:flex-row gap-6 items-start relative min-h-[650px]">
        {/* Lưới Lịch Tháng */}
        <div className="flex-1 w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Days Header */}
          <div className="calendar-grid border-b border-slate-200 bg-slate-50">
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
              <div key={day} className="p-3 text-center text-xs font-bold text-slate-500 uppercase">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="calendar-grid min-h-[500px]">
            {loading ? (
              <div className="col-span-7 p-12 text-center text-slate-400">
                Đang tải lịch deadline...
              </div>
            ) : (
              monthDays.map(({ date, dayNumber, isCurrentMonth, dateKey, key }) => {
                const dayDeadlines = deadlinesByDate[dateKey] || []
                const isSelected = getLocalDateKey(selectedDate) === dateKey
                const isToday = getLocalDateKey(new Date()) === dateKey

                return (
                  <div
                    key={key}
                    onClick={() => {
                      setSelectedDate(date)
                      setShowDetailPanel(true)
                    }}
                    className={`min-h-[90px] p-2 border-r border-b border-slate-100 cursor-pointer transition-all hover:bg-slate-50 flex flex-col justify-between ${
                      isCurrentMonth ? 'text-slate-800' : 'text-slate-400/40 bg-slate-50/50'
                    } ${
                      isSelected 
                        ? 'bg-[#3b309e]/5 ring-1 ring-inset ring-[#3b309e] z-10' 
                        : ''
                    } ${isToday ? 'font-bold' : ''}`}
                  >
                    {/* Số ngày */}
                    <div className="flex justify-between items-center">
                      {isToday && (
                        <span className="bg-[#3b309e] text-white text-[10px] px-1.5 py-0.5 rounded-full">
                          Hôm nay
                        </span>
                      )}
                      <span className={`text-xs ml-auto ${isSelected ? 'text-[#3b309e] font-bold' : ''}`}>
                        {dayNumber}
                      </span>
                    </div>

                    {/* Danh sách các badge deadline rơi vào ngày này */}
                    <div className="mt-1 space-y-1 overflow-hidden">
                      {dayDeadlines.slice(0, 3).map((deadline) => {
                        let badgeBg = 'bg-amber-500/10 text-amber-800'
                        let dotBg = 'bg-amber-500'

                        if (deadline.status === 'Submitted') {
                          badgeBg = 'bg-emerald-500/10 text-emerald-800'
                          dotBg = 'bg-emerald-500'
                        } else if (deadline.priority === 'High') {
                          badgeBg = 'bg-red-500/10 text-red-800'
                          dotBg = 'bg-red-500'
                        } else if (deadline.priority === 'Low') {
                          badgeBg = 'bg-teal-500/10 text-teal-800'
                          dotBg = 'bg-teal-500'
                        }

                        return (
                          <div
                            key={deadline.id}
                            className={`flex items-center gap-1 p-[2px] rounded text-[10px] truncate px-1.5 ${badgeBg} ${
                              deadline.status === 'Submitted' ? 'line-through opacity-70' : ''
                            }`}
                            title={deadline.title}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotBg}`}></span>
                            <span className="truncate">{deadline.title}</span>
                          </div>
                        )
                      })}
                      {dayDeadlines.length > 3 && (
                        <div className="text-[9px] text-[#3b309e] text-right font-semibold">
                          +{dayDeadlines.length - 3} thêm
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Backdrop cho mobile khi detail panel hiển thị */}
        {showDetailPanel && (
          <div 
            className="fixed inset-0 z-30 bg-black/30 backdrop-blur-xs xl:hidden"
            onClick={() => setShowDetailPanel(false)}
          />
        )}

        {/* Bảng Chi Tiết Bên Phải (Detail Panel) */}
        <aside 
          className={`w-[320px] bg-white border border-slate-200 rounded-2xl p-5 overflow-y-auto max-h-[600px] xl:sticky xl:top-[80px] z-40 transition-all duration-300 ${
            showDetailPanel ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none xl:hidden'
          } fixed inset-y-4 right-4 shadow-2xl xl:static xl:shadow-none xl:translate-x-0 xl:opacity-100 xl:pointer-events-auto`}
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-lg text-slate-900">{formattedSelectedDateHeader}</h3>
              <p className="text-xs text-slate-500">
                {selectedDayDeadlines.length} Deadline {selectedDayDeadlines.length > 0 ? 'chính' : ''}
              </p>
            </div>
            <button 
              onClick={() => setShowDetailPanel(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              title="Đóng bảng"
            >
              <span className="material-symbols-outlined block" data-icon="close">close</span>
            </button>
          </div>

          <div className="space-y-6">
            {selectedDayDeadlines.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                <span className="material-symbols-outlined text-[36px] mb-2 block text-slate-300">event_available</span>
                Không có deadline nào trong ngày này.
              </div>
            ) : (
              selectedDayDeadlines.map((deadline) => {
                const risk = computeDeadlineRisk(deadline)
                const isUrgent = risk.score >= 70
                const isMedium = risk.score >= 40 && risk.score < 70
                
                let riskText = 'Thấp'
                let riskColor = 'text-teal-600'
                let riskBarColor = 'bg-teal-500'
                
                if (deadline.status === 'Submitted') {
                  riskText = 'Đã hoàn thành'
                  riskColor = 'text-emerald-600 font-semibold'
                  riskBarColor = 'bg-emerald-500'
                } else if (isUrgent) {
                  riskText = `Cao (${risk.score}%)`
                  riskColor = 'text-red-600 font-bold'
                  riskBarColor = 'bg-red-500'
                } else if (isMedium) {
                  riskText = `Trung bình (${risk.score}%)`
                  riskColor = 'text-amber-600 font-semibold'
                  riskBarColor = 'bg-amber-500'
                }

                return (
                  <div key={deadline.id} className="group relative border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        deadline.status === 'Submitted'
                          ? 'bg-emerald-50 text-emerald-700'
                          : deadline.priority === 'High'
                          ? 'bg-red-50 text-red-700'
                          : deadline.priority === 'Low'
                          ? 'bg-teal-50 text-teal-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {deadline.status === 'Submitted' ? 'Hoàn thành' : priorityLabel(deadline.priority)}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">
                        {getPortalName(deadline.submission_link)}
                      </span>
                    </div>

                    <Link 
                      to={`/deadlines/${deadline.id}`} 
                      className="font-bold text-slate-900 hover:text-[#3b309e] transition-colors leading-snug block mb-1"
                    >
                      {deadline.title}
                    </Link>

                    <div className="flex justify-between text-xs text-slate-500 mb-3">
                      <span>Môn: {deadline.course?.course_code || 'Chưa gán'}</span>
                      <span className="font-semibold text-slate-700">
                        {formatTimeOnly(deadline.due_date)}
                      </span>
                    </div>

                    {/* Risk progress bar */}
                    <div className="mb-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] text-slate-500">Rủi ro trễ hạn:</span>
                        <span className={`text-[11px] ${riskColor}`}>{riskText}</span>
                      </div>
                      <div className="risk-bar-track">
                        <div 
                          className={`risk-bar-fill ${riskBarColor}`}
                          style={{ width: `${deadline.status === 'Submitted' ? 100 : risk.score}%` }}
                        ></div>
                        {deadline.status !== 'Submitted' && (
                          <div className="ai-marker left-[70%]" title="Ranh giới Rủi ro Cao"></div>
                        )}
                      </div>
                    </div>

                    {/* Các nút hành động nhanh */}
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400">Trạng thái:</span>
                        <select
                          value={deadline.status === 'Overdue' ? 'Not Started' : deadline.status}
                          onChange={(event) => updateStatus(deadline, event.target.value)}
                          disabled={statusLoadingId === deadline.id}
                          className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] font-semibold text-slate-700 outline-none focus:border-[#6b5bd6] disabled:opacity-50"
                        >
                          {USER_STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>{statusLabel(status)}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        {deadline.submission_link && (
                          <a
                            href={deadline.submission_link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-semibold text-[#3b309e] hover:underline"
                            title="Mở link nộp bài"
                          >
                            Mở Link
                          </a>
                        )}
                        <Link
                          to={`/deadlines/${deadline.id}/edit`}
                          className="text-xs font-semibold text-slate-500 hover:text-slate-700 hover:underline"
                        >
                          Sửa
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })
            )}

            {/* AI Suggestion Box */}
            <div className="mt-6 p-4 bg-[#f0ecf6] rounded-xl border border-[#3b309e]/15">
              <div className="flex items-center gap-1.5 mb-2 text-[#3b309e]">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <span className="text-xs font-bold uppercase tracking-wide">AI Gợi ý</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {aiSuggestionText}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </Layout>
  )
}
