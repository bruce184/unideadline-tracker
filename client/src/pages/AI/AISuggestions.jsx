import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Bell, Bot, Send, Sparkles, User } from 'lucide-react'
import Layout from '../../components/Layout'
import PageHeader from '../../components/PageHeader'
import { useAuth } from '../../hooks/useAuth'
import { getWeeklyDashboard } from '../../services/dashboardService'
import { formatDateTime, getMonday, toDateInputValue } from '../../utils/deadlineUtils'
import {
  RISK_META,
  findBusiestDay,
  formatDaysLeft,
  summarizeRisk,
  weekdayLabel,
} from '../../utils/riskAnalysis'
import { generateAssistantReply } from '../../utils/aiAssistant'

const QUICK_PROMPTS = [
  'Tuần này tôi nên làm gì?',
  'Deadline nào nguy hiểm nhất?',
  'Lập lịch học cho tôi',
]

function getInitials(user) {
  const source = user?.display_name || user?.email || 'U'
  const parts = source.split(/[\s@.]+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

function buildIntroMessage(summary, busiestDay) {
  if (!summary.total) {
    return 'Chào bạn! Tuần này bạn chưa có deadline nào đang hoạt động. Cứ thoải mái nhé, hoặc hỏi tôi để lên kế hoạch trước cho tuần sau.'
  }

  if (busiestDay && busiestDay.items.length > 1) {
    return `Chào bạn! Tôi đã phân tích lịch học và deadline tuần này của bạn. Có vẻ như ${weekdayLabel(busiestDay.dayKey)} sẽ là thời điểm "nóng" nhất, với ${busiestDay.items.length} deadline dồn vào cùng lúc.`
  }

  return `Chào bạn! Tôi đã phân tích lịch học và deadline tuần này của bạn. "${summary.riskiest.deadline.title}" hiện là việc cần chú ý nhất.`
}

export default function AISuggestions() {
  const { user } = useAuth()
  const [weekStart] = useState(toDateInputValue(getMonday()))
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const scrollRef = useRef(null)

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const { data } = await getWeeklyDashboard({ week_start: weekStart })
      setDashboard(data)
      const sum = summarizeRisk(data?.deadlines || [])
      const busiest = findBusiestDay(data?.deadlines || [])
      setMessages([{ id: 'intro', role: 'assistant', content: buildIntroMessage(sum, busiest) }])
    } catch (err) {
      setError(err?.message || 'Không thể tải dữ liệu deadline tuần này')
    } finally {
      setLoading(false)
    }
  }, [weekStart])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDashboard()
    }, 0)
    return () => clearTimeout(timer)
  }, [fetchDashboard])

  const deadlines = useMemo(() => dashboard?.deadlines || [], [dashboard])
  const summary = useMemo(() => summarizeRisk(deadlines), [deadlines])
  const busiestDay = useMemo(() => findBusiestDay(deadlines), [deadlines])
 
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, thinking])
 
  // CHUYỂN THÀNH HÀM ASYNC ĐỂ CHỜ GEMINI API TRẢ LỜI THẬT
  const sendMessage = async (text) => {
    const trimmed = text.trim()
    if (!trimmed || thinking) return
 
    const userMessage = { id: `u-${Date.now()}`, role: 'user', content: trimmed }
     
    // Sao lưu trạng thái hội thoại trước khi update để đính kèm làm history gửi đi
    const currentMessages = [...messages]
 
    setMessages((current) => [...current, userMessage])
    setInput('')
    setThinking(true)
 
    try {
      // Format history trò chuyện cũ theo chuẩn của ứng dụng đưa lên backend xử lý tiếp
      const formattedHistory = currentMessages.map((msg) => ({
        sender: msg.role === 'user' ? 'user' : 'bot',
        text: msg.content
      }))
 
      // Gọi hàm tích hợp AI thật
      const reply = await generateAssistantReply(
        trimmed, 
        { summary, busiestDay }, 
        formattedHistory
      )
 
      setMessages((current) => [
        ...current, 
        { id: `a-${Date.now()}`, role: 'assistant', content: reply }
      ])
    } catch {
      setMessages((current) => [
        ...current, 
        { id: `a-${Date.now()}`, role: 'assistant', content: 'Rất tiếc, AI không thể phản hồi vào lúc này.' }
      ])
    } finally {
      setThinking(false)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    sendMessage(input)
  }

  const riskiest = summary.riskiest
  const riskiestMeta = riskiest ? RISK_META[riskiest.risk.category] : null
  const estimatedHours = riskiest ? Math.max(2, Math.round((riskiest.risk.score / 100) * 14)) : 0

  const clusterPct = busiestDay
    ? Math.max(15, Math.min(85, 100 - Math.round(busiestDay.items.length * 12 + summary.avgScore * 0.4)))
    : null

  return (
    <Layout>
      <PageHeader
        eyebrow="UniDeadline Tracker"
        title="Gợi ý AI"
        description="Trợ lý đọc dữ liệu deadline trong tuần, phát hiện rủi ro và đề xuất bước tiếp theo để luồng AI thật rõ ràng."
        meta={
          <>
            <span className="rounded-full bg-[#f0ebff] px-3 py-1 text-xs font-semibold text-[#5140b6]">
              Deadline tuần này: {loading ? '-' : summary.total}
            </span>
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
              Rủi ro: {loading ? '-' : summary.level}
            </span>
            <span
              className="max-w-full truncate rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 xl:max-w-[360px]"
              title={riskiest?.deadline?.title || 'Không có deadline rủi ro cao'}
            >
              Ưu tiên: {riskiest ? riskiest.deadline.title : 'Không có deadline rủi ro cao'}
            </span>
          </>
        }
        actions={
          <>
            <Link
              to="/deadlines/new"
              className="rounded-lg border border-[#e9e2fb] bg-white px-4 py-2 text-sm font-semibold text-[#5140b6] shadow-sm hover:bg-[#f5f1ff]"
            >
              Thêm deadline
            </Link>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#f0ebff] text-[#5b45d8]">
              <Bell className="h-4 w-4" />
            </span>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#5b45d8] text-xs font-bold text-white">
              {getInitials(user)}
            </span>
          </>
        }
      />

      {error && (
        <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
          <button onClick={fetchDashboard} className="mt-2 font-semibold text-red-800 hover:underline">
            Thử lại
          </button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.55fr_0.9fr]">
        {/* Chat column */}
        <section className="flex min-h-[620px] flex-col rounded-2xl border border-[#e9e2fb] bg-white shadow-[0_14px_40px_rgba(91,69,170,0.07)]">
          <div className="flex items-center justify-between border-b border-[#eee8ff] px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-950">Chat AI gợi ý</p>
              <p className="mt-1 text-xs text-slate-500">Hỏi trực tiếp về ưu tiên, lịch học hoặc rủi ro deadline.</p>
            </div>
            <span className="rounded-full bg-[#f0ebff] px-3 py-1 text-xs font-semibold text-[#5140b6]">
              Sẵn sàng Gemini
            </span>
          </div>
          <div ref={scrollRef} className="max-h-[640px] flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
            {loading ? (
              <div className="p-8 text-center text-slate-400">Đang phân tích deadline...</div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                        message.role === 'user' ? 'bg-[#f0ebff] text-[#5140b6]' : 'bg-[#5b45d8] text-white'
                      }`}
                    >
                      {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </span>
                    <div
                      className={`max-w-[80%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm ${
                        message.role === 'user'
                          ? 'bg-[#5b45d8] text-white'
                          : 'border border-[#eee8ff] bg-[#fbfaff] text-slate-700'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}

                {thinking && (
                  <div className="flex items-start gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#5b45d8] text-white">
                      <Bot className="h-4 w-4" />
                    </span>
                    <div className="rounded-2xl border border-[#eee8ff] bg-[#fbfaff] px-4 py-3 text-sm text-slate-400">
                      Đang soạn câu trả lời từ Gemini...
                    </div>
                  </div>
                )}

                {riskiest && (
                  <div className="rounded-2xl border border-red-100 bg-white p-4">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertTriangle className="h-4 w-4" />
                      <p className="text-sm font-semibold">Ưu tiên deadline</p>
                    </div>
                    <p className="mt-2 font-semibold text-slate-950">{riskiest.deadline.title}</p>
                    <div className="mt-3 h-2 rounded-full bg-[#fde2e2]">
                      <div
                        className={`h-full rounded-full ${riskiestMeta.bar}`}
                        style={{ width: `${riskiest.risk.score}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      AI ước tính cần khoảng {estimatedHours} giờ làm việc tập trung. Hạn chót:{' '}
                      {formatDateTime(riskiest.deadline.due_date)} ({formatDaysLeft(riskiest.risk.daysLeft)}).
                    </p>
                  </div>
                )}

                {busiestDay && busiestDay.items.length > 1 && (
                  <div className="rounded-2xl border border-amber-100 bg-white p-4">
                    <div className="flex items-center gap-2 text-amber-700">
                      <AlertTriangle className="h-4 w-4" />
                      <p className="text-sm font-semibold">Cảnh báo rủi ro</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      Bạn đang có {busiestDay.items.length} deadline dồn vào cùng một ngày ({weekdayLabel(busiestDay.dayKey)}).
                      AI dự báo khả năng hoàn thành đúng hạn chỉ đạt {clusterPct}% nếu không bắt đầu ngay hôm nay.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        to="/deadlines"
                        className="rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50"
                      >
                        Xem chi tiết
                      </Link>
                      <button
                        onClick={() => sendMessage('Lập lịch học cho tôi')}
                        className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600"
                      >
                        Tối ưu ngay
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="border-t border-[#eee8ff] p-3 sm:p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="rounded-full border border-[#eee8ff] bg-[#fbfaff] px-3 py-1.5 text-xs font-medium text-[#5140b6] hover:bg-[#f0ebff]"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Hỏi AI về deadline của bạn..."
                className="flex-1 rounded-xl border border-[#e5def8] bg-[#fbfaff] px-4 py-2.5 text-sm outline-none focus:border-[#6b5bd6] focus:ring-2 focus:ring-[#eee8ff]"
              />
              <button
                type="submit"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#5b45d8] text-white hover:bg-[#4933c5]"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>

        {/* Right summary panel */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-[#e9e2fb] bg-white p-5 shadow-[0_14px_40px_rgba(91,69,170,0.07)]">
            <p className="font-semibold text-slate-950">Tổng quan tuần này</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#eee8ff] bg-[#fbfaff] p-3">
                <p className="text-xs font-semibold uppercase text-slate-400">Tổng deadline</p>
                <p className="mt-2 text-2xl font-bold text-slate-950">{loading ? '-' : String(summary.total).padStart(2, '0')}</p>
              </div>
              <div className="rounded-xl border border-[#eee8ff] bg-[#fbfaff] p-3">
                <p className="text-xs font-semibold uppercase text-slate-400">Mức độ rủi ro</p>
                <p className="mt-2 text-2xl font-bold text-red-600">{loading ? '-' : summary.level}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e9e2fb] bg-white p-5 shadow-[0_14px_40px_rgba(91,69,170,0.07)]">
            <p className="text-sm font-semibold text-slate-900">Dự báo rủi ro thời gian</p>
            <div className="mt-4 flex justify-center">
              <RiskDonut score={loading ? 0 : summary.avgScore} />
            </div>
            <div className="mt-4 space-y-2 text-sm">
              {Object.values(RISK_META).map((meta) => (
                <div key={meta.key} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                    {meta.label}
                  </span>
                  <span className="font-semibold text-slate-900">{loading ? '-' : summary.counts[meta.key]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-[#f1edff] p-5">
            <div className="flex items-center gap-2 text-[#5140b6]">
              <Sparkles className="h-4 w-4" />
              <p className="text-sm font-semibold">AI Insight</p>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Dựa trên dữ liệu học tập lịch sử, bạn thường làm việc hiệu quả nhất từ 20:00 - 23:00.
              {riskiest
                ? ` AI đã ưu tiên "${riskiest.deadline.title}" để bạn tận dụng tốt khung giờ này.`
                : ' Hãy tận dụng khung giờ này khi có deadline mới.'}
            </p>
          </div>
        </aside>
      </div>
    </Layout>
  )
}

function RiskDonut({ score }) {
  const radius = 64
  const stroke = 14
  const normalizedRadius = radius - stroke / 2
  const circumference = 2 * Math.PI * normalizedRadius
  const offset = circumference - (Math.max(0, Math.min(100, score)) / 100) * circumference

  return (
    <div className="relative h-36 w-36">
      <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
        <circle
          stroke="#f3eefe"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="#ef4444"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 0.6s ease' }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-950">{score}%</p>
          <p className="text-[10px] font-semibold uppercase text-slate-400">Tải lượng</p>
        </div>
      </div>
    </div>
  )
}
