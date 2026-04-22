import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface HeaderProps {
  onLoginClick: () => void;
}

const Header = ({ onLoginClick }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
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
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white hover:bg-white/10"
          >
            {isMenuOpen ? <Icon name="X" /> : <Icon name="Menu" />}
          </Button>
        </div>
        <div className="flex items-center gap-3">
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
        </div>
      </div>
    </header>
  );
};

export default Header;
