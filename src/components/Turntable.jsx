import React, { useState, useRef, useEffect, useCallback } from 'react';
import './Turntable.css';
import discCover1 from '../image/disc_cover_1.jpg';
import discCover2 from '../image/disc_cover_2.jpg';
import discCover3 from '../image/disc_cover_3.jpg';

function Turntable({ track, deckIndex, availableTracks = [], onTrackChange, discImage }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [dragRotation, setDragRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const platterRef = useRef(null);
  const [timeAtStartDrug, setTimeAtStartDrug] = useState(0);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);
  const dragStartAngleRef = useRef(0);
  const [startAngle, setStartAngle] = useState(0);

  const discImages = {
    'disc_cover_1.jpg': discCover1,
    'disc_cover_2.jpg': discCover2,
    'disc_cover_3.jpg': discCover3,
  };

  useEffect(() => {
  }, [deckIndex, discImage]);

  const setRotationWithoutAnimation = useCallback((newRotation) => {
    if (platterRef.current) {
      platterRef.current.style.transition = 'none';
      platterRef.current.style.transform = `rotate(${newRotation}deg)`;
      // Force a reflow
      void platterRef.current.offsetHeight;
      platterRef.current.style.transition = '';
    }
    setRotation(newRotation);
  }, []);

  const animate = useCallback((time) => {
    if (lastTimeRef.current !== 0) {
      const deltaTime = time - lastTimeRef.current;
      let newRotation = rotation + deltaTime * 0.05;
      if (newRotation >= 360) {
        newRotation = newRotation % 360;
        setRotationWithoutAnimation(newRotation);
      } else {
        setRotation(newRotation);
      }
    }
    lastTimeRef.current = time;
    animationRef.current = requestAnimationFrame(animate);
  }, [rotation, setRotationWithoutAnimation]);

  const startAnimation = useCallback(() => {
    if (!animationRef.current) {
      lastTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [animate]);

  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      lastTimeRef.current = 0;
    }
  }, []);

  useEffect(() => {
    if (audioRef.current && track) {
      audioRef.current.src = track.url;
      audioRef.current.load();
      setDuration(0);
      setCurrentTime(0);
    }
  }, [track]);

  useEffect(() => {
    if (audioRef.current && track) {
      const audio = audioRef.current;
      
      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
      };

      const handleCanPlayThrough = () => {
        setDuration(audio.duration);
      };

      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('canplaythrough', handleCanPlayThrough);
      audio.addEventListener('timeupdate', updateTime);

      // 強制的にオーディオを読み込む
      audio.load();


      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('canplaythrough', handleCanPlayThrough);
        audio.removeEventListener('timeupdate', updateTime);
      };
    }
  }, [track]); // trackが変更されたときにこの効果を再実行

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    if (isPlaying && !isDragging) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animationRef.current);
    }
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying, isDragging, animate]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        stopAnimation();
      } else {
        audioRef.current.play();
        startAnimation();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const handlePlaybackRateChange = (e) => {
    const newPlaybackRate = parseFloat(e.target.value);
    setPlaybackRate(newPlaybackRate);
  };

  const updateTime = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleTimeChange = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleTrackChange = (event) => {
    const selectedTrack = availableTracks.find(t => t.title === event.target.value);
    onTrackChange(selectedTrack, deckIndex);
  };

  const handleMouseDown = (e) => {
    if (!platterRef.current) return;
    setIsDragging(true);
    setTimeAtStartDrug(audioRef.current.currentTime);
    stopAnimation();
    const rect = platterRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    dragStartAngleRef.current = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    setDragRotation(rotation);  // ここを変更: dragRotationを現在のrotationに設定
  };

  const handleMouseMove = (e) => {
    if (isDragging && platterRef.current) {
      const rect = platterRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      const deltaAngle = angle - dragStartAngleRef.current;
      let newRotation = rotation + deltaAngle * (180 / Math.PI);
      if (newRotation >= 360 || newRotation < 0) {
        newRotation = newRotation % 360;
        if (newRotation < 0) newRotation += 360;
        setRotationWithoutAnimation(newRotation);
      } else {
        setRotation(newRotation);
      }
      dragStartAngleRef.current = angle;

      // ここで音楽の再生位置を調整
      if (audioRef.current) {
        const rotationDelta = deltaAngle * (180 / Math.PI);
        const timeDelta = rotationDelta / 30;
        audioRef.current.currentTime = Math.max(0, timeAtStartDrug+ timeDelta);
      }
    }
  };

  const handleMouseUp = () => {
    if(isDragging){
        setIsDragging(false);
        setRotation(dragRotation);
        if (isPlaying) {
        startAnimation();
        }
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleMouseMove);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousedown', handleMouseMove);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setStartAngle(calculateAngle(touch.clientX, touch.clientY));
  };

  const handleTouchMove = (e) => {
    if (isDragging && platterRef.current) {
      const rect = platterRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      const deltaAngle = angle - dragStartAngleRef.current;
      let newRotation = rotation + deltaAngle * (180 / Math.PI);
      if (newRotation >= 360 || newRotation < 0) {
        newRotation = newRotation % 360;
        if (newRotation < 0) newRotation += 360;
        setRotationWithoutAnimation(newRotation);
      } else {
        setRotation(newRotation);
      }
      dragStartAngleRef.current = angle;

      // ここで音楽の再生位置を調整
      if (audioRef.current) {
        const rotationDelta = deltaAngle * (180 / Math.PI);
        const timeDelta = rotationDelta / 30;
        audioRef.current.currentTime = Math.max(0, timeAtStartDrug+ timeDelta);
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const calculateAngle = (x, y) => {
    const rect = platterRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    return Math.atan2(y - centerY, x - centerX);
  };

  const handleProgressTouchStart = (e) => {
    const touch = e.touches[0];
    updateProgressTimeFromTouch(touch);
  };

  const handleProgressTouchMove = (e) => {
    const touch = e.touches[0];
    updateProgressTimeFromTouch(touch);
  };

  const updateProgressTimeFromTouch = (touch) => {
    const progressBar = document.querySelector('.progress-bar');
    if (!progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(1, x / width));
    const newTime = percentage * duration;
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  useEffect(() => {
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
      progressBar.addEventListener('touchstart', handleProgressTouchStart);
      progressBar.addEventListener('touchmove', handleProgressTouchMove);
    }

    return () => {
      if (progressBar) {
        progressBar.removeEventListener('touchstart', handleProgressTouchStart);
        progressBar.removeEventListener('touchmove', handleProgressTouchMove);
      }
    };
  }, [duration]); // durationを依存配列に追加

  return (
    <div className={`turntable deck-${deckIndex + 1}`}>
      <div className="deck-info">
        <select 
          value={track ? track.title : ''} 
          onChange={handleTrackChange}
          className="track-selector"
        >
          <option value="">Choose Track</option>
          {availableTracks && availableTracks.map((t, index) => (
            <option key={index} value={t.title}>{t.title}</option>
          ))}
        </select>
      </div>
      <div className="main-controls">
        <button className="play-pause-button" onClick={handlePlayPause}>
          {isPlaying ? '■' : '▶'}
        </button>
        <div className="turntable-container">
          <div className="turntable-platter-base"></div>
          {track && (
            <div 
              key={`${deckIndex}-${discImage}`}
              ref={platterRef}
              className={`turntable-platter ${isPlaying ? 'playing' : ''} ${isDragging ? 'dragging' : 'not-dragging'}`}
              style={{ 
                transform: `rotate(${rotation}deg)`,
                '--disc-image': `url(${discImages[discImage]})` // CSS変数を使用
              }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {track && (
                <audio 
                  ref={audioRef} 
                  src={track.url} 
                  preload="metadata"
                  onLoadedMetadata={(e) => {
                    setDuration(e.target.duration);
                  }}
                />
              )}
            </div>
          )}
          {track && (
            <div className="progress-bar-container">
              <input
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                onInput={handleTimeChange}
                onChange={handleTimeChange}
                onTouchStart={handleProgressTouchStart}
                onTouchMove={handleProgressTouchMove}
                className="progress-bar"
              />
            </div>
          )}
        </div>
        <div className="playback-rate-control control-bar picker">
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={playbackRate}
            onChange={handlePlaybackRateChange}
            orient="vertical"
          />
          <span>{playbackRate.toFixed(1)}x</span>
        </div>
        <div className="volume-control control-bar picker">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
          />
          <span>{(volume * 100).toFixed(0)}%</span>
        </div>
        <div className="time-display">
          <span>{formatTime(currentTime)}/{formatTime(duration)}</span>
        </div>
        
      </div>
      {track && (
        <div className="controls">
        
          <div className="sliders-container">
            <div className="slider-container">
            
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Turntable;