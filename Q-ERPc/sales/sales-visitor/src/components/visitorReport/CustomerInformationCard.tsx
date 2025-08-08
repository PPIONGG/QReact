import React from "react";
import { Card, Form, Row, Col, Input, Button } from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  TeamOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next"; // ⭐ เพิ่ม import

interface CustomerSearchButtonProps {
  onCustomerSearch: () => void;
}

const CustomerInformationCard: React.FC<CustomerSearchButtonProps> = ({
  onCustomerSearch,
}) => {
  // ⭐ เพิ่ม useTranslation hook
  const { t } = useTranslation('sales-visitor');

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
            {t('customerInformation')}
          </div>
          <Button
            type="primary"
            size="small"
            icon={<SearchOutlined />}
            onClick={onCustomerSearch}
            style={{ height: "32px" }}
          >
            {t('searchCustomer')}
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
          <Form.Item label={t('customerCode')} name="customerCode">
            <Input
              placeholder={t('enterCustomerCode')}
              prefix={<UserOutlined />}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Form.Item label={t('customerName')} name="customerName">
            <Input prefix={<UserOutlined />} placeholder={t('enterCompanyName')} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label={t('contactPerson')} name="contactPerson">
            <Input placeholder={t('enterContactPersonName')} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Form.Item
            label={t('tel')}
            name="tel"
            rules={[{ required: true, message: t('pleaseEnterPhoneNumber') }]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder={t('enterPhoneNumber')}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label={t('email')}
            name="email"
            rules={[{ type: "email", message: t('pleaseEnterValidEmail') }]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder={t('enterEmailAddress')}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Form.Item label={t('address')} name="address">
            <Input placeholder={t('enterAddress')} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label={t('salesClose')} name="salesClose">
            <Input placeholder={t('enterSalesClosePercentage')} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Form.Item label={t('note')} name="note">
            <Input placeholder={t('enterNote')} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label={t('businessDetails')} name="businessDetails">
            <Input placeholder={t('enterBusinessDetails')} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Form.Item label={t('status')} name="status">
            <Input placeholder={t('enterStatus')} />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
};

export default CustomerInformationCard;