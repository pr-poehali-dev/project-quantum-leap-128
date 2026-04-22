import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const BARS = 32;

const tracks = [
  { title: "Midnight Drive", artist: "K.J", duration: "3:42" },
  { title: "Red Neon", artist: "K.J", duration: "4:15" },
  { title: "Dark Matter", artist: "K.J", duration: "2:58" },
];

const MiniPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [progress, setProgress] = useState(22);
  const [volume, setVolume] = useState(75);
  const [heights, setHeights] = useState<number[]>(Array(BARS).fill(3));
  const animRef = useRef<number | null>(null);
  const progressRef = useRef<number | null>(null);

  const track = tracks[trackIndex];

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
          const rand = Math.random() * 0.25;
          return Math.max(3, Math.round((wave + rand) * 28));
        })
      );
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      if (progressRef.current) clearInterval(progressRef.current);
      return;
    }
    progressRef.current = window.setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 0.2));
    }, 100);
    return () => { if (progressRef.current) clearInterval(progressRef.current); };
  }, [isPlaying]);

  const nextTrack = () => {
    setTrackIndex((i) => (i + 1) % tracks.length);
    setProgress(0);
  };
  const prevTrack = () => {
    setTrackIndex((i) => (i - 1 + tracks.length) % tracks.length);
    setProgress(0);
  };

  const elapsed = Math.floor((parseInt(track.duration.split(":")[0]) * 60 + parseInt(track.duration.split(":")[1])) * progress / 100);
  const elapsedStr = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-zinc-950/98 backdrop-blur-xl border-t border-white/5 shadow-[0_-8px_40px_rgba(0,0,0,0.8)]">
        {/* Progress bar */}
        <div
          className="h-[2px] bg-zinc-800 cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setProgress(((e.clientX - rect.left) / rect.width) * 100);
          }}
        >
          <div
            className="h-full bg-gradient-to-r from-red-700 to-red-500 relative transition-all duration-100"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2" />
          </div>
        </div>

        <div className="px-6 py-3 flex items-center gap-6">
          {/* Cover */}
          <div className="relative shrink-0">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-red-700 via-red-600 to-zinc-900 flex items-center justify-center shadow-lg shadow-red-900/40 ${isPlaying ? "animate-pulse" : ""}`}>
              <Icon name="Music2" size={20} className="text-white/90" />
            </div>
            {isPlaying && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
            )}
          </div>

          {/* Track info */}
          <div className="w-40 shrink-0">
            <div className="text-sm font-semibold text-white truncate">{track.title}</div>
            <div className="text-xs text-zinc-500 truncate">{track.artist}</div>
          </div>

          {/* Waveform */}
          <div className="hidden md:flex items-end gap-[2px] h-8 flex-1 max-w-xs">
            {heights.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm"
                style={{
                  height: `${h}px`,
                  background: isPlaying
                    ? `rgba(239,68,68,${0.4 + (i / BARS) * 0.5})`
                    : "rgba(255,255,255,0.08)",
                  transition: isPlaying ? "height 80ms ease" : "height 600ms ease",
                }}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 mx-auto">
            <button onClick={prevTrack} className="text-zinc-500 hover:text-white transition-colors">
              <Icon name="SkipBack" size={18} />
            </button>
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="w-11 h-11 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg shadow-red-900/50"
            >
              <Icon name={isPlaying ? "Pause" : "Play"} size={20} className="text-white" />
            </button>
            <button onClick={nextTrack} className="text-zinc-500 hover:text-white transition-colors">
              <Icon name="SkipForward" size={18} />
            </button>
          </div>

          {/* Time + Volume */}
          <div className="hidden md:flex items-center gap-4 ml-auto shrink-0">
            <span className="text-xs text-zinc-500 tabular-nums">
              {elapsedStr} / {track.duration}
            </span>
            <div className="flex items-center gap-2">
              <Icon name="Volume2" size={15} className="text-zinc-500" />
              <div
                className="w-20 h-1 bg-zinc-800 rounded-full cursor-pointer group"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setVolume(Math.round(((e.clientX - rect.left) / rect.width) * 100));
                }}
              >
                <div
                  className="h-full bg-zinc-400 group-hover:bg-red-500 rounded-full transition-colors"
                  style={{ width: `${volume}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer;
