import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import { getDeadline, updateDeadline, updateDeadlineReminder, deleteDeadline as removeDeadline } from '../../services/deadlineService'
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
  const [reminderChannel, setReminderChannel] = useState('email')
  const [reminderOffsets, setReminderOffsets] = useState([1])
  const [reminderSaving, setReminderSaving] = useState(false)
  const [reminderMessage, setReminderMessage] = useState('')

  const OFFSET_OPTIONS = [
    { value: 7, label: '7 ngày trước' },
    { value: 3, label: '3 ngày trước' },
    { value: 1, label: '1 ngày trước' },
    { value: 0, label: 'Đúng ngày hết hạn' },
  ]

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

  const toggleOffset = (value) => {
    setReminderOffsets((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    )
  }

  const saveReminder = async () => {
    setReminderMessage('')

    if (reminderOffsets.length === 0) {
      setReminderMessage('Chọn ít nhất 1 mốc nhắc nhở')
      return
    }

    try {
      setReminderSaving(true)
      await updateDeadlineReminder(id, {
        enabled: true,
        channel: reminderChannel,
        reminder_offsets: reminderOffsets,
      })
      setReminderMessage('Đã bật nhắc nhở thành công')
      await fetchDeadline()
    } catch (err) {
      setReminderMessage(err?.message || 'Không thể lưu cấu hình nhắc nhở')
    } finally {
      setReminderSaving(false)
    }
  }

  const disableReminder = async () => {
    try {
      setReminderSaving(true)
      setReminderMessage('')
      await updateDeadlineReminder(id, { enabled: false, channel: reminderChannel })
      setReminderMessage('Đã tắt nhắc nhở')
      await fetchDeadline()
    } catch (err) {
      setReminderMessage(err?.message || 'Không thể tắt nhắc nhở')
    } finally {
      setReminderSaving(false)
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

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setReminderChannel('email')}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${
                    reminderChannel === 'email'
                      ? 'bg-[#5140b6] text-white'
                      : 'bg-[#f0ebff] text-[#5140b6]'
                  }`}
                >
                  Qua Email
                </button>
                <button
                  type="button"
                  onClick={() => setReminderChannel('in_app')}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${
                    reminderChannel === 'in_app'
                      ? 'bg-[#5140b6] text-white'
                      : 'bg-[#f0ebff] text-[#5140b6]'
                  }`}
                >
                  Trong ứng dụng
                </button>
              </div>

              <div className="mt-3 space-y-2">
                {OFFSET_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={reminderOffsets.includes(option.value)}
                      onChange={() => toggleOffset(option.value)}
                      className="h-4 w-4 rounded border-[#c9bdf2] text-[#5140b6] focus:ring-[#c9bdf2]"
                    />
                    {option.label}
                  </label>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={saveReminder}
                  disabled={reminderSaving}
                  className="flex-1 rounded-lg bg-[#5140b6] px-3 py-2 text-sm font-semibold text-white hover:bg-[#453497] disabled:opacity-50"
                >
                  {reminderSaving ? 'Đang lưu...' : 'Bật nhắc nhở'}
                </button>
                <button
                  onClick={disableReminder}
                  disabled={reminderSaving}
                  className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 disabled:opacity-50"
                >
                  Tắt
                </button>
              </div>

              {reminderMessage && (
                <p className="mt-2 text-sm text-slate-500">{reminderMessage}</p>
              )}

              <div className="mt-4 border-t border-[#f0ebff] pt-3">
                <h4 className="text-xs font-semibold uppercase text-slate-400">Lịch sử nhắc nhở</h4>
                {Array.isArray(reminders) && reminders.length > 0 ? (
                  <ul className="mt-2 space-y-2">
                    {reminders.map((reminder) => (
                      <li key={reminder.id || reminder.reminder_time} className="text-sm text-slate-600">
                        {formatDateTime(reminder.reminder_time)} · {reminder.channel === 'email' ? 'Email' : 'In-app'} ·{' '}
                        {reminder.sent_status === 'sent'
                          ? 'Đã gửi'
                          : reminder.sent_status === 'failed'
                          ? 'Gửi lỗi'
                          : 'Đang chờ'}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-slate-400">Chưa có dữ liệu nhắc nhở.</p>
                )}
              </div>
            </section>
          </aside>
        </div>
      ) : null}
    </Layout>
  )
}