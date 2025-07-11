import React from 'react';
import { Layout } from 'antd';

interface BackgroundOverlayProps {
  children: React.ReactNode;
}

export default function BackgroundOverlay({
  children,
}: BackgroundOverlayProps) {
  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #fff 0%, #ffeaea 100%)',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(0,0,0,0.03) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(0,0,0,0.03) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          padding: '20px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {children}
      </div>
    </Layout>
  );
}
