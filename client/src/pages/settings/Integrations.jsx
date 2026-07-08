import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import PageHeader from '../../components/PageHeader'
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
    if (!window.confirm('Ngắt kết nối Gmail? Các deadline đã nhập sẽ được giữ lại.')) return
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
      showToast('Chọn môn học trước khi nhập từ Gmail', 'error')
      return
    }

    try {
      setImporting(true)
      setImportResult(null)
      const result = await importFromGmail(days, selectedCourseId)
      setImportResult(result)
      if (result.imported > 0) {
        showToast(`Đã nhập ${result.imported} deadline mới từ Gmail!`)
      } else {
        showToast('Không tìm thấy deadline mới trong email.', 'info')
      }
    } catch (err) {
      showToast(err.message || 'Nhập thất bại', 'error')
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

      <PageHeader
        eyebrow="Tích hợp & Đồng bộ"
        title="Đồng bộ Gmail"
        description="Kết nối Gmail ở quyền chỉ đọc, dùng AI nhận diện email có deadline và nhập vào môn học đã chọn."
        meta={
          <>
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
              Gmail chỉ đọc
            </span>
            <span className="rounded-full bg-[#f0ebff] px-3 py-1 text-xs font-semibold text-[#5140b6]">
              AI nhận diện deadline
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Chống nhập trùng
            </span>
          </>
        }
        actions={
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
            connected ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
          }`}>
            <span className="material-symbols-outlined text-[16px]">
              {connected ? 'check_circle' : 'radio_button_unchecked'}
            </span>
            {connected ? 'Đã kết nối' : 'Chưa kết nối'}
          </span>
        }
      />

      <div className="mx-auto max-w-5xl space-y-6 pb-10">
        <section className="rounded-2xl border border-[#e9e2fb] bg-white p-5 shadow-[0_14px_40px_rgba(91,69,170,0.05)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Luồng nhập deadline từ email</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Trình diễn theo thứ tự từ trái sang phải để người xem hiểu rõ Gmail chỉ là nguồn dữ liệu, còn deadline vẫn được gắn vào môn học trong hệ thống.
              </p>
            </div>
            <span className="material-symbols-outlined shrink-0 rounded-xl border border-red-100 bg-red-50 p-2.5 text-[34px] text-red-500">
              mail
            </span>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              ['1', 'Kết nối Gmail', connected ? 'OAuth đã sẵn sàng' : 'Đăng nhập Google để cấp quyền đọc'],
              ['2', 'Chọn môn học', selectedCourseId ? 'Deadline được gắn đúng môn' : 'Chọn môn trước khi nhập'],
              ['3', 'Nhập deadline', importResult ? `${importResult.imported} mới, ${importResult.skipped} bỏ qua` : 'AI lọc email có hạn nộp'],
            ].map(([step, title, detail]) => (
              <div key={step} className="rounded-xl border border-[#eee8ff] bg-[#fbfaff] px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#5b45d8] text-xs font-bold text-white">
                    {step}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900">{title}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500" title={detail}>{detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Main cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">

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

          {/* Card phải: nhập deadline */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              Nhập deadline từ Gmail
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
                      Tạo ít nhất một môn học trước khi nhập deadline từ Gmail.
                    </p>
                  )}
                </div>

                {/* Nút nhập deadline */}
                <button
                  onClick={handleImport}
                  disabled={importing || loadingCourses || !selectedCourseId}
                  className="w-full flex items-center justify-center gap-2 bg-[#3b309e] text-white py-2.5 rounded-xl text-xs font-bold hover:bg-[#2e2482] transition disabled:opacity-60 cursor-pointer"
                >
                  <span className={`material-symbols-outlined text-[16px] ${importing ? 'animate-spin' : ''}`}>
                    {importing ? 'refresh' : 'sync'}
                  </span>
                  {importing ? 'Đang nhập...' : 'Nhập ngay'}
                </button>

                {/* Kết quả nhập deadline */}
                {importResult && (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                      Kết quả lần nhập vừa rồi
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2">
                        <p className="text-lg font-bold text-emerald-600">{importResult.imported}</p>
                        <p className="text-[10px] text-emerald-500 font-semibold">Đã nhập</p>
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
                Kết nối Gmail trước để bắt đầu nhập deadline.
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
              Mỗi email chỉ được nhập một lần, bấm đồng bộ nhiều lần cũng không bị trùng deadline.
            </p>
          </div>
        </section>
      </div>
    </Layout>
  )
}
