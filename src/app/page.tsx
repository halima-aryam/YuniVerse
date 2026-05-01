import styles from "./page.module.css";
import { ThemeSelector } from "@/components/ThemeSelector";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export default function Home() {
  return (
    <div className={styles.container}>
      <Navbar />

      <main className={styles.main}>
        <header className={styles.header}>
          <h1>Design a learning path on any topic you love.</h1>
          <p className={styles.subtitle}>
            A personal curriculum built around curiosity, soft rituals, and zero anxiety streaks.
          </p>
          <div className={styles.actions}>
            <Link href="/builder" className="btn-primary">Build a Syllabus</Link>
            <Link href="/explore" className={styles.btnSecondary} style={{ display: 'inline-block', textDecoration: 'none' }}>Explore Community</Link>
          </div>
        </header>
      </main>
    </div>
  );
}
