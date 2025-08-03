// components/AppHeader.tsx
import React from 'react';
import {
  Layout,
  Button,
  Typography,
  Select,
  Dropdown,
  Avatar,
  Space,
  Tooltip,
} from 'antd';
import {
  GlobalOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { UserOutlined } from '@ant-design/icons';
import type { MenuItem, ActiveApp } from '../../types';
import type { User } from '../../types/auth.types';
import { useTranslation } from 'react-i18next';

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
}

const AppHeader: React.FC<AppHeaderProps> = ({
  collapsed,
  onToggle,
  menuItems,
  activeApp,
  colorBgContainer,
  user,
  selectedCompanyCode,
  onChangeCompany,
}) => {
  const { t, i18n } = useTranslation('portal-dashboard');

  const currentMenuItem = menuItems.find(
    (item) => item.id === activeApp.parentId
  );
  const currentSubItem = currentMenuItem?.subItems?.find(
    (sub) => sub.id === activeApp.subId
  );

  const displayName =
    currentSubItem?.name || currentMenuItem?.name || 'หน้าหลัก';
  const displayIcon = currentSubItem?.icon || currentMenuItem?.icon;

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'th' ? 'en' : 'th';
    i18n.changeLanguage(newLanguage);
  };

  return (
    <Header
      style={{
        padding: 0,
        background: colorBgContainer,
        display: 'flex',
        alignItems: 'center',
        paddingRight: '24px',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onToggle}
        style={{
          fontSize: '16px',
          width: 64,
          height: 64,
        }}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginLeft: '8px',
        }}
      >
        {displayIcon && (
          <span style={{ fontSize: '16px', color: '#1890ff' }}>
            {displayIcon}
          </span>
        )}
        <Title level={4} style={{ margin: 0, color: '#262626' }}>
          {displayName}
        </Title>
      </div>

      <div
        style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <Tooltip
          title={`Switch to ${i18n.language === 'th' ? 'English' : 'ไทย'}`}
        >
          <Button
            type="text"
            icon={<GlobalOutlined />}
            onClick={toggleLanguage}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              height: '32px',
              padding: '0 8px',
            }}
          >
            {i18n.language.toUpperCase()}
          </Button>
        </Tooltip>
        <Dropdown
          placement="bottomRight"
          arrow
          popupRender={() => (
            <div
              style={{
                minWidth: 220,
                padding: '12px 16px',
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                background: '#fff',
              }}
            >
              <Text type="secondary" style={{ fontSize: 12 }}>
                เลือกบริษัท
              </Text>
              <Select
                size="middle"
                value={selectedCompanyCode}
                onChange={onChangeCompany}
                options={user.company.map((c) => ({
                  label: c.companyName,
                  value: c.companyCode,
                }))}
                style={{ width: '100%', marginTop: 6 }}
              />
            </div>
          )}
        >
          <div style={{ cursor: 'pointer' }}>
            <Space>
              <Avatar size="small" icon={<UserOutlined />} />
              <Text style={{ fontSize: 13 }}>{user.username}</Text>
            </Space>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default AppHeader;
