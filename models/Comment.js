const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    movieId: { type: String, required: true },
    username: { type: String, required: true }, // Tên đăng nhập gốc (để hệ thống nhận diện)
    fullName: { type: String, default: '' },    // Tên hiển thị (Tên chém gió)
    avatar: { type: String, default: 'https://i.pravatar.cc/150?img=11' },
    content: { type: String, required: true },
    
    parentId: { type: String, default: null }, 
    replyToUser: { type: String, default: null }, // Lưu TÊN ĐĂNG NHẬP của người bị reply
    
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', commentSchema);