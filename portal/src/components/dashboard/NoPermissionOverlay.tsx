import React from "react";
import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { LockOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

interface NoPermissionOverlayProps {
  title?: string;
  subTitle?: string;
  onClose?: () => void;
}

const NoPermissionOverlay: React.FC<NoPermissionOverlayProps> = ({
  title,
  subTitle,
  onClose,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation("portal-dashboard");
  const handleBackToHome = () => {
    navigate("/");
    if (onClose) onClose();
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          maxWidth: "500px",
          width: "90%",
        }}
      >
        <Result
          status="403"
          title={title || t('noPermission.title')}
          subTitle={subTitle || t('noPermission.subtitle')}
          icon={<LockOutlined style={{ color: "#ff4d4f", fontSize: "64px" }} />}
          extra={
            <Button type="primary" size="large" onClick={handleBackToHome}>
              {t('noPermission.backToHome')}
            </Button>
          }
        />
      </div>
    </div>
  );
};

export default NoPermissionOverlay;
