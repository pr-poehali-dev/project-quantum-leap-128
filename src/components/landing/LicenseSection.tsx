import { useState, useRef, useEffect } from "react";
import { Check, Star, Zap, Crown, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PlanOption {
  name: string;
  price: string;
  period: string;
  icon: React.ReactNode;
  features: string[];
  popular?: boolean;
  badge?: string;
}

const plans: PlanOption[] = [
  {
    name: "Бесплатный",
    price: "0 ₽",
    period: "навсегда",
    icon: <Star className="w-6 h-6" />,
    features: [
      "Доступ к 10 000 треков",
      "Качество до 128 kbps",
      "Реклама между треками",
      "Только онлайн-прослушивание",
      "Мобильное приложение",
    ],
    badge: "НАЧНИ СЕЙЧАС — БЕСПЛАТНО!",
  },
  {
    name: "Стандарт",
    price: "199 ₽",
    period: "в месяц",
    icon: <Zap className="w-6 h-6" />,
    features: [
      "Доступ к 50 000 треков",
      "Качество до 320 kbps",
      "Без рекламы",
      "Скачивание до 100 треков",
      "Мобильное приложение",
      "1 устройство",
    ],
    popular: true,
  },
  {
    name: "Премиум",
    price: "349 ₽",
    period: "в месяц",
    icon: <Crown className="w-6 h-6" />,
    features: [
      "Полный каталог 1 млн+ треков",
      "Качество Hi-Fi / Lossless",
      "Без рекламы",
      "Неограниченное скачивание",
      "До 3 устройств",
      "Эксклюзивные релизы",
    ],
  },
  {
    name: "Семейный",
    price: "499 ₽",
    period: "в месяц",
    icon: <Globe className="w-6 h-6" />,
    features: [
      "Полный каталог 1 млн+ треков",
      "Качество Hi-Fi / Lossless",
      "Без рекламы",
      "Неограниченное скачивание",
      "До 6 аккаунтов",
      "Детский режим",
    ],
  },
];

const LicenseSection = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} id="plans" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-900/20 to-black"></div>

      <div className="container mx-auto px-4 relative">
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white">Выбери свой тариф</h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            От бесплатного доступа до премиум-качества — найди план, который подходит именно тебе
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <Card
                className={`relative h-full bg-black border-white/10 ${
                  hoveredCard === index ? "scale-105" : "scale-100"
                } transition-all duration-300`}
              >
                <div className={`absolute inset-0 rounded-lg p-[1px] ${plan.popular ? "bg-gradient-to-br from-purple-500/60 to-purple-500/0" : "bg-gradient-to-br from-white/20 to-white/0"}`}>
                  <div className="absolute inset-0 rounded-lg bg-black"></div>
                </div>

                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Популярный
                    </span>
                  </div>
                )}

                <CardContent className="relative p-6 rounded-lg h-full flex flex-col">
                  <div className="text-center mb-6">
                    <div className={`inline-flex p-3 rounded-full mb-4 border ${plan.popular ? "bg-purple-500/20 border-purple-500/30 text-purple-400" : "bg-zinc-900 border-white/10 text-white"}`}>
                      {plan.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-white">{plan.name}</h3>
                    <div className="text-3xl font-bold text-white">{plan.price}</div>
                    <div className="text-sm text-zinc-500 mt-1">{plan.period}</div>
                  </div>

                  <div className="flex-grow">
                    {plan.badge && (
                      <div className="mb-4 text-center">
                        <span className="text-xs text-purple-400 font-semibold bg-purple-500/10 px-3 py-1 rounded-full">
                          {plan.badge}
                        </span>
                      </div>
                    )}
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <Check className="h-5 w-5 text-purple-400 mr-2 shrink-0 mt-0.5" />
                          <span className="text-sm text-zinc-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    className={`w-full rounded-full mt-auto transition-all duration-300 ${
                      plan.popular
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10"
                    }`}
                  >
                    {plan.price === "0 ₽" ? "Начать бесплатно" : "Подключить"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LicenseSection;
