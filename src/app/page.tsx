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

        <section className={styles.grid}>
          <Link href="/builder?topic=Jazz+History+101" className={`glass-panel ${styles.cardLink}`}>
            <h3>Jazz History 101</h3>
            <p>A deep dive into the origins and evolution of jazz.</p>
          </Link>
          <Link href="/builder?topic=French+Baking" className={`glass-panel ${styles.cardLink}`}>
            <h3>French Baking</h3>
            <p>From croissants to macarons, perfect your pastry skills.</p>
          </Link>
          <Link href="/builder?topic=Stoicism" className={`glass-panel ${styles.cardLink}`}>
            <h3>Stoicism</h3>
            <p>Ancient philosophy for modern mental resilience.</p>
          </Link>
        </section>
      </main>
    </div>
  );
}
