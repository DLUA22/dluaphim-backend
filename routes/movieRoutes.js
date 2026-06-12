const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const Comment = require('../models/Comment');

// ==========================================
// NHÓM 1: CÁC API KHÔNG CÓ :id (PHẢI ĐẶT LÊN ĐẦU TIÊN)
// Để tránh việc Node.js hiểu nhầm chữ "leech" hay "top-views" là một cái ID phim
// ==========================================

// API 1: Lấy danh sách tất cả các phim
router.get('/', async (req, res) => {
    try {
        const movies = await Movie.find();
        res.json(movies);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// API 2: Thêm phim mới (Nhập tay)
router.post('/', async (req, res) => {
    const movie = new Movie({
        title: req.body.title,
        thumbnail: req.body.thumbnail,
        episodes: req.body.episodes,
        status: req.body.status,
        type: req.body.type,
        genres: req.body.genres
    });

    try {
        const newMovie = await movie.save();
        res.status(201).json(newMovie);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// API 3: Lấy 5 phim có lượt xem cao nhất
router.get('/top-views', async (req, res) => {
    try {
        const topMovies = await Movie.find().sort({ views: -1 }).limit(5);
        res.json(topMovies);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// API 4: Lấy Top 10 phim có lượt xem cao nhất
router.get('/top-10', async (req, res) => {
    try {
        const topMovies = await Movie.find().sort({ views: -1 }).limit(10);
        res.json(topMovies);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// API 5: Auto cào 5 phim mới (Leech)
router.post('/leech', async (req, res) => {
    try {
        const listRes = await fetch('https://phimapi.com/danh-sach/phim-moi-cap-nhat?page=1');
        const listData = await listRes.json();
        const moviesList = listData.items;

        let addedCount = 0;

        for (let i = 0; i < 5; i++) {
            const slug = moviesList[i].slug;
            const detailRes = await fetch(`https://phimapi.com/phim/${slug}`);
            const detailData = await detailRes.json();
            
            const movieData = detailData.movie;
            
            if (!detailData.episodes || detailData.episodes.length === 0 || !detailData.episodes[0].server_data) continue;

            const episodesData = detailData.episodes[0].server_data;
            const title = movieData.name;
            const thumbnail = movieData.thumb_url;
            const status = movieData.episode_current;
            const type = movieData.type; 
            const genres = movieData.category ? movieData.category.map(c => c.name) : [];

            const episodes = episodesData.map(ep => ({ name: ep.name, url: ep.link_m3u8 }));

            const existingMovie = await Movie.findOne({ title: title });
            if (!existingMovie && episodes.length > 0) {
                // Đã thêm slug và description để không bị lỗi 500
                const newMovie = new Movie({ 
                    title, thumbnail, episodes, status, genres, type,
                    slug: slug,
                    description: movieData.content || 'Đang cập nhật nội dung...'
                });
                await newMovie.save();
                addedCount++;
            }
        }
        res.json({ message: `Tuyệt vời! Đã lấy thành công ${addedCount} phim mới!` });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi cào phim: ' + err.message });
    }
});

// ==========================================
// API 6: Cài đặt Công Tắc Bảo Trì Server Video
// ==========================================
let isPlayerEnabled = true;

router.get('/settings/player', (req, res) => {
    res.json({ enabled: isPlayerEnabled });
});

router.post('/settings/player', (req, res) => {
    isPlayerEnabled = req.body.enabled;
    res.json({ message: "Đã cập nhật trạng thái", enabled: isPlayerEnabled });
});

// ==========================================
// API 6.1: Cào phim chính xác theo SLUG (Dùng cho Bảng tìm kiếm)
// ==========================================
router.post('/leech-by-slug', async (req, res) => {
    const slug = req.body.slug; 

    try {
        const detailRes = await fetch(`https://phimapi.com/phim/${slug}`);
        const detailData = await detailRes.json();
        
        if (!detailData.status) {
            return res.status(404).json({ message: "Không lấy được dữ liệu phim này" });
        }

        const movieData = detailData.movie;
        
        let episodes = [];
        if (detailData.episodes && detailData.episodes.length > 0 && detailData.episodes[0].server_data) {
            episodes = detailData.episodes[0].server_data.map(ep => ({
                name: ep.name,
                url: ep.link_m3u8
            }));
        }

        if (episodes.length === 0) {
            return res.status(400).json({ message: `Phim chưa có tập!` });
        }

        const title = movieData.name;
        const thumbnail = movieData.thumb_url;
        const status = movieData.episode_current;
        const type = movieData.type; 
        const genres = movieData.category ? movieData.category.map(c => c.name) : [];

        const existingMovie = await Movie.findOne({ slug: slug });
        if (existingMovie) {
            return res.status(400).json({ message: `Phim đã tồn tại!` });
        }

        const newMovie = new Movie({ 
            title, thumbnail, episodes, status, genres, type,
            slug: slug,
            description: movieData.content || 'Đang cập nhật nội dung...'
        });
        await newMovie.save();

        res.json({ message: `Thành công` });

    } catch (err) {
        console.error(err); 
        res.status(500).json({ message: 'Lỗi: ' + err.message });
    }
});

// API 7: Cào phim ngẫu nhiên theo thể loại
router.post('/leech-genre', async (req, res) => {
    const { genre } = req.body; 

    try {
        const randomPage = Math.floor(Math.random() * 5) + 1;
        const listRes = await fetch(`https://phimapi.com/v1/api/the-loai/${genre}?page=${randomPage}`);
        const listData = await listRes.json();
        
        let moviesList = [];
        if (listData.data && listData.data.items) {
            moviesList = listData.data.items; 
        }

        if (moviesList.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy phim cho thể loại này!' });
        }

        moviesList = moviesList.sort(() => 0.5 - Math.random());
        
        const targetMovies = moviesList.slice(0, 5);
        let addedCount = 0;

        for (let i = 0; i < targetMovies.length; i++) {
            const slug = targetMovies[i].slug;
            const detailRes = await fetch(`https://phimapi.com/phim/${slug}`);
            const detailData = await detailRes.json();
            
            const movieData = detailData.movie;
            
            if (!detailData.episodes || detailData.episodes.length === 0 || !detailData.episodes[0].server_data) continue;

            const episodesData = detailData.episodes[0].server_data;
            const title = movieData.name;
            const thumbnail = movieData.thumb_url;
            const status = movieData.episode_current;
            const type = movieData.type; 
            const genres = movieData.category ? movieData.category.map(c => c.name) : [];
            const episodes = episodesData.map(ep => ({ name: ep.name, url: ep.link_m3u8 }));

            const existingMovie = await Movie.findOne({ title: title });
            if (!existingMovie && episodes.length > 0) {
                // Đã thêm slug và description
                const newMovie = new Movie({ 
                    title, thumbnail, episodes, status, genres, type,
                    slug: slug,
                    description: movieData.content || 'Đang cập nhật nội dung...'
                });
                await newMovie.save();
                addedCount++;
            }
        }
        res.json({ message: `🎉 Đã cào thành công ${addedCount} phim ngẫu nhiên thuộc thể loại bạn chọn!` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi khi cào phim: ' + err.message });
    }
});

// ==========================================
// API 8: Đồng bộ tất cả phim (Bản nâng cấp - Cứu cả phim cũ thiếu slug)
// ==========================================
router.post('/sync-all', async (req, res) => {
    try {
        // Lấy TẤT CẢ phim trong Database, không chừa bộ nào
        const movies = await Movie.find();
        let updatedCount = 0;

        for (let movie of movies) {
            try {
                let currentSlug = movie.slug;

                // 1. NẾU LÀ PHIM CŨ CHƯA CÓ SLUG -> Đi tìm slug bằng tên phim
                if (!currentSlug) {
                    const searchRes = await fetch(`https://phimapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(movie.title)}&limit=1`);
                    const searchData = await searchRes.json();
                    
                    if (searchData.data && searchData.data.items && searchData.data.items.length > 0) {
                        currentSlug = searchData.data.items[0].slug;
                        movie.slug = currentSlug; // Bù đắp slug vào Database cho phim cũ luôn
                    }
                }

                // 2. KHI ĐÃ CÓ SLUG -> Tiến hành vào KKPhim lấy Mô tả và Tập mới
                if (currentSlug) {
                    const response = await fetch(`https://phimapi.com/phim/${currentSlug}`);
                    const data = await response.json();

                    if (data.status) {
                        // Cập nhật trạng thái tập
                        movie.status = data.movie.episode_current || movie.status;
                        
                        // Cập nhật nội dung
                        if (data.movie.content) {
                            movie.description = data.movie.content;
                        }
                        
                        // Cập nhật link tập phim
                        if (data.episodes && data.episodes.length > 0) {
                            movie.episodes = data.episodes[0].server_data.map(ep => ({
                                name: ep.name,
                                url: ep.link_m3u8
                            }));
                        }
                        await movie.save(); 
                        updatedCount++;
                    }
                }
            } catch (fetchErr) {
                console.error(`Lỗi khi đồng bộ phim ${movie.title}:`, fetchErr.message);
            }
        }
        res.json({ message: `Hoàn tất! Đã đồng bộ và vá lỗi thành công ${updatedCount} bộ phim.`, updatedCount });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server khi đồng bộ: ' + err.message });
    }
});
router.get('/notifications/:username', async (req, res) => {
    try {
        const notifications = await Comment.find({ 
            replyToUser: req.params.username,
            isNotiRead: { $ne: true } // Lọc bỏ những cái đã bị đánh dấu ẩn
        }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// API 8.6: XÓA (ẨN) 1 THÔNG BÁO TỪ NÚT "X"
router.put('/notifications/:id/read', async (req, res) => {
    try {
        await Comment.findByIdAndUpdate(req.params.id, { isNotiRead: true });
        res.json({ message: 'Đã ẩn thông báo' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// API 8.7: XÓA (ẨN) TẤT CẢ THÔNG BÁO CÙNG LÚC
router.put('/notifications/clear-all/:username', async (req, res) => {
    try {
        await Comment.updateMany({ replyToUser: req.params.username }, { isNotiRead: true });
        res.json({ message: 'Đã ẩn tất cả' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// ==========================================
// NHÓM 2: CÁC API CÓ CHỨA THAM SỐ :id (PHẢI ĐẶT Ở DƯỚI CÙNG)
// ==========================================

// API 9: Tăng lượt xem (Hỗ trợ cả slug và ID cũ)
router.post('/:id/view', async (req, res) => {
    try {
        let movie = await Movie.findOneAndUpdate({ slug: req.params.id }, { $inc: { views: 1 } });
        
        // Nếu không tìm thấy bằng slug, và mã gửi lên đúng chuẩn 24 ký tự của MongoDB
        if (!movie && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            movie = await Movie.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
        }
        res.json({ message: 'Đã tăng 1 view' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// API 10: Lấy danh sách bình luận của 1 phim
router.get('/:id/comments', async (req, res) => {
    try {
        // Vì bên Schema đã đổi thành String, nó sẽ tìm khớp chính xác cái slug gửi lên
        const comments = await Comment.find({ movieId: req.params.id }).sort({ createdAt: -1 });
        res.json(comments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// API 11: Viết bình luận mới
router.post('/:id/comments', async (req, res) => {
    try {
        // Nhận thêm fullName
        const { username, fullName, avatar, content, parentId, replyToUser } = req.body;
        
        if (!username || !content) return res.status(400).json({ message: 'Thiếu thông tin!' });

        const newComment = new Comment({
            movieId: req.params.id,
            username,
            fullName, // Lưu tên hiển thị
            avatar,
            content,
            parentId: parentId || null,
            replyToUser: replyToUser || null
        });

        await newComment.save();
        res.status(201).json(newComment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// API 12: Lấy chi tiết 1 phim
router.get('/:id', async (req, res) => {
    try {
        let movie = await Movie.findOne({ slug: req.params.id });
        if (!movie && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            movie = await Movie.findById(req.params.id);
        }
        res.json(movie);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// API 13: Cập nhật (Sửa) phim
router.put('/:id', async (req, res) => {
    try {
        const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedMovie);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// API 14: Xóa phim
router.delete('/:id', async (req, res) => {
    try {
        await Movie.findByIdAndDelete(req.params.id);
        res.json({ message: 'Đã xóa phim thành công!' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// XUẤT ROUTER RA NGOÀI (LUÔN NẰM Ở DƯỚI CÙNG)
module.exports = router;