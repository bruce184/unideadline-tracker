import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import { listReminders, updateDeadlineReminder } from '../controllers/reminderController.js'

const router = express.Router()
const deadlineReminderRoutes = express.Router()

router.get('/', requireAuth, listReminders)
deadlineReminderRoutes.patch('/deadlines/:id/reminder', requireAuth, updateDeadlineReminder)

export { deadlineReminderRoutes }
export default router
