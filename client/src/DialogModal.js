import React from 'react';
import './DialogModal.css';

function DialogModal({ isOpen, type, message, onConfirm, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={e => e.stopPropagation()}>
        <p>{message}</p>
        
        <div className="dialog-actions">
          {type === 'confirm' ? (
            <>
              <button className="dialog-btn cancel" onClick={onClose}>Cancel</button>
              <button className="dialog-btn confirm" onClick={onConfirm}>Confirm</button>
            </>
          ) : (
            <button className="dialog-btn confirm" onClick={onClose}>OK</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default DialogModal;