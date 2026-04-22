import { useState, useEffect } from "react";
import {
  InteractiveBackground,
  Header,
  HeroSection,
  Footer,
  MiniPlayer,
  AuthModal,
} from "@/components/landing";
import type { User } from "@/components/landing/AuthModal";

const AUTH_URL = "https://functions.poehali.dev/df438021-8bc0-41c0-a510-a26c103a0ad2";

const Index = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const sid = localStorage.getItem("kj_session");
    if (!sid) return;
    fetch(AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Session-Id": sid },
      body: JSON.stringify({ action: "me" }),
    })
      .then((r) => r.json())
      .then((d) => { if (d.user) setUser(d.user); })
      .catch(() => {});
  }, []);

  const handleAuth = (u: User, sessionId: string) => {
    localStorage.setItem("kj_session", sessionId);
    setUser(u);
  };

  const handleLogout = () => {
    const sid = localStorage.getItem("kj_session");
    if (sid) {
      fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Session-Id": sid },
        body: JSON.stringify({ action: "logout" }),
      }).catch(() => {});
    }
    localStorage.removeItem("kj_session");
    setUser(null);
  };

  return (
    <div className="min-h-screen text-white relative bg-black">
      <InteractiveBackground />
      <div className="relative z-10">
        <Header
          onLoginClick={() => setIsAuthOpen(true)}
          user={user}
          onLogout={handleLogout}
        />
        <main className="pb-24">
          <HeroSection />
        </main>
        <Footer />
      </div>
      <MiniPlayer />
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuth={handleAuth}
      />
    </div>
  );
};

export default Index;
