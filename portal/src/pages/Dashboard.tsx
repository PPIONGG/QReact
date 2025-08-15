import { useLocation, useNavigate } from "react-router-dom";
import { Layout, message, theme, Modal, Button } from "antd";
import {
  HomeOutlined,
  DollarOutlined,
  TeamOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { MenuItem, SubMenuItem } from "../types";
import { useDashboardNavigation } from "../hooks/useDashboardNavigation";
import Sidebar from "../components/dashboard/Sidebar";
import AppHeader from "../components/dashboard/AppHeader";
import DashboardContent from "../components/dashboard/DashboardContent";
import { LoadingComponents } from "../components/dashboard/LoadingComponents";
import { User } from "../types/auth.types";
import { useAuthStore } from "../store/auth.store";
import { useTranslation } from "react-i18next";

const { Content } = Layout;

// Hook ตรวจจับขนาดหน้าจอ (คงไว้จากของเดิม)
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};

export default function Dashboard() {
  const { user, logout, setSelectedCompany, selectedCompanyCode } =
    useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const { t } = useTranslation("portal-dashboard");
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] =
    useState<boolean>(false);
  const { width } = useWindowSize();
  const isMobile = width <= 768;

  const getCompanyName = (code: string) => {
    const comp = user?.company?.find((c) => c.companyCode === code);
    return comp?.companyName ?? code;
  };

  useEffect(() => {
    if (user?.loginTime) {
      const timeDiff = Date.now() - user.loginTime;
      const isRecentLogin = timeDiff < 5000; // 5 วิ
      if (isRecentLogin) {
        message.success({
          content: t("welcome.message", { username: user.username }),
          duration: 3,
          key: "login-success",
        });
      }
    }
  }, [user, t]);

  const allMenuItems: MenuItem[] = useMemo(
    () => [
      {
        id: "home",
        name: t("menu.home"),
        icon: <HomeOutlined />,
        url: "/",
      },
      {
        id: "sales",
        name: t("menu.sales"),
        icon: <DollarOutlined />,
        subItems: [
          {
            id: "SalesVisit",
            name: t("menu.salesVisitor"),
            icon: <TeamOutlined />,
            url: "/sales/sales-visitor",
          },
          // ตัวอย่างเมนูอื่นในอนาคต
          // {
          //   id: "SalesVisitor-2",
          //   name: t("menu.salesVisitor2"),
          //   icon: <TeamOutlined />,
          //   url: "/sales/sales-visitor-2",
          // },
        ],
      },
    ],
    [t]
  );

  const filterMenuItemsByPermission = (
    menuItems: MenuItem[],
    user: User | null,
    selectedCompanyCode: string | null
  ): MenuItem[] => {
    if (!user || !selectedCompanyCode) return [];

    const selectedCompany = user.company?.find(
      (comp: any) => comp.companyCode === selectedCompanyCode
    );
    if (!selectedCompany) return [];

    if (selectedCompany.allPermission === true) {
      return menuItems;
    }

    const allowedPrograms: string[] = [];
    selectedCompany.accessPermission?.forEach((perm: any) => {
      if (perm.programName && Array.isArray(perm.programName)) {
        allowedPrograms.push(...perm.programName);
      }
    });

    const filterSubItems = (subItems: SubMenuItem[]): SubMenuItem[] => {
      return subItems.filter((item) => allowedPrograms.includes(item.id));
    };

    return menuItems
      .map((item) => {
        if (item.subItems && item.subItems.length > 0) {
          const filteredSubItems = filterSubItems(item.subItems);
          if (filteredSubItems.length > 0) {
            return { ...item, subItems: filteredSubItems };
          }
          return null;
        }

        if (item.id === "home") return item;
        if (allowedPrograms.includes(item.id)) return item;
        return null;
      })
      .filter((item) => item !== null) as MenuItem[];
  };

  const filteredMenuItems = useMemo(() => {
    return filterMenuItemsByPermission(allMenuItems, user, selectedCompanyCode);
  }, [allMenuItems, user, selectedCompanyCode]);

  const {
    activeApp,
    openKeys,
    handleMenuClick,
    handleOpenChange,
    getSelectedKeys,
  } = useDashboardNavigation(filteredMenuItems);

  const handleLogout = (): void => {
    try {
      logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/login", { replace: true });
    }
  };

  // ===== Modal เปลี่ยนบริษัท (แบบเราคุมเอง) =====
  const [isChangeCompanyConfirmVisible, setIsChangeCompanyConfirmVisible] =
    useState(false);
  const [pendingCompany, setPendingCompany] = useState<string | null>(null);

  const isFormRoute = (path: string) =>
    path === "/sales/sales-visitor/new" || path === "/sales/sales-visitor/edit";

  const handleChangeCompanyConfirm = () => {
    if (!pendingCompany) {
      setIsChangeCompanyConfirmVisible(false);
      return;
    }
    setSelectedCompany(pendingCompany);
    setPendingCompany(null);
    setIsChangeCompanyConfirmVisible(false);

    if (location.pathname !== "/") {
      setMobileDrawerVisible(false);
      navigate("/", { replace: true });
    }
    message.success(t("confirm.changedCompanySuccess"));
  };

  const handleChangeCompanyCancel = () => {
    setPendingCompany(null);
    setIsChangeCompanyConfirmVisible(false);
  };

  // แทนที่ Modal.confirm เดิมด้วย logic นี้
  const handleChangeCompany = (code: string) => {
    if (code === selectedCompanyCode) return;

    if (isFormRoute(location.pathname)) {
      setPendingCompany(code);
      setIsChangeCompanyConfirmVisible(true);
      return;
    }

    setSelectedCompany(code);
    if (location.pathname !== "/") {
      setMobileDrawerVisible(false);
      navigate("/", { replace: true });
    }
    message.success(t("confirm.changedCompanySuccess"));
  };

  // Mobile drawer handler
  const handleMobileMenuClick = () => setMobileDrawerVisible(true);
  const handleMobileDrawerClose = () => setMobileDrawerVisible(false);

  const getContentStyle = () => {
    const baseStyle = {
      margin: 0,
      padding: 0,
      background: "transparent",
      height: "calc(100vh - 64px)",
    } as const;

    if (activeApp.parentId === "home") {
      return { ...baseStyle, overflow: "hidden" };
    }
    return { ...baseStyle, overflow: "auto" };
  };

  const getLayoutStyle = () => {
    if (isMobile) {
      return {
        minHeight: "100vh",
        overflow: "hidden",
      } as const;
    }
    return {
      minHeight: "100vh",
      overflow: "hidden",
    } as const;
  };

  if (!user) {
    return <LoadingComponents.Branded />;
  }

  return (
    <Layout style={getLayoutStyle()}>
      <Sidebar
        collapsed={collapsed}
        menuItems={filteredMenuItems}
        activeApp={activeApp}
        openKeys={openKeys}
        onMenuClick={handleMenuClick}
        onOpenChange={handleOpenChange}
        onLogout={handleLogout}
        getSelectedKeys={getSelectedKeys}
        mobileDrawerVisible={mobileDrawerVisible}
        onMobileDrawerClose={handleMobileDrawerClose}
      />

      <Layout style={{ overflow: "hidden" }}>
        <AppHeader
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          menuItems={filteredMenuItems}
          activeApp={activeApp}
          colorBgContainer={colorBgContainer}
          user={user}
          selectedCompanyCode={selectedCompanyCode}
          onChangeCompany={handleChangeCompany}
          onMobileMenuClick={handleMobileMenuClick}
        />

        <Content className="dashboard-content" style={getContentStyle()}>
          <DashboardContent activeApp={activeApp} menuItems={filteredMenuItems} />
        </Content>

        {/* ===== Modal ยืนยันเปลี่ยนบริษัท (ควบคุมเอง) ===== */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center" }}>
              <ExclamationCircleOutlined
                style={{ color: "#faad14", fontSize: 22, marginRight: 12 }}
              />
              <span style={{ color: "#1f2937", fontWeight: 600 }}>
                {t("modalConfirm.discardChanges")}
                {/* ต้องการเปลี่ยนบริษัทใช่หรือไม่? */}
              </span>
            </div>
          }
          open={isChangeCompanyConfirmVisible}
          closable={false}
          centered
          width={420}
          footer={
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
            >
              <Button
                key="ok"
                type="primary"
                danger
                onClick={handleChangeCompanyConfirm}
                style={{ height: 36, borderRadius: 6, fontWeight: 500 }}
              >
                {t("modalConfirm.confirm")}
                {/* ยืนยัน */}
              </Button>
              <Button
                key="cancel"
                onClick={handleChangeCompanyCancel}
                style={{ height: 36, borderRadius: 6 }}
              >
                {t("modalConfirm.cancel")}
                {/* ยกเลิก */}
              </Button>
            </div>
          }
          styles={{
            header: {
              borderBottom: "1px solid #f0f0f0",
              paddingBottom: 16,
            },
          }}
        >
          <div style={{ padding: "8px 0" }}>
            <p
              style={{
                margin: 0,
                color: "#6b7280",
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              {location.pathname.endsWith("/new")
                ? 
                // 'คุณมีการแก้ไข visit report ที่ยังไม่ได้บันทึก'
                 t("modalConfirm.unsavedChangesNewWarning")
                :
                 t("modalConfirm.unsavedChangesEditWarning")
                // 'คุณมีการแก้ไข visit report ที่ยังไม่ได้บันทึก'
                }
            </p>
          </div>
        </Modal>
        {/* ===== /Modal ===== */}
      </Layout>
    </Layout>
  );
}
