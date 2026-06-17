import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import { api } from '../../services/api'
import {
  buildQuery,
  formatDateTime,
  getEffectiveStatus,
  PRIORITY_OPTIONS,
  priorityClass,
  STATUS_OPTIONS,
  statusClass,
  USER_STATUS_OPTIONS,
} from '../../utils/deadlineUtils'

const defaultFilters = {
  q: '',
  course_id: '',
  status: '',
  priority: '',
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
      setError(err?.message || 'Could not load deadlines')
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
      setError(err?.message || 'Could not update deadline status')
    } finally {
      setStatusLoadingId('')
    }
  }

  return (
    <Layout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Deadlines</h1>
          <p className="mt-1 text-sm text-slate-500">Search, filter, and update submission status.</p>
        </div>
        <Link
          to="/deadlines/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-blue-700"
        >
          Add deadline
        </Link>
      </div>

      <form onSubmit={handleSearchSubmit} className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
          <input
            value={filters.q}
            onChange={(event) => setFilters({ ...filters, q: event.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Search title or description"
          />
          <select
            value={filters.course_id}
            onChange={(event) => setFilters({ ...filters, course_id: event.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>{course.course_name}</option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(event) => setFilters({ ...filters, status: event.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All status</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <select
            value={filters.priority}
            onChange={(event) => setFilters({ ...filters, priority: event.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All priority</option>
            {PRIORITY_OPTIONS.map((priority) => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Search
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200"
            >
              Reset
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
          <button onClick={fetchData} className="mt-2 font-semibold text-red-800 hover:underline">
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400">
          Loading...
        </div>
      ) : deadlines.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-500">No deadlines found.</p>
          <Link to="/deadlines/new" className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:underline">
            Add your first deadline
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {deadlines.map((deadline) => {
            const effectiveStatus = getEffectiveStatus(deadline)

            return (
              <article key={deadline.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <Link to={`/deadlines/${deadline.id}`} className="font-semibold text-slate-900 hover:text-blue-600">
                      {deadline.title}
                    </Link>
                    <p className="mt-1 text-sm text-slate-500">
                      {deadline.course?.course_name || 'No course'} - {formatDateTime(deadline.due_date)}
                    </p>
                    {deadline.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600">{deadline.description}</p>
                    )}
                    {deadline.submission_link && (
                      <a
                        href={deadline.submission_link}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-block text-sm font-semibold text-blue-600 hover:underline"
                      >
                        Open submission link
                      </a>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row lg:items-center">
                    <div className="flex flex-wrap gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(effectiveStatus)}`}>
                        {effectiveStatus}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityClass(deadline.priority)}`}>
                        {deadline.priority}
                      </span>
                    </div>
                    <select
                      value={deadline.status === 'Overdue' ? 'Not Started' : deadline.status}
                      onChange={(event) => updateStatus(deadline, event.target.value)}
                      disabled={statusLoadingId === deadline.id}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {USER_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <Link
                      to={`/deadlines/${deadline.id}/edit`}
                      className="rounded-lg bg-slate-100 px-3 py-2 text-center text-sm text-slate-700 hover:bg-slate-200"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </Layout>
  )
}
