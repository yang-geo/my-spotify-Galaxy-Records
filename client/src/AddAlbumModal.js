import React, { useState } from 'react';
import './AddAlbumModal.css';

function AddAlbumModal({ isOpen, onClose, onLaunch }) {
  const [link, setLink] = useState('');

  if (!isOpen) return null;

  const handleLaunch = () => {
    onLaunch(link);
    setLink(''); // 清空输入框
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* 已删除顶部的图标 div */}
        
        <h2>Add to Galaxy</h2>
        {/* 更新后的简短提示文字 */}
        <p>Paste a Spotify link</p>
        
        <input 
          type="text" 
          className="modal-input"
          placeholder="e.g. https://open.spotify.com/album/..."
          value={link}
          onChange={e => setLink(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleLaunch()}
        />
        
        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          {/* Launch 按钮现在是绿色的了 */}
          <button className="launch-btn" onClick={handleLaunch}>Launch</button>
        </div>
      </div>
    </div>
  );
}

export default AddAlbumModal;