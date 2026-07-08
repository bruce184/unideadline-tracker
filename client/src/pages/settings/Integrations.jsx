import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import {
  getGmailStatus,
  connectGmail,
  importFromGmail,
  disconnectGmail,
} from '../../services/gmailService'
import { listCourses } from '../../services/courseService'

export default function Integrations() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [connected, setConnected] = useState(false)
  const [connectedAt, setConnectedAt] = useState(null)
  const [loadingStatus, setLoadingStatus] = useState(true)

  const [days, setDays] = useState(7)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [loadingCourses, setLoadingCourses] = useState(true)

  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)

  const [toast, setToast] = useState(null)
  const toastTimerRef = useRef(null)

  const showToast = useCallback((message, type = 'success') => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current)
    }

    setToast({ message, type })
    toastTimerRef.current = window.setTimeout(() => setToast(null), 4000)
  }, [])

  useEffect(() => () => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current)
    }
  }, [])

  const fetchStatus = useCallback(async () => {
    try {
      setLoadingStatus(true)
      const data = await getGmailStatus()
      setConnected(data.connected)
      setConnectedAt(data.connectedAt)
    } catch {
      // setConnected(false)
      console.error('fetchStatus error')
    } finally {
      setLoadingStatus(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchStatus()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [fetchStatus])

  // Đọc query param sau khi OAuth callback redirect về
  useEffect(() => {
    const gmailParam = searchParams.get('gmail')
    if (gmailParam !== 'connected' && gmailParam !== 'error') {
      return undefined
    }

    const handleOAuthCallback = () => {
      if (gmailParam === 'connected') {
        showToast('Kết nối Gmail thành công!')
        setConnected(true)
        fetchStatus()
        setSearchParams({})
      } else if (gmailParam === 'error') {
        showToast('Kết nối Gmail thất bại. Vui lòng thử lại.', 'error')
        setSearchParams({})
      }
    }

    const timeoutId = window.setTimeout(handleOAuthCallback, 0)

    return () => window.clearTimeout(timeoutId)
  }, [searchParams, setSearchParams, fetchStatus, showToast])

  const fetchCourses = useCallback(async () => {
    try {
      setLoadingCourses(true)
      const { data } = await listCourses({ limit: 100, sort_order: 'asc' })
      const courseList = data || []

      setCourses(courseList)
      setSelectedCourseId((currentCourseId) => {
        if (courseList.some((course) => course.id === currentCourseId)) {
          return currentCourseId
        }

        return courseList[0]?.id || ''
      })
    } catch {
      setCourses([])
      setSelectedCourseId('')
      showToast('Không thể tải danh sách môn học', 'error')
    } finally {
      setLoadingCourses(false)
    }
  }, [showToast])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchCourses()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [fetchCourses])

  const handleConnect = async () => {
    try {
      setConnecting(true)
      await connectGmail()
    } catch (err) {
      showToast(err.message || 'Không thể kết nối Gmail', 'error')
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (!window.confirm('Ngắt kết nối Gmail? Các deadline đã import sẽ được giữ lại.')) return
    try {
      setDisconnecting(true)
      await disconnectGmail()
      setConnected(false)
      setConnectedAt(null)
      setImportResult(null)
      showToast('Đã ngắt kết nối Gmail')
    } catch (err) {
      showToast(err.message || 'Có lỗi xảy ra', 'error')
    } finally {
      setDisconnecting(false)
    }
  }

  const handleImport = async () => {
    if (!selectedCourseId) {
      showToast('Chọn môn học trước khi import từ Gmail', 'error')
      return
    }

    try {
      setImporting(true)
      setImportResult(null)
      const result = await importFromGmail(days, selectedCourseId)
      setImportResult(result)
      if (result.imported > 0) {
        showToast(`Đã import ${result.imported} deadline mới từ Gmail!`)
      } else {
        showToast('Không tìm thấy deadline mới trong email.', 'info')
      }
    } catch (err) {
      showToast(err.message || 'Import thất bại', 'error')
    } finally {
      setImporting(false)
    }
  }

  const formatDate = (iso) => {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <Layout>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white transition-all ${
          toast.type === 'error' ? 'bg-red-500' :
          toast.type === 'info' ? 'bg-blue-500' : 'bg-emerald-500'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="flex justify-between items-center px-4 py-3 w-full bg-white rounded-2xl border border-[#e9e2fb] mb-6 shadow-[0_14px_40px_rgba(91,69,170,0.03)]">
        <h2 className="text-xl font-bold text-slate-900">Tích hợp & Đồng bộ</h2>
      </header>

      <div className="max-w-4xl mx-auto space-y-6 pb-10">

        {/* Banner */}
        <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-[40px] text-red-500 bg-red-50 p-2.5 rounded-xl border border-red-100 shrink-0">
              mail
            </span>
            <div>
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                Gmail Integration
                <span className="bg-gradient-to-r from-violet-500 to-[#3b309e] text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[10px] font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                    auto_awesome
                  </span>
                  AI Powered
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Tự động đọc email Gmail và dùng AI để trích xuất deadline, tạo nhắc nhở tức thì.
              </p>
            </div>
          </div>
        </section>

        {/* Main cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Card trái: trạng thái kết nối */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              Trạng thái kết nối
              <span className="material-symbols-outlined text-[18px] text-slate-400">link</span>
            </h4>

            {loadingStatus ? (
              <div className="flex items-center justify-center py-12 text-slate-400 text-xs gap-2">
                <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                Đang kiểm tra...
              </div>
            ) : connected ? (
              <div className="text-center py-8 space-y-3">
                <span className="material-symbols-outlined text-[52px] text-emerald-500">check_circle</span>
                <div>
                  <p className="text-sm font-bold text-slate-800">Gmail đã kết nối</p>
                  {connectedAt && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Từ {formatDate(connectedAt)}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="text-xs text-red-500 font-semibold hover:underline disabled:opacity-50 cursor-pointer"
                >
                  {disconnecting ? 'Đang ngắt...' : 'Ngắt kết nối'}
                </button>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <span className="material-symbols-outlined text-[52px] text-slate-300">mail_off</span>
                <div>
                  <p className="text-sm font-bold text-slate-700">Chưa kết nối Gmail</p>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Kết nối để AI tự động tìm deadline trong email của bạn.
                  </p>
                </div>
                <button
                  onClick={handleConnect}
                  disabled={connecting}
                  className="flex items-center gap-2 mx-auto bg-[#3b309e] text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#2e2482] transition disabled:opacity-60 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">mail</span>
                  {connecting ? 'Đang chuyển hướng...' : 'Kết nối Gmail'}
                </button>
              </div>
            )}
          </section>

          {/* Card phải: import */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              Import deadline từ Gmail
              <span className="material-symbols-outlined text-[18px] text-slate-400">download</span>
            </h4>

            {connected ? (
              <div className="space-y-4">
                {/* Chọn khoảng thời gian */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">
                    Quét email trong
                  </label>
                  <div className="flex gap-2">
                    {[7, 30].map((d) => (
                      <button
                        key={d}
                        onClick={() => setDays(d)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          days === d
                            ? 'bg-[#3b309e] text-white border-[#3b309e]'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-[#3b309e]'
                        }`}
                      >
                        {d} ngày gần nhất
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chọn môn học để gắn deadline import */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">
                    Gắn deadline vào môn
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(event) => setSelectedCourseId(event.target.value)}
                    disabled={loadingCourses || importing || courses.length === 0}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none transition focus:border-[#3b309e] focus:ring-2 focus:ring-[#3b309e]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loadingCourses ? (
                      <option value="">Đang tải môn học...</option>
                    ) : courses.length > 0 ? (
                      courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.course_code ? `${course.course_code} - ${course.course_name}` : course.course_name}
                        </option>
                      ))
                    ) : (
                      <option value="">Chưa có môn học</option>
                    )}
                  </select>
                  {!loadingCourses && courses.length === 0 && (
                    <p className="mt-2 text-[10px] text-amber-600">
                      Tạo ít nhất một môn học trước khi import deadline từ Gmail.
                    </p>
                  )}
                </div>

                {/* Nút import */}
                <button
                  onClick={handleImport}
                  disabled={importing || loadingCourses || !selectedCourseId}
                  className="w-full flex items-center justify-center gap-2 bg-[#3b309e] text-white py-2.5 rounded-xl text-xs font-bold hover:bg-[#2e2482] transition disabled:opacity-60 cursor-pointer"
                >
                  <span className={`material-symbols-outlined text-[16px] ${importing ? 'animate-spin' : ''}`}>
                    {importing ? 'refresh' : 'sync'}
                  </span>
                  {importing ? 'Đang import...' : 'Import ngay'}
                </button>

                {/* Kết quả import */}
                {importResult && (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                      Kết quả lần import vừa rồi
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2">
                        <p className="text-lg font-bold text-emerald-600">{importResult.imported}</p>
                        <p className="text-[10px] text-emerald-500 font-semibold">Đã import</p>
                      </div>
                      <div className="bg-slate-100 border border-slate-200 rounded-lg p-2">
                        <p className="text-lg font-bold text-slate-500">{importResult.skipped}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">Bỏ qua</p>
                      </div>
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-2">
                        <p className="text-lg font-bold text-blue-500">{importResult.total}</p>
                        <p className="text-[10px] text-blue-400 font-semibold">Tổng email</p>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-slate-400 leading-relaxed">
                  AI sẽ đọc email và tự động nhận diện deadline. Chỉ email có thông tin hạn nộp mới được tạo.
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full py-12 text-slate-400 text-xs text-center">
                Kết nối Gmail trước để bắt đầu import deadline.
              </div>
            )}
          </section>
        </div>

        {/* Footer badges */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
            <span className="material-symbols-outlined text-[#3b309e] text-[20px] block">security</span>
            <h5 className="font-bold text-xs text-slate-800">Chỉ đọc</h5>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              App chỉ có quyền đọc email, không thể gửi hay xoá bất kỳ email nào.
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
            <span className="material-symbols-outlined text-[#3b309e] text-[20px] block">smart_toy</span>
            <h5 className="font-bold text-xs text-slate-800">AI nhận diện</h5>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Gemini AI tự động phân tích nội dung email để tìm và trích xuất thông tin deadline.
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
            <span className="material-symbols-outlined text-[#3b309e] text-[20px] block">content_copy</span>
            <h5 className="font-bold text-xs text-slate-800">Không trùng lặp</h5>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Mỗi email chỉ được import một lần, bấm sync nhiều lần cũng không bị trùng deadline.
            </p>
          </div>
        </section>
      </div>
    </Layout>
  )
}
