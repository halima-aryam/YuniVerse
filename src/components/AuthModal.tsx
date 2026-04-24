"use client";

import { useState } from "react";
import styles from "./AuthModal.module.css";
import { supabase } from "@/lib/supabaseClient";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSending(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (authError) {
      setError(authError.message);
      setIsSending(false);
    } else {
      setIsSent(true);
      setIsSending(false);
      // Close automatically after 3 seconds
      setTimeout(() => {
        onClose();
        setIsSent(false);
        setEmail("");
      }, 3000);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.modal} glass-panel`} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
        
        <div className={styles.content}>
          <h2 className={styles.title}>Enter the Yuniverse</h2>
          
          {isSent ? (
            <div className={styles.successState}>
              <span className={styles.sparkle}>✧</span>
              <p>Magic link sent!</p>
              <p className={styles.subtext}>Check your inbox to gently step inside.</p>
            </div>
          ) : (
            <form onSubmit={handleLogin} className={styles.form}>
              <p className={styles.description}>No passwords. Just a gentle magic link to your email.</p>
              
              <input
                type="email"
                placeholder="you@curious.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                required
              />
              
              {error && <p className={styles.error}>{error}</p>}
              
              <button 
                type="submit" 
                className="btn-primary"
                disabled={isSending || !email}
                style={{ width: '100%', background: 'var(--text-primary)', color: 'var(--bg-primary)' }}
              >
                {isSending ? "Sending magic..." : "Send Magic Link ✦"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
