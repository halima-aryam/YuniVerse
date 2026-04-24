import { Suspense } from "react";
import { SyllabusBuilder } from "@/components/SyllabusBuilder";
import { Navbar } from "@/components/Navbar";
import styles from "./page.module.css";

export default function BuilderPage() {
  return (
    <div className={styles.pageContainer}>
      <Navbar showBack={true} />
      
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>Create your path.</h1>
          <p>No grades, no pressure. Just a map for your curiosity.</p>
        </div>
        
        <Suspense fallback={<div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Waking up the Yuniverse...</div>}>
          <SyllabusBuilder />
        </Suspense>
      </main>
    </div>
  );
}
