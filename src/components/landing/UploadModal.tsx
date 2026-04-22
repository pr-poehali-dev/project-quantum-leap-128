import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";

const TRACKS_URL = "https://functions.poehali.dev/af10f0ee-32ed-4912-9e76-1d5785b67d32";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploaded: () => void;
}

const toBase64 = (file: File): Promise<string> =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res((r.result as string).split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

const UploadModal = ({ isOpen, onClose, onUploaded }: UploadModalProps) => {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const audioRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioFile(file);
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile) { setError("Выберите аудиофайл"); return; }
    if (!title.trim() || !artist.trim()) { setError("Заполните название и исполнителя"); return; }

    setError("");
    setIsLoading(true);
    setUploadProgress(10);

    const sid = localStorage.getItem("kj_session");
    if (!sid) { setError("Необходимо войти в аккаунт"); setIsLoading(false); return; }

    try {
      setUploadProgress(30);
      const file_b64 = await toBase64(audioFile);
      setUploadProgress(60);

      let cover_b64 = "";
      let cover_name = "";
      if (coverFile) {
        cover_b64 = await toBase64(coverFile);
        cover_name = coverFile.name;
      }

      setUploadProgress(80);

      // Get duration
      let duration_sec: number | null = null;
      try {
        const url = URL.createObjectURL(audioFile);
        await new Promise<void>((res) => {
          const a = new Audio(url);
          a.onloadedmetadata = () => { duration_sec = Math.round(a.duration); res(); };
          a.onerror = () => res();
        });
      } catch (_e) { /* duration unavailable */ }

      const res = await fetch(TRACKS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Session-Id": sid },
        body: JSON.stringify({ title, artist, file_b64, file_name: audioFile.name, cover_b64, cover_name, duration_sec }),
      });

      setUploadProgress(100);
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Ошибка загрузки"); setIsLoading(false); return; }

      setIsLoading(false);
      setIsDone(true);
      setTimeout(() => {
        setIsDone(false);
        setTitle(""); setArtist(""); setAudioFile(null); setCoverFile(null); setCoverPreview(null);
        setUploadProgress(0);
        onUploaded();
        onClose();
      }, 1500);
    } catch {
      setError("Ошибка соединения");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-700 via-red-500 to-red-700" />
        <div className="p-6">
          <button onClick={onClose} className="absolute top-5 right-5 text-zinc-500 hover:text-white transition-colors">
            <Icon name="X" size={20} />
          </button>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Icon name="Upload" size={20} className="text-red-500" />
            Загрузить трек
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Cover + audio zone */}
            <div className="flex gap-4">
              {/* Cover */}
              <div
                className="w-24 h-24 rounded-xl bg-zinc-900 border-2 border-dashed border-zinc-700 hover:border-red-500/50 flex items-center justify-center cursor-pointer overflow-hidden shrink-0 transition-colors"
                onClick={() => coverRef.current?.click()}
              >
                {coverPreview ? (
                  <img src={coverPreview} alt="cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-2">
                    <Icon name="ImagePlus" size={24} className="text-zinc-600 mx-auto mb-1" />
                    <span className="text-xs text-zinc-600">Обложка</span>
                  </div>
                )}
                <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
              </div>

              {/* Audio drop */}
              <div
                className={`flex-1 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors p-4 ${audioFile ? "border-red-500/50 bg-red-500/5" : "border-zinc-700 hover:border-red-500/50 bg-zinc-900"}`}
                onClick={() => audioRef.current?.click()}
              >
                {audioFile ? (
                  <div className="text-center">
                    <Icon name="Music2" size={24} className="text-red-400 mx-auto mb-1" />
                    <p className="text-sm text-white font-medium truncate max-w-[180px]">{audioFile.name}</p>
                    <p className="text-xs text-zinc-500">{(audioFile.size / 1024 / 1024).toFixed(1)} МБ</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Icon name="Upload" size={24} className="text-zinc-600 mx-auto mb-1" />
                    <p className="text-sm text-zinc-400">Нажмите или перетащите MP3/WAV</p>
                    <p className="text-xs text-zinc-600 mt-1">до 50 МБ</p>
                  </div>
                )}
                <input ref={audioRef} type="file" accept="audio/*" className="hidden" onChange={handleAudioChange} />
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Название трека</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Название" className="bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Исполнитель</label>
              <Input value={artist} onChange={(e) => setArtist(e.target.value)} required placeholder="Имя исполнителя" className="bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500" />
            </div>

            {isLoading && (
              <div className="w-full bg-zinc-800 rounded-full h-1.5">
                <div className="bg-red-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                <Icon name="AlertCircle" size={14} />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={isLoading || isDone}>
              {isLoading ? (
                <span className="flex items-center gap-2"><Icon name="Loader2" size={16} className="animate-spin" />Загружаем...</span>
              ) : isDone ? (
                <span className="flex items-center gap-2"><Icon name="CheckCircle" size={16} />Загружено!</span>
              ) : "Загрузить трек"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;