import { useRef, useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

const achievements = [
  { iconName: "Music2", label: "Треков в каталоге", value: "1 млн+" },
  { iconName: "Users", label: "Активных слушателей", value: "500 тыс+" },
  { iconName: "Globe", label: "Стран доступа", value: "50+" },
  { iconName: "Award", label: "Наград за качество", value: "12+" },
];

const features = [
  { iconName: "Zap", title: "Мгновенный доступ", desc: "Никаких задержек — музыка начинает играть за секунды" },
  { iconName: "Volume2", title: "Высокое качество", desc: "Lossless и Hi-Fi аудио для истинных меломанов" },
  { iconName: "Shuffle", title: "Умные рекомендации", desc: "ИИ подбирает музыку под твоё настроение и вкусы" },
];

const AboutSection = () => {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const progress = Math.max(0, Math.min(1, 1 - rect.top / windowHeight));
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section ref={ref} id="about" className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div
          className={`grid md:grid-cols-2 gap-12 items-center transition-all duration-700 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
          style={{ transform: `translateY(${(1 - scrollProgress) * 50}px)` }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/0 rounded-3xl transform -rotate-6"></div>
            <div className="w-full aspect-square bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-3xl relative z-10 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-blue-900/20"></div>
              <div className="relative text-center p-8">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-2xl shadow-purple-500/30">
                  <Icon name="Headphones" size={64} className="text-white" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {features.map((f) => (
                    <div key={f.title} className="bg-black/40 rounded-xl p-3 border border-white/10 text-left">
                      <Icon name={f.iconName} size={18} className="text-purple-400 mb-1" />
                      <p className="text-white text-xs font-semibold">{f.title}</p>
                    </div>
                  ))}
                  <div className="bg-purple-600/20 rounded-xl p-3 border border-purple-500/20 text-left">
                    <Icon name="Star" size={18} className="text-purple-400 mb-1" />
                    <p className="text-white text-xs font-semibold">Офлайн-режим</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">О платформе SoundWave</h2>
            <p className="text-lg mb-6 text-zinc-300">
              SoundWave — это современная стриминговая площадка, созданная для тех, кто живёт музыкой.
              Мы собрали более миллиона треков от независимых артистов и мировых звёзд в одном месте.
            </p>
            <p className="text-lg mb-8 text-zinc-300">
              Умные алгоритмы рекомендаций, кристально чистый звук в Lossless-качестве и удобный
              интерфейс — всё это делает SoundWave лучшим местом для открытия новой музыки.
            </p>
            <div className="grid grid-cols-2 gap-6">
              {achievements.map((achievement, index) => (
                <div
                  key={achievement.label}
                  className={`bg-zinc-900/50 rounded-lg p-4 border border-white/10 transition-all duration-500 hover:border-purple-400/30 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center mb-2">
                    <div className="mr-2 text-purple-400">
                      <Icon name={achievement.iconName} size={20} />
                    </div>
                    <div className="text-2xl font-bold text-white">{achievement.value}</div>
                  </div>
                  <div className="text-sm text-zinc-400">{achievement.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
