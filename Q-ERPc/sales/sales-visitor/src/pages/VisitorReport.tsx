import React from "react";
import {
  Typography,
  Row,
  Col,
  Space,
  Form,
  Button,
  Spin,
  Alert,
  Modal,
} from "antd";
import { SaveOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import CustomerSearchModal from "../components/visitorReport/CustomerSearchModal";
import VisitInformationCard from "../components/visitorReport/VisitInformationCard";
import CustomerInformationCard from "../components/visitorReport/CustomerInformationCard";
import PhotoUploadCard from "../components/visitorReport/PhotoUploadCard";
import { useVisitorReport } from "../hooks/useVisitorReport";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;

interface VisitorReportProps {
  mode: "new" | "edit";
}

const VisitorReport: React.FC<VisitorReportProps> = ({ mode }) => {
  const { t } = useTranslation("sales-visitor");

  const { id } = useParams();
  const {
    form,
    isCustomerModalVisible,
    // ⭐ เพิ่ม custom modal states
    isBackConfirmVisible,
    isSaveConfirmVisible,
    visitDetail,
    detailLoading,
    detailError,
    saveLoading,
    handleCustomerModalOpen,
    handleCustomerModalClose,
    handleCustomerSelect,
    handleGoBack,
    handleSave,
    // ⭐ เพิ่ม custom modal handlers
    handleBackConfirm,
    handleBackCancel,
    handleSaveConfirm,
    handleSaveCancel,
    clearDetailError,
    fetchVisitDetail,
  } = useVisitorReport(mode);

  const pageTitle =
    mode === "new" ? t("createVisitReport") : t("editVisitReport");

  // Loading states
  if (mode === "edit" && detailLoading) {
    return (
      <div style={{ padding: "10px", textAlign: "center", marginTop: "50px" }}>
        <Spin size="large" />
        <div style={{ marginTop: "16px" }}>
          <Text>{t("loadingVisitDetails")}</Text>
        </div>
      </div>
    );
  }

  // Error states
  if (mode === "edit" && detailError) {
    return (
      <div style={{ padding: "10px" }}>
        <Alert
          message={t("errorLoadingVisitDetails")}
          description={detailError}
          type="error"
          closable
          onClose={clearDetailError}
          action={
            <Space>
              <Button size="small" onClick={handleGoBack}>
                {t("goBack")}
              </Button>
              <Button
                size="small"
                type="primary"
                onClick={() => id && fetchVisitDetail(id)}
              >
                {t("retry")}
              </Button>
            </Space>
          }
        />
      </div>
    );
  }

  if (mode === "edit" && visitDetail && !visitDetail.status) {
    return (
      <div style={{ padding: "10px" }}>
        <Alert
          message={t("visitNotFound")}
          description={t("visitNotFoundDescription")}
          type="warning"
          action={
            <Button type="primary" onClick={handleGoBack}>
              {t("goBack")}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "10px" }}>
      {/* Header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          marginBottom: "14px",
          background: "#fff",
          padding: "10px 10px 14px 10px",
          borderRadius: "6px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
        }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0, color: "#1677ff" }}>
              {pageTitle}
              {mode === "edit" && id && (
                <span style={{ fontSize: "12px", color: "#666" }}>
                  {" "}
                  ({visitDetail?.data.customerPrefix}{" "}
                  {visitDetail?.data.companyName}{" "}
                  {visitDetail?.data.customerSuffix})
                </span>
              )}
            </Title>
          </Col>
          <Col>
            <Space size="middle">
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
                loading={saveLoading}
                disabled={saveLoading}
                style={{
                  borderRadius: "6px",
                }}
              >
                {mode === "new" ? t("save") : t("update")}
              </Button>
              <Button onClick={handleGoBack}>{t("cancel")}</Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Form Content */}
      <Form form={form} layout="vertical" size="large">
        <Row gutter={16}>
          <Col xs={24} xl={16}>
            <VisitInformationCard mode={mode} />
            <CustomerInformationCard
              onCustomerSearch={handleCustomerModalOpen}
            />
          </Col>
          <Col xs={24} xl={8}>
            <PhotoUploadCard mode={mode} />
          </Col>
        </Row>
      </Form>

      {/* Customer Search Modal */}
      <CustomerSearchModal
        isVisible={isCustomerModalVisible}
        onClose={handleCustomerModalClose}
        onCustomerSelect={handleCustomerSelect}
      />

      {/* ⭐ Custom Back Confirmation Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <ExclamationCircleOutlined
              style={{
                color: "#faad14",
                fontSize: "22px",
                marginRight: "12px",
              }}
            />
            <span style={{ color: "#1f2937", fontWeight: "600" }}>
              {t("discardChanges")}
            </span>
          </div>
        }
        open={isBackConfirmVisible}
        closeIcon={true}
        closable={false}
        centered
        width={420}
        footer={
          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}
          >
            <Button
              key="ok"
              type="primary"
              danger
              onClick={handleBackConfirm}
              style={{
                height: "36px",
                borderRadius: "6px",
                fontWeight: "500",
              }}
            >
              {t("yesLeave")}
            </Button>
            <Button
              key="cancel"
              onClick={handleBackCancel}
              style={{
                height: "36px",
                borderRadius: "6px",
              }}
            >
              {t("stay")}
            </Button>
          </div>
        }
        styles={{
          header: {
            borderBottom: "1px solid #f0f0f0",
            paddingBottom: "16px",
          },
        }}
      >
        <div style={{ padding: "8px 0" }}>
          <p
            style={{
              margin: 0,
              color: "#6b7280",
              fontSize: "14px",
              lineHeight: "1.5",
            }}
          >
            {mode === "new"
              ? t("unsavedChangesNewWarning")
              : t("unsavedChangesEditWarning")}
          </p>
        </div>
      </Modal>

      {/* ⭐ Custom Save Confirmation Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ color: "#1f2937", fontWeight: "600" }}>
              {mode === "new" ? t("createNewReport") : t("updateReport")}
            </span>
          </div>
        }
        open={isSaveConfirmVisible}
        closable={false}
        centered
        width={420}
        footer={
          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}
          >
            <Button
              key="ok"
              type="primary"
              onClick={handleSaveConfirm}
              loading={saveLoading}
              icon={<SaveOutlined />}
              style={{
                background: "#52c41a",
                borderColor: "#52c41a",
                height: "36px",
                borderRadius: "6px",
                fontWeight: "500",
              }}
            >
              {mode === "new" ? t("save") : t("update")}
            </Button>
            <Button
              key="cancel"
              onClick={handleSaveCancel}
              disabled={saveLoading}
              style={{
                height: "36px",
                borderRadius: "6px",
              }}
            >
              {t("cancel")}
            </Button>
          </div>
        }
        styles={{
          header: {
            borderBottom: "1px solid #f0f0f0",
            paddingBottom: "16px",
          },
        }}
      >
        <div style={{ padding: "8px 0" }}>
          <p
            style={{
              margin: 0,
              color: "#6b7280",
              fontSize: "14px",
              lineHeight: "1.5",
            }}
          >
            {mode === "new"
              ? t("createNewReportConfirm")
              : t("updateReportConfirm")}
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default VisitorReport;
