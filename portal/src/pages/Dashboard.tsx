import { useNavigate } from "react-router-dom";
import { Layout, message, theme } from "antd";
import { HomeOutlined, DollarOutlined, TeamOutlined } from "@ant-design/icons";
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
  const { t } = useTranslation("portal-dashboard");
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] =
    useState<boolean>(false);
  const { width } = useWindowSize();

  // กำหนดจุดเปลี่ยนเป็น mobile
  const isMobile = width <= 768;

  useEffect(() => {
    if (user?.loginTime) {
      const timeDiff = Date.now() - user.loginTime;
      const isRecentLogin = timeDiff < 5000; // 5 วินาที

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
          {
            id: "SalesVisitor-2",
            name: t("menu.salesVisitor2"),
            icon: <TeamOutlined />,
            url: "/sales/sales-visitor-2",
          },
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
    // ถ้าไม่มี user หรือ selectedCompanyCode ให้ return array ว่าง
    if (!user || !selectedCompanyCode) {
      return [];
    }

    // หาข้อมูลบริษัทที่เลือกอยู่จาก company array
    const selectedCompany = user?.company?.find(
      (comp: any) => comp.companyCode === selectedCompanyCode
    );

    // ถ้าไม่เจอบริษัทที่เลือก ให้ return array ว่าง
    if (!selectedCompany) {
      return [];
    }

    // ถ้า allPermission เป็น true ให้แสดงทั้งหมด
    if (selectedCompany.allPermission === true) {
      return menuItems;
    }

    // ดึงรายการ programName ที่ user มี permission ในบริษัทที่เลือก
    const allowedPrograms: string[] = [];
    selectedCompany.accessPermission?.forEach((perm: any) => {
      if (perm.programName && Array.isArray(perm.programName)) {
        allowedPrograms.push(...perm.programName);
      }
    });

    // ฟังก์ชันสำหรับกรอง subItems (ใช้ SubMenuItem[] ที่ถูกต้อง)
    const filterSubItems = (subItems: SubMenuItem[]): SubMenuItem[] => {
      return subItems.filter((item) => allowedPrograms.includes(item.id));
    };

    // กรอง menuItems
    return menuItems
      .map((item) => {
        // ถ้าเป็น parent item ที่มี subItems
        if (item.subItems && item.subItems.length > 0) {
          const filteredSubItems = filterSubItems(item.subItems);

          // ถ้ามี subItems ที่ผ่านการกรองแล้ว ให้แสดง parent item
          if (filteredSubItems.length > 0) {
            return {
              ...item,
              subItems: filteredSubItems,
            };
          }
          // ถ้าไม่มี subItems ที่ผ่านการกรอง ให้ return null
          return null;
        }

        // ถ้าเป็น single item ให้เช็คว่ามี permission หรือไม่
        // สำหรับ home หรือ menu หลักๆ ที่ไม่ต้องเช็ค permission
        if (item.id === "home") {
          return item;
        }

        // เช็ค permission สำหรับ item อื่นๆ
        if (allowedPrograms.includes(item.id)) {
          return item;
        }

        return null;
      })
      .filter((item) => item !== null) as MenuItem[];
  };

  // ใช้ useMemo เพื่อป้องกันการ re-calculate ที่ไม่จำเป็น
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

  // Handle mobile menu toggle
  const handleMobileMenuClick = () => {
    setMobileDrawerVisible(true);
  };

  const handleMobileDrawerClose = () => {
    setMobileDrawerVisible(false);
  };

  // ใช้สำหรับกำหนด style ของ content ตาม activeApp
  const getContentStyle = () => {
    const baseStyle = {
      margin: 0,
      padding: 0,
      background: "transparent",
      height: "calc(100vh - 64px)",
    };

    if (activeApp.parentId === "home") {
      // styles สำหรับแอพ home
      return {
        ...baseStyle,
        overflow: "hidden",
      };
    } else {
      // สำหรับแอพอื่น ๆ
      return {
        ...baseStyle,
        overflow: "auto",
      };
    }
  };

  // ปรับ layout style สำหรับ mobile
  const getLayoutStyle = () => {
    if (isMobile) {
      return {
        minHeight: "100vh",
        overflow: "hidden",
      };
    }
    return {
      minHeight: "100vh",
      overflow: "hidden",
    };
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
        // Props สำหรับ mobile drawer
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
          onChangeCompany={setSelectedCompany}
          // Props สำหรับ mobile
          onMobileMenuClick={handleMobileMenuClick}
        />

        <Content className="dashboard-content" style={getContentStyle()}>
          <DashboardContent
            activeApp={activeApp}
            menuItems={filteredMenuItems}
          />
        </Content>
      </Layout>
    </Layout>
  );
}
