// require('dotenv').config();
// const express = require('express');
// const SpotifyWebApi = require('spotify-web-api-node');
// const cors = require('cors');
// const fs = require('fs');
// const path = require('path');

// const app = express();
// app.use(cors());
// app.use(express.json());

// const DB_FILE = path.join(__dirname, 'albums.json');

// const spotifyApi = new SpotifyWebApi({
//   clientId: process.env.SPOTIFY_CLIENT_ID,
//   clientSecret: process.env.SPOTIFY_CLIENT_SECRET
// });

// // 获取 Token
// async function getSpotifyToken() {
//   try {
//     const data = await spotifyApi.clientCredentialsGrant();
//     spotifyApi.setAccessToken(data.body['access_token']);
//     console.log('✅ Spotify Token Updated');
//   } catch (error) {
//     console.error('❌ Token Error:', error);
//   }
// }
// getSpotifyToken();

// // === 辅助函数：读写本地 JSON 数据库 ===
// function readDb() {
//   if (!fs.existsSync(DB_FILE)) return [];
//   const data = fs.readFileSync(DB_FILE);
//   return JSON.parse(data);
// }

// function writeDb(data) {
//   fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
// }

// // === 核心算法：生成百分比坐标 ===
// // 这就是让你在手机/电脑上都能铺满全屏的关键
// const getRandomPosition = () => {
//   const top = Math.floor(Math.random() * 80) + 5;  // 5% ~ 85% (留出一点边缘)
//   const left = Math.floor(Math.random() * 80) + 5; // 5% ~ 85%
//   return { top: `${top}%`, left: `${left}%` }; // 返回带 % 的字符串
// };

// // === 接口 ===

// // 1. 获取所有专辑
// app.get('/api/albums', (req, res) => {
//   res.json(readDb());
// });

// // 2. 添加专辑
// app.post('/api/album-info', async (req, res) => {
//   const { link } = req.body;
//   if (!link) return res.status(400).json({ error: 'No link provided' });

//   try {
//     // 处理 Spotify 链接，获取 ID
//     const albumId = link.split('/album/')[1].split('?')[0];
//     const data = await spotifyApi.getAlbum(albumId);
    
//     // 生成百分比位置
//     const { top, left } = getRandomPosition();
    
//     const newAlbum = {
//       id: Date.now(),
//       name: data.body.name,
//       artist: data.body.artists[0].name,
//       coverImage: data.body.images[0].url,
//       spotifyUrl: data.body.external_urls.spotify,
//       releaseDate: data.body.release_date,
//       top,  // 保存百分比坐标
//       left, // 保存百分比坐标
//       comments: []
//     };

//     const currentAlbums = readDb();
//     currentAlbums.push(newAlbum);
//     writeDb(currentAlbums);
//     res.json(newAlbum);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed' });
//   }
// });

// // 3. 删除专辑
// app.delete('/api/albums/:id', (req, res) => {
//   const { id } = req.params;
//   let albums = readDb();
//   // 注意：前端传来的可能是字符串或数字，这里做个强制转换对比
//   const newAlbums = albums.filter(album => album.id != id);
//   writeDb(newAlbums);
//   res.json(newAlbums);
// });

// // 4. 全局洗牌 (Shuffle) - 【已修复】
// app.post('/api/albums/shuffle', (req, res) => {
//   try {
//     let albums = readDb(); // 读取本地数据
    
//     // 为每个专辑重新生成百分比位置
//     const shuffledAlbums = albums.map(album => {
//       const { top, left } = getRandomPosition();
//       return { 
//         ...album, 
//         top, 
//         left 
//       };
//     });
    
//     writeDb(shuffledAlbums); // 保存回本地文件
//     res.json(shuffledAlbums); // 发送给前端
//   } catch (error) {
//     console.error('Shuffle error:', error);
//     res.status(500).json({ error: 'Shuffle failed' });
//   }
// });

// // 5. 添加评论
// app.post('/api/albums/:id/comments', (req, res) => {
//   const { id } = req.params;
//   const { text } = req.body;
//   let albums = readDb();
  
//   const albumIndex = albums.findIndex(a => a.id == id);
//   if (albumIndex > -1) {
//     const newComment = {
//       id: Date.now(),
//       text,
//       date: new Date().toLocaleString()
//     };
//     if (!albums[albumIndex].comments) albums[albumIndex].comments = [];
//     albums[albumIndex].comments.push(newComment);
//     writeDb(albums);
//     res.json(albums[albumIndex]); 
//   } else {
//     res.status(404).json({ error: 'Album not found' });
//   }
// });

// // 6. 删除评论
// app.delete('/api/albums/:albumId/comments/:commentId', (req, res) => {
//   const { albumId, commentId } = req.params;
//   let albums = readDb();
  
//   const albumIndex = albums.findIndex(a => a.id == albumId);
//   if (albumIndex > -1 && albums[albumIndex].comments) {
//     albums[albumIndex].comments = albums[albumIndex].comments.filter(c => c.id != commentId);
//     writeDb(albums);
//     res.json(albums[albumIndex]);
//   } else {
//     res.status(404).json({ error: 'Not found' });
//   }
// });

// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config();
const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const cors = require('cors');
const mongoose = require('mongoose'); // 引入 mongoose

const app = express();
app.use(cors());
app.use(express.json());

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
app.post('/api/album-info', async (req, res) => {
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
app.delete('/api/albums/:id', async (req, res) => {
  try {
    await Album.deleteOne({ id: req.params.id }); // 从云端删
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

// 4. 全局洗牌 (更新所有坐标)
app.post('/api/albums/shuffle', async (req, res) => {
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
app.post('/api/albums/:id/comments', async (req, res) => {
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
app.delete('/api/albums/:albumId/comments/:commentId', async (req, res) => {
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