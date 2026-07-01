import { getDisplayStatus } from './deadlineStatus'

export function filterDeadlines(deadlines, filters) {
  const { q, course_id, status, priority, from, to } = filters

  return deadlines.filter((deadline) => {
    if (q && !deadline.title.toLowerCase().includes(q.toLowerCase())) return false

    if (course_id && deadline.course?.id !== course_id) return false

    if (status && getDisplayStatus(deadline) !== status) return false

    if (priority && deadline.priority !== priority) return false

    if (from && new Date(deadline.due_date) < new Date(from)) return false

    if (to && new Date(deadline.due_date) > new Date(to)) return false

    return true
  })
}
