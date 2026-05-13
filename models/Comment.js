const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    // SỬA Ở ĐÂY: Đổi type thành String để nó nhận được cả số lẫn chữ (slug)
    movieId: { type: String, required: true },
    
    // Thông tin người bình luận
    username: { type: String, required: true },
    avatar: { type: String, default: 'https://i.pravatar.cc/150?img=11' },
    
    // Nội dung và thời gian
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', commentSchema);