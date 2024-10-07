import React, { useState, useEffect } from 'react';
import Turntable from './components/Turntable';
import MusicLibrary from './components/MusicLibrary.jsx';
import HamburgerMenu from './components/HamburgerMenu';
import './App.css';

function App() {
  const [selectedTracks, setSelectedTracks] = useState([null, null]);
  const [availableTracks, setAvailableTracks] = useState([]);
  const [discImages, setDiscImages] = useState(['disc_cover_1.jpg', 'disc_cover_1.jpg']);


  const handleTrackAdd = (newTracks) => {
    setAvailableTracks(prevTracks => {
      const updatedTracks = [...prevTracks];
      newTracks.forEach(newTrack => {
        const existingIndex = updatedTracks.findIndex(track => track.title === newTrack.title);
        if (existingIndex === -1) {
          updatedTracks.push(newTrack);
        } else {
          updatedTracks[existingIndex] = newTrack;
        }
      });
      return updatedTracks;
    });
  };

  const handleTrackChange = (track, deckIndex) => {
    const newSelectedTracks = [...selectedTracks];
    newSelectedTracks[deckIndex] = track;
    setSelectedTracks(newSelectedTracks);
  };

  const handleImageChange = (deckIndex, imageName) => {
    setDiscImages(prevImages => {
      const newImages = [...prevImages];
      newImages[deckIndex] = imageName;
      return newImages;
    });
  };

  useEffect(() => {
    const preventDefault = (e) => e.preventDefault();
    document.body.addEventListener('touchmove', preventDefault, { passive: false });
    
    return () => {
      document.body.removeEventListener('touchmove', preventDefault);
    };
  }, []);

  return (
    <div className="App">
      <HamburgerMenu onImageChange={handleImageChange} />
      <div className="turntables-container">
        <Turntable 
          key={`turntable-0-${discImages[0]}`}
          track={selectedTracks[0]} 
          deckIndex={0} 
          availableTracks={availableTracks}
          onTrackChange={handleTrackChange}
          discImage={discImages[0]}
        />
        <Turntable 
          key={`turntable-1-${discImages[1]}`}
          track={selectedTracks[1]} 
          deckIndex={1}
          availableTracks={availableTracks}
          onTrackChange={handleTrackChange}
          discImage={discImages[1]}
        />
      </div>
      <div className="music-library-container">
        <MusicLibrary onTrackAdd={handleTrackAdd} />
      </div>
    </div>
  );
}

export default App;
