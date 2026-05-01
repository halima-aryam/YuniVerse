"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export function LandingDashboard() {
  const [syllabi, setSyllabi] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPaths() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      const { data } = await supabase
        .from('syllabi')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_completed', false)
        .order('created_at', { ascending: false });

      if (data) {
        setSyllabi(data);
      }
      setIsLoading(false);
    }
    loadPaths();
  }, []);

  if (isLoading || syllabi.length === 0) return null;

  return (
    <section style={{ marginTop: "4rem", width: "100%", maxWidth: "1000px", margin: "4rem auto 0 auto" }}>
      <h2 style={{ fontFamily: "var(--font-serif), serif", fontSize: "2rem", marginBottom: "2rem", textAlign: "center" }}>
        Resume your journey
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
        {syllabi.map((syl) => (
          <Link href={`/journey/${syl.id}`} key={syl.id} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div 
              className="glass-panel" 
              data-vibe={syl.vibe} 
              style={{ padding: "1.5rem", borderLeft: "4px solid var(--accent)", transition: "transform 0.2s ease, box-shadow 0.2s ease", cursor: "pointer", height: "100%" }} 
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
              }} 
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <h4 style={{ fontFamily: "var(--font-serif), serif", fontSize: "1.3rem", marginBottom: "0.5rem" }}>{syl.title} ↗</h4>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                 Saved on {new Date(syl.created_at).toLocaleDateString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
