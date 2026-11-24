/*
From Uiverse.io by ZacharyCrespin - https://uiverse.io/ZacharyCrespin/grumpy-stingray-26
MIT License, Copyright (c) ZacharyCrespin (Zachary Crespin)
*/

import styles from "./square-loader.module.css";

interface SquareLoaderProps {
  className?: string;
}

export function SquareLoader({ className }: SquareLoaderProps) {
  return (
    <div className={`${styles.loader} ${className ?? ""}`} aria-hidden="true">
      <div className={styles.loaderSquare} />
      <div className={styles.loaderSquare} />
      <div className={styles.loaderSquare} />
      <div className={styles.loaderSquare} />
      <div className={styles.loaderSquare} />
      <div className={styles.loaderSquare} />
      <div className={styles.loaderSquare} />
    </div>
  );
}
