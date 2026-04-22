import { usePlayer } from "@/context/PlayerContext";
import Icon from "@/components/ui/icon";

const EQ_LABELS = ["60Hz", "170Hz", "350Hz", "1kHz", "3.5kHz", "10kHz"];

const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

const FullPlayer = () => {
  const {
    currentTrack, isPlaying, progress, elapsed, duration,
    volume, eq, isFullOpen, setIsFullOpen,
    togglePlay, next, prev, seek, setVolume, setEq,
  } = usePlayer();

  if (!isFullOpen || !currentTrack) return null;

  return (
    <div className="fixed inset-0 z-[90] flex flex-col bg-black/95 backdrop-blur-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <button
          onClick={() => setIsFullOpen(false)}
          className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <Icon name="ChevronDown" size={22} />
          <span className="text-sm">Свернуть</span>
        </button>
        <span className="text-sm text-zinc-400 font-medium">Сейчас играет</span>
        <button className="text-zinc-400 hover:text-white transition-colors">
          <Icon name="MoreHorizontal" size={22} />
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 px-6 py-8 overflow-auto max-w-5xl mx-auto w-full">
        {/* Left — Cover + controls */}
        <div className="flex flex-col items-center gap-6 lg:w-80 shrink-0">
          {/* Cover */}
          <div className="relative w-56 h-56 lg:w-72 lg:h-72">
            <div className={`w-full h-full rounded-3xl shadow-2xl shadow-red-900/30 overflow-hidden ${isPlaying ? "ring-2 ring-red-600/40" : ""}`}>
              {currentTrack.cover_url ? (
                <img src={currentTrack.cover_url} alt={currentTrack.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-red-800 via-red-600 to-zinc-900 flex items-center justify-center">
                  <Icon name="Music2" size={80} className="text-white/30" />
                </div>
              )}
            </div>
            {isPlaying && (
              <div className="absolute -inset-2 rounded-3xl border border-red-500/20 animate-pulse" />
            )}
          </div>

          {/* Track info */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">{currentTrack.title}</h2>
            <p className="text-zinc-400 mt-1">{currentTrack.artist}</p>
          </div>

          {/* Progress */}
          <div className="w-full">
            <div
              className="h-1.5 bg-zinc-800 rounded-full cursor-pointer group mb-2"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                seek(((e.clientX - rect.left) / rect.width) * 100);
              }}
            >
              <div
                className="h-full bg-gradient-to-r from-red-700 to-red-500 rounded-full relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <div className="flex justify-between text-xs text-zinc-500 tabular-nums">
              <span>{fmt(elapsed)}</span>
              <span>{fmt(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-5">
            <button onClick={prev} className="text-zinc-400 hover:text-white transition-colors hover:scale-110">
              <Icon name="SkipBack" size={26} />
            </button>
            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center transition-all hover:scale-105 shadow-xl shadow-red-900/50"
            >
              <Icon name={isPlaying ? "Pause" : "Play"} size={28} className="text-white" />
            </button>
            <button onClick={next} className="text-zinc-400 hover:text-white transition-colors hover:scale-110">
              <Icon name="SkipForward" size={26} />
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3 w-full">
            <Icon name="Volume1" size={16} className="text-zinc-500 shrink-0" />
            <div
              className="flex-1 h-1.5 bg-zinc-800 rounded-full cursor-pointer group"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setVolume(Math.round(((e.clientX - rect.left) / rect.width) * 100));
              }}
            >
              <div
                className="h-full bg-red-600 group-hover:bg-red-500 rounded-full transition-colors"
                style={{ width: `${volume}%` }}
              />
            </div>
            <Icon name="Volume2" size={16} className="text-zinc-500 shrink-0" />
            <span className="text-xs text-zinc-500 w-8 text-right tabular-nums">{volume}%</span>
          </div>
        </div>

        {/* Right — Equalizer */}
        <div className="flex-1">
          <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-6 h-full">
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
              <Icon name="SlidersHorizontal" size={18} className="text-red-500" />
              Эквалайзер
            </h3>
            <div className="flex items-end justify-around gap-4 h-52">
              {EQ_LABELS.map((label, i) => (
                <div key={label} className="flex flex-col items-center gap-2 flex-1">
                  <span className="text-xs text-red-400 tabular-nums font-mono">
                    {eq[i] > 0 ? `+${eq[i]}` : eq[i]}dB
                  </span>
                  <div className="relative flex-1 w-full flex justify-center">
                    <input
                      type="range"
                      min={-12}
                      max={12}
                      step={1}
                      value={eq[i]}
                      onChange={(e) => {
                        const next = [...eq];
                        next[i] = Number(e.target.value);
                        setEq(next);
                      }}
                      className="eq-slider"
                      style={{
                        writingMode: "vertical-lr",
                        direction: "rtl",
                        height: "160px",
                        width: "28px",
                        appearance: "slider-vertical",
                        WebkitAppearance: "slider-vertical",
                        cursor: "pointer",
                        accentColor: "#dc2626",
                      }}
                    />
                  </div>
                  <span className="text-xs text-zinc-500">{label}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex gap-2 flex-wrap">
              {[
                { name: "Плоский", values: [0,0,0,0,0,0] },
                { name: "Бас", values: [8,5,2,0,-1,-2] },
                { name: "Вокал", values: [-2,-1,3,5,3,1] },
                { name: "Клуб", values: [4,3,5,2,1,2] },
              ].map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setEq(preset.values)}
                  className="px-3 py-1 text-xs rounded-full border border-white/10 text-zinc-400 hover:text-white hover:border-red-500/50 hover:bg-red-500/10 transition-all"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullPlayer;
