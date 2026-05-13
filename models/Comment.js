const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    movieId: { type: String, required: true },
    username: { type: String, required: true },
    avatar: { type: String, default: 'https://i.pravatar.cc/150?img=11' },
    content: { type: String, required: true },
    
    // THÊM 2 TRƯỜNG NÀY ĐỂ LÀM TÍNH NĂNG TRẢ LỜI & THÔNG BÁO SAU NÀY
    parentId: { type: String, default: null }, // Lưu ID của bình luận gốc (nếu đây là reply)
    replyToUser: { type: String, default: null }, // Lưu tên người bị reply để sau này bắn thông báo
    
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', commentSchema);