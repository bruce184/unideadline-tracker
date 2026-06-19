import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Minus, Sparkles, TrendingDown, TrendingUp } from 'lucide-react'
import Layout from '../../components/Layout'
import { useAuth } from '../../hooks/useAuth'
import { listDeadlines } from '../../services/deadlineService'
import {
  RISK_META,
  computeCourseRisk,
  daysUntil,
  formatDaysLeft,
  groupByCourse,
  isActive,
  riskLevelLabel,
} from '../../utils/riskAnalysis'

const HORIZON_OPTIONS = [
  { value: 'all', label: 'Tất cả deadline đang hoạt động' },
  { value: '7', label: '7 ngày tới' },
  { value: '30', label: '30 ngày tới' },
]

function getInitials(user) {
  const source = user?.display_name || user?.email || 'U'
  const parts = source.split(/[\s@.]+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

function TrendIndicator({ trend }) {
  if (trend > 1) {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-red-600">
        <TrendingUp className="h-3.5 w-3.5" /> +{trend}%
      </span>
    )
  }
  if (trend < -1) {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-teal-600">
        <TrendingDown className="h-3.5 w-3.5" /> {trend}%
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 text-xs font-semibold text-slate-400">
      <Minus className="h-3.5 w-3.5" /> 0%
    </span>
  )
}

export default function RiskAnalysis() {
  const { user } = useAuth()
  const [horizon, setHorizon] = useState('all')
  const [deadlines, setDeadlines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDeadlines = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const { data } = await listDeadlines({ limit: 100, sort_by: 'due_date', sort_order: 'asc' })
      setDeadlines(data || [])
    } catch (err) {
      setError(err?.message || 'Không thể tải danh sách deadline')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDeadlines()
    }, 0)
    return () => clearTimeout(timer)
  }, [fetchDeadlines])

  const filteredActive = useMemo(() => {
    return deadlines.filter((deadline) => {
      if (!isActive(deadline)) return false
      if (horizon === 'all') return true
      const days = daysUntil(deadline.due_date)
      return days === null || days <= Number(horizon)
    })
  }, [deadlines, horizon])

  const courseRisks = useMemo(() => {
    return groupByCourse(filteredActive)
      .map(({ course, deadlines: courseDeadlines }) => ({
        course,
        risk: computeCourseRisk(courseDeadlines),
      }))
      .filter(({ risk }) => risk.count > 0)
      .sort((a, b) => b.risk.score - a.risk.score)
  }, [filteredActive])

  const topCourse = courseRisks[0]
  const stableCourse = [...courseRisks].reverse().find((item) => item.risk.category === 'stable')

  return (
    <Layout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#6b5bd6]">UniDeadline Tracker</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Phân tích rủi ro</h1>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={horizon}
            onChange={(event) => setHorizon(event.target.value)}
            className="rounded-lg border border-[#e5def8] bg-white px-3 py-2 text-sm font-medium text-[#5140b6] outline-none focus:border-[#6b5bd6] focus:ring-2 focus:ring-[#eee8ff]"
          >
            {HORIZON_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#f0ebff] text-[#5b45d8]">
            <Bell className="h-4 w-4" />
          </span>
          <Link
            to="/deadlines/new"
            className="rounded-lg bg-[#5b45d8] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#4933c5]"
          >
            Thêm Deadline
          </Link>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#5b45d8] text-xs font-bold text-white">
            {getInitials(user)}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
          <button onClick={fetchDeadlines} className="mt-2 font-semibold text-red-800 hover:underline">
            Thử lại
          </button>
        </div>
      )}

      <section className="rounded-2xl border border-[#e9e2fb] bg-white p-4 shadow-[0_14px_40px_rgba(91,69,170,0.07)] sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-950">Mức độ rủi ro theo môn học</h2>
            <p className="mt-1 text-sm text-slate-500">Dựa trên khối lượng công việc và thời gian còn lại</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            {Object.values(RISK_META).map((meta) => (
              <span key={meta.key} className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                {meta.label}
              </span>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400">Đang tải...</div>
        ) : courseRisks.length === 0 ? (
          <div className="p-8 text-center text-slate-400">Không có deadline nào để phân tích trong khoảng thời gian này.</div>
        ) : (
          <div className="mt-5 space-y-5">
            {courseRisks.map(({ course, risk }) => {
              const meta = RISK_META[risk.category]
              return (
                <div key={course.id}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{course.course_name}</span>
                    <span className={`font-semibold ${meta.text}`}>
                      {risk.score}% ({riskLevelLabel(risk.score)})
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-[#f1edff]">
                    <div className={`h-full rounded-full ${meta.bar}`} style={{ width: `${risk.score}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {!loading && courseRisks.length > 0 && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {courseRisks.map(({ course, risk }) => {
            const meta = RISK_META[risk.category]
            return (
              <div
                key={course.id}
                className="rounded-2xl border border-[#e9e2fb] bg-white p-5 shadow-[0_14px_40px_rgba(91,69,170,0.07)]"
              >
                <div className="flex items-center justify-between">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${meta.badge}`}>{meta.label}</span>
                  <TrendIndicator trend={risk.trend} />
                </div>
                <p className="mt-3 font-semibold text-slate-950">{course.course_name}</p>
                {course.course_code && <p className="text-xs text-slate-400">{course.course_code}</p>}
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-slate-400">Số deadline</p>
                    <p className="mt-1 text-lg font-bold text-slate-950">{risk.count}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-slate-400">Rủi ro TB</p>
                    <p className={`mt-1 text-lg font-bold ${meta.text}`}>{risk.score}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-slate-400">Hạn gần nhất</p>
                    <p className="mt-1 text-lg font-bold text-slate-950">{formatDaysLeft(risk.nearestDays)}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!loading && courseRisks.length > 0 && (
        <div className="mt-4 rounded-2xl bg-[#f1edff] p-5">
          <div className="flex items-center gap-2 text-[#5140b6]">
            <Sparkles className="h-4 w-4" />
            <p className="text-sm font-semibold">AI Insight & Khuyến nghị</p>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {topCourse && (
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5b45d8]" />
                <span>
                  Ưu tiên tập trung vào môn <strong className="text-slate-900">{topCourse.course.course_name}</strong> trong{' '}
                  {formatDaysLeft(topCourse.risk.nearestDays).toLowerCase()} tới để tránh dồn ứ khối lượng bài tập cuối kỳ.
                </span>
              </li>
            )}
            {stableCourse && stableCourse.course.id !== topCourse?.course.id && (
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5b45d8]" />
                <span>
                  Môn <strong className="text-slate-900">{stableCourse.course.course_name}</strong> đang ở mức ổn định, bạn có thể
                  duy trì tiến độ hiện tại.
                </span>
              </li>
            )}
          </ul>
        </div>
      )}
    </Layout>
  )
}
