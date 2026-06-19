import { formatDateTime } from './deadlineUtils'
import { formatDaysLeft, weekdayLabel } from './riskAnalysis'

function listTopDeadlines(scored, count = 3) {
  if (!scored.length) return 'Hiện tại không có deadline nào đang hoạt động.'
  return scored
    .slice(0, count)
    .map(({ deadline, risk }, index) => {
      const course = deadline.course?.course_name ? ` (${deadline.course.course_name})` : ''
      return `${index + 1}. ${deadline.title}${course} - Hạn chót: ${formatDateTime(deadline.due_date)}, Mức rủi ro: ${risk.score}%`
    })
    .join('\n')
}

/**
 * Gọi API Backend để truyền ngữ cảnh dữ liệu sang Gemini thật xử lý
 */
export async function generateAssistantReply(message, context, history = []) {
  const { summary, busiestDay } = context

  // Tạo chuỗi tóm tắt dữ liệu deadline thật để nhồi làm Context cho AI
  const deadlineContextString = `
DỮ LIỆU DEADLINE THẬT TỪ HỆ THỐNG TUẦN NÀY:
- Tổng số lượng deadline: ${summary.total}
- Mức độ rủi ro tổng quan: ${summary.level} (Điểm trung bình: ${summary.avgScore}%)
- Danh sách công việc ưu tiên hàng đầu:
${listTopDeadlines(summary.scored, 5)}

- Ngày bận rộn nhất: ${busiestDay ? `${weekdayLabel(busiestDay.dayKey)} (có ${busiestDay.items.length} bài tập dồn vào)` : 'Không có ngày nào bị dồn lịch quá mức'}
- Deadline rủi ro cao nhất: ${summary.riskiest ? `"${summary.riskiest.deadline.title}" (Cần khoảng ${Math.max(2, Math.round((summary.riskiest.risk.score / 100) * 14))} giờ tập trung)` : 'Không có'}
- Khung giờ học tập hiệu quả lịch sử của user: 20:00 - 23:00 hàng đêm.
`

  try {
    // Gọi đến API Node.js backend (Đảm bảo backend của bạn chạy ở port 5000 hoặc config tương ứng)
    const response = await fetch('http://localhost:3001/api/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        context: deadlineContextString, // Gửi kèm context dữ liệu thật cho AI đọc
        history: history,               // Gửi kèm lịch sử chat để không bị "đần" khi hỏi câu tiếp theo
      }),
    })

    if (!response.ok) {
      throw new Error('Lỗi phản hồi từ cổng API AI')
    }

    const data = await response.json()
    return data.reply
  } catch (error) {
    console.error('Error calling AI Assistant:', error)
    return 'Xin lỗi bạn, kết nối đến Trợ lý AI đang gặp sự cố nhỏ. Vui lòng thử lại sau giây lát!'
  }
}