import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import {
  SESSION_CHECK_INTERVAL,
  SESSION_DURATION,
} from '../constants/auth.constants';

// ฟังก์ชันตรวจสอบเซสชัน และ ออกจากเซสชัน หากหมดเวลา
export const SessionGuard = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      const { user, logout } = useAuthStore.getState();
      if (user && Date.now() - user.loginTime > SESSION_DURATION) {
        logout();
      }
    }, SESSION_CHECK_INTERVAL); // ตรวจทุก ... นาที

    return () => clearInterval(interval);
  }, []);

  return null;
};
