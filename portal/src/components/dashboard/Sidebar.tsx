import React from "react";
import { Layout, Menu, Button, Tooltip, Dropdown, Typography } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
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
}

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
}) => {
  const { t } = useTranslation("portal-dashboard");

  const isParentActive = (itemId: string): boolean => {
    if (activeApp.parentId === itemId) {
      return true;
    }
    return false;
  };

  const antMenuItems: MenuProps["items"] = menuItems.map((item) => {
    const isActive = isParentActive(item.id);

    if (item.subItems && item.subItems.length > 0) {
      if (collapsed) {
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

    if (collapsed) {
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

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      className={styles.sidebar}
    >
      {/* Logo Section */}
      <div className={styles.logoSection}>
        {collapsed ? (
          <Tooltip title={t("sidebar.systemTitle")} placement="right">
            <img
              src={logo}
              alt="logo"
              className={styles.logoImage}
            />
          </Tooltip>
        ) : (
          <div className={`sidebar-logo-text ${collapsed ? "collapsed" : ""}`}>
            <Title level={5} className={styles.logoText}>
              <span className={styles.qLetter}>Q</span>React
            </Title>
          </div>
        )}
      </div>

      {/* Menu Section */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={getSelectedKeys()}
        openKeys={collapsed ? [] : openKeys}
        onOpenChange={onOpenChange}
        items={antMenuItems}
        onClick={({ key }) => onMenuClick(key)}
        className={`${styles.customMenu} custom-menu`}
      />

      {/* Logout Section */}
      <div className={styles.logoutSection}>
        <Tooltip
          title={collapsed ? t("sidebar.logoutTooltip") : ""}
          placement="right"
        >
          <Button
            type="primary"
            danger
            block={!collapsed}
            icon={<LogoutOutlined />}
            onClick={onLogout}
            className={styles.logoutButton}
          >
            <span
              className={`logout-button-text ${collapsed ? "collapsed" : ""} ${styles.logoutButtonText}`}
            >
              {!collapsed && t("sidebar.logout")}
            </span>
          </Button>
        </Tooltip>
      </div>
    </Sider>
  );
};

export default Sidebar;