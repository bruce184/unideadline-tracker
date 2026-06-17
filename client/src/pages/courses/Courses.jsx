import { useCallback, useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { api } from '../../services/api'

const initialForm = { course_name: '', course_code: '', semester: '' }

function courseProgress(index) {
  return Math.max(22, 76 - index * 12)
}

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
      setError(err?.message || 'Không thể tải danh sách môn học')
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
      setFormError('Tên môn học là bắt buộc')
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
      setFormError(err?.message || 'Không thể lưu môn học')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (course) => {
    if (!confirm(`Xóa ${course.course_name}?`)) return

    try {
      await api.delete(`/courses/${course.id}`)
      await fetchCourses()
    } catch (err) {
      setError(err?.message || 'Không thể xóa môn học này')
    }
  }

  return (
    <Layout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#6b5bd6]">UniDeadline Tracker</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Môn học</h1>
          <p className="mt-2 text-sm text-slate-500">Quản lý môn học và học kỳ để gán deadline.</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-lg bg-[#5b45d8] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#4933c5]"
        >
          Thêm môn học
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-2xl border border-[#e9e2fb] bg-white p-5 shadow-[0_14px_40px_rgba(91,69,170,0.07)] sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-950">
            {editTarget ? 'Sửa môn học' : 'Thêm môn học'}
          </h2>
          {formError && (
            <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">{formError}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="course-name">
                Tên môn học *
              </label>
              <input
                id="course-name"
                required
                value={form.course_name}
                onChange={(event) => updateField('course_name', event.target.value)}
                className="mt-1 w-full rounded-lg border border-[#e5def8] bg-[#fbfaff] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6] focus:ring-2 focus:ring-[#eee8ff]"
                placeholder="Software Project Management"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="course-code">
                  Mã môn
                </label>
                <input
                  id="course-code"
                  value={form.course_code}
                  onChange={(event) => updateField('course_code', event.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#e5def8] bg-[#fbfaff] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6] focus:ring-2 focus:ring-[#eee8ff]"
                  placeholder="BIT304V1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="semester">
                  Học kỳ
                </label>
                <input
                  id="semester"
                  value={form.semester}
                  onChange={(event) => updateField('semester', event.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#e5def8] bg-[#fbfaff] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6] focus:ring-2 focus:ring-[#eee8ff]"
                  placeholder="SUM2026"
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={formLoading}
                className="rounded-lg bg-[#5b45d8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4933c5] disabled:opacity-50"
              >
                {formLoading ? 'Đang lưu...' : 'Lưu'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg bg-[#f0ebff] px-4 py-2 text-sm font-semibold text-[#5140b6] hover:bg-[#e8e0ff]"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
          <button onClick={fetchCourses} className="mt-2 font-semibold text-red-800 hover:underline">
            Thử lại
          </button>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-[#e9e2fb] bg-white p-8 text-center text-slate-400">
          Đang tải...
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-[#e9e2fb] bg-white p-8 text-center">
          <p className="text-slate-500">Chưa có môn học nào.</p>
          <button onClick={openCreate} className="mt-3 text-sm font-semibold text-[#5140b6] hover:underline">
            Thêm môn học đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course, index) => (
            <article
              key={course.id}
              className="rounded-2xl border border-[#e9e2fb] bg-white p-5 shadow-[0_14px_40px_rgba(91,69,170,0.07)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#f0ebff] text-sm font-bold text-[#5140b6]">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <span className="rounded-full bg-[#fbfaff] px-2.5 py-1 text-xs font-semibold text-slate-400">
                  {course.semester || 'Chưa có học kỳ'}
                </span>
              </div>
              <p className="mt-5 font-semibold text-slate-950">{course.course_name}</p>
              <p className="mt-1 text-sm text-slate-500">{course.course_code || 'Chưa có mã môn'}</p>
              <div className="mt-5 h-1.5 rounded-full bg-[#eee8ff]">
                <div className="h-full rounded-full bg-[#6b5bd6]" style={{ width: `${courseProgress(index)}%` }} />
              </div>
              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => openEdit(course)}
                  className="rounded-lg bg-[#f0ebff] px-3 py-1.5 text-sm font-semibold text-[#5140b6] hover:bg-[#e8e0ff]"
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(course)}
                  className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-100"
                >
                  Xóa
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </Layout>
  )
}
