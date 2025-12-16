import { Menu, Button, Flex } from 'antd'
import {
  HomeOutlined,
  TeamOutlined,
  // SettingOutlined,
  // DashboardOutlined,
  // FileSearchOutlined,
  LogoutOutlined,
  ShoppingOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { COLORS } from '../constants/colors'
import { hasMenuPermission } from '../constants/moduleMapping'
import { useAuth } from '../hooks/useAuth'
import logo from '../assets/logo.svg'

interface AppSidebarProps {
  selectedMenu: string
  onMenuClick: MenuProps['onClick']
  onLogout: () => void
  collapsed?: boolean
}

export function AppSidebar({ selectedMenu, onMenuClick, onLogout, collapsed = false }: AppSidebarProps) {
  const { permission } = useAuth()

  // Use first company's moduleCodes from LoginJWT for menu filtering
  const firstCompany = permission?.companys?.[0]
  const moduleCodes = firstCompany?.moduleCodes || []
  const allPermission = firstCompany?.allPermission || false

  // Debug: Log permission info
  console.log('AppSidebar - firstCompany:', firstCompany)
  console.log('AppSidebar - moduleCodes:', moduleCodes)
  console.log('AppSidebar - allPermission:', allPermission)

  // Helper function to filter menu items based on permission
  const filterMenuItems = (items: MenuProps['items']): MenuProps['items'] => {
    if (!items) return items

    // If no permission loaded yet, show all menu items
    if (!firstCompany) {
      return items
    }

    return items.filter((item) => {
      if (!item || typeof item !== 'object' || !('key' in item)) return true

      const key = String(item.key)

      // Check if user has permission for this menu item (parent only)
      if (!hasMenuPermission(key, moduleCodes, allPermission)) {
        return false
      }

      // For parent menus with children: show all children if parent has permission
      // Child route permissions will be checked by RouteGuard when accessing the route
      // We don't filter children here because LoginJWT only contains parent module codes
      return true
    })
  }

  const allMenuItems: MenuProps['items'] = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: 'หน้าหลัก',
    },
    {
      key: 'sales',
      icon: <TeamOutlined />,
      label: 'Sales',
      children: [
        {
          key: 'sales/sales-visitor',
          label: 'Sales Visitor',
        },
      ],
    },
    {
      key: 'purchase',
      icon: <ShoppingOutlined />,
      label: 'Purchase',
      children: [
        {
          key: 'purchase/purchase-order',
          label: 'ใบสั่งซื้อ',
        },
      ],
    },
    // {
    //   key: 'dashboard',
    //   icon: <DashboardOutlined />,
    //   label: 'Dashboard',
    // },
    // {
    //   key: 'search',
    //   icon: <FileSearchOutlined />,
    //   label: 'ค้นหาเอกสาร',
    // },
    // {
    //   key: 'basic-system',
    //   icon: <ShoppingOutlined />,
    //   label: 'ระบบเบื้อต้น',
    //   children: [
    //     {
    //       key: 'quotation',
    //       label: 'ใบเสนอซื้อ',
    //     },
    //   ],
    // },
    // {
    //   key: 'settings',
    //   icon: <SettingOutlined />,
    //   label: 'ตั้งค่า',
    // },
  ]

  // Filter menu items based on user's module permissions
  const menuItems = filterMenuItems(allMenuItems)

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#001529',
      }}
    >
      {/* Logo */}
      <Flex
        justify="center"
        align="center"
        style={{
          height: 64,
          background: 'rgba(255, 255, 255, 0.05)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            letterSpacing: '0.5px',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s',
            opacity: collapsed ? 0 : 1,
            transform: collapsed ? 'scale(0.8)' : 'scale(1)',
          }}
        >
          <span style={{ color: COLORS.danger }}>Q</span>
          <span style={{ color: 'white' }}>-ERPc</span>
        </div>
        {collapsed && (
          <div
            style={{
              position: 'absolute',
              transition: 'all 0.2s',
              opacity: collapsed ? 1 : 0,
              transform: collapsed ? 'scale(1)' : 'scale(0.8)',
            }}
          >
            <img
              src={logo}
              alt="Logo"
              style={{
                width: 40,
                height: 40,
              }}
            />
          </div>
        )}
      </Flex>

      {/* Menu */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[selectedMenu]}
          items={menuItems}
          onClick={onMenuClick}
          inlineCollapsed={collapsed}
          style={{
            background: 'transparent',
            border: 0,
            paddingTop: 8,
          }}
        />
      </div>

      {/* Logout Button */}
      <div
        style={{
          padding: collapsed ? 8 : 12,
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'padding 0.2s',
          marginTop: 'auto',
          flexShrink: 0,
        }}
      >
        <Button
          type="primary"
          block={!collapsed}
          icon={<LogoutOutlined />}
          onClick={onLogout}
          style={{
            height: 40,
            fontWeight: 500,
            width: collapsed ? 40 : undefined,
            transition: 'all 0.2s',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: COLORS.danger,
            borderColor: COLORS.danger,
            outline: 'none',
            boxShadow: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = COLORS.dangerHover
            e.currentTarget.style.borderColor = COLORS.dangerHover
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = COLORS.danger
            e.currentTarget.style.borderColor = COLORS.danger
          }}
        >
          <span
            style={{
              opacity: collapsed ? 0 : 1,
              transition: 'opacity 0.2s',
              whiteSpace: 'nowrap',
              marginLeft: collapsed ? 0 : 8,
            }}
          >
            ออกจากระบบ
          </span>
        </Button>
      </div>
    </div>
  )
}
