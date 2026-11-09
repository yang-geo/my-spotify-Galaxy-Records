import React, { useState } from 'react';
import './Sidebar.css';

function Sidebar({ isOpen, toggleSidebar, albums, onDelete, onSelect, onOpenNote, isAdmin, onHeaderClick }) {
  const [searchTerm, setSearchTerm] = useState('');

  // 1. 在组件内部实时计算过滤后的列表
  const filteredAlbums = albums.filter(album => 
    album.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    album.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        {/* 2. 显示已添加专辑的总数 */}
        <h2 
          onClick={onHeaderClick} 
          style={{ cursor: 'pointer', userSelect: 'none' }}
          title="Click 3 times for Admin Mode"
        >
          Library ({albums.length})
        </h2>
        <button className="close-btn" onClick={toggleSidebar}>×</button>
      </div>

      <div className="search-box">
        <input 
          type="text" 
          placeholder="Search in library..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // 仅更新本地搜索词
        />
      </div>

      <div className="album-list">
        {/* 3. 渲染过滤后的结果 */}
        {filteredAlbums.length === 0 ? (
          <p className="empty-msg">{searchTerm ? "No results found." : "No albums yet."}</p>
        ) : (
          filteredAlbums.map(album => (
            <div key={album.id} className="sidebar-item" onClick={() => onSelect(album)}>
              <img src={album.coverImage} alt={album.name} />
              <div className="item-info">
                <h4>{album.name}</h4>
                <p>{album.artist}</p>
              </div>
              
              {isAdmin && (
                <button 
                  className="delete-btn" 
                  onClick={(e) => {
                    e.stopPropagation();
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
        {!isAdmin && <span style={{ fontSize: '11px', color: '#555', marginLeft: '10px' }}>🔒 Read Only</span>}
      </div>
    </div>
  );
}

export default Sidebar;