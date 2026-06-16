import { getDisplayStatus, STATUS_COLOR, STATUS_LABEL } from '../utils/deadlineStatus'

const colorClass = {
  gray: 'bg-slate-100 text-slate-600',
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
}

export default function StatusBadge({ deadline }) {
  const status = getDisplayStatus(deadline)
  const color = STATUS_COLOR[status]

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colorClass[color]}`}>
      {STATUS_LABEL[status]}
    </span>
  )
}
