import { useEffect, useMemo, useState, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { ActiveApp, MenuItem } from "../../types";
import { useAuthStore } from "../../store/auth.store";
import { Card, Button, Typography, Spin, Alert } from "antd";
import { RocketOutlined, LoadingOutlined } from "@ant-design/icons";
import NoPermissionOverlay from "../NoPermissionOverlay";
import React from "react";

const { Title, Paragraph, Text } = Typography;

const SalesApp = React.lazy(() =>
  import("sales_visitor/App" as any).catch(() => {
    return {
      default: () => (
        <Alert
          message="Sales Application ไม่พร้อมใช้งาน"
          description={
            <div>
              <p>กรุณาตรวจสอบว่า Sales Remote Application ทำงานอยู่</p>
              <p>
                <strong>Expected URL:</strong>{" "}
                http://localhost:3001/remoteEntry.js
              </p>
              <ol style={{ textAlign: "left", marginTop: "10px" }}>
                <li>เปิด terminal ใหม่</li>
                <li>cd ไปยัง remote app folder</li>
                <li>รัน: npm start</li>
                <li>ตรวจสอบว่า remote app รันที่ port 3001</li>
              </ol>
            </div>
          }
          type="warning"
          showIcon
        />
      ),
    };
  })
);

interface DashboardContentProps {
  activeApp: ActiveApp;
  menuItems: MenuItem[];
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  activeApp,
  menuItems,
}) => {
  const location = useLocation();
  const [currentUrl, setCurrentUrl] = useState(window.location.href);
  const { Salesinfo, user, fetchSalesinfo, isloadingSalesinfo } =
    useAuthStore();

  const cleanUsername = (username: string): string => {
    return username.replace(/^QERP_/i, "");
  };

  useEffect(() => {
    if (user && user.username && !Salesinfo) {
      fetchSalesinfo(cleanUsername(user.username));
    }
  }, [user, Salesinfo]);

  useEffect(() => {
    const handleUrlChange = () => {
      const newUrl = window.location.href;
      setCurrentUrl(newUrl);
    };
    // Initial call
    handleUrlChange();

    window.addEventListener("hashchange", handleUrlChange);
    window.addEventListener("popstate", handleUrlChange);

    return () => {
      window.removeEventListener("hashchange", handleUrlChange);
      window.removeEventListener("popstate", handleUrlChange);
    };
  }, [activeApp]);

  const permissionStatus = useMemo(() => {
    if (activeApp.parentId === "home") {
      return { hasPermission: true, showLoading: false };
    }

    if (!user) {
      return { hasPermission: false, showLoading: false };
    }

    if (isloadingSalesinfo) {
      return { hasPermission: false, showLoading: true };
    }

    if (!Salesinfo) {
      return { hasPermission: false, showLoading: false };
    }

    return {
      hasPermission: Salesinfo.status,
      showLoading: false,
    };
  }, [activeApp.parentId, user, isloadingSalesinfo, Salesinfo]);

  const RemoteLoadingFallback: React.FC<{ appName: string }> = ({
    appName,
  }) => (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "400px",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <Spin
        size="large"
        indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />}
      />
      <div style={{ textAlign: "center" }}>
        <Text strong style={{ fontSize: "16px" }}>
          กำลังโหลด {appName}...
        </Text>
        <br />
        <Text type="secondary" style={{ fontSize: "14px" }}>
          กำลังเชื่อมต่อ Remote App ที่ port 3001
        </Text>
      </div>
    </div>
  );

  const RemoteErrorFallback: React.FC<{ appName: string; error?: string }> = ({
    appName,
    error,
  }) => (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        padding: "40px",
      }}
    >
      <Alert
        message={`${appName} ไม่พร้อมใช้งาน`}
        description={
          <div>
            <p>ไม่สามารถโหลด {appName} ได้ในขณะนี้</p>
            {error && (
              <p style={{ fontSize: "12px", color: "#999" }}>Error: {error}</p>
            )}
            <div style={{ marginTop: "16px" }}>
              <Button
                type="primary"
                onClick={() => window.location.reload()}
                style={{ marginRight: "8px" }}
              >
                รีโหลดหน้า
              </Button>
              <Button onClick={() => console.log("Contact support")}>
                ติดต่อฝ่ายสนับสนุน
              </Button>
            </div>
          </div>
        }
        type="error"
        showIcon
        style={{ maxWidth: "600px" }}
      />
    </div>
  );

  const renderContent = useMemo(() => {
    if (activeApp.parentId === "home") {
      return (
        <div style={{ padding: "40px", textAlign: "center" }}>
          <h1>🏠 Portal Dashboard</h1>

          <div
            style={{
              padding: "20px",
              backgroundColor: "#f0f8ff",
              borderRadius: "8px",
              marginBottom: "20px",
              maxWidth: "600px",
              margin: "0 auto 20px auto",
            }}
          >
            <strong>📍 Current URL:</strong>
            <br />
            <code style={{ fontSize: "12px", wordBreak: "break-all" }}>
              {currentUrl}
            </code>
            <br />
            <br />
            <strong>Hash:</strong>{" "}
            <code>{window.location.hash || "(none)"}</code>
            <br />
            <strong>ActiveApp:</strong> <code>{activeApp.parentId}</code>
          </div>

          <p style={{ fontSize: "16px", marginBottom: "20px" }}>
            กดเมนู <strong>"Sales Visitor"</strong> เพื่อทดสอบ Micro Frontend
          </p>

          <div
            style={{
              padding: "15px",
              backgroundColor: "#fff7e6",
              borderRadius: "8px",
              maxWidth: "500px",
              margin: "0 auto",
            }}
          >
            <strong>📋 วิธีทดสอบ:</strong>
            <ol style={{ textAlign: "left", marginTop: "10px" }}>
              <li>คลิกเมนู "การขาย" → "Sales Visitor"</li>
              <li>
                ดู URL เปลี่ยนเป็น <code>/#/sales/sales-visitor</code>
              </li>
              <li>ใน Remote App คลิก "New Visit Report"</li>
              <li>
                ดู URL เปลี่ยนเป็น <code>/#/sales/sales-visitor/new</code>
              </li>
              <li>คลิก "Edit" ใน table</li>
              <li>
                ดู URL เปลี่ยนเป็น <code>/#/sales/sales-visitor/edit/001</code>
              </li>
            </ol>
          </div>
        </div>
      );
    }
    // ตรวจสอบว่าเป็น Sales App หรือไม่
    const isSalesApp =
      activeApp.parentId === "sales" ||
      location.pathname.includes("/sales") ||
      window.location.hash.includes("/sales/sales-visitor");

    if (isSalesApp) {
      return (
        <div>
          <Suspense
            fallback={<RemoteLoadingFallback appName="Sales Application" />}
          >
            <SalesApp />
          </Suspense>
        </div>
      );
    }

    const renderRemoteApp = () => {
      switch (activeApp.parentId) {
        case "sales":
        case "wms":
          return (
            <RemoteErrorFallback
              appName="WMS Application"
              error="Module ยังไม่พร้อมใช้งาน"
            />
          );

        default:
          return (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                padding: "40px",
              }}
            >
              <Card style={{ maxWidth: "600px", textAlign: "center" }}>
                <div style={{ padding: "40px 20px" }}>
                  <RocketOutlined
                    style={{
                      fontSize: "64px",
                      color: "#1890ff",
                      marginBottom: "24px",
                    }}
                  />
                  <Title level={3}>
                    Application "{activeApp.parentId}" กำลังพัฒนา
                  </Title>
                  <Paragraph>
                    เรากำลังพัฒนา Application นี้ในรูปแบบ Microfrontend
                    Architecture เพื่อประสิทธิภาพและความยืดหยุ่นที่ดีขึ้น
                  </Paragraph>
                  <div style={{ marginTop: "24px" }}>
                    <Button type="primary" style={{ marginRight: "12px" }}>
                      แจ้งเตือนเมื่อพร้อม
                    </Button>
                    <Button>กลับหน้าหลัก</Button>
                  </div>
                </div>
              </Card>
            </div>
          );
      }
    };

    return (
      <div style={{ width: "100%", height: "100%" }}>{renderRemoteApp()}</div>
    );
  }, [activeApp, menuItems, location, currentUrl]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {renderContent}

      {permissionStatus.showLoading && activeApp.parentId !== "home" && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(2px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <Spin
              size="large"
              indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />}
            />
            <p
              style={{
                margin: "16px 0 0 0",
                color: "#64748b",
                fontSize: "16px",
                fontWeight: 500,
              }}
            >
              กำลังตรวจสำมสิทธิ์...
            </p>
            <p
              style={{
                margin: "8px 0 0 0",
                color: "#94a3b8",
                fontSize: "14px",
              }}
            >
              กรุณารอสักครู่
            </p>
          </div>
        </div>
      )}

      {!permissionStatus.hasPermission &&
        !permissionStatus.showLoading &&
        activeApp.parentId !== "home" && <NoPermissionOverlay />}

    </div>
  );
};

export default DashboardContent;
