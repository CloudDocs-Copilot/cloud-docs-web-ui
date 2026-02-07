import React, { useRef, useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import type { VideoPlayerProps } from '../../types/preview.types';
import { PreviewHeader } from './PreviewHeader';
import styles from './VideoPlayer.module.css';

/**
 * Componente para reproducir videos con controles HTML5
 */
export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, mimeType, filename, onBack, fileSize }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [error, setError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Cargar video con autenticación
   */
  useEffect(() => {
    const loadVideo = async () => {
      try {
        setLoading(true);
        const response = await fetch(url, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to load video');
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
        setLoading(false);
      } catch (err) {
        console.error('Error loading video:', err);
        setError('Failed to load video');
        setLoading(false);
      }
    };

    loadVideo();

    // Cleanup
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [url]);

  /**
   * Alternar reproducción/pausa
   */
  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  /**
   * Manejo de actualización de tiempo
   */
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  /**
   * Manejo de carga de metadata
   */
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  /**
   * Cambiar posición del video
   */
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const newTime = parseFloat(e.target.value);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  /**
   * Cambiar volumen
   */
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const newVolume = parseFloat(e.target.value);
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  /**
   * Alternar mute
   */
  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  /**
   * Alternar pantalla completa
   */
  const toggleFullscreen = () => {
    if (!videoRef.current) return;

    if (!isFullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  /**
   * Cambiar velocidad de reproducción
   */
  const changePlaybackRate = () => {
    if (!videoRef.current) return;
    
    const rates = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    const newRate = rates[nextIndex];
    
    videoRef.current.playbackRate = newRate;
    setPlaybackRate(newRate);
  };

  /**
   * Formatear tiempo en mm:ss
   */
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Manejo de eventos de teclado
   */
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!videoRef.current) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'm':
          toggleMute();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying]);

  /**
   * Detectar cambios de fullscreen
   */
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  /**
   * Manejo de errores
   */
  const handleError = () => {
    setError('Failed to load video. The format might not be supported.');
  };

  return (
    <div className={styles.videoPlayer}>
      <PreviewHeader
        filename={filename}
        fileSize={fileSize}
        onBack={onBack}
        onDownload={() => window.open(url, '_blank')}
      />
      
      <div className={styles.videoContainer}>
        {loading && (
          <div className={styles.loadingState}>
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading video...</span>
            </div>
            <p className="mt-3">Loading video...</p>
          </div>
        )}

        {error && (
          <div className={styles.errorState}>
            <i className="bi bi-exclamation-triangle-fill"></i>
            <p>{error}</p>
          </div>
        )}

        {blobUrl && (
          <video
            ref={videoRef}
            src={blobUrl}
            className={styles.video}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onError={handleError}
            onEnded={() => setIsPlaying(false)}
          >
            <source src={blobUrl} type={mimeType} />
            Your browser does not support the video tag.
          </video>
        )}
      </div>

      {/* Controles del video */}
      <div className={styles.controls}>
        {/* Progress bar */}
        <div className={styles.progressContainer}>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className={styles.progressBar}
          />
          <div className={styles.timeDisplay}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control buttons */}
        <div className={styles.controlButtons}>
          <div className={styles.leftControls}>
            <Button
              variant="link"
              className={styles.controlButton}
              onClick={togglePlay}
            >
              <i className={`bi bi-${isPlaying ? 'pause' : 'play'}-fill`}></i>
            </Button>

            <div className={styles.volumeControl}>
              <Button
                variant="link"
                className={styles.controlButton}
                onClick={toggleMute}
              >
                <i className={`bi bi-volume-${isMuted ? 'mute' : 'up'}-fill`}></i>
              </Button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className={styles.volumeSlider}
              />
            </div>
          </div>

          <div className={styles.rightControls}>
            <Button
              variant="link"
              className={styles.controlButton}
              onClick={changePlaybackRate}
              title="Playback Speed"
            >
              {playbackRate}x
            </Button>

            <Button
              variant="link"
              className={styles.controlButton}
              onClick={toggleFullscreen}
            >
              <i className={`bi bi-${isFullscreen ? 'fullscreen-exit' : 'fullscreen'}`}></i>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
