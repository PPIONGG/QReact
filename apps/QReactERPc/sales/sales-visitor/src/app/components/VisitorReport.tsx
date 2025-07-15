import React, { useEffect } from 'react';
import {
  Card,
  Button,
  Typography,
  Input,
  DatePicker,
  Row,
  Col,
  Upload,
  Space,
  Form,
  message,
  Spin,
  Alert,
  Modal,
  notification,
} from 'antd';
import {
  CameraOutlined,
  SaveOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useSalesVisitorStore } from '../store/sales-visitor';
import { VisitorFormData } from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { confirm } = Modal;

interface VisitorReportProps {
  mode: 'new' | 'edit';
}

const VisitorReport: React.FC<VisitorReportProps> = ({ mode }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    fetchVisitDetail,
    visitDetail,
    detailLoading,
    detailError,
    clearDetailError,
    clearVisitDetail,
    saveVisitReport,
    saveLoading,
    saveError,
    clearSaveError,
  } = useSalesVisitorStore();

  // เรียก API เมื่อ mode เป็น 'edit' และมี id
  useEffect(() => {
    if (mode === 'edit' && id) {
      fetchVisitDetail(id);
    }

    // Clear data เมื่อ component unmount หรือเปลี่ยน mode
    return () => {
      if (mode === 'edit') {
        clearVisitDetail();
      }
    };
  }, [mode, id, fetchVisitDetail, clearVisitDetail]);

  // Populate form เมื่อได้ข้อมูลจาก API
  useEffect(() => {
    if (mode === 'edit' && visitDetail?.status && visitDetail.data) {
      const data = visitDetail.data;
      form.setFieldsValue({
        visitDate: data.dateVisit ? dayjs(data.dateVisit) : null,
        visitor: data.visitorName,
        customerCode: data.customerCode,
        customerName: data.companyName,
        contactPerson: data.contactPerson,
        tel: data.tel,
        email: data.email,
        address: data.address,
        salesClose: data.salesClose,
        note: data.note,
        businessDetails: data.note2,
        status: data.status,
      });
    }
  }, [visitDetail, mode, form]);

  const handleGoBack = () => {
    // ถาม confirmation ก่อนออก (ถ้ามีข้อมูลใน form)
    const hasFormData = form.getFieldsValue();
    const hasValues = Object.values(hasFormData).some(value => 
      value !== undefined && value !== null && value !== ''
    );

    if (hasValues && mode === 'new') {
      confirm({
        title: 'Discard Changes?',
        icon: <ExclamationCircleOutlined />,
        content: 'You have unsaved changes. Are you sure you want to leave?',
        okText: 'Yes, Leave',
        okType: 'danger',
        cancelText: 'Stay',
        onOk() {
          navigate('/');
        },
      });
    } else {
      navigate('/');
    }
  };


const handleSave = async () => {
  try {
    const values: VisitorFormData = await form.validateFields();
    const confirmMessage = mode === 'new' 
      ? 'Are you sure you want to create this visit report?' 
      : 'Are you sure you want to update this visit report?';
      
    const isConfirmed = window.confirm(confirmMessage);
    if (!isConfirmed) {
      console.log("=== USER CANCELLED ===");
      return;
    }
    // สร้าง body
    const requestBody = {
      userName: 'QERP_pingtest',
      data: {
        noItem:
          mode === 'edit' && visitDetail?.data?.noItem
            ? visitDetail.data.noItem
            : 0,
        customerCode: values.customerCode || '',
        companyName: values.customerName || '',
        visitorName: values.visitor || '',
        dateVisit: values.visitDate
          ? dayjs.isDayjs(values.visitDate)
            ? values.visitDate.format('YYYY-MM-DD')
            : values.visitDate
          : '',
        contactPerson: values.contactPerson || '',
        tel: values.tel || '',
        email: values.email || '',
        address: values.address || '',
        objective: '',
        status: values.status || '',
        note: values.note || '',
        note2: values.businessDetails || '',
        salesClose: values.salesClose || '',
        latitude: 0,
        longitude: 0,
        currentLocation: '',
        issuedStatusWithdraw: true,
        salesCode:
          mode === 'edit' && visitDetail?.data?.salesCode
            ? visitDetail.data.salesCode
            : 'S001',
        salesName:
          mode === 'edit' && visitDetail?.data?.salesName
            ? visitDetail.data.salesName
            : 'Wanida Nontaphan',
        employeeCode:
          mode === 'edit' && visitDetail?.data?.employeeCode
            ? visitDetail.data.employeeCode
            : '',
        imageFilePatch:
          mode === 'edit' && visitDetail?.data?.imageFilePatch
            ? visitDetail.data.imageFilePatch
            : '',
        isUpdateImage: mode === 'edit' ? true : false,
      },
    };
    // เรียก API ตาม mode
    const apiMode = mode === 'new' ? 'create' : 'update';
    const response = await saveVisitReport(requestBody, apiMode);

    if (response.status) {
      if (mode === 'new') {
        form.resetFields();
        message.success('New visit report created successfully!');
      } else {
        message.success('Visit report updated successfully!');
      }

      setTimeout(() => {
        navigate('/');
      }, 1000);
    } else {
      message.error(response.message || 'Failed to save visit report');
    }
  } catch (error) {
    message.error('Failed to save visit report');
  }
};

  useEffect(() => {
    if (saveError) {
      notification.error({
        message: 'Error',
        description: saveError,
        placement: 'topRight',
        duration: 4,
      });
      clearSaveError();
    }
  }, [saveError, clearSaveError]);

  const pageTitle = mode === 'new' ? 'NEW VISIT REPORT' : 'EDIT VISIT REPORT';

  // Show loading spinner when fetching data for edit mode
  if (mode === 'edit' && detailLoading) {
    return (
      <div style={{ padding: '10px', textAlign: 'center', marginTop: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>
          <Text>Loading visit details...</Text>
        </div>
      </div>
    );
  }

  // Show error if failed to load data for edit mode
  if (mode === 'edit' && detailError) {
    return (
      <div style={{ padding: '10px' }}>
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

  // Show error if edit mode but no data found
  if (mode === 'edit' && visitDetail && !visitDetail.status) {
    return (
      <div style={{ padding: '10px' }}>
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
    <div style={{ padding: '10px' }}>
      <div style={{ marginBottom: '14px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div>
                <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                  {pageTitle}
                  {mode === 'edit' && id && (
                    <span style={{ fontSize: '16px', color: '#666' }}>
                      {' '}
                      (ID: {id})
                    </span>
                  )}
                </Title>
              </div>
            </div>
          </Col>
          <Col>
            <Space size="middle">
              <Button size="large" onClick={handleGoBack}>
                Cancel
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<SaveOutlined />}
                onClick={handleSave}
                loading={saveLoading}
                disabled={saveLoading}
                style={{
                  borderRadius: '6px',
                  background: '#52c41a',
                  borderColor: '#52c41a',
                }}
              >
                {mode === 'new' ? 'Save Report' : 'Update Report'}
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      <Form form={form} layout="vertical" size="large">
        <Row gutter={32}>
          <Col xs={24} xl={16}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarOutlined
                    style={{ marginRight: '8px', color: '#1890ff' }}
                  />
                  Visit Information
                </div>
              }
              style={{ marginBottom: '24px' }}
              styles={{ header: { background: '#fafafa' } }}
            >
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="DATE OF VISIT"
                    name="visitDate"
                    rules={[
                      { required: true, message: 'Please select visit date' },
                    ]}
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      placeholder="Select date"
                      format="DD/MM/YYYY"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="VISITOR" name="visitor">
                    <Input placeholder="Enter visitor name" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Customer Information */}
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <UserOutlined
                    style={{ marginRight: '8px', color: '#1890ff' }}
                  />
                  Customer Information
                </div>
              }
              style={{ marginBottom: '24px' }}
              styles={{ header: { background: '#fafafa' } }}
            >
              <Row gutter={24}>
                <Col xs={24} md={24}>
                  <Form.Item
                    label="Customer Code"
                    name="customerCode"
                    rules={[
                      { required: true, message: 'Please enter Customer Code' },
                    ]}
                  >
                    <Input
                      placeholder="Enter customer code"
                      prefix={<UserOutlined />}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Customer Name"
                    name="customerName"
                    rules={[
                      { required: true, message: 'Please enter Customer Name' },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="Enter company name"
                    />
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
                  <Form.Item label="Tel" name="tel">
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
                    rules={[
                      { type: 'email', message: 'Please enter valid email' },
                    ]}
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
                  <Form.Item
                    label="Sales Close (ปิดการขาย %)"
                    name="salesClose"
                  >
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
                  <Form.Item
                    label="รายละเอียดธุรกิจลูกค้า"
                    name="businessDetails"
                  >
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
          </Col>

          {/* Right Column - Photos & Summary */}
          <Col xs={24} xl={8}>
            {/* Photos Upload */}
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <CameraOutlined
                    style={{ marginRight: '8px', color: '#1890ff' }}
                  />
                  Visit Photos
                </div>
              }
              style={{ marginBottom: '24px' }}
              styles={{ header: { background: '#fafafa' } }}
            >
              <Form.Item name="photos">
                <Upload.Dragger
                  multiple
                  listType="picture-card"
                  accept="image/*"
                  fileList={[]}
                  style={{
                    background: '#fafafa',
                    border: '2px dashed #d9d9d9',
                    borderRadius: '6px',
                  }}
                  beforeUpload={() => false}
                >
                  <div style={{ padding: '20px', textAlign: 'center' }}>
                    <CameraOutlined
                      style={{
                        fontSize: '36px',
                        color: '#bfbfbf',
                        marginBottom: '12px',
                      }}
                    />
                    <div>
                      <Text style={{ fontSize: '14px', color: '#666' }}>
                        Click or drag photos here
                      </Text>
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Support: JPG, PNG • Max 5MB each
                      </Text>
                    </div>
                  </div>
                </Upload.Dragger>
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default VisitorReport;