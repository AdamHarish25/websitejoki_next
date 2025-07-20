'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import Image from 'next/image'; // Impor komponen Image

const AUTOPLAY_COUNTDOWN_SECONDS = 5;

export default function CustomVideoPlayer({ src, thumbnailSrc }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const [countdown, setCountdown] = useState(AUTOPLAY_COUNTDOWN_SECONDS);
  const [showTimer, setShowTimer] = useState(true);

  // Fungsi untuk memulai video (bisa dipanggil oleh timer atau klik)
  const startVideo = () => {
    videoRef.current.play();
    setIsPlaying(true);
    setShowTimer(false); // Sembunyikan timer saat video mulai
  };

  const togglePlayPause = () => {
    setShowTimer(false); // Sembunyikan timer jika user berinteraksi
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (showTimer) {
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown <= 1) {
            clearInterval(timer);
            startVideo(); // Mulai video saat countdown habis
            return 0;
          }
          return prevCountdown - 1;
        });
      }, 1000);

      // Cleanup function untuk membersihkan interval
      return () => clearInterval(timer);
    }
  }, [showTimer]);

  useEffect(() => {
    const video = videoRef.current;
    const handleTimeUpdate = () => { setProgress((video.currentTime / video.duration) * 100); };
    const handleLoadedMetadata = () => { setDuration(video.duration); };
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', () => setIsPlaying(false));
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, []);

  const handleScrub = (e) => {
    const scrubTime = (e.nativeEvent.offsetX / e.currentTarget.clientWidth) * duration;
    videoRef.current.currentTime = scrubTime;
  };

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl group bg-black">
      {/* Elemen Video Utama */}
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        onClick={togglePlayPause}
        playsInline
        muted
      />

      {/* ======================= PERUBAHAN DI SINI ======================= */}
      {/* Gambar Thumbnail Kustom */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${isPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <Image
          src={thumbnailSrc}
          alt="Video thumbnail"
          fill
          className="object-cover"
          priority // Prioritaskan load gambar thumbnail
        />
      </div>
      {/* ================================================================ */}

      {/* Kontrol Kustom di Bawah */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
        <div className="flex items-center gap-4 text-white">
          <button className='hover:text-[#2ECC71] transition-colors' onClick={togglePlayPause}>
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <div className="w-full h-1.5 bg-white/30 rounded-full cursor-pointer" onClick={handleScrub}>
            <div className="h-full bg-[#2ECC71] rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Tombol Play Besar di Tengah (hanya muncul saat video dijeda) */}
      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer z-20"
          onClick={togglePlayPause}
        >
          <div className="w-20 h-20 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/50 group-hover:border-2 group-hover:border-[#2ECC71] border-white duration-500 transition-colors">
            <Play size={40} fill="white" className="text-white group-hover:scale-80 transition-transform duration-500 ml-1" />
          </div>
        </div>
      )}
    </div>
  );
}