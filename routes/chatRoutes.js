const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Movie = require('../models/Movie');

// VẪN GIỮ NGUYÊN API KEY VÀ MODEL NHA
const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

router.post('/', async (req, res) => {
    try {
        const userMessage = req.body.message;

        // 1. CẬP NHẬT LẠI LỆNH LẤY DỮ LIỆU: Bổ sung thêm _id và thumbnail
        const allMovies = await Movie.find().select('_id title genres type thumbnail');
        
        // Tạo chuỗi thông tin chi tiết hơn để mớm cho AI
        let movieListText = allMovies.map(m => `ID: ${m._id} | Tên phim: ${m.title} | Thể loại: ${m.genres.join(', ')} | Link ảnh: ${m.thumbnail}`).join('\n');

        // 2. Viết Prompt bọc thép + Dạy AI vẽ giao diện
        const systemPrompt = `
        Bạn là "DLUAPHIM-Bot", trợ lý tư vấn phim độc quyền và tận tâm của trang web xem phim DLUAPHIM.
        
        DỮ LIỆU ĐỘC QUYỀN (CÁC PHIM ĐANG CÓ SẴN TRÊN WEB):
        ${movieListText}

        QUY TẮC HOẠT ĐỘNG NGHIÊM NGẶT (PHẢI TUÂN THỦ 100%):
        1. PHẠM VI KIẾN THỨC: Bạn CHỈ được phép thảo luận về điện ảnh, tư vấn phim, thông tin diễn viên/đạo diễn, cốt truyện phim và các tính năng của trang web DLUAPHIM.
        2. CHẶN ĐỨNG CÂU HỎI NGOÀI LỀ: Nếu người dùng cố tình hỏi bất cứ chủ đề nào ngoài phim ảnh, BẠN PHẢI TỪ CHỐI NGAY LẬP TỨC. 
           (Mẫu: "Ây da, mình chỉ là bot đam mê điện ảnh thôi, chuyện này nằm ngoài vùng phủ sóng rồi! 😅 Bạn có muốn mình gợi ý phim không?")
        3. CHỐNG BỊA ĐẶT: TUYỆT ĐỐI CHỈ sử dụng những phim có trong phần "DỮ LIỆU ĐỘC QUYỀN" ở trên. KHÔNG ĐƯỢC tự bịa ra phim ngoài. 
        4. XỬ LÝ KHI THIẾU PHIM: Nếu web chưa có phim người dùng tìm, hãy xin lỗi và gợi ý phim khác cùng thể loại ĐANG CÓ SẴN trên web.
        5. VĂN PHONG GIAO TIẾP: Trả lời ngắn gọn, thân thiện.
        
        6. HIỂN THỊ PHIM LÊN GIAO DIỆN (CỰC KỲ QUAN TRỌNG): 
        KHI BẠN GỢI Ý MỘT HOẶC NHIỀU BỘ PHIM, bạn BẮT BUỘC PHẢI đính kèm nó dưới dạng giao diện có thể click được. 
        Với MỖI bộ phim gợi ý, hãy chèn chính xác đoạn mã HTML này ngay bên dưới lời giới thiệu (thay thế ID_PHIM, LINK_ANH, TÊN_PHIM bằng dữ liệu tương ứng):

        <a href="watch.html?id=ID_PHIM" style="display: flex; align-items: center; background: #1c1c1f; padding: 10px; border-radius: 8px; text-decoration: none; margin-top: 10px; border: 1px solid #444; transition: 0.3s;">
            <img src="LINK_ANH" style="width: 45px; height: 65px; border-radius: 4px; object-fit: cover; margin-right: 15px;">
            <div>
                <b style="color: #ffda76; font-size: 15px; display: block; margin-bottom: 5px;">TÊN_PHIM</b>
                <span style="color: #00d2ff; font-size: 12px; background: rgba(0, 210, 255, 0.1); padding: 3px 8px; border-radius: 10px;">▶ Nhấn để xem ngay</span>
            </div>
        </a>

        LƯU Ý: TRẢ VỀ HTML THUẦN TÚY, TUYỆT ĐỐI KHÔNG ĐƯỢC bọc trong thẻ code markdown (như \`\`\`html).

        Câu hỏi của người dùng: "${userMessage}"
        `;

        // 3. Gửi câu hỏi lên Gemini (Dùng bản 2.5-flash theo như test ban nãy nhé)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(systemPrompt);
        const responseText = result.response.text();

        // 4. Trả câu trả lời về cho giao diện
        res.json({ reply: responseText });

    } catch (error) {
        console.error('Lỗi Gemini API:', error);
        res.status(500).json({ reply: 'Xin lỗi, não bộ AI của tôi đang bảo trì một chút. Bạn hỏi lại sau nhé! 😅' });
    }
});

module.exports = router;