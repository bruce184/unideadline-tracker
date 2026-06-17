import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import { api } from '../../services/api'
import { PRIORITY_OPTIONS, toDateTimeLocal, USER_STATUS_OPTIONS } from '../../utils/deadlineUtils'

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
        const courseData = await api.get('/courses')
        setCourses(courseData)

        if (isEdit) {
          const deadline = await api.get(`/deadlines/${id}`)
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
        setError(err?.message || 'Could not load form data')
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
      setError('Title is required')
      return
    }

    if (!form.course_id) {
      setError('Course is required')
      return
    }

    if (!form.due_date) {
      setError('Due date is required')
      return
    }

    if (!isHttpUrl(form.submission_link)) {
      setError('Submission link must start with http:// or https://')
      return
    }

    const payload = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      submission_link: form.submission_link.trim(),
    }

    try {
      setLoading(true)
      if (isEdit) {
        await api.patch(`/deadlines/${id}`, payload)
      } else {
        await api.post('/deadlines', payload)
      }
      navigate('/deadlines')
    } catch (err) {
      setError(err?.message || 'Could not save deadline')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <Layout>
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400">
          Loading...
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-2xl">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            onClick={() => navigate('/deadlines')}
            className="text-left text-sm font-semibold text-blue-600 hover:underline"
          >
            Back to deadlines
          </button>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEdit ? 'Edit deadline' : 'Add deadline'}
          </h1>
        </div>

        {courses.length === 0 ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
            <p className="text-amber-800">You need a course before creating deadlines.</p>
            <button
              onClick={() => navigate('/courses')}
              className="mt-3 text-sm font-semibold text-blue-600 hover:underline"
            >
              Add course first
            </button>
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="title">
                  Title *
                </label>
                <input
                  id="title"
                  required
                  value={form.title}
                  onChange={(event) => updateField('title', event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Submit weekly report"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="course">
                  Course *
                </label>
                <select
                  id="course"
                  required
                  value={form.course_id}
                  onChange={(event) => updateField('course_id', event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>{course.course_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="due-date">
                  Due date *
                </label>
                <input
                  id="due-date"
                  required
                  type="datetime-local"
                  value={form.due_date}
                  onChange={(event) => updateField('due_date', event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700" htmlFor="status">
                    Status
                  </label>
                  <select
                    id="status"
                    value={form.status}
                    onChange={(event) => updateField('status', event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    {USER_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700" htmlFor="priority">
                    Priority
                  </label>
                  <select
                    id="priority"
                    value={form.priority}
                    onChange={(event) => updateField('priority', event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    {PRIORITY_OPTIONS.map((priority) => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  value={form.description}
                  onChange={(event) => updateField('description', event.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="What should be submitted?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="submission-link">
                  Submission link
                </label>
                <input
                  id="submission-link"
                  type="url"
                  value={form.submission_link}
                  onChange={(event) => updateField('submission_link', event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/deadlines')}
                  className="rounded-lg bg-slate-100 px-5 py-2 text-sm text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  )
}
