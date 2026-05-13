const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    movieId: { type: String, required: true },
    username: { type: String, required: true },
    fullName: { type: String, default: '' },
    avatar: { type: String, default: 'https://i.pravatar.cc/150?img=11' },
    content: { type: String, required: true },
    
    parentId: { type: String, default: null }, 
    replyToUser: { type: String, default: null },
    isNotiRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', commentSchema);