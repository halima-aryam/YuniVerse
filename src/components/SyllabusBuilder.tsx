"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import styles from "../app/builder/page.module.css";
import { useTheme } from "./ThemeProvider";
import { HomeworkCard } from "./HomeworkCard";
import { ThemeSelector } from "./ThemeSelector";

import { supabase } from "@/lib/supabaseClient";
import { useToast } from "./ToastProvider";

interface Module {
  id: string;
  title: string;
  items: string[];
  resource?: { title: string; url: string; };
}

export function SyllabusBuilder() {
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get("topic") || "";
  
  const [courseName, setCourseName] = useState(initialTopic);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isJourneyStarted, setIsJourneyStarted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [emailCapture, setEmailCapture] = useState("");
  const [hasJoinedWaitlist, setHasJoinedWaitlist] = useState(false);
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [modules, setModules] = useState<Module[]>([
    { id: "1", title: "Introduction", items: ["Read chapter 1"] }
  ]);
  const [resources, setResources] = useState<{title: string, url: string}[]>([]);
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const loadingMessages = [
    "Consulting the Yuniverse...",
    "Dusting off ancient tomes...",
    "Curating the perfect resources...",
    "Aligning the syllabus with your vibe...",
    "Finalizing your magical path..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingStep((prev) => Math.min(prev + 1, loadingMessages.length - 1));
      }, 2000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const addModule = () => {
    setModules([...modules, { id: Date.now().toString(), title: "New Module", items: [] }]);
  };

  const removeModule = (moduleId: string) => {
    setModules(modules.filter(mod => mod.id !== moduleId));
  };

  const addLearningItem = (moduleId: string) => {
    setModules(modules.map(mod => {
      if (mod.id === moduleId) {
        return { ...mod, items: [...mod.items, "New Item"] };
      }
      return mod;
    }));
  };

  const removeLearningItem = (moduleId: string, itemIndex: number) => {
    setModules(modules.map(mod => {
      if (mod.id === moduleId) {
        const newItems = [...mod.items];
        newItems.splice(itemIndex, 1);
        return { ...mod, items: newItems };
      }
      return mod;
    }));
  };

  const updateItem = (moduleId: string, itemIndex: number, value: string) => {
    setModules(modules.map(mod => {
      if (mod.id === moduleId) {
        const newItems = [...mod.items];
        newItems[itemIndex] = value;
        return { ...mod, items: newItems };
      }
      return mod;
    }));
  };

  const generateWithAI = async () => {
    if (!courseName.trim()) {
      showToast("Please enter a curiosity to explore first!", "error");
      return;
    }
    
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: courseName, vibe: theme })
      });
      
      const data = await res.json();
      if (data.modules) {
        setModules(data.modules);
        setResources(data.resources || []);
        setHasGenerated(true);
        showToast("Path discovered successfully!", "success");
      } else {
        showToast("Failed to generate curriculum. " + (data.error || ""), "error");
      }
    } catch (err) {
      console.error(err);
      showToast("An error occurred while communicating with the AI.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveToSupabase = async () => {
    if (!user) {
      showToast("Please log in from the top navigation to save your curriculum!", "error");
      return;
    }

    setIsSaving(true);
    try {
      // 1. Save Syllabus
      const { data: syllabusData, error: syllabusError } = await supabase
        .from('syllabi')
        .insert({ user_id: user.id, title: courseName || "Untitled Path", vibe: theme })
        .select()
        .single();

      if (syllabusError) throw syllabusError;

      // 2. Save Modules and Sparks
      for (let i = 0; i < modules.length; i++) {
        const mod = modules[i];
        const { data: modData, error: modError } = await supabase
          .from('modules')
          .insert({ 
            syllabus_id: syllabusData.id, 
            title: mod.title, 
            order_index: i,
            resource_title: mod.resource?.title || null,
            resource_url: mod.resource?.url || null
          })
          .select()
          .single();

        if (modError) throw modError;

        const sparksToInsert = mod.items.map((item, j) => ({
          module_id: modData.id,
          prompt: item,
          order_index: j
        }));

        if (sparksToInsert.length > 0) {
          const { error: sparksError } = await supabase.from('sparks').insert(sparksToInsert);
          if (sparksError) throw sparksError;
        }
      }

      showToast("Syllabus successfully saved to your Cabinet!", "success");
    } catch (error: any) {
      console.error(error);
      showToast("Failed to save syllabus. Did you run the SQL schema script in Supabase?", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const joinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailCapture || !emailCapture.includes("@")) return;
    setIsSubmittingEmail(true);
    try {
      const { error } = await supabase.from('waitlist').insert({
        email: emailCapture,
        path_topic: courseName || "Untitled"
      });
      if (error) throw error;
      setHasJoinedWaitlist(true);
      showToast("Email saved! We'll keep your path safe.", "success");
    } catch (err) {
      console.error(err);
      showToast("Something went wrong saving your email.", "error");
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  if (isJourneyStarted) {
    return (
      <div className={styles.builderContainer}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2>{courseName || "Your Journey"}</h2>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>Take it one spark at a time.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
            <button 
              className={styles.addItemBtn} 
              onClick={() => setIsJourneyStarted(false)}
            >
              ← Back to Editor
            </button>
            <button 
              className="btn-primary" 
              onClick={saveToSupabase}
              disabled={isSaving}
              style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)' }}
            >
              {isSaving ? 'Saving...' : 'Save to yuniverse ✦'}
            </button>
          </div>
        </div>
        
        {modules.map((mod) => (
          <div key={mod.id} style={{ marginBottom: "4rem" }}>
            <h3 style={{ marginBottom: "1.5rem", textAlign: "center" }}>
              {mod.title}
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
              {mod.items.map((item, i) => (
                <HomeworkCard key={i} prompt={item} />
              ))}
            </div>
            
            {mod.resource && (
              <div style={{ marginTop: "2rem", padding: "1.5rem", background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px", display: "inline-block" }}>
                <a href={mod.resource.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-primary)", textDecoration: "none", fontSize: "1.1rem", fontFamily: "var(--font-serif), serif", transition: "color 0.2s ease" }} onMouseEnter={e => e.currentTarget.style.color = "var(--accent)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-primary)"}>
                  ✦ Start here: <span style={{ textDecoration: "underline", textDecorationColor: "var(--accent)", textUnderlineOffset: "4px" }}>{mod.resource.title}</span>
                </a>
              </div>
            )}
          </div>
        ))}

      </div>
    );
  }

  return (
    <div className={styles.builderContainer}>
      <div className={styles.header}>
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '600px', gap: '1rem' }}>
          <input 
            type="text" 
            className={styles.courseTitleInput} 
            placeholder="Name your curiosity..."
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
          />
          <button 
            className="btn-primary" 
            style={{ alignSelf: 'flex-start', background: 'var(--text-primary)', color: 'var(--bg-primary)', transition: 'all 0.3s ease' }}
            onClick={generateWithAI}
            disabled={isGenerating}
          >
            {isGenerating ? loadingMessages[loadingStep] : "Discover a Path ✧"}
          </button>
        </div>
        
        <div className={styles.vibeSelector}>
          <span>Set the vibe:</span>
          <ThemeSelector />
        </div>
      </div>

      {resources.length > 0 && (
        <div className="glass-panel" style={{ padding: "2rem", marginBottom: "3rem", background: "rgba(var(--accent-rgb), 0.05)" }}>
          <h3 style={{ fontSize: "1.2rem", marginBottom: "1rem", color: "var(--accent)", fontFamily: "var(--font-serif), serif" }}>Recommended Field Guides</h3>
          <ul style={{ display: "flex", flexDirection: "column", gap: "0.8rem", listStyle: "none" }}>
            {resources.map((res, idx) => (
              <li key={idx}>
                <a href={res.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--text-primary)", textDecoration: "none", transition: "color 0.2s ease" }} onMouseEnter={e => e.currentTarget.style.color = "var(--accent)"} onMouseLeave={e => e.currentTarget.style.color = "var(--text-primary)"}>
                  <span style={{ fontSize: "0.8rem" }}>🔗</span>
                  <span style={{ fontWeight: 500 }}>{res.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.modulesList}>
        {modules.map((mod, index) => (
          <div key={mod.id} className="glass-panel" style={{ padding: "2rem", marginBottom: "2rem", position: "relative" }}>
            <button 
              onClick={() => removeModule(mod.id)}
              style={{ position: 'absolute', top: '1rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem', transition: 'color 0.2s ease' }}
              onMouseEnter={e => e.currentTarget.style.color = '#d9534f'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              title="Delete Module"
            >×</button>

            <div className={styles.moduleHeader}>
              <input 
                type="text" 
                className={styles.moduleTitleInput}
                value={mod.title}
                onChange={(e) => {
                  const newMods = [...modules];
                  newMods[index].title = e.target.value;
                  setModules(newMods);
                }}
              />
            </div>
            
            <ul className={styles.itemList}>
              {mod.items.map((item, i) => (
                <li key={i} className={styles.itemRow} style={{ position: 'relative' }}>
                  <div className={styles.bullet}>✧</div>
                  <input 
                    type="text" 
                    value={item} 
                    onChange={(e) => updateItem(mod.id, i, e.target.value)}
                    placeholder="e.g. Watch 10 min of a documentary"
                    className={styles.itemInput}
                    style={{ paddingRight: '2rem' }}
                  />
                  <button 
                    onClick={() => removeLearningItem(mod.id, i)}
                    style={{ position: 'absolute', right: '0', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', opacity: 0.5, transition: 'opacity 0.2s ease, color 0.2s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = '#d9534f'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    title="Remove Spark"
                  >×</button>
                </li>
              ))}
            </ul>
            
            {mod.resource && (
              <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px dashed var(--border-color)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Curated Resource</span>
                <input 
                  type="text" 
                  value={mod.resource.title}
                  onChange={(e) => {
                    const newMods = [...modules];
                    newMods[index].resource = { ...newMods[index].resource!, title: e.target.value };
                    setModules(newMods);
                  }}
                  className={styles.itemInput}
                  placeholder="Resource title..."
                />
                <input 
                  type="text" 
                  value={mod.resource.url}
                  onChange={(e) => {
                    const newMods = [...modules];
                    newMods[index].resource = { ...newMods[index].resource!, url: e.target.value };
                    setModules(newMods);
                  }}
                  className={styles.itemInput}
                  placeholder="Resource URL..."
                  style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}
                />
              </div>
            )}
            
            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
              <button className={styles.addItemBtn} onClick={() => addLearningItem(mod.id)}>
                + Add a spark
              </button>
            </div>
          </div>
        ))}
      </div>

      {hasGenerated && !user && !hasJoinedWaitlist && (
        <form onSubmit={joinWaitlist} className="glass-panel" style={{ padding: "2.5rem", marginBottom: "2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <h3 style={{ fontFamily: "var(--font-serif), serif", fontSize: "1.6rem" }}>Save your path</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>Drop your email to keep it safe for later.</p>
          <div style={{ display: "flex", gap: "0.5rem", width: "100%", maxWidth: "400px", marginTop: "0.5rem" }}>
            <input 
              type="email" 
              value={emailCapture}
              onChange={(e) => setEmailCapture(e.target.value)}
              placeholder="Your email address..."
              style={{ flex: 1, padding: "0.8rem 1.2rem", borderRadius: "9999px", border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)", fontFamily: "inherit" }}
              required
            />
            <button type="submit" disabled={isSubmittingEmail} className="btn-primary" style={{ padding: "0.8rem 1.5rem" }}>
              {isSubmittingEmail ? "..." : "Save"}
            </button>
          </div>
        </form>
      )}
      
      {hasJoinedWaitlist && !user && (
         <div className="glass-panel" style={{ padding: "1.5rem", marginBottom: "2rem", textAlign: "center", background: "rgba(var(--accent-rgb), 0.05)" }}>
           <p style={{ color: "var(--accent)", fontWeight: 500, fontSize: "1.1rem" }}>✨ We've saved your magical path!</p>
         </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: "1rem" }}>
        <button className="btn-primary" onClick={addModule}>
          + Add Module
        </button>
        <button 
          className="btn-primary" 
          onClick={() => setIsJourneyStarted(true)}
          style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)' }}
        >
          Start Journey →
        </button>
      </div>
    </div>
  );
}
