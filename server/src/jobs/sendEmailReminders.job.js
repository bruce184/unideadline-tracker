import cron from 'node-cron'
import { findDueReminders, markReminderStatus } from '../models/reminderModel.js'
import { findProfilesByIds } from '../models/profileModel.js'
import { findGmailConnectionsByUserIds } from '../models/gmailModel.js'
import { sendReminderEmail } from '../services/emailService.js'

/**
 * Quét các reminder channel='email' đã tới giờ (reminder_time <= now) và còn 'pending',
 * gửi email, rồi cập nhật sent_status thành 'sent' hoặc 'failed'.
 * Có thể gọi trực tiếp (test/manual trigger) hoặc để cron tự chạy định kỳ.
 */
export async function processEmailReminders() {
  const nowIso = new Date().toISOString()
  const { data: reminders, error } = await findDueReminders('email', nowIso)

  if (error) {
    console.error('[EmailReminder] Không lấy được danh sách reminder:', error.message)
    return { processed: 0, sent: 0, failed: 0 }
  }

  if (!reminders || reminders.length === 0) {
    return { processed: 0, sent: 0, failed: 0 }
  }

  const userIds = [...new Set(reminders.map((r) => r.deadline.user_id))]

  const [{ data: profiles, error: profileError }, { data: gmailConns, error: gmailError }] = await Promise.all([
    findProfilesByIds(userIds),
    findGmailConnectionsByUserIds(userIds),
  ])

  if (profileError) {
    console.error('[EmailReminder] Không lấy được profile:', profileError.message)
  }
  if (gmailError) {
    console.error('[EmailReminder] Không lấy được gmail_connections:', gmailError.message)
  }

  const profileByUserId = new Map((profiles || []).map((p) => [p.id, p]))
  const gmailEmailByUserId = new Map(
    (gmailConns || []).filter((c) => c.email).map((c) => [c.user_id, c.email])
  )

  let sent = 0
  let failed = 0

  for (const reminder of reminders) {
    const profile = profileByUserId.get(reminder.deadline.user_id)
    // Ưu tiên gửi tới Gmail đã sync trong app; nếu user chưa kết nối Gmail thì fallback về email đăng ký
    const targetEmail = gmailEmailByUserId.get(reminder.deadline.user_id) || profile?.email

    if (!targetEmail) {
      console.warn(`[EmailReminder] Reminder ${reminder.id}: user ${reminder.deadline.user_id} không có email`)
      await markReminderStatus(reminder.id, 'failed')
      failed += 1
      continue
    }

    try {
      await sendReminderEmail({
        to: targetEmail,
        displayName: profile?.display_name,
        deadlineTitle: reminder.deadline.title,
        dueDate: reminder.deadline.due_date,
        offsetDays: reminder.offset_days,
      })
      await markReminderStatus(reminder.id, 'sent')
      sent += 1
    } catch (err) {
      console.error(`[EmailReminder] Gửi thất bại cho reminder ${reminder.id}:`, err.message)
      await markReminderStatus(reminder.id, 'failed')
      failed += 1
    }
  }

  console.log(`[EmailReminder] Đã xử lý ${reminders.length} reminder — sent: ${sent}, failed: ${failed}`)
  return { processed: reminders.length, sent, failed }
}

/**
 * Bật cron chạy mỗi 10 phút. Gọi 1 lần lúc khởi động server (xem index.js).
 */
export function startEmailReminderCron() {
  cron.schedule('*/10 * * * *', () => {
    processEmailReminders().catch((err) => {
      console.error('[EmailReminder] Cron job lỗi:', err.message)
    })
  })
  console.log('[EmailReminder] Cron đã lên lịch (mỗi 10 phút)')
}