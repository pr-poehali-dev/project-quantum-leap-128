import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const BARS = 28;

const MiniPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [heights, setHeights] = useState<number[]>(Array(BARS).fill(4));
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      setHeights(Array(BARS).fill(4));
      return;
    }

    const animate = () => {
      setHeights(
        Array.from({ length: BARS }, (_, i) => {
          const base = Math.sin(Date.now() / 200 + i * 0.6) * 0.5 + 0.5;
          const rand = Math.random() * 0.3;
          return Math.max(4, Math.round((base + rand) * 36));
        })
      );
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-t border-white/10 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center shrink-0">
          <Icon name="Music2" size={18} className="text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white truncate">K.J — Featured Track</div>
          <div className="text-xs text-zinc-500 truncate">Нажмите play, чтобы слушать</div>
        </div>

        <div className="flex items-center gap-1 h-10" style={{ minWidth: BARS * 5 }}>
          {heights.map((h, i) => (
            <div
              key={i}
              className="w-[3px] rounded-full bg-red-500 transition-all"
              style={{
                height: `${h}px`,
                opacity: isPlaying ? 0.8 + Math.random() * 0.2 : 0.25,
                transitionDuration: isPlaying ? "80ms" : "400ms",
              }}
            />
          ))}
        </div>

        <button
          onClick={() => setIsPlaying((p) => !p)}
          className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all duration-200 hover:scale-105 shrink-0"
        >
          <Icon name={isPlaying ? "Pause" : "Play"} size={18} className="text-white" />
        </button>

        <button className="text-zinc-500 hover:text-white transition-colors shrink-0">
          <Icon name="SkipForward" size={18} />
        </button>

        <div className="hidden md:flex items-center gap-2 shrink-0">
          <Icon name="Volume2" size={16} className="text-zinc-500" />
          <div className="w-20 h-1 bg-zinc-800 rounded-full">
            <div className="w-3/4 h-full bg-red-600 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer;
