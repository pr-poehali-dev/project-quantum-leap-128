import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsLoading(false);
    setIsDone(true);
    setTimeout(() => {
      setIsDone(false);
      onClose();
    }, 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-700 via-red-500 to-red-700" />

        <div className="p-8">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-zinc-500 hover:text-white transition-colors"
          >
            <Icon name="X" size={20} />
          </button>

          <div className="text-center mb-8">
            <span className="text-3xl font-bold text-white flex items-center justify-center gap-2">
              <span className="text-red-500">♪</span> K.J
            </span>
            <p className="text-zinc-400 text-sm mt-2">
              {mode === "login" ? "Вход в аккаунт" : "Создать аккаунт"}
            </p>
          </div>

          <div className="flex bg-zinc-900 rounded-xl p-1 mb-6">
            <button
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === "login" ? "bg-red-600 text-white" : "text-zinc-400 hover:text-white"
              }`}
              onClick={() => setMode("login")}
            >
              Войти
            </button>
            <button
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === "register" ? "bg-red-600 text-white" : "text-zinc-400 hover:text-white"
              }`}
              onClick={() => setMode("register")}
            >
              Регистрация
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Имя</label>
                <Input
                  type="text"
                  placeholder="Ваше имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500 focus:border-red-500"
                />
              </div>
            )}
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Email</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500 focus:border-red-500"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Пароль</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500 focus:border-red-500"
              />
            </div>

            {mode === "login" && (
              <div className="text-right">
                <button type="button" className="text-xs text-red-400 hover:text-red-300 transition-colors">
                  Забыли пароль?
                </button>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white py-5 rounded-xl text-sm font-semibold transition-all"
              disabled={isLoading || isDone}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Icon name="Loader2" size={16} className="animate-spin" />
                  {mode === "login" ? "Входим..." : "Создаём аккаунт..."}
                </span>
              ) : isDone ? (
                <span className="flex items-center gap-2">
                  <Icon name="CheckCircle" size={16} />
                  {mode === "login" ? "Добро пожаловать!" : "Аккаунт создан!"}
                </span>
              ) : (
                mode === "login" ? "Войти" : "Создать аккаунт"
              )}
            </Button>
          </form>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs text-zinc-500 bg-zinc-950 px-3">
              или продолжить с
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full mt-4 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white gap-2"
            type="button"
          >
            <Icon name="Mail" size={16} />
            Войти через Google
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
