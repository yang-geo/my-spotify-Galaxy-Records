// import React, { useState } from 'react';
// import './AlbumDetailModal.css';

// function AlbumDetailModal({ album, onClose, onAddComment, onDeleteComment }) {
//   const [commentText, setCommentText] = useState('');

//   if (!album) return null;

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (commentText.trim()) {
//       onAddComment(album.id, commentText);
//       setCommentText('');
//     }
//   };

//   return (
//     <div className="detail-overlay" onClick={onClose}>
//       <div className="detail-content" onClick={e => e.stopPropagation()}>
//         <button className="close-detail-btn" onClick={onClose}>×</button>
        
//         {/* 左侧：专辑封面和信息 */}
//         <div className="detail-left">
//           <div className="cover-wrapper">
//              <img src={album.coverImage} alt={album.name} className="detail-cover" />
//           </div>
          
//           <h1>{album.name}</h1>
//           <h3>{album.artist}</h3>
          
//           {/* 标签代码已被删除 */}

//           <a href={album.spotifyUrl} target="_blank" rel="noopener noreferrer" className="play-now-btn">
//             {/* Spotify 黑色图标 SVG */}
//             <svg viewBox="0 0 24 24" className="spotify-icon-svg">
//               <path fill="currentColor" d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.2-1.32 9.6-0.66 13.38 1.68.42.24.6.84.36 1.14zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.299z"/>
//             </svg>
//             Play Now
//           </a>
//         </div>

//         {/* 右侧：评论区 (保持不变) */}
//         <div className="detail-right">
//           <div className="comments-header">
//             FREQUENCY LOG ({album.comments ? album.comments.length : 0})
//           </div>
          
//           <div className="comments-list">
//             {(!album.comments || album.comments.length === 0) ? (
//               <div className="no-signal">
//                 <p>NO SIGNALS DETECTED</p>
//               </div>
//             ) : (
//               album.comments.map(comment => (
//                 <div key={comment.id} className="comment-item">
//                   <div className="comment-text">{comment.text}</div>
//                   <div className="comment-meta">
//                     <span>{comment.date}</span>
//                     <button onClick={() => onDeleteComment(album.id, comment.id)}>Del</button>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>

//           <form className="comment-form" onSubmit={handleSubmit}>
//             <input 
//               type="text" 
//               placeholder="Broadcast a frequency..." 
//               value={commentText}
//               onChange={e => setCommentText(e.target.value)}
//             />
//             <button type="submit">➤</button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default AlbumDetailModal;


import React, { useState } from 'react';
import './AlbumDetailModal.css';

// 1. 增加 isAdmin 属性
function AlbumDetailModal({ album, onClose, onAddComment, onDeleteComment, isAdmin }) {
  const [commentText, setCommentText] = useState('');

  if (!album) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      onAddComment(album.id, commentText);
      setCommentText('');
    }
  };

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-content" onClick={e => e.stopPropagation()}>
        <button className="close-detail-btn" onClick={onClose}>×</button>
        
        {/* 左侧：专辑封面和信息 */}
        <div className="detail-left">
          <div className="cover-wrapper">
             <img src={album.coverImage} alt={album.name} className="detail-cover" />
          </div>
          
          <h1>{album.name}</h1>
          <h3>{album.artist}</h3>

          <a href={album.spotifyUrl} target="_blank" rel="noopener noreferrer" className="play-now-btn">
            <svg viewBox="0 0 24 24" className="spotify-icon-svg">
              <path fill="currentColor" d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.2-1.32 9.6-0.66 13.38 1.68.42.24.6.84.36 1.14zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.299z"/>
            </svg>
            Play Now
          </a>
        </div>

        {/* 右侧：评论区 */}
        <div className="detail-right">
          <div className="comments-header">
            FREQUENCY LOG ({album.comments ? album.comments.length : 0})
          </div>
          
          <div className="comments-list">
            {(!album.comments || album.comments.length === 0) ? (
              <div className="no-signal">
                <p>NO SIGNALS DETECTED</p>
              </div>
            ) : (
              album.comments.map(comment => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-text">{comment.text}</div>
                  <div className="comment-meta">
                    <span>{comment.date}</span>
                    {/* 2. 只有管理员能看到删除评论按钮 */}
                    {isAdmin && (
                      <button onClick={() => onDeleteComment(album.id, comment.id)}>Del</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 3. 只有管理员能看到评论输入框 */}
          {isAdmin ? (
            <form className="comment-form" onSubmit={handleSubmit}>
              <input 
                type="text" 
                placeholder="Broadcast a frequency..." 
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
              />
              <button type="submit">➤</button>
            </form>
          ) : (
            <div className="guest-msg" style={{ textAlign: 'center', padding: '15px', color: '#555', fontSize: '13px', borderTop: '1px solid #222' }}>
              🔒 Receiver Mode Only
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AlbumDetailModal;