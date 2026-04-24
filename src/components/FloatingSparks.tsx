"use client";

import { useEffect, useState } from "react";
import styles from "./FloatingSparks.module.css";

// A component that renders gentle, slow-floating aesthetic particles in the background
export function FloatingSparks() {
  const [sparks, setSparks] = useState<{ id: number; left: string; top: string; delay: string; duration: string; size: string; symbol: string }[]>([]);

  useEffect(() => {
    // Generate sparks only on the client to avoid hydration mismatch
    const symbols = ["✦", "✧", "⋆", "⟡", "°"];
    const newSparks = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${10 + Math.random() * 20}s`, // slow floating
      size: `${0.5 + Math.random() * 1.5}rem`,
      symbol: symbols[Math.floor(Math.random() * symbols.length)]
    }));
    setSparks(newSparks);
  }, []);

  if (sparks.length === 0) return null;

  return (
    <div className={styles.container} aria-hidden="true">
      {sparks.map((spark) => (
        <span
          key={spark.id}
          className={styles.spark}
          style={{
            left: spark.left,
            top: spark.top,
            animationDelay: spark.delay,
            animationDuration: spark.duration,
            fontSize: spark.size
          }}
        >
          {spark.symbol}
        </span>
      ))}
    </div>
  );
}
