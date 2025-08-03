import React from 'react';
import { Layout, Menu, Button, Tooltip, Dropdown, Typography } from 'antd';
import { GlobalOutlined, LogoutOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { ActiveApp, MenuItem, SubMenuItem } from '../../types';
import logo from '../../assets/logo.svg'
const { Sider } = Layout;
const { Title, Text } = Typography;

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
): MenuProps['items'] => {
  return subItems.map((subItem) => ({
    key: subItem.id,
    label: (
      <div
        onClick={() => onMenuClick(subItem.id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 0',
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
  const isParentActive = (itemId: string): boolean => {
    if (activeApp.parentId === itemId) {
      return true;
    }
    return false;
  };

  const antMenuItems: MenuProps['items'] = menuItems.map((item) => {
    const isActive = isParentActive(item.id);

    if (item.subItems && item.subItems.length > 0) {
      if (collapsed) {
        return {
          key: item.id,
          icon: (
            <Dropdown
              menu={{ items: createDropdownItems(item.subItems, onMenuClick) }}
              placement="topRight"
              trigger={['hover']}
              overlayStyle={{ minWidth: '180px' }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </div>
            </Dropdown>
          ),
          label: (
            <Tooltip
              title={`${item.name}`}
              placement="right"
            >
              <span style={{ marginLeft: '0px' }}>{item.name}</span>
            </Tooltip>
          ),
          className: isActive ? 'parent-menu-active' : '',
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
          <Tooltip
            title={`${item.name}`}
            placement="right"
          >
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
      style={{
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '16px', textAlign: 'center' }}>
        {collapsed ? (
          <Tooltip
            title="ระบบจัดการองค์กร - Management System"
            placement="right"
          >
          <img src={logo} alt="logo" 
          style={{
            marginLeft:"5px",       
            width: '30px',
            height: '30px'
          }} />
          </Tooltip>
        ) : (
          <div className={`sidebar-logo-text ${collapsed ? 'collapsed' : ''}`}>
            <Title
              level={5}
              style={{
                color: 'white',
                margin: 0,
                fontSize: '14px',
                lineHeight: '1.2',
                whiteSpace: 'nowrap',
              }}
            >
              QReact
            </Title>
          </div>
        )}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={getSelectedKeys()}
        openKeys={collapsed ? [] : openKeys}
        onOpenChange={onOpenChange}
        items={antMenuItems}
        onClick={({ key }) => onMenuClick(key)}
        style={{
          borderRight: 0,
          flex: 1,
        }}
      />

      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px',
          borderTop: '1px solid #303030',
          background: '#001529',
        }}
      >
        <Tooltip title={collapsed ? 'ออกจากระบบ' : ''} placement="right">
          <Button
            type="primary"
            danger
            block={!collapsed}
            icon={<LogoutOutlined />}
            onClick={onLogout}
            style={{
              height: '44px',
              borderRadius: '8px',
              fontWeight: 500,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <span
              className={`logout-button-text ${collapsed ? 'collapsed' : ''}`}
            >
              {!collapsed && 'ออกจากระบบ'}
            </span>
          </Button>
        </Tooltip>
      </div>
    </Sider>
  );
};

export default Sidebar;
