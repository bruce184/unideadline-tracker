import { STATUS_OPTIONS } from '../utils/deadlineStatus'

const PRIORITY_OPTIONS = ['High', 'Medium', 'Low']

export default function DeadlineFilter({ filters, courses, onChange, onReset }) {
  function handleChange(event) {
    onChange({ ...filters, [event.target.name]: event.target.value })
  }

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <input
        type="text"
        name="q"
        value={filters.q}
        onChange={handleChange}
        placeholder="Search deadlines..."
        className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
      />

      <div className="flex flex-wrap gap-3">
        <select
          name="course_id"
          value={filters.course_id}
          onChange={handleChange}
          className="rounded border border-slate-200 px-2 py-1 text-sm"
        >
          <option value="">All courses</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.course_name}
            </option>
          ))}
        </select>

        <select
          name="status"
          value={filters.status}
          onChange={handleChange}
          className="rounded border border-slate-200 px-2 py-1 text-sm"
        >
          <option value="">All statuses</option>
          {[...STATUS_OPTIONS, 'Overdue'].map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          name="priority"
          value={filters.priority}
          onChange={handleChange}
          className="rounded border border-slate-200 px-2 py-1 text-sm"
        >
          <option value="">All priorities</option>
          {PRIORITY_OPTIONS.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>

        <input
          type="date"
          name="from"
          value={filters.from}
          onChange={handleChange}
          className="rounded border border-slate-200 px-2 py-1 text-sm"
          aria-label="From date"
        />

        <input
          type="date"
          name="to"
          value={filters.to}
          onChange={handleChange}
          className="rounded border border-slate-200 px-2 py-1 text-sm"
          aria-label="To date"
        />

        <button
          type="button"
          onClick={onReset}
          className="rounded border border-slate-200 px-3 py-1 text-sm text-slate-500 hover:bg-slate-50"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
