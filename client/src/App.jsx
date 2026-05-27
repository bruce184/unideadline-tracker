function App() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <section className="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold text-slate-900">
          UniDeadline Tracker
        </h1>
        <p className="mt-3 text-slate-600">
          Responsive Web App for managing courses, deadlines, status, weekly dashboard, and reminders.
        </p>

        <div className="mt-6 rounded-xl border border-slate-200 p-4">
          <p className="font-semibold text-slate-800">Frontend is running.</p>
          <p className="mt-1 text-sm text-slate-500">
            Next step: implement Auth, Course, Deadline, Dashboard, and Reminder modules.
          </p>
        </div>
      </section>
    </main>
  )
}

export default App
