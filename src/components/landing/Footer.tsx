import Icon from "@/components/ui/icon";

const Footer = () => {
  return (
    <footer className="bg-black py-10 border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <a href="/" className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
              <span className="text-purple-400">♪</span> SoundWave
            </a>
            <p className="text-zinc-500 text-sm">Музыка без границ</p>
          </div>
          <div className="flex gap-6 text-zinc-500 text-sm">
            <a href="#" className="hover:text-white transition-colors">Условия использования</a>
            <a href="#" className="hover:text-white transition-colors">Конфиденциальность</a>
            <a href="#" className="hover:text-white transition-colors">Для артистов</a>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-zinc-400 hover:text-purple-400 transition-colors" aria-label="YouTube">
              <Icon name="Youtube" size={22} />
            </a>
            <a href="#" className="text-zinc-400 hover:text-purple-400 transition-colors" aria-label="Instagram">
              <Icon name="Instagram" size={22} />
            </a>
            <a href="#" className="text-zinc-400 hover:text-purple-400 transition-colors" aria-label="Telegram">
              <Icon name="Send" size={22} />
            </a>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/5 text-center text-zinc-600 text-sm">
          &copy; {new Date().getFullYear()} SoundWave. Все права защищены.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
