import React from "react";
import { Card, Form, Row, Col, DatePicker, Input } from "antd";
import { CalendarOutlined } from "@ant-design/icons";

interface VisitInformationCardProps {
  mode: "new" | "edit";
}

const VisitInformationCard: React.FC<VisitInformationCardProps> = ({
  mode,
}) => {
  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          <CalendarOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
          Visit Information
        </div>
      }
      style={{ marginBottom: "24px" }}
      styles={{ header: { background: "#fafafa" } }}
    >
      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Form.Item
            label="DATE OF VISIT"
            name="visitDate"
            rules={[{ required: true, message: "Please select visit date" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              placeholder="Select date"
              format="DD/MM/YYYY"
              disabled={mode === "edit"}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="VISITOR"
            name="visitor"
            rules={[{ required: true, message: "Please enter visitor name" }]}
          >
            <Input placeholder="Enter visitor name" readOnly />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
};

export default VisitInformationCard;
