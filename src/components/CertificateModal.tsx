"use client";

import { useEffect, useState } from "react";
import styles from "./CertificateModal.module.css";
import confetti from "canvas-confetti";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
  vibe: string;
  date: string;
  userName?: string;
}

export function CertificateModal({ isOpen, onClose, topic, vibe, date, userName = "Curious Explorer" }: CertificateModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Trigger magical confetti
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);
    } else {
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

  return (
    <div className={`${styles.overlay} ${isOpen ? styles.open : ""}`} onClick={onClose}>
      <div 
        className={`${styles.certificateContainer} ${styles[vibe]}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.borderInner}>
          <div className={styles.header}>
            <div className={styles.seal}>✦</div>
            <h2 className={styles.title}>Certificate of Curiosity</h2>
            <p className={styles.subtitle}>Proudly presented to</p>
          </div>

          <h3 className={styles.name}>{userName}</h3>

          <div className={styles.body}>
            <p>For fearlessly venturing into the unknown and</p>
            <p>successfully conquering the path of</p>
            <h4 className={styles.topic}>{topic}</h4>
          </div>

          <div className={styles.footer}>
            <div className={styles.signatureBlock}>
              <span className={styles.signature}>The yuniverse</span>
              <span className={styles.line}></span>
              <span className={styles.label}>Curator</span>
            </div>
            <div className={styles.dateBlock}>
              <span className={styles.date}>{date}</span>
              <span className={styles.line}></span>
              <span className={styles.label}>Date Sealed</span>
            </div>
          </div>
        </div>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
      </div>
    </div>
  );
}
