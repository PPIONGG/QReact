import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@qreact/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// ฟังก์ชันสำหรับจัดการเส้นทางที่ต้องการการยืนยันตัวตน
// หากผู้ใช้ไม่ได้เข้าสู่ระบบ จะเปลี่ยนเส้นทางไปยังหน้าเข้าสู่ระบบ
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
}