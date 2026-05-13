require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors()); 
app.use(express.json({ limit: '10mb' }));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Đã kết nối Database thành công!'))
    .catch(err => console.log('❌ Lỗi kết nối Database:', err));

const movieRoutes = require('./routes/movieRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes); 
app.use('/api/chat', chatRoutes);

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server backend đang chạy tại http://localhost:${PORT}`);
});