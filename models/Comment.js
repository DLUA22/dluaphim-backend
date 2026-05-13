const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    // Lưu ID của bộ phim để biết bình luận này thuộc về phim nào
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    
    // Thông tin người bình luận
    username: { type: String, required: true },
    avatar: { type: String, default: 'https://i.pravatar.cc/150?img=11' },
    
    // Nội dung và thời gian
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', commentSchema);