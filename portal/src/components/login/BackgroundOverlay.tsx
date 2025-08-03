import React from "react";
import { Layout } from "antd";
import styles from "./BackgroundOverlay.module.css";

interface BackgroundOverlayProps {
  children: React.ReactNode;
}

export default function BackgroundOverlay({
  children,
}: BackgroundOverlayProps) {
  return (
    <Layout className={styles.layout}>
      <div className={styles.backgroundPattern} />
      <div className={styles.contentContainer}>
        {children}
        </div>
    </Layout>
  );
}
