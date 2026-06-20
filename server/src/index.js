import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv' 
import { GoogleGenAI } from '@google/genai' 
import { requireAuth } from './middleware/auth.js'
import { sendError } from './utils/responses.js'
import courseRoutes from './routes/courses.js'
import deadlineRoutes from './routes/deadlines.js'
import dashboardRoutes from './routes/dashboard.js'
import reminderRoutes, { deadlineReminderRoutes } from './routes/reminders.js'
import { getCurrentProfile, updateProfile } from './controllers/authController.js'
import { handleChatAI } from './controllers/chatController.js'
import authRoutes from './routes/auth.js'
// import chatRoutes from './routes/chat.js'

// Kích hoạt biến môi trường ngay đầu file
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'

// Khởi tạo đối tượng kết nối Gemini bằng API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

app.use(cors({
  origin: CLIENT_ORIGIN,
  credentials: true,
}))

// CẦN PHẢI ĐẶT THẰNG NÀY ĐẦU TIÊN để đọc được body JSON của các route bên dưới
app.use(express.json())

// ĐĂNG KÝ TUYẾN ĐƯỜNG CHAT TRỰC TIẾP TẠI ĐÂY
app.post('/api/v1/chat', requireAuth, handleChatAI)

// Các tuyến đường Router khác
app.use('/api/v1/courses', courseRoutes)
app.use('/api/v1/deadlines', deadlineRoutes)
app.use('/api/v1/dashboard', dashboardRoutes)
app.use('/api/v1/reminders', reminderRoutes)
app.use('/api/v1/auth', authRoutes)
// app.use('/api/v1/chat', chatRoutes)
app.use('/api/v1', deadlineReminderRoutes)

app.get('/api/v1/me', requireAuth, getCurrentProfile)
app.patch('/api/v1/me', requireAuth, updateProfile)

app.get('/api/v1/health', (req, res) => {
  res.json({
    ok: true,
    data: {
      service: 'server',
      status: 'running',
      timestamp: new Date().toISOString(),
    },
    message: 'UniDeadline Tracker API is running',
  })
})

app.get('/api/v1', (req, res) => {
  res.json({
    ok: true,
    message: 'Welcome to UniDeadline Tracker API',
  })
})

app.use((err, req, res, _next) => {
  console.error(err)
  return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Unexpected server error')
})


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})