import nodemailer from 'nodemailer'

let transporter = null

/**
 * Lazy-init transporter, dùng chung config SMTP đã có sẵn trong .env.example
 * Với Gmail: EMAIL_HOST=smtp.gmail.com, EMAIL_PORT=587, EMAIL_USER=<gmail>, EMAIL_PASS=<app password>
 */
function getTransporter() {
  if (transporter) return transporter

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465, // 465 = SSL, 587 = STARTTLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  return transporter
}

function formatDueDate(dueDate) {
  return new Date(dueDate).toLocaleString('vi-VN', {
    dateStyle: 'full',
    timeStyle: 'short',
  })
}

function offsetLabel(offsetDays) {
  if (offsetDays === 0) return 'Hôm nay là hạn chót nộp bài'
  if (offsetDays === 1) return 'Còn 1 ngày nữa là tới hạn'
  return `Còn ${offsetDays} ngày nữa là tới hạn`
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char])
}

function normalizeSubjectText(value) {
  return String(value ?? 'Deadline')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || 'Deadline'
}

/**
 * Gửi email nhắc deadline cho 1 user
 */
export async function sendReminderEmail({ to, displayName, deadlineTitle, dueDate, offsetDays }) {
  const subjectTitle = normalizeSubjectText(deadlineTitle)
  const safeDeadlineTitle = escapeHtml(subjectTitle)
  const safeGreeting = displayName ? `Chào ${escapeHtml(displayName)},` : 'Xin chào,'

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; color: #1f2937;">
      <p>${safeGreeting}</p>
      <h2 style="color:#d97706; margin-bottom: 4px;">⏰ ${offsetLabel(offsetDays)}</h2>
      <p style="font-size: 16px;"><strong>${safeDeadlineTitle}</strong></p>
      <p>Hạn nộp: <strong>${formatDueDate(dueDate)}</strong></p>
      <p style="margin-top: 16px; font-size: 13px; color: #6b7280;">
        Email này được gửi tự động từ UniDeadline Tracker. Đăng nhập ứng dụng để xem chi tiết hoặc tắt nhắc nhở.
      </p>
    </div>
  `

  return getTransporter().sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject: `[Nhắc hạn] ${subjectTitle}`,
    html,
  })
}

/**
 * Dùng để test nhanh kết nối SMTP (gọi từ script test)
 */
export async function verifyEmailTransport() {
  return getTransporter().verify()
}
