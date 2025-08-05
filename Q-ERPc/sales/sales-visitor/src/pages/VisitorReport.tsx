import React from "react";
import { Typography, Row, Col, Space, Form, Button, Spin, Alert } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import CustomerSearchModal from "../components/visitorReport/CustomerSearchModal";
import VisitInformationCard from "../components/visitorReport/VisitInformationCard";
import CustomerInformationCard from "../components/visitorReport/CustomerInformationCard";
import PhotoUploadCard from "../components/visitorReport/PhotoUploadCard";
import { useVisitorReport } from "../hooks/useVisitorReport";

const { Title, Text } = Typography;

interface VisitorReportProps {
  mode: "new" | "edit";
}

const VisitorReport: React.FC<VisitorReportProps> = ({ mode }) => {
  const { id } = useParams();
  const {
    form,
    isCustomerModalVisible,
    visitDetail,
    detailLoading,
    detailError,
    saveLoading,
    handleCustomerModalOpen,
    handleCustomerModalClose,
    handleCustomerSelect,
    handleGoBack,
    handleSave,
    clearDetailError,
    fetchVisitDetail,
  } = useVisitorReport(mode);

  const pageTitle = mode === "new" ? "NEW VISIT REPORT" : "EDIT VISIT REPORT";

  // Loading states
  if (mode === "edit" && detailLoading) {
    return (
      <div style={{ padding: "10px", textAlign: "center", marginTop: "50px" }}>
        <Spin size="large" />
        <div style={{ marginTop: "16px" }}>
          <Text>Loading visit details...</Text>
        </div>
      </div>
    );
  }

  // Error states
  if (mode === "edit" && detailError) {
    return (
      <div style={{ padding: "10px" }}>
        <Alert
          message="Error loading visit details"
          description={detailError}
          type="error"
          closable
          onClose={clearDetailError}
          action={
            <Space>
              <Button size="small" onClick={handleGoBack}>
                Go Back
              </Button>
              <Button
                size="small"
                type="primary"
                onClick={() => id && fetchVisitDetail(id)}
              >
                Retry
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
          message="Visit not found"
          description="The requested visit details could not be found."
          type="warning"
          action={
            <Button type="primary" onClick={handleGoBack}>
              Go Back
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "10px" }}>
      {/* Header */}
      <div style={{ marginBottom: "14px" }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
              {pageTitle}
              {mode === "edit" && id && (
                <span style={{ fontSize: "16px", color: "#666" }}>
                  {" "}
                  (ID: {id})
                </span>
              )}
            </Title>
          </Col>
          <Col>
            <Space size="middle">
              <Button
                onClick={handleGoBack}
              >
                Cancel
              </Button>
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
                {mode === "new" ? "Save Report" : "Update Report"}
              </Button>
            </Space>
          </Col>
        </Row>
      </div>
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

      <CustomerSearchModal
        isVisible={isCustomerModalVisible}
        onClose={handleCustomerModalClose}
        onCustomerSelect={handleCustomerSelect}
      />
    </div>
  );
};

export default VisitorReport;
