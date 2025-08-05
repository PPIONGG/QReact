import React from "react";
import { Card, Form, Row, Col, Input, Button } from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  TeamOutlined,
} from "@ant-design/icons";

interface CustomerSearchButtonProps {
  onCustomerSearch: () => void;
}

const CustomerInformationCard: React.FC<CustomerSearchButtonProps> = ({
  onCustomerSearch,
}) => {
  return (
    <Card
      title={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <UserOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
            Customer Information
          </div>
          <Button
            type="primary"
            size="small"
            icon={<TeamOutlined />}
            onClick={onCustomerSearch}
            style={{ height: "32px" }}
          >
            ลูกค้าในระบบ
          </Button>
        </div>
      }
      style={{ marginBottom: "24px" }}
      styles={{ header: { background: "#fafafa" } }}
    >
      <Form.Item name="customerPrefix" hidden>
        <Input />
      </Form.Item>
      <Form.Item name="customerSuffix" hidden>
        <Input />
      </Form.Item>
      <Row gutter={24}>
        <Col xs={24} md={24}>
          <Form.Item label="Customer Code" name="customerCode">
            <Input
              placeholder="Enter customer code"
              prefix={<UserOutlined />}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Form.Item label="Customer Name" name="customerName">
            <Input prefix={<UserOutlined />} placeholder="Enter company name" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Contact Person" name="contactPerson">
            <Input placeholder="Enter contact person name" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Form.Item
            label="Tel"
            name="tel"
            rules={[{ required: true, message: "Please enter phone number" }]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="Enter phone number"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ type: "email", message: "Please enter valid email" }]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Enter email address"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Form.Item label="Address" name="address">
            <Input placeholder="Enter address" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Sales Close (ปิดการขาย %)" name="salesClose">
            <Input placeholder="Enter sales close percentage" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Form.Item label="Note" name="note">
            <Input placeholder="Enter note" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="รายละเอียดธุรกิจลูกค้า" name="businessDetails">
            <Input placeholder="Enter business details" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Form.Item label="Status" name="status">
            <Input placeholder="Enter status" />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
};

export default CustomerInformationCard;
