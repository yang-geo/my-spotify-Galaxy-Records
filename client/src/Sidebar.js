import React, { useState } from 'react';
import './Sidebar.css';

function Sidebar({ isOpen, toggleSidebar, albums, onDelete, onSelect, onSearch,onOpenNote }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>Library</h2>
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
              <button 
                className="delete-btn" 
                onClick={(e) => {
                  e.stopPropagation(); // 防止触发点击专辑
                  onDelete(album.id);
                }}
              >
                🗑
              </button>
            </div>
          ))
        )}
      </div>
      <div className="sidebar-footer">
        <div className="personal-note-trigger" onClick={onOpenNote}><span>My Note</span></div>
      </div>
    </div>
  );
}

export default Sidebar;