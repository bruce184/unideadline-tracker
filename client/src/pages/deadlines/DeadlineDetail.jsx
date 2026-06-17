import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import { getDeadline, updateDeadline, deleteDeadline as removeDeadline } from '../../services/deadlineService'
import {
  formatDateTime,
  getEffectiveStatus,
  priorityClass,
  priorityLabel,
  statusClass,
  statusLabel,
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
      const { data } = await getDeadline(id)
      setDeadline(data)
    } catch (err) {
      setError(err?.message || 'Không thể tải chi tiết deadline')
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
      await updateDeadline(id, { status })
      await fetchDeadline()
    } catch (err) {
      setError(err?.message || 'Không thể cập nhật trạng thái deadline')
    } finally {
      setStatusLoading(false)
    }
  }

  const deleteDeadline = async () => {
    if (!confirm('Xóa deadline này?')) return

    try {
      setDeleteLoading(true)
      await removeDeadline(id)
      navigate('/deadlines')
    } catch (err) {
      setError(err?.message || 'Không thể xóa deadline')
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
          <Link to="/deadlines" className="text-sm font-semibold text-[#5140b6] hover:underline">
            Quay lại danh sách deadline
          </Link>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Chi tiết deadline</h1>
        </div>
        {deadline && (
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/deadlines/${id}/edit`}
              className="rounded-lg bg-[#f0ebff] px-4 py-2 text-sm font-semibold text-[#5140b6] hover:bg-[#e8e0ff]"
            >
              Sửa
            </Link>
            <button
              onClick={deleteDeadline}
              disabled={deleteLoading}
              className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
            >
              {deleteLoading ? 'Đang xóa...' : 'Xóa'}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-[#e9e2fb] bg-white p-8 text-center text-slate-400">
          Đang tải...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
          <button onClick={fetchDeadline} className="mt-2 font-semibold text-red-800 hover:underline">
            Thử lại
          </button>
        </div>
      ) : deadline ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="rounded-2xl border border-[#e9e2fb] bg-white p-5 shadow-[0_14px_40px_rgba(91,69,170,0.07)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{deadline.title}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {deadline.course?.course_name || 'Chưa có môn học'}
                  {deadline.course?.course_code ? ` - ${deadline.course.course_code}` : ''}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(effectiveStatus)}`}>
                  {statusLabel(effectiveStatus)}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityClass(deadline.priority)}`}>
                  {priorityLabel(deadline.priority)}
                </span>
              </div>
            </div>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-slate-500">Hạn nộp</dt>
                <dd className="mt-1 text-slate-900">{formatDateTime(deadline.due_date)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Link nộp bài</dt>
                <dd className="mt-1">
                  {deadline.submission_link ? (
                    <a
                      href={deadline.submission_link}
                      target="_blank"
                      rel="noreferrer"
                    className="break-all text-[#5140b6] hover:underline"
                    >
                      {deadline.submission_link}
                    </a>
                  ) : (
                    <span className="text-slate-400">Chưa thêm link</span>
                  )}
                </dd>
              </div>
            </dl>

            <div className="mt-6">
              <h3 className="font-semibold text-slate-900">Mô tả</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {deadline.description || 'Chưa có mô tả.'}
              </p>
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-[#e9e2fb] bg-white p-5 shadow-[0_14px_40px_rgba(91,69,170,0.07)]">
              <h3 className="font-semibold text-slate-900">Theo dõi trạng thái</h3>
              <select
                value={deadline.status === 'Overdue' ? 'Not Started' : deadline.status}
                onChange={(event) => updateStatus(event.target.value)}
                disabled={statusLoading}
                className="mt-3 w-full rounded-lg border border-[#e5def8] bg-[#fbfaff] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6] focus:ring-2 focus:ring-[#eee8ff] disabled:opacity-50"
              >
                {USER_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>{statusLabel(status)}</option>
                ))}
              </select>
            </section>

            <section className="rounded-2xl border border-[#e9e2fb] bg-white p-5 shadow-[0_14px_40px_rgba(91,69,170,0.07)]">
              <h3 className="font-semibold text-slate-900">Nhắc nhở</h3>
              {Array.isArray(reminders) && reminders.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {reminders.map((reminder) => (
                    <li key={reminder.id || reminder.reminder_time} className="text-sm text-slate-600">
                      {formatDateTime(reminder.reminder_time)} - {reminder.sent_status || 'đang chờ'}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-400">Chưa có dữ liệu nhắc nhở.</p>
              )}
            </section>
          </aside>
        </div>
      ) : null}
    </Layout>
  )
}
