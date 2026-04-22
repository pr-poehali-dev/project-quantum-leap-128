import { useState } from "react";
import {
  InteractiveBackground,
  Header,
  HeroSection,
  Footer,
  MiniPlayer,
  AuthModal,
} from "@/components/landing";

const Index = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="min-h-screen text-white relative bg-black">
      <InteractiveBackground />
      <div className="relative z-10">
        <Header onLoginClick={() => setIsAuthOpen(true)} />
        <main className="pb-20">
          <HeroSection />
        </main>
        <Footer />
      </div>
      <MiniPlayer />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};

export default Index;
