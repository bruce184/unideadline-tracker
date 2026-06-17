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
  if (!value) return 'Chưa có hạn nộp'
  return new Intl.DateTimeFormat('vi-VN', {
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
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function statusClass(status) {
  const effectiveStatus = status || 'Not Started'
  if (effectiveStatus === 'Submitted') return 'bg-emerald-50 text-emerald-700'
  if (effectiveStatus === 'In Progress') return 'bg-[#efeaff] text-[#5140b6]'
  if (effectiveStatus === 'Overdue') return 'bg-red-50 text-red-700'
  return 'bg-slate-100 text-slate-600'
}

export function statusTextClass(status) {
  const effectiveStatus = status || 'Not Started'
  if (effectiveStatus === 'Submitted') return 'text-emerald-700'
  if (effectiveStatus === 'In Progress') return 'text-[#5140b6]'
  if (effectiveStatus === 'Overdue') return 'text-red-700'
  return 'text-slate-500'
}

export function priorityClass(priority) {
  if (priority === 'High') return 'bg-red-50 text-red-700'
  if (priority === 'Low') return 'bg-teal-50 text-teal-700'
  return 'bg-amber-50 text-amber-700'
}

export function priorityBarClass(priority) {
  if (priority === 'High') return 'bg-red-500'
  if (priority === 'Low') return 'bg-teal-400'
  return 'bg-amber-400'
}

export function statusLabel(status) {
  const effectiveStatus = status || 'Not Started'
  if (effectiveStatus === 'Submitted') return 'Đã nộp'
  if (effectiveStatus === 'In Progress') return 'Đang làm'
  if (effectiveStatus === 'Overdue') return 'Quá hạn'
  return 'Chưa bắt đầu'
}

export function priorityLabel(priority) {
  if (priority === 'High') return 'Cao'
  if (priority === 'Low') return 'Thấp'
  return 'Trung bình'
}

export function buildQuery(params) {
  const search = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value)
  })

  const query = search.toString()
  return query ? `?${query}` : ''
}
