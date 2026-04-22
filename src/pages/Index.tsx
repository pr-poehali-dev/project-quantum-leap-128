import { useState, useEffect } from "react";
import {
  InteractiveBackground,
  Header,
  HeroSection,
  Footer,
  MiniPlayer,
  AuthModal,
  FullPlayer,
  UploadModal,
  TrackCatalog,
} from "@/components/landing";
import { PlayerProvider } from "@/context/PlayerContext";
import type { User } from "@/components/landing/AuthModal";

const AUTH_URL = "https://functions.poehali.dev/df438021-8bc0-41c0-a510-a26c103a0ad2";

const IndexInner = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

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
        <main className="pb-28">
          <HeroSection />
          <TrackCatalog
            user={user}
            onUploadClick={() => user ? setIsUploadOpen(true) : setIsAuthOpen(true)}
            refreshKey={refreshKey}
          />
        </main>
        <Footer />
      </div>

      <MiniPlayer />
      <FullPlayer />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuth={handleAuth}
      />
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploaded={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
};

const Index = () => (
  <PlayerProvider>
    <IndexInner />
  </PlayerProvider>
);

export default Index;
