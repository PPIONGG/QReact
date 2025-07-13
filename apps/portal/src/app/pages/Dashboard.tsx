import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { Layout, theme } from 'antd';
import { HomeOutlined, DollarOutlined, TeamOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { MenuItem } from '../types';
import {
  filterMenuByPermission,
  getAllProgramNames,
} from '../utils/permissionUtils';
import { useDashboardNavigation } from '../hooks/useDashboardNavigation';
import Sidebar from '../components/Sidebar';
import AppHeader from '../components/AppHeader';
import DashboardContent from '../components/DashboardContent';

const { Content } = Layout;

export default function Dashboard() {
  const { user, logout, setSelectedCompany, selectedCompanyCode } =
    useAuthStore();
  const navigate = useNavigate();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [allowedPrograms, setAllowedPrograms] = useState<string[]>([]);
  const [permissionLoaded, setPermissionLoaded] = useState<boolean>(false);

  const allMenuItems: MenuItem[] = [
    {
      id: 'home',
      name: 'หน้าหลัก',
      icon: <HomeOutlined />,
      url: '/',
    },
    {
      id: 'sales',
      name: 'การขาย',
      icon: <DollarOutlined />,
      subItems: [
        {
          id: 'SalesVisit',
          name: 'Sales Visitor',
          icon: <TeamOutlined />,
          url: '/sales/sales-visitor',
        },
        {
          id: 'SalesVisitor-2',
          name: 'Sales Visitor 2',
          icon: <TeamOutlined />,
          url: '/sales/sales-visitor-2',
        },
      ],
    },
  ];

  const menuItems = useMemo(() => {
    if (!permissionLoaded) {
      return allMenuItems;
    }
    return filterMenuByPermission(allMenuItems, allowedPrograms);
  }, [allowedPrograms, permissionLoaded]);

  const {
    activeApp,
    openKeys,
    handleMenuClick,
    handleOpenChange,
    getSelectedKeys,
  } = useDashboardNavigation(menuItems);

  useEffect(() => {
    const loadPermissionData = () => {
      if (!user || !user.company) {
        setPermissionLoaded(true);
        return;
      }

      const programNames: string[] = [];

      user.company.forEach((company) => {
        if (company.allPermission) {
          const allPrograms = getAllProgramNames(allMenuItems);
          programNames.push(...allPrograms);
        } else {
          company.accessPermission.forEach((permission) => {
            programNames.push(...permission.programName);
          });
        }
      });
      // ลบ duplicate
      const uniquePrograms = [...new Set(programNames)];
      setAllowedPrograms(uniquePrograms);
      setPermissionLoaded(true);
    };
    loadPermissionData();
  }, [user]);

  const handleLogout = (): void => {
    try {
      logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login', { replace: true });
    }
  };

  // 🎨 Dynamic styling functions
  const getContentStyle = () => {
    if (activeApp.parentId === 'home') {
      // สำหรับหน้าหลัก: ใช้ padding และ margin ปกติ
      return {
        margin: '24px 16px',
        padding: '24px',
        background: colorBgContainer,
        borderRadius: borderRadiusLG,
        minHeight: '280px',
        overflow: 'auto', // ให้ scroll ได้ปกติ
      };
    } else {
      // สำหรับ iframe: ไม่ใช้ padding, เต็มจอ, ไม่มี scroll
      return {
        margin: 0,
        padding: 0,
        background: 'transparent',
        height: 'calc(100vh - 64px)', // ลบความสูง header
        overflow: 'hidden', // 🔥 สำคัญ! ป้องกัน outer scroll
      };
    }
  };

  if (!user) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '16px',
        }}
      >
        Loading...
      </div>
    );
  }
  return (
    <>
      <style>
        {`
          .ant-layout-sider-collapsed .ant-menu-item.parent-active {
            background-color: #1890ff !important;
            color: white !important;
          }

          .ant-layout-sider-collapsed .ant-menu-item.parent-active .anticon {
            color: white !important;
          }

          /* เมื่อ hover ใน collapsed state */
          .ant-layout-sider-collapsed .ant-menu-item.parent-active:hover {
            background-color: #40a9ff !important;
          }

          /* Custom dropdown trigger active state */
          .dropdown-trigger-active {
            background-color: #1890ff !important;
            border-radius: 6px !important;
          }

          .dropdown-trigger-active .anticon {
            color: white !important;
          }
        `}
      </style>
      <Layout style={{ minHeight: '100vh', overflow: 'hidden' }}>
        <Sidebar
          collapsed={collapsed}
          menuItems={menuItems}
          activeApp={activeApp}
          openKeys={openKeys}
          onMenuClick={handleMenuClick}
          onOpenChange={handleOpenChange}
          onLogout={handleLogout}
          getSelectedKeys={getSelectedKeys}
        />

        <Layout style={{ overflow: 'hidden' }}>
          <AppHeader
            collapsed={collapsed}
            onToggle={() => setCollapsed(!collapsed)}
            menuItems={menuItems}
            activeApp={activeApp}
            colorBgContainer={colorBgContainer}
            user={user} // ✅ ส่ง user
            selectedCompanyCode={selectedCompanyCode} // ✅ ส่งค่า company ที่เลือก
            onChangeCompany={setSelectedCompany} // ✅ ฟังก์ชันเปลี่ยนบริษัท
          />

          <Content className="dashboard-content" style={getContentStyle()}>
            <DashboardContent
              activeApp={activeApp}
              menuItems={menuItems}
              onMenuClick={handleMenuClick}
              getAppUrl={getAppUrl}
            />
          </Content>
        </Layout>
      </Layout>
    </>
  );
}
