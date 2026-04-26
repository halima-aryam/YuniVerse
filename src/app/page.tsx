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
          <Link href="/builder?topic=The+Art+of+Kintsugi" className={`glass-panel ${styles.cardLink}`}>
            <h3>The Art of Kintsugi</h3>
            <p>The Japanese philosophy of repairing broken pottery with gold.</p>
          </Link>
          <Link href="/builder?topic=Victorian+Flower+Language" className={`glass-panel ${styles.cardLink}`}>
            <h3>Victorian Flower Language</h3>
            <p>Crafting beautiful bouquets embedded with secret, historical meanings.</p>
          </Link>
          <Link href="/builder?topic=Mycology+and+Foraging" className={`glass-panel ${styles.cardLink}`}>
            <h3>Mycology & Foraging</h3>
            <p>Discovering the hidden fungal networks of the deep forest.</p>
          </Link>
        </section>
      </main>
    </div>
  );
}
