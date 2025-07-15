import { Navigate, Route, Routes } from 'react-router-dom';
import LogVisited from '../components/LogVisited';
import VisitorReport from '../components/VisitorReport';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LogVisited />} />
      <Route path="/new" element={<VisitorReport mode="new" />} />
      <Route path="/edit/:id" element={<VisitorReport mode="edit" />} />
      <Route path="/edit" element={<VisitorReport mode="edit" />} />
      <Route path="/" element={<Navigate to="/sales-visitor" replace />} />
      <Route path="*" element={<Navigate to="/sales-visitor" replace />} />
    </Routes>
  );
};
