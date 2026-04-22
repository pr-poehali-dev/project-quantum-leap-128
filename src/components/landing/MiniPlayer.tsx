import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { usePlayer } from "@/context/PlayerContext";

const BARS = 32;

const MiniPlayer = () => {
  const {
    currentTrack, isPlaying, progress, elapsed, duration,
    volume, togglePlay, next, prev, seek, setVolume, setIsFullOpen,
  } = usePlayer();

  const [heights, setHeights] = useState<number[]>(Array(BARS).fill(3));
  const [isDraggingVol, setIsDraggingVol] = useState(false);
  const volBarRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);

  // Waveform animation
  useEffect(() => {
    if (!isPlaying) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      setHeights(Array(BARS).fill(3));
      return;
    }
    const animate = () => {
      setHeights(
        Array.from({ length: BARS }, (_, i) => {
          const wave = Math.sin(Date.now() / 180 + i * 0.7) * 0.5 + 0.5;
          return Math.max(3, Math.round((wave + Math.random() * 0.25) * 28));
        })
      );
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [isPlaying]);

  // Volume drag
  const calcVolume = (clientX: number) => {
    if (!volBarRef.current) return;
    const rect = volBarRef.current.getBoundingClientRect();
    const v = Math.max(0, Math.min(100, Math.round(((clientX - rect.left) / rect.width) * 100)));
    setVolume(v);
  };

  useEffect(() => {
    if (!isDraggingVol) return;
    const onMove = (e: MouseEvent | TouchEvent) => {
      const x = "touches" in e ? e.touches[0].clientX : e.clientX;
      calcVolume(x);
    };
    const onUp = () => setIsDraggingVol(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [isDraggingVol]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  if (!currentTrack) return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/98 backdrop-blur-xl border-t border-white/5 px-6 py-3 flex items-center justify-center">
      <p className="text-zinc-600 text-sm">Выберите трек для воспроизведения</p>
    </div>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-zinc-950/98 backdrop-blur-xl border-t border-white/5 shadow-[0_-8px_40px_rgba(0,0,0,0.8)]">
        {/* Progress bar — clickable */}
        <div
          className="h-[2px] bg-zinc-800 cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            seek(((e.clientX - rect.left) / rect.width) * 100);
          }}
        >
          <div
            className="h-full bg-gradient-to-r from-red-700 to-red-500 relative"
            style={{ width: `${progress}%`, transition: "width 100ms linear" }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="px-4 md:px-6 py-3 flex items-center gap-3 md:gap-5">

          {/* Cover — click opens full player */}
          <div
            className="relative shrink-0 cursor-pointer group"
            onClick={() => setIsFullOpen(true)}
            title="Открыть плеер"
          >
            <div className={`w-12 h-12 rounded-xl overflow-hidden shadow-lg shadow-red-900/40 ${isPlaying ? "ring-1 ring-red-500/50" : ""}`}>
              {currentTrack.cover_url ? (
                <img src={currentTrack.cover_url} alt={currentTrack.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-red-700 via-red-600 to-zinc-900 flex items-center justify-center">
                  <Icon name="Music2" size={18} className="text-white/80" />
                </div>
              )}
            </div>
            <div className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Icon name="Maximize2" size={14} className="text-white" />
            </div>
            {isPlaying && (
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-red-600 rounded-full border-2 border-zinc-950" />
            )}
          </div>

          {/* Track info */}
          <div
            className="w-32 md:w-44 shrink-0 cursor-pointer"
            onClick={() => setIsFullOpen(true)}
          >
            <div className="text-sm font-semibold text-white truncate">{currentTrack.title}</div>
            <div className="text-xs text-zinc-500 truncate">{currentTrack.artist}</div>
          </div>

          {/* Waveform */}
          <div className="hidden lg:flex items-end gap-[2px] h-7 flex-1 max-w-[200px]">
            {heights.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm"
                style={{
                  height: `${h}px`,
                  background: isPlaying
                    ? `rgba(239,68,68,${0.35 + (i / BARS) * 0.55})`
                    : "rgba(255,255,255,0.07)",
                  transition: isPlaying ? "height 80ms ease" : "height 600ms ease",
                }}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 md:gap-3 mx-auto shrink-0">
            <button onClick={prev} className="text-zinc-500 hover:text-white transition-colors p-1">
              <Icon name="SkipBack" size={18} />
            </button>
            <button
              onClick={togglePlay}
              className="w-11 h-11 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center transition-all hover:scale-105 shadow-lg shadow-red-900/50"
            >
              <Icon name={isPlaying ? "Pause" : "Play"} size={20} className="text-white" />
            </button>
            <button onClick={next} className="text-zinc-500 hover:text-white transition-colors p-1">
              <Icon name="SkipForward" size={18} />
            </button>
          </div>

          {/* Time + Volume */}
          <div className="hidden md:flex items-center gap-4 ml-auto shrink-0">
            <span className="text-xs text-zinc-500 tabular-nums whitespace-nowrap">
              {fmt(elapsed)} / {duration ? fmt(duration) : "--:--"}
            </span>

            {/* Volume — fixed with drag */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setVolume(volume > 0 ? 0 : 75)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <Icon name={volume === 0 ? "VolumeX" : volume < 50 ? "Volume1" : "Volume2"} size={15} />
              </button>
              <div
                ref={volBarRef}
                className="w-20 h-1.5 bg-zinc-800 rounded-full cursor-pointer group relative"
                onMouseDown={(e) => { setIsDraggingVol(true); calcVolume(e.clientX); }}
                onClick={(e) => calcVolume(e.clientX)}
              >
                <div
                  className="h-full bg-zinc-400 group-hover:bg-red-500 rounded-full transition-colors relative"
                  style={{ width: `${volume}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <span className="text-xs text-zinc-600 w-6 tabular-nums">{volume}</span>
            </div>

            {/* Open full player */}
            <button
              onClick={() => setIsFullOpen(true)}
              className="text-zinc-500 hover:text-white transition-colors p-1"
              title="Открыть плеер"
            >
              <Icon name="Maximize2" size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer;
