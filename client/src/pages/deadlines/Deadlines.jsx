import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import { api } from '../../services/api'
import {
  buildQuery,
  formatDateTime,
  getEffectiveStatus,
  PRIORITY_OPTIONS,
  priorityBarClass,
  priorityClass,
  priorityLabel,
  STATUS_OPTIONS,
  statusClass,
  statusLabel,
  USER_STATUS_OPTIONS,
} from '../../utils/deadlineUtils'

const defaultFilters = {
  q: '',
  course_id: '',
  status: '',
  priority: '',
}

function progressFor(deadline) {
  const status = getEffectiveStatus(deadline)
  if (status === 'Submitted') return 100
  if (status === 'Overdue') return 88
  if (status === 'In Progress') return 58
  return 24
}

export default function Deadlines() {
  const [deadlines, setDeadlines] = useState([])
  const [courses, setCourses] = useState([])
  const [filters, setFilters] = useState(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusLoadingId, setStatusLoadingId] = useState('')

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const [deadlineData, courseData] = await Promise.all([
        api.get(`/deadlines${buildQuery(appliedFilters)}`),
        api.get('/courses'),
      ])
      setDeadlines(deadlineData || [])
      setCourses(courseData || [])
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
      await api.patch(`/deadlines/${deadline.id}`, { status })
      await fetchData()
    } catch (err) {
      setError(err?.message || 'Không thể cập nhật trạng thái deadline')
    } finally {
      setStatusLoadingId('')
    }
  }

  return (
    <Layout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#6b5bd6]">UniDeadline Tracker</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Deadline</h1>
          <p className="mt-2 text-sm text-slate-500">Tìm, lọc và cập nhật trạng thái nộp bài.</p>
        </div>
        <Link
          to="/deadlines/new"
          className="rounded-lg bg-[#5b45d8] px-4 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-[#4933c5]"
        >
          Thêm deadline
        </Link>
      </div>

      <form onSubmit={handleSearchSubmit} className="mb-6 rounded-2xl border border-[#e9e2fb] bg-white p-4 shadow-[0_14px_40px_rgba(91,69,170,0.07)]">
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
              className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Tìm
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-lg bg-[#f0ebff] px-4 py-2 text-sm font-semibold text-[#5140b6] hover:bg-[#e8e0ff]"
            >
              Xóa lọc
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
          <button onClick={fetchData} className="mt-2 font-semibold text-red-800 hover:underline">
            Thử lại
          </button>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-[#e9e2fb] bg-white p-8 text-center text-slate-400">
          Đang tải...
        </div>
      ) : deadlines.length === 0 ? (
        <div className="rounded-2xl border border-[#e9e2fb] bg-white p-8 text-center">
          <p className="text-slate-500">Không tìm thấy deadline nào.</p>
          <Link to="/deadlines/new" className="mt-3 inline-block text-sm font-semibold text-[#5140b6] hover:underline">
            Thêm deadline đầu tiên
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {deadlines.map((deadline) => {
            const effectiveStatus = getEffectiveStatus(deadline)
            const progress = progressFor(deadline)

            return (
              <article key={deadline.id} className="rounded-2xl border border-[#e9e2fb] bg-white p-5 shadow-[0_14px_40px_rgba(91,69,170,0.07)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <Link to={`/deadlines/${deadline.id}`} className="font-semibold text-slate-950 hover:text-[#5140b6]">
                      {deadline.title}
                    </Link>
                    <p className="mt-1 text-sm text-slate-500">
                      {deadline.course?.course_name || 'Chưa có môn học'} - {formatDateTime(deadline.due_date)}
                    </p>
                    {deadline.description && (
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{deadline.description}</p>
                    )}
                    {deadline.submission_link && (
                      <a
                        href={deadline.submission_link}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-block text-sm font-semibold text-[#5140b6] hover:underline"
                      >
                        Mở link nộp bài
                      </a>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row lg:items-center">
                    <select
                      value={deadline.status === 'Overdue' ? 'Not Started' : deadline.status}
                      onChange={(event) => updateStatus(deadline, event.target.value)}
                      disabled={statusLoadingId === deadline.id}
                      className="rounded-lg border border-[#e5def8] bg-[#fbfaff] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6] focus:ring-2 focus:ring-[#eee8ff] disabled:opacity-50"
                    >
                      {USER_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>{statusLabel(status)}</option>
                      ))}
                    </select>
                    <Link
                      to={`/deadlines/${deadline.id}/edit`}
                      className="rounded-lg bg-[#f0ebff] px-3 py-2 text-center text-sm font-semibold text-[#5140b6] hover:bg-[#e8e0ff]"
                    >
                      Sửa
                    </Link>
                  </div>
                </div>

                <div className="mt-5 h-1.5 rounded-full bg-[#eee8ff]">
                  <div className={`h-full rounded-full ${priorityBarClass(deadline.priority)}`} style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(effectiveStatus)}`}>
                    {statusLabel(effectiveStatus)}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityClass(deadline.priority)}`}>
                    {priorityLabel(deadline.priority)}
                  </span>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </Layout>
  )
}
