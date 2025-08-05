import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, Tooltip, Dropdown, Typography, Drawer } from "antd";
import { LogoutOutlined, MenuOutlined, CloseOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import type { ActiveApp, MenuItem, SubMenuItem } from "../../types";
import logo from "../../assets/logo.svg";
import { useTranslation } from "react-i18next";
import styles from "./Sidebar.module.css";

const { Sider } = Layout;
const { Title } = Typography;

interface SidebarProps {
  collapsed: boolean;
  menuItems: MenuItem[];
  activeApp: ActiveApp;
  openKeys: string[];
  onMenuClick: (key: string) => void;
  onOpenChange: (keys: string[]) => void;
  onLogout: () => void;
  getSelectedKeys: () => string[];
  // เพิ่ม prop สำหรับ mobile drawer control
  mobileDrawerVisible?: boolean;
  onMobileDrawerClose?: () => void;
}

// Hook สำหรับตรวจจับขนาดหน้าจอ
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

const createDropdownItems = (
  subItems: SubMenuItem[],
  onMenuClick: (key: string) => void
): MenuProps["items"] => {
  return subItems.map((subItem) => ({
    key: subItem.id,
    label: (
      <div
        onClick={() => onMenuClick(subItem.id)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "4px 0",
        }}
      >
        {subItem.icon}
        <span>{subItem.name}</span>
      </div>
    ),
  }));
};

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  menuItems,
  activeApp,
  openKeys,
  onMenuClick,
  onOpenChange,
  onLogout,
  getSelectedKeys,
  mobileDrawerVisible = false,
  onMobileDrawerClose,
}) => {
  const { t } = useTranslation("portal-dashboard");
  const { width } = useWindowSize();
  const [internalDrawerVisible, setInternalDrawerVisible] = useState(false);
  
  // กำหนดจุดเปลี่ยนเป็น drawer
  const isMobile = width <= 768; // เปลี่ยนจาก 640 เป็น 768 เพื่อให้เข้ากับ responsive design ทั่วไป
  
  // ใช้ external control ถ้ามี ไม่งั้นใช้ internal state
  const drawerVisible = onMobileDrawerClose ? mobileDrawerVisible : internalDrawerVisible;
  const setDrawerVisible = onMobileDrawerClose ? 
    (visible: boolean) => !visible && onMobileDrawerClose() : 
    setInternalDrawerVisible;

  const isParentActive = (itemId: string): boolean => {
    if (activeApp.parentId === itemId) {
      return true;
    }
    return false;
  };

  // สร้าง menu items สำหรับทั้ง Sider และ Drawer
  const createMenuItems = (isDrawerMode: boolean = false): MenuProps["items"] => {
    return menuItems.map((item) => {
      const isActive = isParentActive(item.id);

      if (item.subItems && item.subItems.length > 0) {
        if (collapsed && !isDrawerMode) {
          // Dropdown สำหรับ collapsed sider
          return {
            key: item.id,
            icon: (
              <Dropdown
                menu={{ items: createDropdownItems(item.subItems, onMenuClick) }}
                placement="topRight"
                trigger={["hover"]}
                overlayStyle={{ minWidth: "180px" }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </div>
              </Dropdown>
            ),
            label: (
              <Tooltip title={`${item.name}`} placement="right">
                <span style={{ marginLeft: "0px" }}>{item.name}</span>
              </Tooltip>
            ),
            className: isActive ? "parent-menu-active" : "",
          };
        } else {
          // ปกติ submenu
          return {
            key: item.id,
            icon: item.icon,
            label: item.name,
            children: item.subItems.map((subItem) => ({
              key: subItem.id,
              icon: subItem.icon,
              label: subItem.name,
            })),
          };
        }
      }

      const menuItem = {
        key: item.id,
        icon: item.icon,
        label: item.name,
      };

      if (collapsed && !isDrawerMode) {
        return {
          ...menuItem,
          label: (
            <Tooltip title={`${item.name}`} placement="right">
              <span>{item.name}</span>
            </Tooltip>
          ),
        };
      }

      return menuItem;
    });
  };

  // Handle menu click สำหรับ drawer (ปิด drawer หลังคลิก)
  const handleDrawerMenuClick = (key: string) => {
    onMenuClick(key);
    setDrawerVisible(false);
  };

  // Logo Section Component
  const LogoSection = ({ isCollapsed = false, isDrawer = false }) => (
    <div className={`${styles.logoSection} ${isDrawer ? styles.drawerLogoSection : ''}`}>
      {isCollapsed && !isDrawer ? (
        <Tooltip title={t("sidebar.systemTitle")} placement="right">
          <img
            src={logo}
            alt="logo"
            className={styles.logoImage}
          />
        </Tooltip>
      ) : (
        <div className={`sidebar-logo-text ${isCollapsed ? "collapsed" : ""}`}>
          <Title level={5} className={styles.logoText}>
            <span className={styles.qLetter}>Q</span>-ERPc
          </Title>
        </div>
      )}
    </div>
  );

  // Logout Section Component
  const LogoutSection = ({ isCollapsed = false, isDrawer = false }) => (
    <div className={`${styles.logoutSection} ${isDrawer ? styles.drawerLogoutSection : ''}`}>
      <Tooltip
        title={isCollapsed && !isDrawer ? t("sidebar.logoutTooltip") : ""}
        placement="right"
      >
        <Button
          type="primary"
          danger
          block={!isCollapsed}
          icon={<LogoutOutlined />}
          onClick={onLogout}
          className={styles.logoutButton}
        >
          <span
            className={`logout-button-text ${isCollapsed ? "collapsed" : ""} ${styles.logoutButtonText}`}
          >
            {(!isCollapsed || isDrawer) && t("sidebar.logout")}
          </span>
        </Button>
      </Tooltip>
    </div>
  );

  // Drawer Header สำหรับ mobile
  const DrawerHeader = () => (
    <div className={styles.drawerHeader}>
      <LogoSection isDrawer={true} />
      <Button
        type="text"
        icon={<MenuOutlined />}
        onClick={() => setDrawerVisible(false)}
        className={styles.drawerCloseButton}
      />
    </div>
  );

  // ถ้าเป็นมือถือ แสดงเฉพาะ Drawer (ไม่แสดง mobile menu button ที่นี่)
  if (isMobile) {
    return (
      <Drawer
        title={<DrawerHeader />}
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        bodyStyle={{ padding: 0 }}
        width={200}
        className={styles.mobileDrawer}
        closeIcon={null}
      >
        <div className={styles.drawerContent}>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={getSelectedKeys()}
            openKeys={openKeys}
            onOpenChange={onOpenChange}
            items={createMenuItems(true)}
            onClick={({ key }) => handleDrawerMenuClick(key)}
            className={`${styles.customMenu} custom-menu`}
            style={{ flex: 1, borderRight: 0 }}
          />
          <LogoutSection isDrawer={true} />
        </div>
      </Drawer>
    );
  }

  // ถ้าไม่ใช่มือถือ แสดง Sider ปกติ
  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      className={styles.sidebar}
    >
    <LogoSection isCollapsed={collapsed} />
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={getSelectedKeys()}
        openKeys={collapsed ? [] : openKeys}
        onOpenChange={onOpenChange}
        items={createMenuItems()}
        onClick={({ key }) => onMenuClick(key)}
        className={`${styles.customMenu} custom-menu`}
      />

      <LogoutSection isCollapsed={collapsed} />
    </Sider>
  );
};

export default Sidebar;