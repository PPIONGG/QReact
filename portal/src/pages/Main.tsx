import { lazy, Suspense, useState, useEffect } from 'react'
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom'
import {
  Layout,
  Button,
  Typography,
  Spin,
  Avatar,
  Flex,
  Drawer,
  Grid,
  Select,
} from 'antd'
import {
  UserOutlined,
  MenuOutlined,
  HomeOutlined,
  TeamOutlined,
  ShoppingOutlined,
  DashboardOutlined,
  FileSearchOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useAuth } from '../hooks/useAuth'
import { AppSidebar } from '../components/AppSidebar'
import logoPO from '../assets/logo_po.png'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { RouteGuard } from '../components/RouteGuard'
import Unauthorized from './Unauthorized'

const { Header, Content, Sider } = Layout
const { Text } = Typography
const { useBreakpoint } = Grid

const SIDEBAR_VISIBLE_KEY = 'portal-sidebar-visible'

// Load sidebar state from localStorage
const loadSidebarVisible = (): boolean => {
  try {
    const stored = localStorage.getItem(SIDEBAR_VISIBLE_KEY)
    if (stored !== null) {
      return JSON.parse(stored)
    }
  } catch {
    // Ignore parse errors
  }
  return true // Default to visible
}

// Dynamically import remote components
const SalesVisitorApp = lazy(() => import('salesVisitor/App'))
const PurchaseOrderApp = lazy(() => import('purchaseOrder/App'))
const DashboardApp = lazy(() => import('dashboard/App'))
const BusinessDataMonitoringApp = lazy(() => import('businessDataMonitoring/App'))

// Page components - HomePage now uses Dashboard remote
interface DashboardPageWrapperProps {
  username: string
  accessToken: string
  companyCode: string
}

const DashboardPageWrapper = ({ username, accessToken, companyCode }: DashboardPageWrapperProps) => (
  <DashboardApp
    username={username}
    accessToken={accessToken}
    companyCode={companyCode}
  />
)

const QuotationPage = () => (
  <div>
    <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
      <Text strong style={{ fontSize: 20 }}>
        ใบเสนอซื้อ
      </Text>
      <Button type="primary">สร้างใบเสนอซื้อ</Button>
    </Flex>
    <Flex justify="center" align="center" style={{ height: '40vh' }}>
      <Text type="secondary">หน้าใบเสนอซื้อ (กำลังพัฒนา)</Text>
    </Flex>
  </div>
)

const SearchPage = () => (
  <Flex justify="center" align="center" style={{ height: '50vh' }}>
    <Text type="secondary">ค้นหาเอกสาร (กำลังพัฒนา)</Text>
  </Flex>
)

const SettingsPage = () => (
  <Flex justify="center" align="center" style={{ height: '50vh' }}>
    <Text type="secondary">ตั้งค่า (กำลังพัฒนา)</Text>
  </Flex>
)

// Wrapper components for remote apps with props
interface RemoteAppPageProps {
  username: string
  accessToken: string
  companyCode: string
  permission: Permission | null
}

const SalesVisitorPageWrapper = ({ username, accessToken, companyCode, permission }: RemoteAppPageProps) => (
  <SalesVisitorApp
    username={username}
    accessToken={accessToken}
    companyCode={companyCode}
    permission={permission}
  />
)

const PurchaseOrderPageWrapper = ({ username, accessToken, companyCode, permission }: RemoteAppPageProps) => (
  <PurchaseOrderApp
    username={username}
    accessToken={accessToken}
    companyCode={companyCode}
    permission={permission}
  />
)

const BusinessDataMonitoringPageWrapper = ({ username, accessToken, companyCode }: Omit<RemoteAppPageProps, 'permission'>) => (
  <BusinessDataMonitoringApp
    username={username}
    accessToken={accessToken}
    companyCode={companyCode}
  />
)

function Main() {
  const navigate = useNavigate()
  const location = useLocation()
  const { username, accessToken, permission, menuPermission, logout, updateCompany } = useAuth()
  const [sidebarVisible, setSidebarVisible] = useState(loadSidebarVisible)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [selectedCompanyCode, setSelectedCompanyCode] = useState<string | undefined>(
    permission?.companys?.[0]?.companyCode
  )
  const [isLoadingCompany, setIsLoadingCompany] = useState(false)
  const screens = useBreakpoint()

  // Update selectedCompanyCode when menuPermission changes
  useEffect(() => {
    if (menuPermission?.companyCode) {
      setSelectedCompanyCode(menuPermission.companyCode)
    }
  }, [menuPermission])

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem(SIDEBAR_VISIBLE_KEY, JSON.stringify(sidebarVisible))
  }, [sidebarVisible])

  // Determine if we should use drawer (mobile) or sider (desktop)
  const isMobile = !screens.lg

  // Check if current path is a form page (create/edit) - hide sidebar for more space
  const isFormPage = /\/(create|edit\/|new)/.test(location.pathname)

  // Get current path to determine selected menu
  const fullPath = location.pathname.replace(/^\//, '') || 'home'

  // Get base path for matching menu (e.g., "purchase/purchase-order/create" -> "purchase/purchase-order")
  const getBasePath = (path: string): string => {
    const menuPaths = [
      'sales/sales-visitor',
      'purchase/purchase-order',
      'dashboard/financial-report',
      'dashboard/inventory',
      'dashboard/purchase-summary',
      'dashboard/sales-summary',
      'quotation',
      'dashboard',
      'search',
      'settings',
      'home',
    ]
    return menuPaths.find((menuPath) => path.startsWith(menuPath)) || path
  }

  const currentPath = getBasePath(fullPath)

  // Get page title and icon based on current path
  const getPageTitle = (path: string): string => {
    const titles: Record<string, string> = {
      home: 'หน้าหลัก',
      'sales/sales-visitor': 'Sales Visitor',
      'purchase/purchase-order': 'ใบสั่งซื้อ',
      quotation: 'ใบเสนอซื้อ',
      dashboard: 'Dashboard',
      'dashboard/financial-report': 'รายงานการเงิน',
      'dashboard/inventory': 'สินค้าคงคลัง',
      'dashboard/purchase-summary': 'สรุปยอดซื้อ',
      'dashboard/sales-summary': 'สรุปยอดขาย',
      search: 'ค้นหาเอกสาร',
      settings: 'ตั้งค่า',
    }
    return titles[path] || 'Q-ERP Portal'
  }

  // Update document title when menu changes
  useEffect(() => {
    const pageTitle = getPageTitle(currentPath)
    document.title = `${pageTitle} | Q-ERPc`
  }, [currentPath])

  const getPageIcon = (path: string) => {
    const icons: Record<string, React.ReactNode> = {
      home: <HomeOutlined />,
      'sales/sales-visitor': <TeamOutlined />,
      'purchase/purchase-order': <img src={logoPO} alt="PO" style={{ width: 50, height: 50 }} />,
      quotation: <ShoppingOutlined />,
      dashboard: <DashboardOutlined />,
      'dashboard/financial-report': <DashboardOutlined />,
      'dashboard/inventory': <DashboardOutlined />,
      'dashboard/purchase-summary': <DashboardOutlined />,
      'dashboard/sales-summary': <DashboardOutlined />,
      search: <FileSearchOutlined />,
      settings: <SettingOutlined />,
    }
    return icons[path] || null
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleCompanyChange = async (companyCode: string) => {
    setIsLoadingCompany(true)
    try {
      await updateCompany(companyCode)
      setSelectedCompanyCode(companyCode)
    } catch (error) {
      console.error('Failed to change company:', error)
    } finally {
      setIsLoadingCompany(false)
    }
  }

  // Company select options
  const companyOptions = permission?.companys?.map((company) => ({
    label: company.companyName,
    value: company.companyCode,
  })) || []

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    navigate(`/${e.key}`)
    // Close drawer on mobile after selection
    if (isMobile) {
      setDrawerVisible(false)
    }
  }

  const handleToggleSidebar = () => {
    if (isMobile) {
      setDrawerVisible(!drawerVisible)
    } else {
      setSidebarVisible(!sidebarVisible)
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sider - hide on form pages for more space */}
      {!isMobile && !isFormPage && (
        <Sider
          collapsible
          collapsed={!sidebarVisible}
          trigger={null}
          width={200}
          collapsedWidth={64}
          style={{
            background: '#001529',
            overflow: 'hidden',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 1000,
          }}
        >
          <AppSidebar
            selectedMenu={currentPath}
            onMenuClick={handleMenuClick}
            onLogout={handleLogout}
            collapsed={!sidebarVisible}
          />
        </Sider>
      )}

      {/* Mobile Drawer */}
      <Drawer
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={isMobile && drawerVisible}
        styles={{
          wrapper: { width: 200 },
          body: { padding: 0 },
        }}
        closeIcon={null}
      >
        <AppSidebar
          selectedMenu={currentPath}
          onMenuClick={handleMenuClick}
          onLogout={handleLogout}
        />
      </Drawer>

      <Layout
        style={{
          marginLeft: !isMobile && !isFormPage ? (sidebarVisible ? 200 : 64) : 0,
          transition: 'margin-left 0.2s',
        }}
      >
        <Header
          style={{
            background: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 16px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            gap: 8,
          }}
        >
          <Flex align="center" gap={8} style={{ minWidth: 0, flex: '0 1 auto' }}>
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={handleToggleSidebar}
              style={{
                fontSize: 18,
                outline: 'none',
                boxShadow: 'none',
                flexShrink: 0,
              }}
            />
            <Flex align="center" gap={8} style={{ minWidth: 0 }}>
              {getPageIcon(currentPath) && (
                <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{getPageIcon(currentPath)}</span>
              )}
              <Text
                strong
                style={{
                  fontSize: 18,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {getPageTitle(currentPath)}
              </Text>
            </Flex>
          </Flex>

          <Flex align="center" gap={12} style={{ minWidth: 0, flex: '1 1 auto', justifyContent: 'flex-end' }}>
            <Select
              value={selectedCompanyCode}
              onChange={handleCompanyChange}
              loading={isLoadingCompany}
              style={{ minWidth: 150, maxWidth: 250 }}
              options={companyOptions}
            />

            <Flex align="center" gap={6}>
              <Avatar icon={<UserOutlined />} size="small" style={{ backgroundColor: '#52c41a' }} />
              <Text style={{ fontSize: 14 }}>{username}</Text>
            </Flex>
          </Flex>
        </Header>

        <Content
          style={{
            padding: 12,
            background: '#f5f5f5',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <Suspense
            fallback={
              <Flex justify="center" align="center" style={{ height: '50vh' }}>
                <Spin size="large" tip="กำลังโหลด Module...">
                  <div style={{ padding: 50 }} />
                </Spin>
              </Flex>
            }
          >
            <Routes>
              <Route path="/" element={<Navigate to="home" replace />} />
              <Route
                path="home"
                element={
                  <ErrorBoundary>
                    <DashboardPageWrapper
                      username={username || ''}
                      accessToken={accessToken || ''}
                      companyCode={menuPermission?.companyCode || ''}
                    />
                  </ErrorBoundary>
                }
              />
              <Route path="unauthorized" element={<Unauthorized />} />
              <Route
                path="sales/sales-visitor/*"
                element={
                  <RouteGuard menuKey="sales/sales-visitor">
                    <ErrorBoundary>
                      <SalesVisitorPageWrapper
                        username={username || ''}
                        accessToken={accessToken || ''}
                        companyCode={menuPermission?.companyCode || ''}
                        permission={permission}
                      />
                    </ErrorBoundary>
                  </RouteGuard>
                }
              />
              <Route
                path="purchase/purchase-order/*"
                element={
                  <RouteGuard menuKey="purchase/purchase-order">
                    <ErrorBoundary>
                      <PurchaseOrderPageWrapper
                        username={username || ''}
                        accessToken={accessToken || ''}
                        companyCode={menuPermission?.companyCode || ''}
                        permission={permission}
                      />
                    </ErrorBoundary>
                  </RouteGuard>
                }
              />
              <Route path="quotation" element={<QuotationPage />} />
              <Route
                path="dashboard/*"
                element={
                  <RouteGuard menuKey="dashboard">
                    <ErrorBoundary>
                      <BusinessDataMonitoringPageWrapper
                        username={username || ''}
                        accessToken={accessToken || ''}
                        companyCode={menuPermission?.companyCode || ''}
                      />
                    </ErrorBoundary>
                  </RouteGuard>
                }
              />
              <Route path="search" element={<SearchPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="home" replace />} />
            </Routes>
          </Suspense>
        </Content>
      </Layout>
    </Layout>
  )
}

export default Main