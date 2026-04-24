"use client";

import { useState } from "react";
import styles from "./HomeworkCard.module.css";

interface HomeworkCardProps {
  prompt: string;
}

export function HomeworkCard({ prompt }: HomeworkCardProps) {
  const [isCompleted, setIsCompleted] = useState(false);

  return (
    <div className={`${styles.card} ${isCompleted ? styles.completed : ""} glass-panel`}>
      <div className={styles.content}>
        <p className={styles.prompt}>{prompt}</p>
      </div>
      <button 
        className={styles.actionBtn}
        onClick={() => setIsCompleted(!isCompleted)}
      >
        {isCompleted ? "✧ Done" : "Mark as done"}
      </button>
    </div>
  );
}
