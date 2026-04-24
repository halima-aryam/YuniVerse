"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/lib/supabaseClient";

export default function CabinetPage() {
  const [curiosities, setCuriosities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCabinet() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('reflections')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setCuriosities(data);
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
        
        {isLoading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Dusting off the shelves...</p>
        ) : curiosities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Your cabinet is empty. Log in and seal a Cozy Check-in to start your collection!</p>
          </div>
        ) : (
          <div className={styles.masonry}>
            {curiosities.map((curio) => (
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
        )}
      </main>
    </div>
  );
}
