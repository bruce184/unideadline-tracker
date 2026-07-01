export function getDisplayStatus(deadline) {
  if (deadline.status === 'Submitted') return 'Submitted'

  const now = new Date()
  const due = new Date(deadline.due_date)

  if (due < now) return 'Overdue'

  return deadline.status
}

export const STATUS_OPTIONS = ['Not Started', 'In Progress', 'Submitted']

export const STATUS_LABEL = {
  'Not Started': 'Not Started',
  'In Progress': 'In Progress',
  Submitted: 'Submitted',
  Overdue: 'Overdue',
}

export const STATUS_COLOR = {
  'Not Started': 'gray',
  'In Progress': 'blue',
  Submitted: 'green',
  Overdue: 'red',
}
