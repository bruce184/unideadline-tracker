import { useState } from 'react'
import Layout from '../../components/Layout'

export default function Integrations() {
  const [isConnected, setIsConnected] = useState(true)
  
  // Form states
  const [url, setUrl] = useState('https://moodle.hcmut.edu.vn')
  const [username, setUsername] = useState('MSSV hoặc Email')
  const [password, setPassword] = useState('password123')
  
  // Toggles cho môn học
  const [syncMath, setSyncMath] = useState(true)
  const [syncPhys, setSyncPhys] = useState(true)
  const [syncPhil, setSyncPhil] = useState(false)
  const [syncSE, setSyncSE] = useState(true)

  const handleConnect = (e) => {
    e.preventDefault()
    setIsConnected(true)
  }

  const handleDisconnect = () => {
    if (window.confirm('Bạn có chắc chắn muốn ngắt kết nối với Moodle không?')) {
      setIsConnected(false)
    }
  }

  const handleSyncNow = () => {
    alert('Đang đồng bộ hóa bài tập từ Moodle... Hoàn tất trong 2 giây!')
  }

  return (
    <Layout>
      {/* Header */}
      <header className="flex justify-between items-center px-4 py-3 w-full bg-white rounded-2xl border border-[#e9e2fb] mb-6 shadow-[0_14px_40px_rgba(91,69,170,0.03)]">
        <h2 className="text-xl font-bold text-slate-900">Kết nối Moodle</h2>
      </header>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto space-y-6 pb-10">
        
        {/* Banner Mô tả tích hợp */}
        <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-[40px] text-orange-500 bg-orange-50 p-2.5 rounded-xl border border-orange-100 shrink-0">school</span>
            <div>
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                Moodle Integration
                <span className="bg-gradient-to-r from-violet-500 to-[#3b309e] text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[10px] font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  AI Powered Sync
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Tự động đồng bộ hóa thời hạn bài tập và sự kiện từ hệ thống LMS của trường bạn.
              </p>
            </div>
          </div>
        </section>

        {/* Thiết lập kết nối */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card trái: Thiết lập kết nối (nếu ngắt kết nối sẽ điền form) */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              Thiết lập kết nối
              <span className="material-symbols-outlined text-[18px] text-slate-400">link</span>
            </h4>
            
            {isConnected ? (
              <div className="text-center py-10 space-y-3">
                <span className="material-symbols-outlined text-[48px] text-emerald-500">check_circle</span>
                <p className="text-xs font-semibold text-slate-700">Tài khoản Moodle đã liên kết thành công!</p>
                <button
                  onClick={handleDisconnect}
                  className="text-xs text-red-600 font-bold hover:underline"
                >
                  Ngắt kết nối tài khoản
                </button>
              </div>
            ) : (
              <form onSubmit={handleConnect} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1" htmlFor="moodle-url">
                    Moodle Server URL
                  </label>
                  <input
                    id="moodle-url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none focus:border-[#3b309e] focus:bg-white"
                    placeholder="https://moodle.youruniversity.edu"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1" htmlFor="moodle-user">
                    Tên đăng nhập
                  </label>
                  <input
                    id="moodle-user"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none focus:border-[#3b309e] focus:bg-white"
                    placeholder="MSSV hoặc Email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1" htmlFor="moodle-pass">
                    Mật khẩu
                  </label>
                  <input
                    id="moodle-pass"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none focus:border-[#3b309e] focus:bg-white"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#3b309e] text-white rounded-xl py-2.5 text-xs font-bold hover:bg-[#2e2482] transition shadow-xs cursor-pointer"
                >
                  Kết nối ngay
                </button>
              </form>
            )}
          </section>

          {/* Card phải: Trạng thái & Danh sách môn học đồng bộ */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            {isConnected ? (
              <>
                {/* Trạng thái đã kết nối */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                  <div className="flex gap-2">
                    <span className="material-symbols-outlined text-emerald-500 font-bold text-[20px]">check_circle</span>
                    <div>
                      <h4 className="font-bold text-xs text-slate-800">Đã kết nối</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">moodle.hcmut.edu.vn</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleSyncNow}
                    className="bg-[#3b309e] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-[#2e2482] cursor-pointer transition shadow-xs"
                  >
                    Đồng bộ ngay
                  </button>
                </div>

                {/* Danh sách môn học chọn đồng bộ */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    <span>Danh sách môn học</span>
                    <button className="text-[#3b309e] hover:underline cursor-pointer">Chọn tất cả</button>
                  </div>
                  
                  <div className="space-y-2">
                    {/* Môn 1 */}
                    <div className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                      <div>
                        <h5 className="font-bold text-xs text-slate-800">Giải tích</h5>
                        <p className="text-[10px] text-slate-400">MT1003 • 2 Deadline sắp tới</p>
                      </div>
                      <button
                        onClick={() => setSyncMath(!syncMath)}
                        className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                          syncMath ? 'bg-[#3b309e]' : 'bg-slate-200'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${
                          syncMath ? 'left-4' : 'left-0.5'
                        }`} />
                      </button>
                    </div>

                    {/* Môn 2 */}
                    <div className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                      <div>
                        <h5 className="font-bold text-xs text-slate-800">Vật lý</h5>
                        <p className="text-[10px] text-slate-400">PH1003 • 0 Deadline sắp tới</p>
                      </div>
                      <button
                        onClick={() => setSyncPhys(!syncPhys)}
                        className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                          syncPhys ? 'bg-[#3b309e]' : 'bg-slate-200'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${
                          syncPhys ? 'left-4' : 'left-0.5'
                        }`} />
                      </button>
                    </div>

                    {/* Môn 3 */}
                    <div className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                      <div>
                        <h5 className="font-bold text-xs text-slate-800">Triết học</h5>
                        <p className="text-[10px] text-slate-400">MS1001 • 1 Deadline sắp tới</p>
                      </div>
                      <button
                        onClick={() => setSyncPhil(!syncPhil)}
                        className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                          syncPhil ? 'bg-[#3b309e]' : 'bg-slate-200'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${
                          syncPhil ? 'left-4' : 'left-0.5'
                        }`} />
                      </button>
                    </div>

                    {/* Môn 4 */}
                    <div className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                      <div>
                        <h5 className="font-bold text-xs text-slate-800">Software Engineering</h5>
                        <p className="text-[10px] text-slate-400">CO3001 • 4 Deadline sắp tới</p>
                      </div>
                      <button
                        onClick={() => setSyncSE(!syncSE)}
                        className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                          syncSE ? 'bg-[#3b309e]' : 'bg-slate-200'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${
                          syncSE ? 'left-4' : 'left-0.5'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                Chưa có tài khoản LMS được kết nối. Hãy điền cấu hình bên trái.
              </div>
            )}
          </section>
        </div>

        {/* Chân trang các cam kết bảo mật & năng lực */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
            <span className="material-symbols-outlined text-[#3b309e] text-[20px] block">security</span>
            <h5 className="font-bold text-xs text-slate-800">Bảo mật tuyệt đối</h5>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Thông tin đăng nhập được lưu trữ cực bộ trên thiết bị của bạn. Dữ liệu được mã hóa đầu cuối.
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
            <span className="material-symbols-outlined text-[#3b309e] text-[20px] block">bolt</span>
            <h5 className="font-bold text-xs text-slate-800">Đồng bộ tức thì</h5>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Mọi thay đổi thời hạn nộp bài trên Moodle sẽ được cập nhật tự động trong vài giây.
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
            <span className="material-symbols-outlined text-[#3b309e] text-[20px] block">smart_toy</span>
            <h5 className="font-bold text-xs text-slate-800">Phân tích AI</h5>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Tự động ước tính thời gian làm bài, đề xuất ưu tiên thông minh dựa trên độ khó bài tập.
            </p>
          </div>
        </section>
      </div>
    </Layout>
  )
}
