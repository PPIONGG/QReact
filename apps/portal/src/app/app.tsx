import { HashRouter } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { SessionGuard } from './components/SessionGuard';

export function App() {
  return (
    <HashRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <SessionGuard/>
      <AppRoutes />
    </HashRouter>
  );
}

export default App;
