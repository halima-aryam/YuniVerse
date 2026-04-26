"use client";

import Link from "next/link";
import { ThemeSelector } from "./ThemeSelector";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { AuthModal } from "./AuthModal";
import styles from "./Navbar.module.css";

export function Navbar({ showBack = false }: { showBack?: boolean }) {
  const [user, setUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Close menu on click outside
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAuthClick = async () => {
    if (user) {
      await supabase.auth.signOut();
    } else {
      setIsModalOpen(true);
    }
  };

  const closeMenu = () => setIsMenuOpen(false);

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
          <div className={styles.desktopLinks}>
            <Link href="/explore" className={styles.linkItem}>
              Explore
            </Link>
            <Link href="/cabinet" className={styles.linkItem}>
              My Cabinet
            </Link>
            <button 
              onClick={handleAuthClick}
              className={styles.authBtn}
            >
              {user ? 'Log out' : 'Log in'}
            </button>
          </div>
          
          <ThemeSelector />

          <div className={styles.hamburgerMenu} ref={menuRef}>
            <button className={styles.hamburgerBtn} onClick={() => setIsMenuOpen(!isMenuOpen)}>
              ☰
            </button>
            {isMenuOpen && (
              <div className={styles.dropdown}>
                <Link href="/explore" className={styles.dropdownItem} onClick={closeMenu}>Explore</Link>
                <Link href="/cabinet" className={styles.dropdownItem} onClick={closeMenu}>My Cabinet</Link>
                <button onClick={() => { closeMenu(); handleAuthClick(); }} className={styles.dropdownItem}>
                  {user ? 'Log out' : 'Log in'}
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
