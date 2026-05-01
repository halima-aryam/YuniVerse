"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/lib/supabaseClient";
import { ProgressRitual } from "@/components/ProgressRitual";
import { CertificateModal } from "@/components/CertificateModal";
import Link from "next/link";

export default function CabinetPage() {
  const [reflections, setReflections] = useState<any[]>([]);
  const [syllabi, setSyllabi] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  const [activeCert, setActiveCert] = useState<{isOpen: boolean, topic: string, vibe: string, date: string} | null>(null);

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

  const markAsComplete = async (syllabus: any) => {
    const completionDate = new Date().toISOString();
    
    // Open modal immediately for instant feedback
    setActiveCert({
      isOpen: true,
      topic: syllabus.title,
      vibe: syllabus.vibe,
      date: new Date().toLocaleDateString()
    });

    // Optimistic UI update
    setSyllabi(prev => prev.map(s => s.id === syllabus.id ? { ...s, is_completed: true, completed_at: completionDate } : s));

    // Save to DB
    try {
      await supabase.from('syllabi').update({ 
        is_completed: true, 
        completed_at: completionDate 
      }).eq('id', syllabus.id);
    } catch(e) {
      console.error(e);
    }
  };

  const activeSyllabi = syllabi.filter(s => !s.is_completed);
  const completedSyllabi = syllabi.filter(s => s.is_completed);

  return (
    <div className={styles.pageContainer}>
      <Navbar showBack={true} />
      
      <main className={styles.main}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className={styles.intro}>
            <h1>Your Cabinet of Curiosities.</h1>
            <p>A visual archive of every path you've explored and every reflection you've sealed.</p>
          </div>
          
          {/* Top Section: Cozy Check-in */}
          <div style={{ display: "flex", justifyContent: "center" }}>
             <div style={{ width: "100%", maxWidth: "600px" }}>
               <ProgressRitual syllabusTitle="Daily Journal" vibe="minimal" />
             </div>
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
            {/* Middle Section: Active Paths */}
            {activeSyllabi.length > 0 && (
              <div style={{ marginBottom: "2rem" }}>
                <h3 style={{ fontFamily: "var(--font-serif), serif", fontSize: "1.8rem", marginBottom: "1.5rem" }}>Active Journeys</h3>
                <div className={styles.pathsGrid}>
                  {activeSyllabi.map((syl) => (
                    <div key={syl.id} className="glass-panel" data-vibe={syl.vibe} style={{ padding: "1.5rem", borderLeft: "4px solid var(--accent)", display: "flex", flexDirection: "column", gap: "1rem" }}>
                      <div>
                        <Link href={`/journey/${syl.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <h4 style={{ fontFamily: "var(--font-serif), serif", fontSize: "1.3rem", marginBottom: "0.5rem", cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.color = "var(--accent)"} onMouseLeave={e => e.currentTarget.style.color = "inherit"}>
                            {syl.title} ↗
                          </h4>
                        </Link>
                        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                           Saved on {new Date(syl.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button 
                        onClick={() => markAsComplete(syl)}
                        style={{ background: "var(--accent)", color: "#fff", border: "none", padding: "0.6rem 1rem", borderRadius: "99px", fontWeight: 500, fontSize: "0.9rem", cursor: "pointer", alignSelf: "flex-start", transition: "transform 0.2s ease" }}
                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                      >
                        Complete Journey ✦
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Paths / Trophy Case */}
            {completedSyllabi.length > 0 && (
              <div style={{ marginBottom: "2rem" }}>
                <h3 style={{ fontFamily: "var(--font-serif), serif", fontSize: "1.8rem", marginBottom: "1.5rem", color: "var(--accent)" }}>✦ Trophy Case</h3>
                <div className={styles.pathsGrid}>
                  {completedSyllabi.map((syl) => (
                    <div 
                      key={syl.id} 
                      className="glass-panel" 
                      style={{ padding: "1.5rem", cursor: "pointer", transition: "transform 0.2s ease", textAlign: "center", border: "2px solid var(--border-color)" }}
                      onClick={() => setActiveCert({
                        isOpen: true,
                        topic: syl.title,
                        vibe: syl.vibe,
                        date: new Date(syl.completed_at || syl.created_at).toLocaleDateString()
                      })}
                      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
                      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                    >
                      <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📜</div>
                      <h4 style={{ fontFamily: "var(--font-serif), serif", fontSize: "1.1rem", marginBottom: "0.2rem" }}>{syl.title}</h4>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                         Completed {new Date(syl.completed_at || syl.created_at).toLocaleDateString()}
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

      {activeCert && (
        <CertificateModal
          isOpen={activeCert.isOpen}
          onClose={() => setActiveCert(null)}
          topic={activeCert.topic}
          vibe={activeCert.vibe}
          date={activeCert.date}
          userName={user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Curious Explorer"}
        />
      )}
    </div>
  );
}
