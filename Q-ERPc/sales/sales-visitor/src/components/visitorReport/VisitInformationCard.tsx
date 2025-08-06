import React from "react";
import { Card, Form, Row, Col, DatePicker, Input } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next"; // ⭐ เพิ่ม import

interface VisitInformationCardProps {
  mode: "new" | "edit";
}

const VisitInformationCard: React.FC<VisitInformationCardProps> = ({
  mode,
}) => {
  // ⭐ เพิ่ม useTranslation hook
  const { t } = useTranslation('sales-visitor');

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          <CalendarOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
          {t('visitInformation')}
        </div>
      }
      style={{ marginBottom: "24px" }}
      styles={{ header: { background: "#fafafa" } }}
    >
      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Form.Item
            label={t('dateOfVisit')}
            name="visitDate"
            rules={[{ required: true, message: t('pleaseSelectVisitDate') }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              placeholder={t('selectDate')}
              format="DD/MM/YYYY"
              disabled={mode === "edit"}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label={t('visitor')}
            name="visitor"
            rules={[{ required: true, message: t('pleaseEnterVisitorName') }]}
          >
            <Input placeholder={t('enterVisitorName')} readOnly />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
};

export default VisitInformationCard;