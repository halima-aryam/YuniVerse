"use client";

import { useState, useEffect } from "react";
import styles from "./ProgressRitual.module.css";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "./ToastProvider";

interface ProgressRitualProps {
  syllabusTitle: string;
  vibe: string;
}

export function ProgressRitual({ syllabusTitle, vibe }: ProgressRitualProps) {
  const [reflection, setReflection] = useState("");
  const [isSealed, setIsSealed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { showToast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const sealReflection = async () => {
    if (!reflection.trim()) return;

    if (!user) {
      showToast("Please log in from the top navigation to seal your reflections into your Cabinet!", "error");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from('reflections').insert({
        user_id: user.id,
        syllabus_title: syllabusTitle || "Untitled Journey",
        vibe: vibe,
        reflection_text: reflection
      });

      if (error) throw error;
      setIsSealed(true);
      showToast("Reflection sealed successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to seal reflection. Did you run the SQL script in Supabase?", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isSealed) {
    return (
      <div className={`${styles.container} glass-panel`} style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <h3 className={styles.title} style={{ color: 'var(--accent)' }}>✧ Reflection Sealed ✧</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
          Your thoughts have been gently tucked away into the yuniverse. See you next week.
        </p>
      </div>
    );
  }

  return (
    <div className={`${styles.container} glass-panel`}>
      <div className={styles.header}>
        <h3 className={styles.title}>Cozy Check-in</h3>
        <p className={styles.subtitle}>No streaks. No scores. Just a moment to reflect.</p>
      </div>
      
      <div className={styles.prompts}>
        <p>What sparked your curiosity the most this week?</p>
      </div>

      <textarea 
        className={styles.journalInput}
        placeholder="Dear yuniverse..."
        value={reflection}
        onChange={(e) => setReflection(e.target.value)}
      />

      <div className={styles.actions}>
        <button 
          className="btn-primary" 
          onClick={sealReflection}
          disabled={isSaving}
          style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)' }}
        >
          {isSaving ? "Sealing..." : "Seal Reflection"}
        </button>
      </div>
    </div>
  );
}
