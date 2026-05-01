"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Navbar } from "@/components/Navbar";
import { HomeworkCard } from "@/components/HomeworkCard";
import styles from "./page.module.css";
import { useTheme } from "@/components/ThemeProvider";

export default function JourneyPage() {
  const { id } = useParams();
  const { setTheme } = useTheme();
  const [syllabus, setSyllabus] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadJourney() {
      if (!id) return;
      
      const { data: syllabusData, error: sylError } = await supabase
        .from('syllabi')
        .select('*')
        .eq('id', id)
        .single();

      if (sylError || !syllabusData) {
        setIsLoading(false);
        return;
      }
      setSyllabus(syllabusData);
      
      // Update global theme to match the vibe of the saved syllabus
      if (syllabusData.vibe) {
        setTheme(syllabusData.vibe);
      }

      const { data: modsData, error: modError } = await supabase
        .from('modules')
        .select(`
          id, 
          title, 
          order_index, 
          resource_title, 
          resource_url,
          sparks (*)
        `)
        .eq('syllabus_id', id)
        .order('order_index', { ascending: true });

      if (!modError && modsData) {
        // Sort sparks by order_index inside each module
        const processedMods = modsData.map(mod => {
          if (mod.sparks) {
            mod.sparks.sort((a: any, b: any) => a.order_index - b.order_index);
          }
          return mod;
        });
        setModules(processedMods);
      }
      
      setIsLoading(false);
    }

    loadJourney();
  }, [id]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Navbar showBack={true} />
        <div style={{ textAlign: "center", marginTop: "4rem" }}>Dusting off the ancient tomes...</div>
      </div>
    );
  }

  if (!syllabus) {
    return (
      <div className={styles.container}>
        <Navbar showBack={true} />
        <div style={{ textAlign: "center", marginTop: "4rem" }}>Journey not found. It may have drifted into the ether.</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Navbar showBack={true} />
        <main className={styles.main}>
          <div className={styles.header}>
            <h1 className={styles.title}>{syllabus.title}</h1>
            <p className={styles.subtitle}>Take it one spark at a time.</p>
          </div>

          <div className={styles.journeyContent}>
            {modules.map((mod) => (
              <div key={mod.id} className={styles.moduleSection}>
                <h3 className={styles.moduleTitle}>{mod.title}</h3>
                
                <div className={styles.sparksGrid}>
                  {mod.sparks?.map((spark: any) => (
                    <HomeworkCard key={spark.id} prompt={spark.prompt} />
                  ))}
                </div>

                {mod.resource_title && mod.resource_url && (
                  <div className={styles.resourceWrapper}>
                    <a 
                      href={mod.resource_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={styles.resourceLink}
                    >
                      ✦ Start here: <span>{mod.resource_title}</span>
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
  );
}
