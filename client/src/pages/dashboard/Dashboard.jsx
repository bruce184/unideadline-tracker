import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import { getWeeklyDashboard } from '../../services/dashboardService'
import {
  formatDateTime,
  getEffectiveStatus,
  getMonday,
  priorityBarClass,
  priorityClass,
  priorityLabel,
  statusClass,
  statusLabel,
  statusTextClass,
  toDateInputValue,
} from '../../utils/deadlineUtils'

const summaryCards = [
  { key: 'total', label: 'Tổng deadline' },
  { key: 'in_progress', label: 'Đang làm' },
  { key: 'overdue', label: 'Quá hạn' },
  { key: 'high_priority', label: 'Ưu tiên cao' },
]

function deadlineProgress(deadline) {
  const status = getEffectiveStatus(deadline)
  if (status === 'Submitted') return 100
  if (status === 'In Progress') return 62
  if (status === 'Overdue') return 92
  return 28
}

export default function Dashboard() {
  const [weekStart, setWeekStart] = useState(toDateInputValue(getMonday()))
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const { data } = await getWeeklyDashboard({ week_start: weekStart })
      setDashboard(data)
    } catch (err) {
      setError(err?.message || 'Không thể tải dashboard tuần')
    } finally {
      setLoading(false)
    }
  }, [weekStart])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDashboard()
    }, 0)

    return () => clearTimeout(timer)
  }, [fetchDashboard])

  const deadlines = dashboard?.deadlines || []
  const nextDeadline = deadlines.find((deadline) => getEffectiveStatus(deadline) !== 'Submitted')

  return (
    <Layout>
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#6b5bd6]">UniDeadline Tracker</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Tuần này</h1>
          <p className="mt-2 text-sm text-slate-500">
            {dashboard ? `${dashboard.week_start} - ${dashboard.week_end}` : 'Theo dõi workload và deadline sắp tới'}
          </p>
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-[#e9e2fb] bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center">
          <label className="text-sm font-medium text-slate-600" htmlFor="week-start">
            Tuần bắt đầu
          </label>
          <input
            id="week-start"
            type="date"
            value={weekStart}
            onChange={(event) => setWeekStart(event.target.value)}
            className="rounded-lg border border-[#e5def8] bg-[#fbfaff] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6] focus:ring-2 focus:ring-[#eee8ff]"
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
          <button onClick={fetchDashboard} className="mt-2 font-semibold text-red-800 hover:underline">
            Thử lại
          </button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-2xl border border-[#e9e2fb] bg-white p-4 shadow-[0_14px_40px_rgba(91,69,170,0.07)] sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <div key={card.key} className="rounded-xl border border-[#eee8ff] bg-[#fbfaff] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{card.label}</p>
                <p className="mt-3 text-3xl font-bold text-slate-950">
                  {loading ? '-' : dashboard?.summary?.[card.key] ?? 0}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl bg-[#f1edff] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#5140b6]">AI insight & khuyến nghị</p>
                <p className="mt-1 text-sm text-slate-600">
                  Ưu tiên deadline mức cao và các bài quá hạn trước khi thêm việc mới.
                </p>
              </div>
              <Link
                to="/deadlines"
                className="rounded-lg bg-[#5b45d8] px-4 py-2 text-center text-sm font-semibold text-white hover:bg-[#4933c5]"
              >
                Xem deadline
              </Link>
            </div>
          </div>
        </section>

        <aside className="rounded-2xl border border-[#e9e2fb] bg-white p-5 shadow-[0_14px_40px_rgba(91,69,170,0.07)]">
          <p className="text-sm font-semibold text-slate-900">Deadline tiếp theo</p>
          {nextDeadline ? (
            <div className="mt-4">
              <p className="font-semibold text-slate-950">{nextDeadline.title}</p>
              <p className="mt-1 text-sm text-slate-500">{formatDateTime(nextDeadline.due_date)}</p>
              <div className="mt-4 h-2 rounded-full bg-[#eee8ff]">
                <div
                  className={`h-full rounded-full ${priorityBarClass(nextDeadline.priority)}`}
                  style={{ width: `${deadlineProgress(nextDeadline)}%` }}
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(getEffectiveStatus(nextDeadline))}`}>
                  {statusLabel(getEffectiveStatus(nextDeadline))}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityClass(nextDeadline.priority)}`}>
                  {priorityLabel(nextDeadline.priority)}
                </span>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">Không có deadline cần xử lý.</p>
          )}
        </aside>
      </div>

      <section className="mt-6 rounded-2xl border border-[#e9e2fb] bg-white p-4 shadow-[0_14px_40px_rgba(91,69,170,0.07)] sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-950">Nhiệm vụ trong tuần</h2>
            <p className="text-sm text-slate-500">Sắp xếp theo hạn nộp gần nhất.</p>
          </div>
          <Link
            to="/deadlines/new"
            className="rounded-lg bg-[#5b45d8] px-4 py-2 text-center text-sm font-semibold text-white hover:bg-[#4933c5]"
          >
            Thêm deadline
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400">Đang tải...</div>
        ) : deadlines.length === 0 ? (
          <div className="p-8 text-center text-slate-400">Không có deadline trong tuần này.</div>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {deadlines.map((deadline) => {
              const effectiveStatus = getEffectiveStatus(deadline)
              const progress = deadlineProgress(deadline)

              return (
                <Link
                  key={deadline.id}
                  to={`/deadlines/${deadline.id}`}
                  className="rounded-xl border border-[#eee8ff] bg-[#fbfaff] p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-950">{deadline.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {deadline.course?.course_name || 'Chưa có môn học'}
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityClass(deadline.priority)}`}>
                      {priorityLabel(deadline.priority)}
                    </span>
                  </div>
                  <div className="mt-4 h-1.5 rounded-full bg-[#eee8ff]">
                    <div className={`h-full rounded-full ${priorityBarClass(deadline.priority)}`} style={{ width: `${progress}%` }} />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
                    <span>{formatDateTime(deadline.due_date)}</span>
                    <span className={`font-semibold ${statusTextClass(effectiveStatus)}`}>
                      {statusLabel(effectiveStatus)}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </Layout>
  )
}
