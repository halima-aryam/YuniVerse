"use client";

import Link from "next/link";
import { ThemeSelector } from "./ThemeSelector";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { AuthModal } from "./AuthModal";
import styles from "./Navbar.module.css";

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
      <nav className={styles.nav}>
        {showBack ? (
          <Link href="/" className={styles.backLink}>
            ← Back to yuniverse
          </Link>
        ) : (
          <div className={styles.logo}>
            <span>yuni</span>verse
          </div>
        )}

        <div className={styles.links}>
          <Link href="/explore" className={styles.linkItem}>
            Explore
          </Link>
          {user && (
            <Link href="/cabinet" className={styles.linkItem}>
              My Cabinet
            </Link>
          )}
          <button 
            onClick={handleAuthClick}
            className={styles.authBtn}
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
