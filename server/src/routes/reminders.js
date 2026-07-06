import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import { listReminders, updateDeadlineReminder } from '../controllers/reminderController.js'
import { processEmailReminders } from '../jobs/sendEmailReminders.job.js'
import { sendSuccess } from '../utils/responses.js'

const router = express.Router()
const deadlineReminderRoutes = express.Router()

router.get('/', requireAuth, listReminders)
deadlineReminderRoutes.patch('/deadlines/:id/reminder', requireAuth, updateDeadlineReminder)

// DEV-ONLY: trigger job gửi email ngay lập tức, không cần đợi cron 15 phút.
// Xoá route này trước khi deploy production.
if (process.env.NODE_ENV !== 'production') {
  router.post('/process-email-now', requireAuth, async (req, res) => {
    const result = await processEmailReminders()
    return sendSuccess(res, result, 'Đã chạy job gửi email reminder')
  })
}

export { deadlineReminderRoutes }
export default router