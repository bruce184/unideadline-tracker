import { useState } from 'react'
import { updateDeadline } from '../services/deadlineService'
import { STATUS_OPTIONS } from '../utils/deadlineStatus'

export default function StatusSelect({ deadline, onUpdated }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleChange(event) {
    const newStatus = event.target.value
    setLoading(true)
    setError(null)

    try {
      const response = await updateDeadline(deadline.id, { status: newStatus })
      onUpdated?.(response.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <select
        value={deadline.status}
        onChange={handleChange}
        disabled={loading}
        className="rounded border border-slate-200 px-2 py-1 text-sm"
      >
        {STATUS_OPTIONS.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
