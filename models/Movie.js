const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    thumbnail: { type: String, required: true },
    episodes: [
        { name: { type: String }, url: { type: String } }
    ],
    status: { type: String, default: 'Đang chiếu' },

    genres: { type: [String], default: [] },
    type: { type: String, default: 'single' }, 
    views: { type: Number, default: 0 },
    description: { type: String, default: 'Đang cập nhật nội dung...' },
    slug: { type: String, required: true }
});

module.exports = mongoose.model('Movie', movieSchema);