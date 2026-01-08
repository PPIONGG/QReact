import { useState, useEffect } from 'react'
import { Menu, Button, Flex, Popover, Spin } from 'antd'
import {
  HomeOutlined,
  TeamOutlined,
  // SettingOutlined,
  DashboardOutlined,
  // FileSearchOutlined,
  LogoutOutlined,
  ShoppingOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { COLORS } from '../constants/colors'
import { hasMenuPermission } from '../constants/moduleMapping'
import { useAuth } from '../hooks/useAuth'
import logo from '../assets/logo.svg'
import { VERSION as PORTAL_VERSION } from '../version'

interface ModuleVersion {
  name: string
  version: string
}

interface AppSidebarProps {
  selectedMenu: string
  onMenuClick: MenuProps['onClick']
  onLogout: () => void
  collapsed?: boolean
}

export function AppSidebar({ selectedMenu, onMenuClick, onLogout, collapsed = false }: AppSidebarProps) {
  const { permission } = useAuth()
  const [moduleVersions, setModuleVersions] = useState<ModuleVersion[]>([])
  const [loadingVersions, setLoadingVersions] = useState(false)
  const [versionPopoverOpen, setVersionPopoverOpen] = useState(false)

  // Load remote module versions when popover opens (only for modules user has access to)
  useEffect(() => {
    if (!versionPopoverOpen) return

    const loadVersions = async () => {
      setLoadingVersions(true)
      const versions: ModuleVersion[] = [
        { name: 'Portal', version: PORTAL_VERSION },
      ]

      // Get user permissions
      const company = permission?.companys?.[0]
      const userModuleCodes = company?.moduleCodes || []
      const hasAllPermission = company?.allPermission || false

      // Helper to extract version from module (handles both direct export and default export)
      const getVersionInfo = (mod: { VERSION?: string; APP_NAME?: string; default?: { VERSION?: string; APP_NAME?: string } }) => {
        // Try direct export first, then default export
        const version = mod.VERSION || mod.default?.VERSION
        const appName = mod.APP_NAME || mod.default?.APP_NAME
        return { version, appName }
      }

      // Load PO version (check 'purchase' menu permission)
      if (hasMenuPermission('purchase', userModuleCodes, hasAllPermission)) {
        try {
          const poVersion = await import('purchaseOrder/version')
          const { version, appName } = getVersionInfo(poVersion)
          versions.push({
            name: appName || 'ใบสั่งซื้อ',
            version: version || 'N/A',
          })
        } catch {
          versions.push({ name: 'ใบสั่งซื้อ', version: 'N/A' })
        }
      }

      // Load Dashboard version (check 'dashboard' menu permission)
      if (hasMenuPermission('dashboard', userModuleCodes, hasAllPermission)) {
        try {
          const dashboardVersion = await import('dashboard/version')
          const { version, appName } = getVersionInfo(dashboardVersion)
          versions.push({
            name: appName || 'Dashboard',
            version: version || 'N/A',
          })
        } catch {
          versions.push({ name: 'Dashboard', version: 'N/A' })
        }
      }

      // Load Sales Visitor version (check 'sales' menu permission)
      if (hasMenuPermission('sales', userModuleCodes, hasAllPermission)) {
        try {
          const salesVersion = await import('salesVisitor/version')
          const { version, appName } = getVersionInfo(salesVersion)
          versions.push({
            name: appName || 'Sales Visitor',
            version: version || 'N/A',
          })
        } catch {
          versions.push({ name: 'Sales Visitor', version: 'N/A' })
        }
      }

      setModuleVersions(versions)
      setLoadingVersions(false)
    }

    loadVersions()
  }, [versionPopoverOpen, permission])

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
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      children: [
        {
          key: 'dashboard/financial-report',
          label: 'รายงานการเงิน',
        },
        {
          key: 'dashboard/inventory',
          label: 'สินค้าคงคลัง',
        },
        {
          key: 'dashboard/purchase-summary',
          label: 'สรุปยอดซื้อ',
        },
        {
          key: 'dashboard/sales-summary',
          label: 'สรุปยอดขาย',
        },
      ],
    },
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

      {/* Version */}
      <div
        style={{
          padding: '8px 16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          marginTop: 'auto',
          textAlign: 'center',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        <Popover
          open={versionPopoverOpen}
          onOpenChange={setVersionPopoverOpen}
          trigger="click"
          placement="rightBottom"
          content={
            <div style={{ minWidth: 160 }}>
              {loadingVersions ? (
                <div style={{ textAlign: 'center', padding: 12 }}>
                  <Spin size="small" />
                </div>
              ) : (
                <div>
                  {moduleVersions.map((module, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '4px 0',
                        borderBottom: index < moduleVersions.length - 1 ? '1px solid #f0f0f0' : 'none',
                      }}
                    >
                      <span style={{ color: '#666' }}>{module.name}</span>
                      <span style={{ fontWeight: 500 }}>v{module.version}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          }
        >
          <span
            style={{
              color: 'rgba(255, 255, 255, 0.45)',
              fontSize: 11,
              display: 'inline-block',
              transition: 'opacity 0.2s, transform 0.2s',
              opacity: collapsed ? 0 : 1,
              transform: collapsed ? 'scale(0.8)' : 'scale(1)',
              lineHeight: 1.5,
              cursor: 'pointer',
            }}
          >
            Version {PORTAL_VERSION}
          </span>
        </Popover>
      </div>

      {/* Logout Button */}
      <div
        style={{
          padding: collapsed ? 8 : 12,
          transition: 'padding 0.2s',
          flexShrink: 0,
        }}
      >
        <Button
          type="primary"
          block={!collapsed}
          onClick={onLogout}
          style={{
            height: 40,
            fontWeight: 500,
            width: collapsed ? 48 : undefined,
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
          <LogoutOutlined style={{ fontSize: 16, flexShrink: 0 }} />
          {!collapsed && (
            <span
              style={{
                whiteSpace: 'nowrap',
                marginLeft: 8,
              }}
            >
              ออกจากระบบ
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}
