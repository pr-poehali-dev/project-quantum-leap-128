import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import type { User } from "./AuthModal";

interface HeaderProps {
  onLoginClick: () => void;
  user: User | null;
  onLogout: () => void;
}

const Header = ({ onLoginClick, user, onLogout }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-black/95 backdrop-blur-sm" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <a href="/" className="text-3xl font-bold tracking-tighter text-white flex items-center gap-2">
          <span className="text-red-500">♪</span> K.J
        </a>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
                <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold text-white">
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-zinc-200 hidden sm:block">
                  {user.name || user.email.split("@")[0]}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-zinc-500 hover:text-white hover:bg-white/10"
                onClick={onLogout}
                title="Выйти"
              >
                <Icon name="LogOut" size={18} />
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                className="text-zinc-300 hover:text-white hover:bg-white/10"
                onClick={onLoginClick}
              >
                Войти
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={onLoginClick}
              >
                Регистрация
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
