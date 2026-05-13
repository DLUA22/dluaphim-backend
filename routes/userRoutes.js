const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Movie = require('../models/Movie');

router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Xóa thành viên
router.delete('/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Đã xóa thành viên thành công!' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
router.post('/toggle-favorite', async (req, res) => {
    const { username, movieId } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });

        // Kiểm tra xem ID phim này đã có trong danh sách favorites chưa
        const index = user.favorites.indexOf(movieId);
        let isFavorited = false;

        if (index === -1) {
            // Nếu chưa có -> Thêm vào danh sách (Thả tim)
            user.favorites.push(movieId);
            isFavorited = true;
        } else {
            // Nếu có rồi -> Xóa khỏi danh sách (Bỏ tim)
            user.favorites.splice(index, 1);
        }

        await user.save(); // Lưu lại vào Database
        res.json({ isFavorited, message: 'Thành công' });

    } catch (err) {
        res.status(500).json({ message: 'Lỗi server: ' + err.message });
    }
});
router.get('/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản!' });
        
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server: ' + err.message });
    }
});
router.put('/:username/profile', async (req, res) => {
    try {
        const { avatar, newPassword, fullName, address, phone } = req.body;
        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });

        // Cập nhật các trường nếu có gửi lên
        if (avatar) user.avatar = avatar; 
        if (newPassword) user.password = newPassword; 
        if (fullName !== undefined) user.fullName = fullName;
        if (address !== undefined) user.address = address;
        if (phone !== undefined) user.phone = phone;

        await user.save();
        res.json({ message: 'Cập nhật thông tin thành công!', avatar: user.avatar });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// API: Tự động thêm phim vào Lịch sử xem
router.post('/history', async (req, res) => {
    try {
        const { username, movieId } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });

        // Xóa phim này khỏi lịch sử (nếu đã xem trước đó) để đẩy nó lên đầu danh sách mới nhất
        user.history = user.history.filter(id => id !== movieId);
        
        // Thêm phim vào cuối mảng lịch sử
        user.history.push(movieId);

        // Giữ tối đa 50 phim trong lịch sử cho nhẹ máy
        if (user.history.length > 50) user.history.shift(); 

        await user.save();
        res.json({ message: 'Đã lưu lịch sử' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/:username/history', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        user.history = []; // Xóa trắng mảng lịch sử
        await user.save();
        res.json({ message: 'Đã xóa toàn bộ lịch sử xem phim!' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
router.get('/:username/favorites-details', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });

        // Lệnh $in: Tìm tất cả phim có _id nằm trong mảng user.favorites
        const favoriteMovies = await Movie.find({ _id: { $in: user.favorites } });
        
        res.json(favoriteMovies); // Trả về thẳng danh sách phim (rất nhẹ)
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
module.exports = router;