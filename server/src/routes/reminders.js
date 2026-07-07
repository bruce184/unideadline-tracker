import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import { listReminders, updateDeadlineReminder } from '../controllers/reminderController.js'
import { processEmailReminders } from '../jobs/sendEmailReminders.job.js'
import { sendError, sendSuccess } from '../utils/responses.js'

const router = express.Router()
const deadlineReminderRoutes = express.Router()
const manualEmailTriggerToken = process.env.EMAIL_REMINDER_TRIGGER_TOKEN

router.get('/', requireAuth, listReminders)
deadlineReminderRoutes.patch('/deadlines/:id/reminder', requireAuth, updateDeadlineReminder)

// Dev/demo-only trigger for email reminders; production never registers this route.
if (process.env.NODE_ENV !== 'production' && manualEmailTriggerToken) {
  router.post('/process-email-now', requireAuth, async (req, res) => {
    if (req.get('x-dev-job-token') !== manualEmailTriggerToken) {
      return sendError(res, 403, 'FORBIDDEN', 'Invalid manual job token')
    }

    const result = await processEmailReminders()
    return sendSuccess(res, result, 'Email reminder job processed')
  })
}

export { deadlineReminderRoutes }
export default router
