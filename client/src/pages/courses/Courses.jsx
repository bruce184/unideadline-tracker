import { useCallback, useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { api } from '../../services/api'

const initialForm = { course_name: '', course_code: '', semester: '' }

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const data = await api.get('/courses')
      setCourses(data)
    } catch (err) {
      setError(err?.message || 'Could not load courses')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCourses()
    }, 0)

    return () => clearTimeout(timer)
  }, [fetchCourses])

  const openCreate = () => {
    setEditTarget(null)
    setForm(initialForm)
    setFormError('')
    setShowForm(true)
  }

  const openEdit = (course) => {
    setEditTarget(course)
    setForm({
      course_name: course.course_name || '',
      course_code: course.course_code || '',
      semester: course.semester || '',
    })
    setFormError('')
    setShowForm(true)
  }

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')

    if (!form.course_name.trim()) {
      setFormError('Course name is required')
      return
    }

    const payload = {
      course_name: form.course_name.trim(),
      course_code: form.course_code.trim(),
      semester: form.semester.trim(),
    }

    try {
      setFormLoading(true)
      if (editTarget) {
        await api.patch(`/courses/${editTarget.id}`, payload)
      } else {
        await api.post('/courses', payload)
      }
      setShowForm(false)
      setEditTarget(null)
      setForm(initialForm)
      await fetchCourses()
    } catch (err) {
      setFormError(err?.message || 'Could not save course')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (course) => {
    if (!confirm(`Delete ${course.course_name}?`)) return

    try {
      await api.delete(`/courses/${course.id}`)
      await fetchCourses()
    } catch (err) {
      setError(err?.message || 'Could not delete this course')
    }
  }

  return (
    <Layout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Courses</h1>
          <p className="mt-1 text-sm text-slate-500">Manage subjects and semesters used by deadlines.</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Add course
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            {editTarget ? 'Edit course' : 'Add course'}
          </h2>
          {formError && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{formError}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="course-name">
                Course name *
              </label>
              <input
                id="course-name"
                required
                value={form.course_name}
                onChange={(event) => updateField('course_name', event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Software Project Management"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="course-code">
                  Course code
                </label>
                <input
                  id="course-code"
                  value={form.course_code}
                  onChange={(event) => updateField('course_code', event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="BIT304V1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="semester">
                  Semester
                </label>
                <input
                  id="semester"
                  value={form.semester}
                  onChange={(event) => updateField('semester', event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="SUM2026"
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={formLoading}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {formLoading ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
          <button onClick={fetchCourses} className="mt-2 font-semibold text-red-800 hover:underline">
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400">
          Loading...
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-500">No courses yet.</p>
          <button onClick={openCreate} className="mt-3 text-sm font-semibold text-blue-600 hover:underline">
            Add your first course
          </button>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {courses.map((course) => (
            <article key={course.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{course.course_name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {[course.course_code, course.semester].filter(Boolean).join(' - ') || 'No code or semester'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(course)}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(course)}
                    className="rounded-lg bg-red-50 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </Layout>
  )
}
