import { getDisplayStatus } from '../utils/deadlineStatus'

function getAlertType(deadline) {
  const status = getDisplayStatus(deadline)
  if (status === 'Overdue') return 'overdue'

  const now = new Date()
  const due = new Date(deadline.due_date)
  const diffDays = (due - now) / (1000 * 60 * 60 * 24)

  if (diffDays <= 3) return 'near-due'

  return null
}

const ALERT_STYLE = {
  overdue: {
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-700',
    label: 'Overdue',
  },
  'near-due': {
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-700',
    label: 'Due soon',
  },
}

export default function ReminderAlert({ deadlines }) {
  const alerts = deadlines
    .filter((deadline) => getDisplayStatus(deadline) !== 'Submitted')
    .map((deadline) => ({ deadline, type: getAlertType(deadline) }))
    .filter(({ type }) => type !== null)

  if (alerts.length === 0) return null

  return (
    <div className="mb-6 flex flex-col gap-2">
      {alerts.map(({ deadline, type }) => {
        const style = ALERT_STYLE[type]
        return (
          <div
            key={deadline.id}
            className={`flex items-center justify-between rounded-lg border px-4 py-3 ${style.bg}`}
          >
            <div>
              <span className={`text-xs font-semibold ${style.text}`}>
                {style.label}
              </span>
              <p className={`mt-0.5 text-sm font-medium ${style.text}`}>
                {deadline.title}
              </p>
              <p className={`mt-0.5 text-xs ${style.text} opacity-70`}>
                {deadline.course?.course_name ?? 'No course'} - Due:{' '}
                {new Date(deadline.due_date).toLocaleString('vi-VN', {
                  timeZone: 'Asia/Ho_Chi_Minh',
                })}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
