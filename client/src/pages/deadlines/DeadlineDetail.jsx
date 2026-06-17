import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import { api } from '../../services/api'
import {
  formatDateTime,
  getEffectiveStatus,
  priorityClass,
  statusClass,
  USER_STATUS_OPTIONS,
} from '../../utils/deadlineUtils'

export default function DeadlineDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [deadline, setDeadline] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusLoading, setStatusLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchDeadline = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const data = await api.get(`/deadlines/${id}`)
      setDeadline(data)
    } catch (err) {
      setError(err?.message || 'Could not load deadline detail')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDeadline()
    }, 0)

    return () => clearTimeout(timer)
  }, [fetchDeadline])

  const updateStatus = async (status) => {
    try {
      setStatusLoading(true)
      await api.patch(`/deadlines/${id}`, { status })
      await fetchDeadline()
    } catch (err) {
      setError(err?.message || 'Could not update deadline status')
    } finally {
      setStatusLoading(false)
    }
  }

  const deleteDeadline = async () => {
    if (!confirm('Delete this deadline?')) return

    try {
      setDeleteLoading(true)
      await api.delete(`/deadlines/${id}`)
      navigate('/deadlines')
    } catch (err) {
      setError(err?.message || 'Could not delete deadline')
    } finally {
      setDeleteLoading(false)
    }
  }

  const effectiveStatus = getEffectiveStatus(deadline)
  const reminders = deadline?.reminders || deadline?.reminder_summary || []

  return (
    <Layout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to="/deadlines" className="text-sm font-semibold text-blue-600 hover:underline">
            Back to deadlines
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Deadline detail</h1>
        </div>
        {deadline && (
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/deadlines/${id}/edit`}
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200"
            >
              Edit
            </Link>
            <button
              onClick={deleteDeadline}
              disabled={deleteLoading}
              className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
            >
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400">
          Loading...
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
          <button onClick={fetchDeadline} className="mt-2 font-semibold text-red-800 hover:underline">
            Try again
          </button>
        </div>
      ) : deadline ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{deadline.title}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {deadline.course?.course_name || 'No course'}
                  {deadline.course?.course_code ? ` - ${deadline.course.course_code}` : ''}
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

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-slate-500">Due date</dt>
                <dd className="mt-1 text-slate-900">{formatDateTime(deadline.due_date)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Submission link</dt>
                <dd className="mt-1">
                  {deadline.submission_link ? (
                    <a
                      href={deadline.submission_link}
                      target="_blank"
                      rel="noreferrer"
                      className="break-all text-blue-600 hover:underline"
                    >
                      {deadline.submission_link}
                    </a>
                  ) : (
                    <span className="text-slate-400">No link added</span>
                  )}
                </dd>
              </div>
            </dl>

            <div className="mt-6">
              <h3 className="font-semibold text-slate-900">Description</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {deadline.description || 'No description.'}
              </p>
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-lg border border-slate-200 bg-white p-5">
              <h3 className="font-semibold text-slate-900">Status tracking</h3>
              <select
                value={deadline.status === 'Overdue' ? 'Not Started' : deadline.status}
                onChange={(event) => updateStatus(event.target.value)}
                disabled={statusLoading}
                className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
              >
                {USER_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5">
              <h3 className="font-semibold text-slate-900">Reminder</h3>
              {Array.isArray(reminders) && reminders.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {reminders.map((reminder) => (
                    <li key={reminder.id || reminder.reminder_time} className="text-sm text-slate-600">
                      {formatDateTime(reminder.reminder_time)} - {reminder.sent_status || 'pending'}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-400">No reminder data.</p>
              )}
            </section>
          </aside>
        </div>
      ) : null}
    </Layout>
  )
}
