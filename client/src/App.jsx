import { useEffect, useMemo, useState } from 'react'
import DeadlineCard from './components/DeadlineCard'
import DeadlineFilter from './components/DeadlineFilter'
import LoginForm from './components/LoginForm'
import ReminderAlert from './components/ReminderAlert'
import { configureApiClient, listDeadlines } from './services'
import {
  clearStoredSession,
  getStoredAccessToken,
  getStoredSession,
  hasSupabaseAuthConfig,
  signInWithPassword,
  signOut,
} from './services/supabaseAuthService'
import { filterDeadlines } from './utils/filterDeadlines'

const INITIAL_FILTERS = {
  q: '',
  course_id: '',
  status: '',
  priority: '',
  from: '',
  to: '',
}

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
  const [session, setSession] = useState(() => getStoredSession())
  const [deadlines, setDeadlines] = useState([])
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [loadingDeadlines, setLoadingDeadlines] = useState(false)
  const [deadlineError, setDeadlineError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const authReady = hasSupabaseAuthConfig()

  useEffect(() => {
    configureApiClient({
      getAccessToken: getStoredAccessToken,
      onUnauthorized: () => {
        clearStoredSession()
        setSession(null)
        setDeadlines([])
      },
    })
  }, [])

  useEffect(() => {
    if (!session) {
      return
    }

    let ignore = false

    async function loadDeadlines() {
      setLoadingDeadlines(true)
      setDeadlineError(null)

      try {
        const response = await listDeadlines({
          page: 1,
          limit: 100,
          sort_by: 'due_date',
          sort_order: 'asc',
        })

        if (!ignore) {
          setDeadlines(response.data || [])
        }
      } catch (err) {
        if (!ignore) {
          setDeadlineError(err.message)
          setDeadlines([])
        }
      } finally {
        if (!ignore) {
          setLoadingDeadlines(false)
        }
      }
    }

    loadDeadlines()

    return () => {
      ignore = true
    }
  }, [session, reloadKey])

  const courses = useMemo(() => getCoursesFromDeadlines(deadlines), [deadlines])
  const filteredDeadlines = useMemo(
    () => filterDeadlines(deadlines, filters),
    [deadlines, filters],
  )

  async function handleLogin(credentials) {
    const nextSession = await signInWithPassword(credentials)
    setSession(nextSession)
  }

  async function handleLogout() {
    await signOut()
    setSession(null)
    setDeadlines([])
    setFilters(INITIAL_FILTERS)
  }

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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              UniDeadline Tracker
            </h1>
            {session?.user?.email && (
              <p className="mt-1 text-sm text-slate-500">{session.user.email}</p>
            )}
          </div>

          {session && (
            <button
              type="button"
              onClick={handleLogout}
              className="w-fit rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              Sign out
            </button>
          )}
        </div>

        {!session ? (
          <LoginForm onLogin={handleLogin} authReady={authReady} />
        ) : (
          <>
            <div className="mt-6">
              <ReminderAlert deadlines={deadlines} />
              <DeadlineFilter
                filters={filters}
                courses={courses}
                onChange={setFilters}
                onReset={() => setFilters(INITIAL_FILTERS)}
              />
            </div>

            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                {loadingDeadlines
                  ? 'Loading deadlines...'
                  : `${filteredDeadlines.length} deadline(s) shown`}
              </p>
              <button
                type="button"
                onClick={() => setReloadKey((currentKey) => currentKey + 1)}
                disabled={loadingDeadlines}
                className="rounded border border-slate-200 bg-white px-3 py-1 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
              >
                Refresh
              </button>
            </div>

            {deadlineError && (
              <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {deadlineError}
              </p>
            )}

            {filteredDeadlines.length === 0 ? (
              <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center">
                <p className="font-medium text-slate-800">No deadlines to show.</p>
                <p className="mt-1 text-sm text-slate-500">
                  Seed demo data or create deadlines to populate this list.
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
          </>
        )}
      </section>
    </main>
  )
}

export default App
