import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-black/95 backdrop-blur-sm" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <a href="/" className="text-3xl font-bold tracking-tighter text-white flex items-center gap-2">
          <span className="text-red-500">♪</span> SoundWave
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
        <nav
          className={`${
            isMenuOpen ? "flex" : "hidden"
          } md:flex absolute md:relative top-full left-0 w-full md:w-auto bg-black/95 md:bg-transparent flex-col md:flex-row`}
        >
          <ul className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8 p-4 md:p-0">
            <li>
              <button
                onClick={() => scrollToSection("plans")}
                className="text-white hover:text-red-500 transition-colors"
              >
                Тарифы
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection("about")}
                className="text-white hover:text-red-500 transition-colors"
              >
                О платформе
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection("contact")}
                className="text-white hover:text-red-500 transition-colors"
              >
                Контакты
              </button>
            </li>
          </ul>
        </nav>
        <Button
          variant="outline"
          className="hidden md:block border-red-500/50 text-red-400 hover:bg-red-500/10"
          onClick={() => scrollToSection("plans")}
        >
          Начать слушать
        </Button>
      </div>
    </header>
  );
};

export default Header;