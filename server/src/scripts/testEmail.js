/**
 * Script test nhanh SMTP + gửi thử 1 email, không đụng tới database.
 * Chạy: node --env-file=.env src/scripts/testEmail.js you@example.com
 */
import { verifyEmailTransport, sendReminderEmail } from '../services/emailService.js'

const testRecipient = process.argv[2]

if (!testRecipient) {
  console.error('Thiếu email người nhận. Dùng: node --env-file=.env src/scripts/testEmail.js you@example.com')
  process.exit(1)
}

try {
  console.log('Đang kiểm tra kết nối SMTP...')
  await verifyEmailTransport()
  console.log('✅ Kết nối SMTP OK')

  console.log(`Đang gửi email test tới ${testRecipient}...`)
  await sendReminderEmail({
    to: testRecipient,
    displayName: 'Bạn',
    deadlineTitle: 'Bài tập lớn môn Kiểm thử phần mềm',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    offsetDays: 1,
  })
  console.log('✅ Đã gửi email test thành công. Kiểm tra hộp thư đến.')
} catch (err) {
  console.error('❌ Lỗi:', err.message)
  process.exit(1)
}