import { useMemo, useState } from 'react'
import DeadlineCard from './components/DeadlineCard'
import DeadlineFilter from './components/DeadlineFilter'
import ReminderAlert from './components/ReminderAlert'
import { filterDeadlines } from './utils/filterDeadlines'

const INITIAL_FILTERS = {
  q: '',
  course_id: '',
  status: '',
  priority: '',
  from: '',
  to: '',
}

const INITIAL_DEADLINES = []

function getCoursesFromDeadlines(deadlines) {
  return [
    ...new Map(
      deadlines
        .map((deadline) => deadline.course)
        .filter(Boolean)
        .map((course) => [course.id, course]),
    ).values(),
  ]
}

function App() {
  const [deadlines, setDeadlines] = useState(INITIAL_DEADLINES)
  const [filters, setFilters] = useState(INITIAL_FILTERS)

  const courses = useMemo(() => getCoursesFromDeadlines(deadlines), [deadlines])
  const filteredDeadlines = useMemo(
    () => filterDeadlines(deadlines, filters),
    [deadlines, filters],
  )

  function handleUpdated(updatedDeadline) {
    setDeadlines((currentDeadlines) =>
      currentDeadlines.map((deadline) =>
        deadline.id === updatedDeadline.id ? updatedDeadline : deadline,
      ),
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6">
      <section className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-slate-900">
          UniDeadline Tracker
        </h1>

        <div className="mt-6">
          <ReminderAlert deadlines={deadlines} />
          <DeadlineFilter
            filters={filters}
            courses={courses}
            onChange={setFilters}
            onReset={() => setFilters(INITIAL_FILTERS)}
          />
        </div>

        {filteredDeadlines.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center">
            <p className="font-medium text-slate-800">No deadlines to show.</p>
            <p className="mt-1 text-sm text-slate-500">
              Add demo deadlines or connect the deadline API to populate this list.
            </p>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {filteredDeadlines.map((deadline) => (
              <DeadlineCard
                key={deadline.id}
                deadline={deadline}
                onUpdated={handleUpdated}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default App
