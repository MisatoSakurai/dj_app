import React, { useState, useRef } from 'react';
import './MusicLibrary.css';

function MusicLibrary({ onTrackAdd }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const newTracks = files.map(file => ({
      title: file.name,
      url: URL.createObjectURL(file)
    }));
    setSelectedFiles(prevFiles => [...prevFiles, ...newTracks]);
    onTrackAdd(newTracks);
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="music-library">
      <div className="music-library-content">
        {/* <h2>ミュージックライブラリ</h2> */}
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <button onClick={handleButtonClick} className="file-select-button">
          Add Music
        </button>
      </div>
      <div className="music-library-list">
        <ul>
          {selectedFiles.map((file, index) => (
            <li key={index}>{file.title}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default MusicLibrary;