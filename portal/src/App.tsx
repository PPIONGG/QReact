import React, { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import { SessionGuard } from './components/SessionGuard';
import { AppRoutes } from './routes/AppRoutes';

// const RemoteButton = React.lazy(() => import('remote/Button' as any));

const App: React.FC = () => {

  return (
    <HashRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <SessionGuard/>
      <AppRoutes />
    </HashRouter>
  );
};

export default App;