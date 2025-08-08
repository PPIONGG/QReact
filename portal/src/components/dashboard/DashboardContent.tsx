import { useEffect, useMemo, useState, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { ActiveApp, MenuItem } from "../../types";
import { useAuthStore } from "../../store/auth.store";
import { Card, Button, Typography, Spin, Alert } from "antd";
import {
  RocketOutlined,
  LoadingOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import NoPermissionOverlay from "./NoPermissionOverlay";
import React from "react";
import { useTranslation } from "react-i18next";
import logo1 from "../../assets/Q-ERPc.jpg";
import logo2 from "../../assets/Q-ERPc_2.jpg";

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { Salesinfo, user, fetchSalesinfo, isloadingSalesinfo } =
    useAuthStore();
  const { t } = useTranslation("portal-dashboard");

  // ⭐ เพิ่ม array ของรูปภาพ
  const images = [logo1, logo2];

  const cleanUsername = (username: string): string => {
    return username.replace(/^QERP_/i, "");
  };

  // ⭐ เพิ่ม Auto slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // เปลี่ยนทุก 4 วินาที

    return () => clearInterval(interval);
  }, [images.length]);

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

  // ⭐ เพิ่ม functions สำหรับควบคุม slider
  const goToPrevious = () => {
    setCurrentImageIndex(
      currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentImageIndex(
      currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentImageIndex(index);
  };

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
          {t("remote.loading", { appName })}
        </Text>
        <br />
        <Text type="secondary" style={{ fontSize: "14px" }}>
          {t("remote.connecting")}
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
        message={t("remote.notAvailable", { appName })}
        description={
          <div>
            <p>{t("remote.cannotLoad", { appName })}</p>
            {error && (
              <p style={{ fontSize: "12px", color: "#999" }}>Error: {error}</p>
            )}
            <div style={{ marginTop: "16px" }}>
              <Button
                type="primary"
                onClick={() => window.location.reload()}
                style={{ marginRight: "8px" }}
              >
                {t("remote.reloadPage")}
              </Button>
              <Button onClick={() => console.log("Contact support")}>
                {t("remote.contactSupport")}
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
        <div style={{ padding: "20px", textAlign: "center" }}>
          <div
            style={{
              position: "relative",
              width: "100%",
              margin: "0 auto",
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              backgroundColor: "#fff",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "50vh",
                minHeight: "300px",
                maxHeight: "600px",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f8fafc",
              }}
            >
              <img
                src={images[currentImageIndex]}
                alt={`Logo ${currentImageIndex + 1}`}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                  transition: "transform 0.5s ease-in-out",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 20px",
                  background:
                    "linear-gradient(90deg, rgba(0,0,0,0.1) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.1) 100%)",
                }}
              >
                {/* Left Arrow */}
                <Button
                  type="text"
                  icon={<LeftOutlined />}
                  onClick={goToPrevious}
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    border: "none",
                    fontSize: "18px",
                    color: "#1890ff",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(255, 255, 255, 1)";
                    e.currentTarget.style.transform = "scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(255, 255, 255, 0.9)";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                />
                {/* Right Arrow */}
                <Button
                  type="text"
                  icon={<RightOutlined />}
                  onClick={goToNext}
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    border: "none",
                    fontSize: "18px",
                    color: "#1890ff",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(255, 255, 255, 1)";
                    e.currentTarget.style.transform = "scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(255, 255, 255, 0.9)";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                />
              </div>
            </div>
            {/* Dots Indicator */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "8px",
                padding: "20px",
                backgroundColor: "rgba(248, 250, 252, 0.8)",
              }}
            >
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    border: "none",
                    backgroundColor:
                      index === currentImageIndex ? "#1890ff" : "#d1d5db",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    transform:
                      index === currentImageIndex ? "scale(1.2)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          </div>
          {/* Title และ Description */}
          <div style={{ marginTop: "40px" }}>
            <Title level={2} style={{ color: "#1890ff", marginBottom: "16px" }}>
              ยินดีต้อนรับสู่ Q-ERPc Dashboard
            </Title>
            <Paragraph
              style={{
                fontSize: "16px",
                color: "#64748b",
                maxWidth: "600px",
                margin: "0 auto",
              }}
            >
              ระบบจัดการองค์กรแบบครบวงจร
              เพื่อเพิ่มประสิทธิภาพในการดำเนินงานของธุรกิจ
            </Paragraph>
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
              error={t("remote.moduleNotReady")}
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
                    {t("content.applicationDeveloping", {
                      appName: activeApp.parentId,
                    })}
                  </Title>
                  <Paragraph>{t("content.microfrontendDesc")}</Paragraph>
                  <div style={{ marginTop: "24px" }}>
                    <Button type="primary" style={{ marginRight: "12px" }}>
                      {t("content.notifyWhenReady")}
                    </Button>
                    <Button>{t("content.backToMain")}</Button>
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
  }, [activeApp, menuItems, location, currentUrl, currentImageIndex, images]);

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
              {t("loading.checkingPermission")}
            </p>
            <p
              style={{
                margin: "8px 0 0 0",
                color: "#94a3b8",
                fontSize: "14px",
              }}
            >
              {t("loading.pleaseWait")}
            </p>
          </div>
        </div>
      )}

      {!permissionStatus.hasPermission &&
        !permissionStatus.showLoading &&
        activeApp.parentId !== "home" && (
          <NoPermissionOverlay
            title={t("noPermission.title")}
            subTitle={t("noPermission.subtitle")}
          />
        )}
    </div>
  );
};

export default DashboardContent;
