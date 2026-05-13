const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    movieId: { type: String, required: true },
    username: { type: String, required: true },
    avatar: { type: String, default: 'https://i.pravatar.cc/150?img=11' },
    content: { type: String, required: true },
    
    // BẮT BUỘC PHẢI CÓ 2 DÒNG NÀY ĐỂ NHẬN DIỆN CÂU TRẢ LỜI
    parentId: { type: String, default: null }, 
    replyToUser: { type: String, default: null }, 
    
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', commentSchema);