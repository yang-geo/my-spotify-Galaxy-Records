import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import AddAlbumModal from './AddAlbumModal';
import Sidebar from './Sidebar';
import AlbumDetailModal from './AlbumDetailModal';
import DialogModal from './DialogModal';

function App() {
  // === 核心数据 ===
  const [allAlbums, setAllAlbums] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [displayedAlbums, setDisplayedAlbums] = useState([]); 
  
  // === UI 状态 ===
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [dialog, setDialog] = useState({ isOpen: false, type: '', message: '', action: null });
  const [isNoteOpen, setIsNoteOpen] = useState(false);

  // === 洗牌与显示控制 ===
  const [isAutoShuffle, setIsAutoShuffle] = useState(false);
  const [shuffleInterval, setShuffleInterval] = useState(10);
  
  // 新增：isLocked 状态，默认为 false
  const [isLocked, setIsLocked] = useState(false); 
  
  // 修改：displayLimit 初始值可以是数字，也可以是字符串 'ALL'
  const [displayLimit, setDisplayLimit] = useState(10); 
  
  const [showShuffleSettings, setShowShuffleSettings] = useState(false);
  const shuffleTimerRef = useRef(null);
  const BACKEND_URL = 'https://galaxy-backend-i0q1.onrender.com';

  // === 初始化 ===
  // useEffect(() => {
  //   fetchAllAlbums();
  // }, []);
  useEffect(() => {
    // 2. 修改：请求开始时确保 loading 为 true，结束后设为 false
    const fetchAlbums = async () => {
      try {
        setLoading(true);
        // 注意：这里要把 localhost 换成你 Render 的后端地址
        const response = await fetch('https://galaxy-backend-i0q1.onrender.com');
        const data = await response.json();
        setAllAlbums(data);
        updateDisplayedSubset(data, displayLimit);
      } catch (error) {
        console.error("Error fetching albums:", error);
      } finally {
        setLoading(false); // 无论成功失败，都停止加载动画
      }
    };

    fetchAlbums();
  }, []);
 
  // === 自动洗牌定时器 ===
  useEffect(() => {
    if (shuffleTimerRef.current) clearInterval(shuffleTimerRef.current);
    if (isAutoShuffle) {
      shuffleTimerRef.current = setInterval(() => {
        performSmartShuffle(); 
      }, shuffleInterval * 1000);
    }
    return () => clearInterval(shuffleTimerRef.current);
  }, [isAutoShuffle, shuffleInterval, displayLimit, allAlbums, isLocked]); // 依赖项加入 isLocked

  // === 获取所有数据 ===
  const fetchAllAlbums = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/albums`);
      // const res = await axios.get('http://localhost:5000/api/albums');
      setAllAlbums(res.data);
      // 首次加载
      updateDisplayedSubset(res.data, displayLimit);
    } catch (error) {
      console.error('Error fetching albums:', error);
    }
  };

  // === 辅助：生成随机坐标 ===
  const getRandomCoords = () => ({
    top: `${Math.floor(Math.random() * 75) + 5}%`,
    left: `${Math.floor(Math.random() * 75) + 5}%`
  });

  // === 核心功能：智能洗牌 (Smart Shuffle) ===
  const performSmartShuffle = () => {
    if (isLocked) {
      // 🔒 锁定模式：
      // 不换专辑，只换位置！
      // 因为 ID 不变，React 会复用 DOM，CSS transition 动画就会生效！
      const movedAlbums = displayedAlbums.map(album => ({
        ...album,
        ...getRandomCoords() // 只更新坐标
      }));
      setDisplayedAlbums(movedAlbums);
    } else {
      // 🔓 未锁定模式：
      // 从全集里重新抽取一批新的（像放回取样）
      // 如果你选的是 'ALL'，这里依然会触发动画，因为全集ID也没变
      updateDisplayedSubset(allAlbums, displayLimit);
    }
  };

  // === 辅助：从全集中抽取 N 个并生成新坐标 ===
  const updateDisplayedSubset = (sourceAlbums, limit) => {
    if (!sourceAlbums || sourceAlbums.length === 0) return;

    let subset;

    // 如果选择显示 "ALL"，则不进行切片
    if (limit === 'ALL') {
      subset = [...sourceAlbums]; // 复制一份
    } else {
      // 1. 随机打乱全集
      const shuffled = [...sourceAlbums].sort(() => 0.5 - Math.random());
      // 2. 截取前 N 个
      subset = shuffled.slice(0, limit);
    }

    // 3. 生成坐标
    const positionedSubset = subset.map(album => ({
      ...album,
      ...getRandomCoords()
    }));

    setDisplayedAlbums(positionedSubset);
  };

  // === 搜索逻辑 ===
  const handleSearch = (query) => {
    const lowerQ = query.toLowerCase();
    if (!query) {
      performSmartShuffle(); 
      return;
    }
    const filtered = allAlbums.filter(a => 
      a.name.toLowerCase().includes(lowerQ) || 
      a.artist.toLowerCase().includes(lowerQ)
    );
    const positionedFiltered = filtered.map(album => ({
       ...album,
       ...getRandomCoords()
    }));
    setDisplayedAlbums(positionedFiltered);
  };

  // === 删除逻辑 ===
  const confirmDeleteAlbum = (id) => {
     setDialog({ isOpen: true, type: 'confirm', message: 'Delete this album?', action: () => { handleDeleteAlbum(id); setDialog({ ...dialog, isOpen: false }); } });
  };
  const handleDeleteAlbum = async (id) => {
    try { 
      // await axios.delete(`http://localhost:5000/api/albums/${id}`); 
      await axios.delete(`${BACKEND_URL}/api/albums/${id}`);
      fetchAllAlbums(); 
    } catch (error) { setDialog({ isOpen: true, type: 'alert', message: 'Delete failed', action: null }); }
  };

  const handleAddComment = async (albumId, text) => { try { const res = await axios.post(`https://galaxy-backend-i0q1.onrender.com/api/albums/${albumId}/comments`, { text }); const updatedList = allAlbums.map(a => a.id === albumId ? res.data : a); setAllAlbums(updatedList); setDisplayedAlbums(prev => prev.map(a => a.id === albumId ? res.data : a)); setSelectedAlbum(res.data); } catch (error) {} };
  const handleDeleteComment = async (albumId, commentId) => { try { const res = await axios.delete(`https://galaxy-backend-i0q1.onrender.com/api/albums/${albumId}/comments/${commentId}`); const updatedList = allAlbums.map(a => a.id === albumId ? res.data : a); setAllAlbums(updatedList); setDisplayedAlbums(prev => prev.map(a => a.id === albumId ? res.data : a)); setSelectedAlbum(res.data); } catch (error) {} };
  const handleLaunch = async (linkString) => { setIsAddModalOpen(false); if (!linkString) return; try { const response = await axios.post('https://galaxy-backend-i0q1.onrender.com/api/album-info', { link: linkString }); const newAll = [...allAlbums, response.data]; setAllAlbums(newAll); updateDisplayedSubset(newAll, displayLimit); } catch (error) { setDialog({ isOpen: true, type: 'alert', message: 'Failed to add album', action: null }); } };
  const handleOpenNote = () => { setIsSidebarOpen(false); setIsNoteOpen(true); };

//   return (
//     <div className="App">
//       <h1>Galaxy Records</h1>

//       {isSidebarOpen && <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2500, background: 'rgba(0,0,0,0.3)' }} />}

//       <button className="menu-btn" onClick={() => setIsSidebarOpen(true)}>☰ Library</button>

//       {/* === 右上角控制区 === */}
//       <div className="shuffle-container" style={{ position: 'absolute', top: 20, right: 20, zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        
//         {/* 给这个 div 加一个 class，方便 CSS 控制换行 */}
//         <div className="shuffle-controls-row">
            
//             {/* 1. 设置按钮 (不需要改，本身就是图标) */}
//             <button className={`shuffle-btn settings-btn ${showShuffleSettings ? 'active' : ''}`} onClick={() => setShowShuffleSettings(!showShuffleSettings)}>
//                 ⚙️
//             </button>
            
//             {/* 2. 锁定按钮 */}
//             <button 
//                 className={`shuffle-btn ${isLocked ? 'active' : ''}`} 
//                 onClick={() => setIsLocked(!isLocked)}
//                 style={isLocked ? { borderColor: '#1DB954', color: '#1DB954' } : {}}
//             >
//                 {/* 拆分图标和文字 */}
//                 <span className="btn-icon">{isLocked ? '🔒' : '🔓'}</span>
//                 <span className="btn-text">{isLocked ? 'Locked' : 'Unlocked'}</span>
//             </button>

//             {/* 3. 自动洗牌按钮 */}
//             <button className={`shuffle-btn ${isAutoShuffle ? 'active-pulse' : ''}`} onClick={() => setIsAutoShuffle(!isAutoShuffle)}>
//                 <span className="btn-icon">{isAutoShuffle ? '⏹' : '🔄'}</span>
//                 {/* 这里的文字是动态的 */}
//                 <span className="btn-text">
//                     {isAutoShuffle ? `${shuffleInterval}s` : 'Auto'}
//                 </span>
//             </button>
            
//             {/* 4. 立即洗牌按钮 */}
//             <button className="shuffle-btn" onClick={performSmartShuffle}>
//                 <span className="btn-icon">🎲</span>
//                 <span className="btn-text">Shuffle</span>
//             </button>
//         </div>

//         {/* 下拉设置面板 */}
//         {showShuffleSettings && (
//             <div className="shuffle-settings-panel">
                
//                 {/* 1. 数量控制 */}
//                 <p>Display Limit:</p>
//                 <div className="interval-options" style={{marginBottom: '15px'}}>
//                     {[5, 10, 20].map(num => (
//                         <button key={num} className={`interval-btn ${displayLimit === num ? 'selected' : ''}`}
//                             onClick={() => { 
//                                 setDisplayLimit(num); 
//                                 setIsLocked(false); // 切换数量时，建议先解锁，否则可能逻辑奇怪
//                                 updateDisplayedSubset(allAlbums, num); 
//                             }}>
//                             {num}
//                         </button>
//                     ))}
//                     {/* 新增 ALL 按钮 */}
//                     <button className={`interval-btn ${displayLimit === 'ALL' ? 'selected' : ''}`}
//                          onClick={() => { 
//                              setDisplayLimit('ALL'); 
//                              updateDisplayedSubset(allAlbums, 'ALL'); 
//                          }}>
//                         All
//                     </button>
//                 </div>

//                 {/* 2. 频率控制 */}
//                 <p>Shuffle Interval:</p>
//                 <div className="interval-options">
//                     {[5, 10, 30, 60].map(time => (
//                         <button key={time} className={`interval-btn ${shuffleInterval === time ? 'selected' : ''}`}
//                             onClick={() => setShuffleInterval(time)}>
//                             {time}s
//                         </button>
//                     ))}
//                 </div>
//             </div>
//         )}
//       </div>

//       <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(false)} albums={allAlbums} onDelete={confirmDeleteAlbum} onSearch={handleSearch} onSelect={(album) => { setSelectedAlbum(album); setIsSidebarOpen(false); }} onOpenNote={handleOpenNote} />

//       {/* 渲染区域 */}
//       {/* <div className="album-container">
//         {displayedAlbums.map((album) => (
//           <div key={album.id} className="floating-album" style={{ top: album.top, left: album.left }} onClick={() => setSelectedAlbum(album)}>
//             <img src={album.coverImage} alt={album.name} />
//             <div className="album-info"><p>{album.name}</p><span>{album.artist}</span></div>
//           </div>
//         ))}
//       </div> */}
//       <div className="album-container">
//         {displayedAlbums.map((album) => (
//           <div 
//             key={album.id}
//             // 关键修改：如果 isLocked 为 true，就加上 'animate' 这个类名
//             className={`floating-album ${isLocked ? 'animate' : ''}`}
//             style={{ top: album.top, left: album.left }} 
//             onClick={() => setSelectedAlbum(album)}
//           >
//             <img src={album.coverImage} alt={album.name} />
//             <div className="album-info"><p>{album.name}</p><span>{album.artist}</span></div>
//           </div>
//         ))}
//       </div>

//       {/* 底部与弹窗组件保持不变 */}
//       <div className="bottom-bar">
//         <button className="add-album-btn" onClick={() => setIsAddModalOpen(true)}><span className="btn-icon">+</span><span className="btn-text">Add Album</span></button>
//       </div>

//       <AddAlbumModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onLaunch={handleLaunch} />
//       <AlbumDetailModal album={selectedAlbum} onClose={() => setSelectedAlbum(null)} onAddComment={handleAddComment} onDeleteComment={handleDeleteComment} />
//       <DialogModal isOpen={dialog.isOpen} type={dialog.type} message={dialog.message} onConfirm={dialog.action} onClose={() => setDialog({ ...dialog, isOpen: false })} />
      
//       {isNoteOpen && (
//         <div className="note-overlay" onClick={() => setIsNoteOpen(false)}>
//           <div className="note-content" onClick={(e) => e.stopPropagation()}>
//             <div className="note-inner">
//               <p>在武汉的时候，我有一台老旧的松下 CD 机，一叠 CD。里头有林生祥、有 Chinese Football、有 Blur。全部放在桌上的架子里，没有红心、没有评论、没有播放量，也没有排名。</p>
//               <p>我有点怀念从架子上抽出 CD 塞进机器，按播放键，一首一首按着顺序听完，再取出来，换下一张。</p>
//               <p>所以在这里，没有必听歌单，没有火热排名。只有屏幕上随机晃动的专辑封面，和你亲手选出的、在这一刻你最想听的那张专辑。</p>
//               <p className="note-footer">换一种听歌方式，听这一刻我最想听的歌。</p>
//             </div>
//             <button className="close-note-btn" onClick={() => setIsNoteOpen(false)}>关闭</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
// ... 前面的逻辑代码保持不变 ...

  return (
    <div className="App">
      {/* 1. Loading 遮罩层：当服务器正在唤醒时显示 */}
      {loading ? (
        <div className="loading-screen" style={{
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh',
          backgroundColor: '#121212', // 保持和你的主题色一致
          color: 'white'
        }}>
          <div className="spinning-record" style={{ fontSize: '60px', marginBottom: '20px' }}>💿</div>
          <h2 style={{ fontWeight: '300', letterSpacing: '2px' }}>GALAXY RECORDS</h2>
          <p style={{ color: '#b3b3b3', marginTop: '10px' }}>唤醒云端服务器中...</p>
          <p style={{ color: '#666', fontSize: '12px' }}>初次加载可能需要约 50 秒，请稍候</p>
        </div>
      ) : (
        /* 2. 真正的 UI 内容：当数据加载完成后显示 */
        <>
          <h1>Galaxy Records</h1>
          
          {isSidebarOpen && <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2500, background: 'rgba(0,0,0,0.3)' }} />}

          <button className="menu-btn" onClick={() => setIsSidebarOpen(true)}>☰ Library</button>

          {/* === 右上角控制区 === */}
          <div className="shuffle-container" style={{ position: 'absolute', top: 20, right: 20, zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div className="shuffle-controls-row">
                <button className={`shuffle-btn settings-btn ${showShuffleSettings ? 'active' : ''}`} onClick={() => setShowShuffleSettings(!showShuffleSettings)}>
                    ⚙️
                </button>
                
                <button 
                    className={`shuffle-btn ${isLocked ? 'active' : ''}`} 
                    onClick={() => setIsLocked(!isLocked)}
                    style={isLocked ? { borderColor: '#1DB954', color: '#1DB954' } : {}}
                >
                    <span className="btn-icon">{isLocked ? '🔒' : '🔓'}</span>
                    <span className="btn-text">{isLocked ? 'Locked' : 'Unlocked'}</span>
                </button>

                <button className={`shuffle-btn ${isAutoShuffle ? 'active-pulse' : ''}`} onClick={() => setIsAutoShuffle(!isAutoShuffle)}>
                    <span className="btn-icon">{isAutoShuffle ? '⏹' : '🔄'}</span>
                    <span className="btn-text">
                        {isAutoShuffle ? `${shuffleInterval}s` : 'Auto'}
                    </span>
                </button>
                
                <button className="shuffle-btn" onClick={performSmartShuffle}>
                    <span className="btn-icon">🎲</span>
                    <span className="btn-text">Shuffle</span>
                </button>
            </div>

            {showShuffleSettings && (
                <div className="shuffle-settings-panel">
                    <p>Display Limit:</p>
                    <div className="interval-options" style={{marginBottom: '15px'}}>
                        {[5, 10, 20].map(num => (
                            <button key={num} className={`interval-btn ${displayLimit === num ? 'selected' : ''}`}
                                onClick={() => { 
                                    setDisplayLimit(num); 
                                    setIsLocked(false); 
                                    updateDisplayedSubset(allAlbums, num); 
                                }}>
                                {num}
                            </button>
                        ))}
                        <button className={`interval-btn ${displayLimit === 'ALL' ? 'selected' : ''}`}
                             onClick={() => { 
                                 setDisplayLimit('ALL'); 
                                 updateDisplayedSubset(allAlbums, 'ALL'); 
                             }}>
                            All
                        </button>
                    </div>

                    <p>Shuffle Interval:</p>
                    <div className="interval-options">
                        {[5, 10, 30, 60].map(time => (
                            <button key={time} className={`interval-btn ${shuffleInterval === time ? 'selected' : ''}`}
                                onClick={() => setShuffleInterval(time)}>
                                {time}s
                            </button>
                        ))}
                    </div>
                </div>
            )}
          </div>

          <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(false)} albums={allAlbums} onDelete={confirmDeleteAlbum} onSearch={handleSearch} onSelect={(album) => { setSelectedAlbum(album); setIsSidebarOpen(false); }} onOpenNote={handleOpenNote} />

          <div className="album-container">
            {displayedAlbums.map((album) => (
              <div 
                key={album.id}
                className={`floating-album ${isLocked ? 'animate' : ''}`}
                style={{ top: album.top, left: album.left }} 
                onClick={() => setSelectedAlbum(album)}
              >
                <img src={album.coverImage} alt={album.name} />
                <div className="album-info"><p>{album.name}</p><span>{album.artist}</span></div>
              </div>
            ))}
          </div>

          <div className="bottom-bar">
            <button className="add-album-btn" onClick={() => setIsAddModalOpen(true)}><span className="btn-icon">+</span><span className="btn-text">Add Album</span></button>
          </div>

          <AddAlbumModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onLaunch={handleLaunch} />
          <AlbumDetailModal album={selectedAlbum} onClose={() => setSelectedAlbum(null)} onAddComment={handleAddComment} onDeleteComment={handleDeleteComment} />
          <DialogModal isOpen={dialog.isOpen} type={dialog.type} message={dialog.message} onConfirm={dialog.action} onClose={() => setDialog({ ...dialog, isOpen: false })} />
          
          {isNoteOpen && (
            <div className="note-overlay" onClick={() => setIsNoteOpen(false)}>
              <div className="note-content" onClick={(e) => e.stopPropagation()}>
                <div className="note-inner">
                  <p>在武汉的时候，我有一台老旧的松下 CD 机...</p>
                  {/* ... 其他文字 ... */}
                  <p className="note-footer">换一种听歌方式，听这一刻我最想听的歌。</p>
                </div>
                <button className="close-note-btn" onClick={() => setIsNoteOpen(false)}>关闭</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;