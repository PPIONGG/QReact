import { useEffect, useMemo, useState, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { ActiveApp, MenuItem } from "../../types";
import { useAuthStore } from "../../store/auth.store";
import { Card, Button, Typography, Spin, Alert } from "antd";
import { RocketOutlined, LoadingOutlined } from "@ant-design/icons";
import NoPermissionOverlay from "./NoPermissionOverlay";
import React from "react";
import { useTranslation } from "react-i18next";

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
  const {t} = useTranslation('portal-dashboard');

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
          {t('remote.loading', { appName })}
        </Text>
        <br />
        <Text type="secondary" style={{ fontSize: "14px" }}>
          {t('remote.connecting')}
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
        message={t('remote.notAvailable', { appName })}
        description={
          <div>
            <p>{t('remote.cannotLoad', { appName })}</p>
            {error && (
              <p style={{ fontSize: "12px", color: "#999" }}>Error: {error}</p>
            )}
            <div style={{ marginTop: "16px" }}>
              <Button
                type="primary"
                onClick={() => window.location.reload()}
                style={{ marginRight: "8px" }}
              >
                {t('remote.reloadPage')}
              </Button>
              <Button onClick={() => console.log("Contact support")}>
                {t('remote.contactSupport')}
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
          <h1>{t('content.portalDashboard')}</h1>

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
            <strong>{t('content.currentUrl')}</strong>
            <br />
            <code style={{ fontSize: "12px", wordBreak: "break-all" }}>
              {currentUrl}
            </code>
            <br />
            <br />
            <strong>{t('content.hash')}</strong>
            <code>{window.location.hash || "(none)"}</code>
            <br />
            <strong>{t('content.activeApp')}</strong> <code>{activeApp.parentId}</code>
          </div>

          <p style={{ fontSize: "16px", marginBottom: "20px" }}>
            {t('content.testInstructions')}
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
            <strong>{t('content.howToTest')}</strong>
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
              error={t('remote.moduleNotReady')}
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
                    {t('content.applicationDeveloping', { appName: activeApp.parentId })}
                  </Title>
                  <Paragraph>
                    {t('content.microfrontendDesc')}
                  </Paragraph>
                  <div style={{ marginTop: "24px" }}>
                    <Button type="primary" style={{ marginRight: "12px" }}>
                      {t('content.notifyWhenReady')}
                    </Button>
                    <Button>{t('content.backToMain')}</Button>
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
              {t('loading.checkingPermission')}
            </p>
            <p
              style={{
                margin: "8px 0 0 0",
                color: "#94a3b8",
                fontSize: "14px",
              }}
            >
              {t('loading.pleaseWait')}
            </p>
          </div>
        </div>
      )}

      {!permissionStatus.hasPermission &&
        !permissionStatus.showLoading &&
        activeApp.parentId !== "home" && (
          <NoPermissionOverlay
            title={t('noPermission.title')} 
            subTitle={t('noPermission.subtitle')}
          />
        )}
    </div>
  );
};

export default DashboardContent;
