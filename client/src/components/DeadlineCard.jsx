import StatusBadge from './StatusBadge'
import StatusSelect from './StatusSelect'

export default function DeadlineCard({ deadline, onUpdated }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-slate-900">{deadline.title}</p>
          <p className="mt-1 text-sm text-slate-500">
            {deadline.course?.course_name ?? 'No course'}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Due:{' '}
            {new Date(deadline.due_date).toLocaleString('vi-VN', {
              timeZone: 'Asia/Ho_Chi_Minh',
            })}
          </p>
          {deadline.submission_link ? (
            <a
              href={deadline.submission_link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block break-all text-xs text-blue-600 underline hover:text-blue-800"
            >
              Open submission link
            </a>
          ) : (
            <p className="mt-2 text-xs text-slate-300">
              No submission link
            </p>
          )}
        </div>
        <StatusBadge deadline={deadline} />
      </div>
      <div className="mt-3 border-t border-slate-100 pt-3">
        <StatusSelect deadline={deadline} onUpdated={onUpdated} />
      </div>
    </div>
  )
}
