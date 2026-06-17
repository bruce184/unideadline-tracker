export const USER_STATUS_OPTIONS = ['Not Started', 'In Progress', 'Submitted']
export const STATUS_OPTIONS = ['Not Started', 'In Progress', 'Submitted', 'Overdue']
export const PRIORITY_OPTIONS = ['High', 'Medium', 'Low']

export function getEffectiveStatus(deadline) {
  if (!deadline) return 'Not Started'
  if (deadline.status === 'Submitted') return 'Submitted'
  if (deadline.status === 'Overdue') return 'Overdue'
  return new Date(deadline.due_date) < new Date() ? 'Overdue' : deadline.status
}

export function formatDateTime(value) {
  if (!value) return 'No due date'
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(value))
}

export function toDateTimeLocal(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return offsetDate.toISOString().slice(0, 16)
}

export function getMonday(date = new Date()) {
  const copy = new Date(date)
  const day = copy.getDay()
  const diff = day === 0 ? -6 : 1 - day
  copy.setDate(copy.getDate() + diff)
  copy.setHours(0, 0, 0, 0)
  return copy
}

export function toDateInputValue(date) {
  return date.toISOString().slice(0, 10)
}

export function statusClass(status) {
  const effectiveStatus = status || 'Not Started'
  if (effectiveStatus === 'Submitted') return 'bg-emerald-50 text-emerald-700'
  if (effectiveStatus === 'In Progress') return 'bg-blue-50 text-blue-700'
  if (effectiveStatus === 'Overdue') return 'bg-red-50 text-red-700'
  return 'bg-slate-100 text-slate-700'
}

export function priorityClass(priority) {
  if (priority === 'High') return 'bg-red-50 text-red-700'
  if (priority === 'Low') return 'bg-slate-100 text-slate-600'
  return 'bg-amber-50 text-amber-700'
}

export function buildQuery(params) {
  const search = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value)
  })

  const query = search.toString()
  return query ? `?${query}` : ''
}
