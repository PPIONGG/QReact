import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@qreact/store';

interface PublicRouteProps {
  children: React.ReactNode;
}

// ฟังก์ชันสำหรับจัดการเส้นทางสาธารณะ
// หากผู้ใช้เข้าสู่ระบบแล้ว จะเปลี่ยนเส้นทางไปยังแดชบอร์ด
// หากยังไม่ได้เข้าสู่ระบบ จะให้แสดงหน้าเข้าสู่ระบบ
export default function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    return <Navigate to="/dashboard" replace />;
  }

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
}