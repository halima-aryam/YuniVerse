"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/lib/supabaseClient";
import { ProgressRitual } from "@/components/ProgressRitual";

export default function CabinetPage() {
  const [reflections, setReflections] = useState<any[]>([]);
  const [syllabi, setSyllabi] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadCabinet() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setIsLoading(false);
        return;
      }
      setUser(session.user);

      const [reflectionsRes, syllabiRes] = await Promise.all([
        supabase.from('reflections').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('syllabi').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false })
      ]);

      if (!reflectionsRes.error && reflectionsRes.data) {
        setReflections(reflectionsRes.data);
      }
      if (!syllabiRes.error && syllabiRes.data) {
        setSyllabi(syllabiRes.data);
      }
      setIsLoading(false);
    }
    
    loadCabinet();
  }, []);

  return (
    <div className={styles.pageContainer}>
      <Navbar showBack={true} />
      
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>Your Cabinet of Curiosities.</h1>
          <p>A visual archive of every path you've explored and every reflection you've sealed.</p>
        </div>
        
        {/* Top Section: Cozy Check-in */}
        <div style={{ marginBottom: "4rem", display: "flex", justifyContent: "center" }}>
           <div style={{ width: "100%", maxWidth: "600px" }}>
             <ProgressRitual syllabusTitle="Daily Journal" vibe="minimal" />
           </div>
        </div>

        {isLoading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Dusting off the shelves...</p>
        ) : !user ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Log in to view and save your magical paths!</p>
          </div>
        ) : (
          <>
            {/* Middle Section: Saved Syllabi */}
            {syllabi.length > 0 && (
              <div style={{ marginBottom: "4rem" }}>
                <h3 style={{ fontFamily: "var(--font-serif), serif", fontSize: "1.8rem", marginBottom: "1.5rem" }}>Saved Paths</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
                  {syllabi.map((syl) => (
                    <div key={syl.id} className="glass-panel" data-vibe={syl.vibe} style={{ padding: "1.5rem", borderLeft: "4px solid var(--accent)" }}>
                      <h4 style={{ fontFamily: "var(--font-serif), serif", fontSize: "1.3rem", marginBottom: "0.5rem" }}>{syl.title}</h4>
                      <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                         Saved on {new Date(syl.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Section: Reflections Archive */}
            {reflections.length > 0 && (
              <div>
                <h3 style={{ fontFamily: "var(--font-serif), serif", fontSize: "1.8rem", marginBottom: "1.5rem" }}>Sealed Reflections</h3>
                <div className={styles.masonry}>
                  {reflections.map((curio) => (
                    <div key={curio.id} className={`${styles.curiosityCard} glass-panel`} data-vibe={curio.vibe}>
                      <div className={styles.cardHeader}>
                        <span className={styles.topic}>{curio.syllabus_title}</span>
                        <span className={styles.date}>
                          {new Date(curio.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <p className={styles.reflection}>"{curio.reflection_text}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {syllabi.length === 0 && reflections.length === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Your cabinet is empty. Build a path or seal a reflection to start your collection!</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
