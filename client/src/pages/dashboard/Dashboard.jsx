import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import { api } from '../../services/api'
import {
  formatDateTime,
  getEffectiveStatus,
  getMonday,
  priorityClass,
  statusClass,
  toDateInputValue,
} from '../../utils/deadlineUtils'

const summaryCards = [
  { key: 'total', label: 'Total' },
  { key: 'not_started', label: 'Not started' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'high_priority', label: 'High priority' },
]

export default function Dashboard() {
  const [weekStart, setWeekStart] = useState(toDateInputValue(getMonday()))
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const data = await api.get(`/dashboard/weekly?week_start=${weekStart}`)
      setDashboard(data)
    } catch (err) {
      setError(err?.message || 'Could not load weekly dashboard')
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

  return (
    <Layout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Weekly dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            {dashboard ? `${dashboard.week_start} to ${dashboard.week_end}` : 'Track this week workload'}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="text-sm font-medium text-slate-700" htmlFor="week-start">
            Week start
          </label>
          <input
            id="week-start"
            type="date"
            value={weekStart}
            onChange={(event) => setWeekStart(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
          <button onClick={fetchDashboard} className="mt-2 font-semibold text-red-800 hover:underline">
            Try again
          </button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {summaryCards.map((card) => (
          <div key={card.key} className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {loading ? '-' : dashboard?.summary?.[card.key] ?? 0}
            </p>
          </div>
        ))}
      </div>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">This week deadlines</h2>
            <p className="text-sm text-slate-500">Near due, overdue, and high priority work.</p>
          </div>
          <Link
            to="/deadlines/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-blue-700"
          >
            Add deadline
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : deadlines.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No deadlines for this week.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {deadlines.map((deadline) => {
              const effectiveStatus = getEffectiveStatus(deadline)

              return (
                <Link
                  key={deadline.id}
                  to={`/deadlines/${deadline.id}`}
                  className="block p-4 hover:bg-slate-50"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">{deadline.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {deadline.course?.course_name || 'No course'} - {formatDateTime(deadline.due_date)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(effectiveStatus)}`}>
                        {effectiveStatus}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityClass(deadline.priority)}`}>
                        {deadline.priority}
                      </span>
                    </div>
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
