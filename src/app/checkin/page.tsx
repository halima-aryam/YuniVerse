"use client";

import { Navbar } from "@/components/Navbar";
import { ProgressRitual } from "@/components/ProgressRitual";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CheckinPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
      setIsLoading(false);
    }
    loadUser();
  }, []);

  return (
    <div style={{ minHeight: "100vh", padding: "0 2rem 4rem 2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <Navbar showBack={true} />
      
      <main style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "4rem", gap: "2rem" }}>
        <div style={{ textAlign: "center", maxWidth: "600px" }}>
          <h1 style={{ fontFamily: "var(--font-serif), serif", fontSize: "3rem", marginBottom: "1rem" }}>
            Cozy Check-in
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.15rem", lineHeight: "1.6" }}>
            Take a moment to breathe, reflect on your learning journey, and seal your thoughts away for future you.
          </p>
        </div>

        {isLoading ? (
          <p style={{ color: "var(--text-secondary)" }}>Warming up...</p>
        ) : !user ? (
          <div style={{ textAlign: "center", padding: "4rem", background: "var(--bg-secondary)", borderRadius: "12px", width: "100%", maxWidth: "600px" }}>
            <p style={{ color: "var(--text-secondary)" }}>Log in to seal your reflections and save your progress!</p>
          </div>
        ) : (
          <div style={{ width: "100%", maxWidth: "600px", marginTop: "2rem" }}>
            <ProgressRitual syllabusTitle="Daily Journal" vibe="minimal" />
          </div>
        )}
      </main>
    </div>
  );
}
