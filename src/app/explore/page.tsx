"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

// Fallback mock data in case the database is empty
const MOCK_PATHS = [
  { id: 'mock1', author: "@stargazer", title: "Astrophysics for Poets", description: "A gentle introduction to the cosmos.", vibe: "dark-academia", sparksCount: 12 },
  { id: 'mock2', author: "@mossy_stone", title: "Urban Foraging", description: "Learn to identify edible plants hidden in plain sight.", vibe: "cottagecore", sparksCount: 8 }
];

export default function ExplorePage() {
  const [paths, setPaths] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCommunitySyllabi() {
      // Fetch public syllabi from the database
      const { data, error } = await supabase
        .from('syllabi')
        .select(`
          id, 
          title, 
          vibe, 
          user_id,
          modules (
            sparks (id)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data && data.length > 0) {
        // Transform the nested data to match our UI format
        const formattedPaths = data.map((syllabus: any) => {
          let sparkCount = 0;
          syllabus.modules?.forEach((mod: any) => {
            sparkCount += mod.sparks?.length || 0;
          });
          
          return {
            id: syllabus.id,
            author: "Community Member", // Since we don't have user profiles yet
            title: syllabus.title,
            description: "A magical path discovered in the yuniverse.",
            vibe: syllabus.vibe,
            sparksCount: sparkCount
          };
        });
        setPaths(formattedPaths);
      } else {
        // Use mock data if the database is brand new and empty
        setPaths(MOCK_PATHS);
      }
      setIsLoading(false);
    }
    
    loadCommunitySyllabi();
  }, []);

  return (
    <div className={styles.pageContainer}>
      <Navbar showBack={true} />
      
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>The Discovery Feed.</h1>
          <p>Serendipitous rabbit holes adjacent to your current obsessions. Find a path and start wandering.</p>
        </div>
        
        {isLoading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Searching the cosmos...</p>
        ) : (
          <div className={styles.feedGrid}>
            {paths.map((path) => (
              <div key={path.id} className={`${styles.feedCard} glass-panel`} data-vibe={path.vibe}>
                <div className={styles.cardHeader}>
                  <span className={styles.author}>{path.author}</span>
                  <span className={styles.sparks}>{path.sparksCount} sparks</span>
                </div>
                <h2 className={styles.title}>{path.title}</h2>
                <p className={styles.description}>{path.description}</p>
                
                <Link 
                  href={`/builder?topic=${encodeURIComponent(path.title)}`}
                  className={styles.cloneBtn}
                  style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
                >
                  Clone this Path ✦
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
