const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: 'https://i.pravatar.cc/150?img=11' }, 
    fullName: { type: String, default: '' },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    favorites: { type: [String], default: [] }, 
    history: { type: Array, default: [] },

    // THÊM DÒNG NÀY: Mặc định ai đăng ký cũng chỉ là 'user' (người dùng thường)
    role: { type: String, default: 'user' } 
});

module.exports = mongoose.model('User', userSchema);