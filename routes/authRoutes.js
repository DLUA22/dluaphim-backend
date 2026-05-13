const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 1. API Đăng ký tài khoản
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Kiểm tra xem tên này có ai đăng ký chưa
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại!' });
        }

        // Nếu chưa có thì tạo mới
        const newUser = new User({ username, password });
        await newUser.save();
        res.status(201).json({ message: 'Đăng ký thành công!' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. API Đăng nhập
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Tìm xem có tài khoản nào khớp cả tên lẫn mật khẩu không
        const user = await User.findOne({ username, password });
        
        if (!user) {
            return res.status(400).json({ message: 'Sai tên đăng nhập hoặc mật khẩu!' });
        }

        // Nếu đúng thì trả về thông tin (bao gồm cả quyền admin hay user)
        res.json({ 
            message: 'Đăng nhập thành công', 
            username: user.username, 
            role: user.role 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;