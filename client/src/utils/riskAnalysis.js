const DAY_MS = 24 * 60 * 60 * 1000

export const RISK_META = {
  urgent: {
    key: 'urgent',
    label: 'Khẩn cấp',
    dot: 'bg-red-500',
    text: 'text-red-700',
    softText: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-100',
    bar: 'bg-red-500',
    badge: 'bg-red-50 text-red-700',
  },
  upcoming: {
    key: 'upcoming',
    label: 'Sắp tới',
    dot: 'bg-amber-500',
    text: 'text-amber-700',
    softText: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    bar: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700',
  },
  stable: {
    key: 'stable',
    label: 'Ổn định',
    dot: 'bg-teal-500',
    text: 'text-teal-700',
    softText: 'text-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
    bar: 'bg-teal-400',
    badge: 'bg-teal-50 text-teal-700',
  },
}

export function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value))
}

export function daysUntil(dueDate, now = new Date()) {
  if (!dueDate) return null
  return (new Date(dueDate) - now) / DAY_MS
}

function priorityWeight(priority) {
  if (priority === 'High') return 18
  if (priority === 'Low') return -8
  return 0
}

function urgencyFromDays(daysLeft) {
  if (daysLeft <= 0) return 100
  if (daysLeft <= 1) return 92
  if (daysLeft <= 2) return 82
  if (daysLeft <= 3) return 72
  if (daysLeft <= 5) return 58
  if (daysLeft <= 7) return 46
  if (daysLeft <= 10) return 34
  if (daysLeft <= 14) return 24
  if (daysLeft <= 21) return 14
  return 6
}

export function categoryFromScore(score) {
  if (score >= 70) return 'urgent'
  if (score >= 40) return 'upcoming'
  return 'stable'
}

export function riskLevelLabel(score) {
  if (score >= 70) return 'Rất cao'
  if (score >= 50) return 'Cao'
  if (score >= 30) return 'Trung bình'
  if (score >= 15) return 'Thấp'
  return 'Rất thấp'
}

export function isActive(deadline) {
  return deadline?.status !== 'Submitted'
}

/**
 * Heuristic risk score (0-100) for a single deadline based on time
 * remaining and priority. Also returns the projected change in score
 * for tomorrow, used as a lightweight "trend" indicator.
 */
export function computeDeadlineRisk(deadline, now = new Date()) {
  const daysLeft = daysUntil(deadline?.due_date, now)

  if (daysLeft === null || !isActive(deadline)) {
    return { score: 0, daysLeft, category: 'stable', trend: 0 }
  }

  const weight = priorityWeight(deadline.priority)
  const score = Math.round(clamp(urgencyFromDays(daysLeft) + weight))
  const tomorrowScore = Math.round(clamp(urgencyFromDays(daysLeft - 1) + weight))

  return {
    score,
    daysLeft,
    category: categoryFromScore(score),
    trend: tomorrowScore - score,
  }
}

export function activeDeadlines(deadlines = []) {
  return deadlines.filter(isActive)
}

/**
 * Aggregate risk across a list of deadlines (e.g. for a week or a course).
 */
export function summarizeRisk(deadlines = [], now = new Date()) {
  const active = activeDeadlines(deadlines)
  const scored = active
    .map((deadline) => ({ deadline, risk: computeDeadlineRisk(deadline, now) }))
    .sort((a, b) => b.risk.score - a.risk.score)

  const counts = { urgent: 0, upcoming: 0, stable: 0 }
  let scoreSum = 0

  scored.forEach(({ risk }) => {
    counts[risk.category] += 1
    scoreSum += risk.score
  })

  const avgScore = scored.length ? Math.round(scoreSum / scored.length) : 0

  return {
    total: active.length,
    avgScore,
    level: riskLevelLabel(avgScore),
    counts,
    scored,
    riskiest: scored[0] || null,
  }
}

/**
 * Groups deadlines by their course so a per-course breakdown can be shown.
 */
export function groupByCourse(deadlines = []) {
  const map = new Map()

  deadlines.forEach((deadline) => {
    const course = deadline.course || { id: 'no-course', course_name: 'Chưa gán môn học', course_code: '' }
    const key = course.id || 'no-course'

    if (!map.has(key)) {
      map.set(key, { course, deadlines: [] })
    }

    map.get(key).deadlines.push(deadline)
  })

  return Array.from(map.values())
}

export function computeCourseRisk(courseDeadlines, now = new Date()) {
  const active = activeDeadlines(courseDeadlines)

  if (active.length === 0) {
    return { score: 0, category: 'stable', nearestDays: null, count: 0, trend: 0 }
  }

  const scored = active.map((deadline) => computeDeadlineRisk(deadline, now))
  const maxScore = Math.max(...scored.map((item) => item.score))
  const avgScore = Math.round(scored.reduce((sum, item) => sum + item.score, 0) / scored.length)
  const score = Math.round(clamp(maxScore * 0.7 + avgScore * 0.3))
  const nearestDays = Math.min(...scored.map((item) => item.daysLeft))
  const trend = Math.round(scored.reduce((sum, item) => sum + item.trend, 0) / scored.length)

  return {
    score,
    category: categoryFromScore(score),
    nearestDays,
    count: active.length,
    trend,
  }
}

export function formatDaysLeft(daysLeft) {
  if (daysLeft === null || daysLeft === undefined || Number.isNaN(daysLeft)) return 'Chưa rõ'
  if (daysLeft < 0) return `Quá hạn ${Math.ceil(Math.abs(daysLeft))} ngày`
  if (daysLeft < 1) return 'Hôm nay'
  if (daysLeft < 2) return 'Ngày mai'
  return `${Math.ceil(daysLeft)} ngày`
}

export function weekdayLabel(date) {
  const labels = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
  return labels[new Date(date).getDay()]
}

/**
 * Finds the calendar day (within the supplied deadlines) where the most
 * deadlines collide, which is the scenario the AI assistant warns about.
 */
export function findBusiestDay(deadlines = []) {
  const buckets = new Map()

  activeDeadlines(deadlines).forEach((deadline) => {
    if (!deadline.due_date) return
    const dayKey = new Date(deadline.due_date).toDateString()
    if (!buckets.has(dayKey)) buckets.set(dayKey, [])
    buckets.get(dayKey).push(deadline)
  })

  let busiest = null
  buckets.forEach((items, dayKey) => {
    if (!busiest || items.length > busiest.items.length) {
      busiest = { dayKey, items }
    }
  })

  return busiest
}
