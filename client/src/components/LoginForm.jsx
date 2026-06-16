import { useState } from 'react'

export default function LoginForm({ onLogin, authReady }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()

    if (!email.trim() || !password) {
      setError('Email and password are required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await onLogin({ email: email.trim(), password })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-lg border border-slate-200 bg-white p-4"
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          disabled={!authReady || loading}
          className="rounded border border-slate-200 px-3 py-2 text-sm"
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          disabled={!authReady || loading}
          className="rounded border border-slate-200 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={!authReady || loading}
          className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
      {!authReady && (
        <p className="mt-3 text-sm text-red-600">
          Supabase frontend environment variables are missing.
        </p>
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </form>
  )
}
