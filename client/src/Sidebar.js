import React, { useState } from 'react';
import './Sidebar.css';

// 1. 在参数中增加 isAdmin
function Sidebar({ isOpen, toggleSidebar, albums, onDelete, onSelect, onSearch, onOpenNote, isAdmin,onHeaderClick }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2 
          onClick={onHeaderClick} 
          style={{ cursor: 'pointer', userSelect: 'none' }}
        >
          Library
        </h2>
        <button className="close-btn" onClick={toggleSidebar}>×</button>
      </div>

      <div className="search-box">
        <input 
          type="text" 
          placeholder="Search albums..." 
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <div className="album-list">
        {albums.length === 0 ? (
          <p className="empty-msg">No albums yet.</p>
        ) : (
          albums.map(album => (
            <div key={album.id} className="sidebar-item" onClick={() => onSelect(album)}>
              <img src={album.coverImage} alt={album.name} />
              <div className="item-info">
                <h4>{album.name}</h4>
                <p>{album.artist}</p>
              </div>
              
              {/* 2. 关键修改：只有 isAdmin 为 true 时才显示删除按钮 */}
              {isAdmin && (
                <button 
                  className="delete-btn" 
                  onClick={(e) => {
                    e.stopPropagation(); // 防止触发点击专辑选中效果
                    onDelete(album.id);
                  }}
                >
                  🗑
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <div className="sidebar-footer">
        <div className="personal-note-trigger" onClick={onOpenNote}>
          <span>My Note</span>
        </div>
        {/* 💡 小细节：如果是访客模式，可以在底部显示一个微弱的只读提示 */}
        {!isAdmin && <span style={{ fontSize: '11px', color: '#555', marginLeft: '10px' }}>🔒 Read Only</span>}
      </div>
    </div>
  );
}

export default Sidebar;