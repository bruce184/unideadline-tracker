import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import { getDeadline, createDeadline, updateDeadline } from '../../services/deadlineService'
import { listCourses } from '../../services/courseService'
import {
  PRIORITY_OPTIONS,
  priorityLabel,
  statusLabel,
  toDateTimeLocal,
  toIsoDateTime,
  USER_STATUS_OPTIONS,
} from '../../utils/deadlineUtils'

const initialForm = {
  title: '',
  course_id: '',
  due_date: '',
  status: 'Not Started',
  priority: 'Medium',
  description: '',
  submission_link: '',
}

function isHttpUrl(value) {
  if (!value) return true

  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export default function DeadlineForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [courses, setCourses] = useState([])
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        setFetchLoading(true)
        setError('')
        const courseData = await listCourses({ limit: 100 })
        setCourses(courseData.data || [])

        if (isEdit) {
          const { data: deadline } = await getDeadline(id)
          setForm({
            title: deadline.title || '',
            course_id: deadline.course_id || '',
            due_date: toDateTimeLocal(deadline.due_date),
            status: deadline.status === 'Overdue' ? 'Not Started' : deadline.status || 'Not Started',
            priority: deadline.priority || 'Medium',
            description: deadline.description || '',
            submission_link: deadline.submission_link || '',
          })
        }
      } catch (err) {
        setError(err?.message || 'Không thể tải dữ liệu biểu mẫu')
      } finally {
        setFetchLoading(false)
      }
    }

    init()
  }, [id, isEdit])

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!form.title.trim()) {
      setError('Tiêu đề là bắt buộc')
      return
    }

    if (!form.course_id) {
      setError('Môn học là bắt buộc')
      return
    }

    if (!form.due_date) {
      setError('Hạn nộp là bắt buộc')
      return
    }

    if (!isHttpUrl(form.submission_link)) {
      setError('Link nộp bài phải bắt đầu bằng http:// hoặc https://')
      return
    }

    const isoDueDate = toIsoDateTime(form.due_date)

    // MAJ-06 fix: toIsoDateTime returns '' for invalid dates — catch it here
    // to show a meaningful error instead of letting the API return "Due date is required"
    if (!isoDueDate) {
      setError('Hạn nộp không hợp lệ. Vui lòng chọn lại.')
      return
    }

    const payload = {
      ...form,
      title: form.title.trim(),
      due_date: isoDueDate,
      description: form.description.trim(),
      submission_link: form.submission_link.trim(),
    }

    try {
      setLoading(true)
      if (isEdit) {
        await updateDeadline(id, payload)
      } else {
        await createDeadline(payload)
      }
      navigate('/deadlines')
    } catch (err) {
      setError(err?.message || 'Không thể lưu deadline')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <Layout>
        <div className="rounded-2xl border border-[#e9e2fb] bg-white p-8 text-center text-slate-400">
          Đang tải...
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-3xl">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            onClick={() => navigate('/deadlines')}
            className="text-left text-sm font-semibold text-[#5140b6] hover:underline"
          >
            Quay lại danh sách deadline
          </button>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            {isEdit ? 'Sửa deadline' : 'Thêm deadline'}
          </h1>
        </div>

        {courses.length === 0 ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
            <p className="text-amber-800">Bạn cần có môn học trước khi tạo deadline.</p>
            <button
              onClick={() => navigate('/courses')}
              className="mt-3 text-sm font-semibold text-[#5140b6] hover:underline"
            >
              Thêm môn học trước
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#e9e2fb] bg-white p-5 shadow-[0_14px_40px_rgba(91,69,170,0.07)] sm:p-6">
            {error && (
              <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="title">
                  Tiêu đề *
                </label>
                <input
                  id="title"
                  required
                  value={form.title}
                  onChange={(event) => updateField('title', event.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#e5def8] bg-[#fbfaff] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6] focus:ring-2 focus:ring-[#eee8ff]"
                  placeholder="Nộp báo cáo tuần"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="course">
                  Môn học *
                </label>
                <select
                  id="course"
                  required
                  value={form.course_id}
                  onChange={(event) => updateField('course_id', event.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#e5def8] bg-[#fbfaff] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6] focus:ring-2 focus:ring-[#eee8ff]"
                >
                  <option value="">Chọn môn học</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>{course.course_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="due-date">
                  Hạn nộp *
                </label>
                <input
                  id="due-date"
                  required
                  type="datetime-local"
                  value={form.due_date}
                  onChange={(event) => updateField('due_date', event.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#e5def8] bg-[#fbfaff] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6] focus:ring-2 focus:ring-[#eee8ff]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700" htmlFor="status">
                    Trạng thái
                  </label>
                  <select
                    id="status"
                    value={form.status}
                    onChange={(event) => updateField('status', event.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#e5def8] bg-[#fbfaff] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6] focus:ring-2 focus:ring-[#eee8ff]"
                  >
                    {USER_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>{statusLabel(status)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700" htmlFor="priority">
                    Ưu tiên
                  </label>
                  <select
                    id="priority"
                    value={form.priority}
                    onChange={(event) => updateField('priority', event.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#e5def8] bg-[#fbfaff] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6] focus:ring-2 focus:ring-[#eee8ff]"
                  >
                    {PRIORITY_OPTIONS.map((priority) => (
                      <option key={priority} value={priority}>{priorityLabel(priority)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="description">
                  Mô tả
                </label>
                <textarea
                  id="description"
                  value={form.description}
                  onChange={(event) => updateField('description', event.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-[#e5def8] bg-[#fbfaff] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6] focus:ring-2 focus:ring-[#eee8ff]"
                  placeholder="Cần nộp những gì?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="submission-link">
                  Link nộp bài
                </label>
                <input
                  id="submission-link"
                  type="url"
                  value={form.submission_link}
                  onChange={(event) => updateField('submission_link', event.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#e5def8] bg-[#fbfaff] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6] focus:ring-2 focus:ring-[#eee8ff]"
                  placeholder="https://..."
                />
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-[#5b45d8] px-5 py-2 text-sm font-semibold text-white hover:bg-[#4933c5] disabled:opacity-50"
                >
                  {loading ? 'Đang lưu...' : 'Lưu'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/deadlines')}
                  className="rounded-lg bg-[#f0ebff] px-5 py-2 text-sm font-semibold text-[#5140b6] hover:bg-[#e8e0ff]"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  )
}
