import { Navigate, Route, Routes } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};
