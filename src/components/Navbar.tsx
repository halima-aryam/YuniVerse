"use client";

import Link from "next/link";
import { ThemeSelector } from "./ThemeSelector";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { AuthModal } from "./AuthModal";

export function Navbar({ showBack = false }: { showBack?: boolean }) {
  const [user, setUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthClick = async () => {
    if (user) {
      await supabase.auth.signOut();
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '2rem 0',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {showBack ? (
          <Link href="/" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', transition: 'color 0.2s ease', textDecoration: 'none' }}>
            ← Back to yuniverse
          </Link>
        ) : (
          <div style={{ fontFamily: 'var(--font-serif), serif', fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.02em' }}>
            <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>yuni</span>verse
          </div>
        )}

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/explore" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s ease', fontWeight: 500, textDecoration: 'none' }}>
            Explore
          </Link>
          {user && (
            <Link href="/cabinet" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s ease', fontWeight: 500, textDecoration: 'none' }}>
              My Cabinet
            </Link>
          )}
          <button 
            onClick={handleAuthClick}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              fontWeight: 500,
              cursor: 'pointer',
              fontSize: '1rem',
              fontFamily: 'var(--font-sans), sans-serif',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            {user ? 'Log out' : 'Log in'}
          </button>
          <ThemeSelector />
        </div>
      </nav>

      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
