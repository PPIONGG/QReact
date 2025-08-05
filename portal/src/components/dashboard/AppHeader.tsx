import React, { useState, useEffect } from "react";
import {
  Layout,
  Button,
  Typography,
  Select,
  Dropdown,
  Avatar,
  Space,
  Tooltip,
} from "antd";
import {
  GlobalOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { UserOutlined } from "@ant-design/icons";
import type { MenuItem, ActiveApp } from "../../types";
import type { User } from "../../types/auth.types";
import { useTranslation } from "react-i18next";

const { Header } = Layout;
const { Title, Text } = Typography;

interface AppHeaderProps {
  collapsed: boolean;
  onToggle: () => void;
  menuItems: MenuItem[];
  activeApp: ActiveApp;
  colorBgContainer: string;
  user: User;
  selectedCompanyCode: string | null;
  onChangeCompany: (code: string) => void;
  // เพิ่ม props สำหรับ mobile drawer
  onMobileMenuClick?: () => void;
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

const AppHeader: React.FC<AppHeaderProps> = ({
  collapsed,
  onToggle,
  menuItems,
  activeApp,
  colorBgContainer,
  user,
  selectedCompanyCode,
  onChangeCompany,
  onMobileMenuClick,
}) => {
  const { t, i18n } = useTranslation("portal-dashboard");
  const { width } = useWindowSize();
  
  // กำหนดจุดเปลี่ยนเป็น mobile
  const isMobile = width <= 768;

  const currentMenuItem = menuItems.find(
    (item) => item.id === activeApp.parentId
  );
  const currentSubItem = currentMenuItem?.subItems?.find(
    (sub) => sub.id === activeApp.subId
  );

  const displayName =
    currentSubItem?.name || currentMenuItem?.name || t("menu.home");
  const displayIcon = currentSubItem?.icon || currentMenuItem?.icon;

  const toggleLanguage = () => {
    const newLanguage = i18n.language === "th" ? "en" : "th";
    i18n.changeLanguage(newLanguage);
  };

  // User dropdown สำหรับ mobile และ desktop
  const UserDropdown = ({ compact = false }) => (
    <Dropdown
      placement="bottomRight"
      arrow
      popupRender={() => (
        <div
          style={{
            minWidth: compact ? 200 : 220,
            padding: "12px 16px",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            background: "#fff",
          }}
        >
          <Text type="secondary" style={{ fontSize: 12 }}>
            {t("header.selectCompany")}
          </Text>
          <Select
            size="middle"
            value={selectedCompanyCode}
            onChange={onChangeCompany}
            options={user.company.map((c) => ({
              label: c.companyName,
              value: c.companyCode,
            }))}
            style={{ width: "100%", marginTop: 6 }}
          />
        </div>
      )}
    >
      <div style={{ cursor: "pointer" }}>
        <Space>
          <Avatar
            style={{
              backgroundColor: "#B30000",
              color: "#fff",
            }}
            size={compact ? "small" : "small"}
            icon={<UserOutlined />}
          />
          {!compact && (
            <Text style={{ fontSize: 13 }}>{user.username}</Text>
          )}
        </Space>
      </div>
    </Dropdown>
  );

  if (isMobile) {
    return (
      <Header
        style={{
          padding: "0 16px",
          background: colorBgContainer,
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid #f0f0f0",
          height: 64,
        }}
      >
        {/* Mobile Menu Button */}
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={onMobileMenuClick}
          style={{
            fontSize: "18px",
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // borderRadius: 8,
            // color: "#B30000",
          }}
        />

        {/* Title Section - Compact */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginLeft: "12px",
            flex: 1,
            minWidth: 0, // Allow shrinking
          }}
        >
          {displayIcon && (
            <span style={{ fontSize: "16px", color: "#B30000", flexShrink: 0 }}>
              {displayIcon}
            </span>
          )}
          <Title 
            level={5} 
            style={{ 
              margin: 0, 
              color: "#262626",
              fontSize: "14px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
          >
            {displayName}
          </Title>
        </div>

        {/* Right Section - Compact */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexShrink: 0,
          }}
        >
          {/* Language Toggle - Icon Only */}
          <Tooltip
            title={t("header.switchLanguage", {
              lang: i18n.language === "th" ? "English" : "ไทย",
            })}
          >
            <Button
              type="text"
              icon={<GlobalOutlined />}
              onClick={toggleLanguage}
              style={{
                fontSize: "16px",
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          </Tooltip>
          
          {/* User Dropdown - Avatar Only */}
          <UserDropdown compact={true} />
        </div>
      </Header>
    );
  }

  // Desktop Header (เหมือนเดิม)
  return (
    <Header
      style={{
        padding: 0,
        background: colorBgContainer,
        display: "flex",
        alignItems: "center",
        paddingRight: "24px",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onToggle}
        style={{
          fontSize: "16px",
          width: 64,
          height: 64,
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginLeft: "8px",
        }}
      >
        {displayIcon && (
          <span style={{ fontSize: "16px", color: "#B30000" }}>
            {displayIcon}
          </span>
        )}
        <Title level={4} style={{ margin: 0, color: "#262626" }}>
          {displayName}
        </Title>
      </div>

      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <Tooltip
          title={t("header.switchLanguage", {
            lang: i18n.language === "th" ? "English" : "ไทย",
          })}
        >
          <Button
            type="text"
            icon={<GlobalOutlined />}
            onClick={toggleLanguage}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "12px",
              height: "32px",
              padding: "0 8px",
            }}
          >
            {i18n.language.toUpperCase()}
          </Button>
        </Tooltip>
        
        <UserDropdown />
      </div>
    </Header>
  );
};

export default AppHeader;