import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ActiveApp, MenuItem } from '../types';

export const useDashboardNavigation = (menuItems: MenuItem[]) => {
  const navigate = useNavigate();
  const location = useLocation();


  const getCurrentApp = (): ActiveApp => {
    const pathname = location.pathname;

    if (pathname === '/' || pathname === '') return { parentId: 'home' };

    const pathParts = pathname.split('/').filter((part) => part);
    if (pathParts.length === 0) return { parentId: 'home' };

    const mainPath = pathParts[0];
    const menuItem = menuItems.find((item) => item.id === mainPath);
    if (!menuItem) return { parentId: 'home' };

    if (pathParts.length > 1 && menuItem.subItems) {
      const subPath = pathParts[1];
      const subItem = menuItem.subItems.find(
        (sub) => sub.url && sub.url.split('/').pop() === subPath
      );
      if (subItem) {
        return { parentId: mainPath, subId: subItem.id };
      }
    }

    return { parentId: mainPath };
  };

  const [activeApp, setActiveApp] = useState(() => getCurrentApp());
  const [openKeys, setOpenKeys] = useState<string[]>(() => {
    const current = getCurrentApp();
    return current.subId ? [current.parentId] : [];
  });

  // Update activeApp เมื่อ URL เปลี่ยน
  useEffect(() => {
    const current = getCurrentApp();
    setActiveApp(current);
  }, [location.pathname]);

  const handleMenuClick = (key: string): void => {
    try {
      const menuItem = menuItems.find((item) => item.id === key);
      const subItem = menuItems
        .flatMap((item) => item.subItems || [])
        .find((sub) => sub.id === key);

      if (subItem) {
        // Handle sub-menu click
        const parentItem = menuItems.find((item) =>
          item.subItems?.some((sub) => sub.id === key)
        );
        if (parentItem) {
          setActiveApp({ parentId: parentItem.id, subId: key });
          if (subItem.url) {
            navigate(subItem.url);
          }
        }
      } else if (menuItem) {
        // Handle main menu click
        if (!menuItem.subItems || menuItem.subItems.length === 0) {
          setActiveApp({ parentId: key });
          if (menuItem.url) {
            navigate(menuItem.url);
          }
        }
      }
    } catch (error) {
      console.error('Menu click error:', error);
    }
  };

  const handleOpenChange = (keys: string[]): void => {
    setOpenKeys(keys);
  };

  const getSelectedKeys = (): string[] => {
    return activeApp.subId ? [activeApp.subId] : [activeApp.parentId];
  };

  return {
    activeApp,
    openKeys,
    handleMenuClick,
    handleOpenChange,
    getSelectedKeys,
  };
};