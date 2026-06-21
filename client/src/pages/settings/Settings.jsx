import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { useAuth } from '../../hooks/useAuth'

export default function Settings() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Mocks states cho các thiết lập
  const [notify24h, setNotify24h] = useState(true)
  const [notifyHighRisk, setNotifyHighRisk] = useState(true)
  const [notifyWeeklyEmail, setNotifyWeeklyEmail] = useState(false)
  
  const [themeMode, setThemeMode] = useState('light') // 'light' hoặc 'dark'
  const [language, setLanguage] = useState('vi') // 'vi' hoặc 'en'

  const handleLogout = async () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất không?')) {
      await logout()
      navigate('/login')
    }
  }

  const handleDeleteAllDeadlines = () => {
    alert('Hành động nguy hiểm! Tính năng xóa tất cả dữ liệu yêu cầu quyền quản trị viên cao cấp.')
  }

  return (
    <Layout>
      {/* Header */}
      <header className="flex justify-between items-center px-4 py-3 w-full bg-white rounded-2xl border border-[#e9e2fb] mb-6 shadow-[0_14px_40px_rgba(91,69,170,0.03)]">
        <h2 className="text-xl font-bold text-slate-900">Cài đặt hệ thống</h2>
      </header>

      {/* Grid nội dung */}
      <div className="space-y-6 max-w-4xl mx-auto pb-10">
        
        {/* Hộp Thông tin tài khoản người dùng */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row gap-6 items-center">
          {/* Avatar tròn */}
          <div className="w-20 h-20 rounded-full bg-[#f0ecf6] border border-outline-variant/30 flex items-center justify-center overflow-hidden shrink-0">
            <span className="material-symbols-outlined text-[48px] text-[#3b309e]">account_circle</span>
          </div>
          
          {/* Email và tên học sinh */}
          <div className="flex-1 text-center md:text-left space-y-1">
            <h3 className="font-bold text-xl text-slate-900">John Doe</h3>
            <p className="text-sm text-slate-500 font-medium">{user?.email || 'john.doe@hcmut.edu.vn'}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left border-t border-slate-100 mt-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Trường Đại học</p>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">HCMUT (ĐH Bách Khoa TP.HCM)</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Khoa</p>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">Khoa Khoa học & Kỹ thuật Máy tính</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Niên khóa</p>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">2021 - 2025</p>
              </div>
            </div>
          </div>
        </section>

        {/* Thiết lập Thông báo & Giao diện */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Cột Trái: Thông báo */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="material-symbols-outlined text-[18px] text-[#3b309e]">notifications</span>
              Thông báo
            </h3>
            
            <div className="space-y-4">
              {/* Switch 1 */}
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-slate-600">Nhắc trước deadline 24 giờ</span>
                <button
                  type="button"
                  onClick={() => setNotify24h(!notify24h)}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    notify24h ? 'bg-[#3b309e]' : 'bg-slate-200'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${
                    notify24h ? 'left-4.5' : 'left-0.5'
                  }`} />
                </button>
              </div>

              {/* Switch 2 */}
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-slate-600">Thông báo rủi ro cao (AI)</span>
                <button
                  type="button"
                  onClick={() => setNotifyHighRisk(!notifyHighRisk)}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    notifyHighRisk ? 'bg-[#3b309e]' : 'bg-slate-200'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${
                    notifyHighRisk ? 'left-4.5' : 'left-0.5'
                  }`} />
                </button>
              </div>

              {/* Switch 3 */}
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-slate-600">Email tóm tắt tuần</span>
                <button
                  type="button"
                  onClick={() => setNotifyWeeklyEmail(!notifyWeeklyEmail)}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    notifyWeeklyEmail ? 'bg-[#3b309e]' : 'bg-slate-200'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${
                    notifyWeeklyEmail ? 'left-4.5' : 'left-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </section>

          {/* Cột Phải: Giao diện */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="material-symbols-outlined text-[18px] text-[#3b309e]">palette</span>
              Giao diện & Ngôn ngữ
            </h3>
            
            <div className="space-y-4">
              {/* Chế độ hiển thị Sáng/Tối */}
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-slate-600">Chế độ hiển thị</span>
                <div className="bg-slate-100 p-0.5 rounded-lg flex gap-1">
                  <button
                    onClick={() => setThemeMode('light')}
                    className={`px-3 py-1 text-[11px] font-bold rounded-md cursor-pointer transition ${
                      themeMode === 'light' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400'
                    }`}
                  >
                    Sáng
                  </button>
                  <button
                    onClick={() => setThemeMode('dark')}
                    className={`px-3 py-1 text-[11px] font-bold rounded-md cursor-pointer transition ${
                      themeMode === 'dark' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400'
                    }`}
                  >
                    Tối
                  </button>
                </div>
              </div>

              {/* Lựa chọn ngôn ngữ */}
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-slate-600">Ngôn ngữ hiển thị</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="rounded border border-slate-200 bg-white px-2 py-1 text-xs outline-none cursor-pointer focus:border-[#3b309e]"
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        {/* Tích hợp dữ liệu LMS */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="material-symbols-outlined text-[18px] text-[#3b309e]">hub</span>
            Tích hợp dữ liệu
          </h3>
          
          <div className="space-y-3">
            {/* Moodle connected card */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[32px] text-orange-500">school</span>
                <div>
                  <h4 className="font-bold text-xs text-slate-800">
                    Moodle <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded font-bold ml-1">ĐÃ KẾT NỐI</span>
                  </h4>
                  <p className="text-[10px] text-slate-400">https://moodle.hcmut.edu.vn</p>
                </div>
              </div>
              <button className="bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-50 cursor-pointer transition">
                Ngắt kết nối
              </button>
            </div>

            {/* Canvas disconnected card */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[32px] text-red-500 font-bold">grid_view</span>
                <div>
                  <h4 className="font-bold text-xs text-slate-800">Canvas</h4>
                  <p className="text-[10px] text-slate-400">Chưa liên kết tài khoản LMS của bạn</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/integrations')}
                className="bg-[#3b309e] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#2e2482] cursor-pointer transition"
              >
                Kết nối Canvas
              </button>
            </div>
          </div>
        </section>

        {/* Vùng Nguy Hiểm & Thoát */}
        <section className="bg-red-50/50 rounded-2xl border border-red-100 p-6 space-y-4">
          <h3 className="font-bold text-sm text-red-800 flex items-center gap-2 border-b border-red-100 pb-3">
            <span className="material-symbols-outlined text-[18px] text-red-800 font-bold">warning</span>
            Vùng nguy hiểm
          </h3>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h4 className="font-bold text-xs text-slate-900">Xóa tất cả deadline</h4>
              <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                Hành động này sẽ xóa vĩnh viễn toàn bộ dữ liệu lịch học và deadline đã được đồng bộ hoặc tạo thủ công. Không thể hoàn tác.
              </p>
            </div>
            <button
              onClick={handleDeleteAllDeadlines}
              className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-50 cursor-pointer shadow-xs shrink-0 transition"
            >
              Xóa tất cả deadline
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-red-100/50 pt-4">
            <div>
              <h4 className="font-bold text-xs text-slate-900">Đăng xuất khỏi hệ thống</h4>
              <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                Thoát tài khoản khỏi phiên làm việc hiện tại trên thiết bị này.
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-700 cursor-pointer shadow-xs shrink-0 transition flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">logout</span>
              Thoát tài khoản
            </button>
          </div>
        </section>

      </div>
    </Layout>
  )
}
