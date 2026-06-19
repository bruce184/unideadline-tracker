import { GoogleGenAI } from '@google/genai'

// Khởi tạo Gemini AI từ biến môi trường
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export const handleChatAI = async (req, res) => {
    try {
        const { message, context, history } = req.body; 

        if (!message) {
            return res.status(400).json({ error: "Tin nhắn không được bỏ trống" });
        }

        const systemInstruction = `
Bạn là trợ lý AI thông minh tích hợp trong hệ thống quản lý deadline mang tên "UniDeadline Tracker" của sinh viên Lê Nguyễn Quốc Toàn.
Nhiệm vụ của bạn là dựa vào hội thoại và DỮ LIỆU ĐƯỢC CUNG CẤP THẬT dưới đây để tư vấn, phân tích và lên lịch học tập tối ưu cho sinh viên.

${context || "Hiện tại chưa lấy được dữ liệu thời gian thực của tuần."}

QUY TẮC PHẢN HỒI:
1. Luôn ưu tiên trả lời dựa trực tiếp trên số liệu thật trong dữ liệu cung cấp phía trên.
2. Trả lời thân thiện, mạch lạc, ngắn gọn (nên dùng gạch đầu dòng khi lập lịch học).
3. Đề xuất các giải pháp thiết thực dựa trên khung giờ làm việc tối ưu (20:00 - 23:00) và các deadline có độ rủi ro lớn.
`;

        const formattedContents = [
            ...(history || []).map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            })),
            { role: 'user', parts: [{ text: message }] }
        ];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: formattedContents,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
            }
        });

        res.json({ reply: response.text });
    } catch (error) {
        console.error("Lỗi tại Chat Controller:", error);
        res.status(500).json({ error: "Lỗi kết nối dịch vụ AI" });
    }
}