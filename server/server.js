const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config();
const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const cors = require('cors');
const mongoose = require('mongoose'); // 引入 mongoose
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

// === Admin 鉴权：密码只存在于服务端环境变量 ===
const sha256 = (s) => crypto.createHash('sha256').update(String(s)).digest();
const isValidPassword = (pwd) => {
  if (!process.env.ADMIN_PASSWORD || !pwd) return false;
  return crypto.timingSafeEqual(sha256(pwd), sha256(process.env.ADMIN_PASSWORD));
};
const requireAdmin = (req, res, next) => {
  if (!isValidPassword(req.get('x-admin-password'))) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

app.post('/api/admin/verify', (req, res) => {
  if (!isValidPassword(req.body.password)) return res.status(401).json({ ok: false });
  res.json({ ok: true });
});

// === 1. 连接 MongoDB 云端数据库 ===
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// === 2. 定义数据模型 (Schema) ===
// 这就像是给你的 CD 建立档案格式
const albumSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // 使用 String 类型的 ID
  name: String,
  artist: String,
  coverImage: String,
  spotifyUrl: String,
  releaseDate: String,
  top: String,
  left: String,
  comments: [{
    id: String,
    text: String,
    date: String
  }]
});

const Album = mongoose.model('Album', albumSchema);

// === Spotify 配置 ===
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

async function getSpotifyToken() {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body['access_token']);
    console.log('✅ Spotify Token Updated');
  } catch (error) {
    console.error('❌ Token Error:', error);
  }
}
getSpotifyToken();
// Spotify token 有效期 1 小时，提前刷新
setInterval(getSpotifyToken, 50 * 60 * 1000);

// === 辅助：生成百分比坐标 ===
const getRandomPosition = () => {
  const top = Math.floor(Math.random() * 80) + 5; 
  const left = Math.floor(Math.random() * 80) + 5;
  return { top: `${top}%`, left: `${left}%` };
};

// === 接口 API (全部改写为 Mongoose 语法) ===

// 1. 获取所有专辑
app.get('/api/albums', async (req, res) => {
  try {
    const albums = await Album.find(); // 从云端查
    res.json(albums);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. 添加专辑
app.post('/api/album-info', requireAdmin, async (req, res) => {
  const { link } = req.body;
  if (!link) return res.status(400).json({ error: 'No link provided' });

  try {
    const albumId = link.split('/album/')[1].split('?')[0];
    const data = await spotifyApi.getAlbum(albumId);
    const { top, left } = getRandomPosition();

    // 创建新文档
    const newAlbum = new Album({
      id: Date.now().toString(), // 转成字符串，保险
      name: data.body.name,
      artist: data.body.artists[0].name,
      coverImage: data.body.images[0].url,
      spotifyUrl: data.body.external_urls.spotify,
      releaseDate: data.body.release_date,
      top,
      left,
      comments: []
    });

    await newAlbum.save(); // 保存到云端
    res.json(newAlbum);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add album' });
  }
});

// 3. 删除专辑
app.delete('/api/albums/:id', requireAdmin, async (req, res) => {
  try {
    await Album.deleteOne({ id: req.params.id }); // 从云端删
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

// 4. 全局洗牌 (更新所有坐标)
app.post('/api/albums/shuffle', requireAdmin, async (req, res) => {
  try {
    const albums = await Album.find();
    
    // 并行更新所有专辑的坐标
    const updates = albums.map(async (album) => {
      const { top, left } = getRandomPosition();
      album.top = top;
      album.left = left;
      return album.save();
    });
    
    await Promise.all(updates); // 等待所有保存完成
    res.json(await Album.find()); // 返回最新的
  } catch (error) {
    res.status(500).json({ error: 'Shuffle failed' });
  }
});

// 5. 添加评论
app.post('/api/albums/:id/comments', requireAdmin, async (req, res) => {
  try {
    const album = await Album.findOne({ id: req.params.id });
    if (!album) return res.status(404).json({ error: 'Not found' });

    album.comments.push({
      id: Date.now().toString(),
      text: req.body.text,
      date: new Date().toLocaleString()
    });
    
    await album.save();
    res.json(album);
  } catch (err) {
    res.status(500).json({ error: 'Comment failed' });
  }
});

// 6. 删除评论
app.delete('/api/albums/:albumId/comments/:commentId', requireAdmin, async (req, res) => {
  try {
    const album = await Album.findOne({ id: req.params.albumId });
    if (!album) return res.status(404).json({ error: 'Not found' });

    // 过滤掉那条评论
    album.comments = album.comments.filter(c => c.id !== req.params.commentId);
    
    await album.save();
    res.json(album);
  } catch (err) {
    res.status(500).json({ error: 'Delete comment failed' });
  }
});

const PORT = process.env.PORT || 5000; // 适配 Render 端口
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});