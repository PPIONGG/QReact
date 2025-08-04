import React, { useState, useEffect } from "react";
import {
  Modal,
  Input,
  Card,
  Button,
  Typography,
  Spin,
  Alert,
  message,
} from "antd";
import {
  TeamOutlined,
  SearchOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useSalesVisitorStore } from "../../store/sales-visitor";

const { Text } = Typography;

interface CustomerSearchModalProps {
  isVisible: boolean;
  onClose: () => void;
  onCustomerSelect: (customerData: any) => void;
}

const CustomerSearchModal: React.FC<CustomerSearchModalProps> = ({
  isVisible,
  onClose,
  onCustomerSelect,
}) => {
  const [searchText, setSearchText] = useState("");
  const [selectedCustomerCode, setSelectedCustomerCode] = useState<
    string | null
  >(null);
  const [isSelectingCustomer, setIsSelectingCustomer] = useState(false);

  const {
    listAllCustomer,
    listAllCustomerLoading,
    listAllCustomerError,
    clearListAllCustomer,
    fetchlistAllCustomerAPI,
    customerDetails,
    customerDetailsError,
    clearCustomerDetails,
    fetchCustomerDetails,
  } = useSalesVisitorStore();

  const filteredCustomers =
    listAllCustomer?.data?.filter(
      (customer) =>
        customer.customerName
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        customer.customerCode
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchText.toLowerCase()) ||
        customer.customerPrefix
          ?.toLowerCase()
          .includes(searchText.toLowerCase()) ||
        customer.customerSuffix
          ?.toLowerCase()
          .includes(searchText.toLowerCase())
    ) || [];

  useEffect(() => {
    if (isVisible) {
      fetchlistAllCustomerAPI().catch(() => {
        message.error("ไม่สามารถโหลดข้อมูลลูกค้าได้");
      });
    }
  }, [isVisible, fetchlistAllCustomerAPI]);

  useEffect(() => {
    if (customerDetails?.status && customerDetails.data) {
      onCustomerSelect(customerDetails.data);
      handleClose();
    } else if (customerDetails?.status === false) {
      message.error("ไม่พบข้อมูลลูกค้า");
      setSelectedCustomerCode(null);
      setIsSelectingCustomer(false);
    }
  }, [customerDetails, onCustomerSelect]);

  useEffect(() => {
    if (customerDetailsError) {
      message.error("เกิดข้อผิดพลาดในการโหลดข้อมูลลูกค้า");
      setSelectedCustomerCode(null);
      setIsSelectingCustomer(false);
    }
  }, [customerDetailsError]);

  const handleClose = () => {
    setSearchText("");
    setSelectedCustomerCode(null);
    setIsSelectingCustomer(false);
    clearCustomerDetails();
    clearListAllCustomer();
    onClose();
  };

  const handleCustomerSelect = async (customerData: any) => {
    try {
      setSelectedCustomerCode(customerData.customerCode);
      setIsSelectingCustomer(true);
      await fetchCustomerDetails(customerData.noItem, customerData.typeInfo);
    } catch (error) {
      message.error("ไม่สามารถโหลดรายละเอียดลูกค้าได้");
      setSelectedCustomerCode(null);
      setIsSelectingCustomer(false);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          <TeamOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
          <span style={{ fontSize: "18px", fontWeight: "600" }}>
            เลือกลูกค้าในระบบ
          </span>
        </div>
      }
      open={isVisible}
      onCancel={handleClose}
      footer={null}
      width={800}
      maskClosable={!isSelectingCustomer}
      closable={!isSelectingCustomer}
    >
      {/* Loading Overlay */}
      {isSelectingCustomer && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(255, 255, 255, 0.9)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            borderRadius: "8px",
          }}
        >
          <Spin
            size="large"
            indicator={
              <LoadingOutlined
                style={{ fontSize: 40, color: "#1890ff" }}
                spin
              />
            }
          />
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <Text
              style={{ fontSize: "16px", color: "#1890ff", fontWeight: "500" }}
            >
              กำลังโหลดข้อมูลลูกค้า...
            </Text>
            <div style={{ marginTop: "8px" }}>
              <Text type="secondary" style={{ fontSize: "14px" }}>
                รหัสลูกค้า: {selectedCustomerCode}
              </Text>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: "20px 0" }}>
        {/* Search Input */}
        <div style={{ marginBottom: "20px" }}>
          <Input
            size="large"
            placeholder="ค้นหาชื่อลูกค้า, รหัสลูกค้า..."
            prefix={<SearchOutlined />}
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ borderRadius: "8px" }}
            disabled={isSelectingCustomer}
          />
        </div>

        {/* Customer List */}
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {listAllCustomerLoading && (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <Spin size="large" />
              <div style={{ marginTop: "16px" }}>
                <Text>กำลังโหลดข้อมูลลูกค้า...</Text>
              </div>
            </div>
          )}

          {listAllCustomerError && (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <Alert
                message="เกิดข้อผิดพลาด"
                description={listAllCustomerError}
                type="error"
                showIcon
              />
            </div>
          )}

          {!listAllCustomerLoading && !listAllCustomerError && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {filteredCustomers.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <Text type="secondary">
                    {searchText ? "ไม่พบลูกค้าที่ค้นหา" : "ไม่มีข้อมูลลูกค้า"}
                  </Text>
                </div>
              ) : (
                filteredCustomers.map((customer, index) => {
                  const isCurrentlyLoading =
                    selectedCustomerCode === customer.customerCode &&
                    isSelectingCustomer;

                  return (
                    <Card
                      key={`${customer.customerCode}-${customer.typeInfo}-${index}`}
                      size="small"
                      hoverable={!isSelectingCustomer}
                      style={{
                        cursor: isSelectingCustomer ? "not-allowed" : "pointer",
                        border: isCurrentlyLoading
                          ? "2px solid #1890ff"
                          : "1px solid #e1e5e9",
                        borderRadius: "8px",
                        opacity:
                          isSelectingCustomer && !isCurrentlyLoading ? 0.6 : 1,
                        transform: isCurrentlyLoading
                          ? "scale(1.02)"
                          : "scale(1)",
                        transition: "all 0.3s ease",
                        background: isCurrentlyLoading
                          ? "linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)"
                          : "#fff",
                        boxShadow: isCurrentlyLoading
                          ? "0 4px 12px rgba(24, 144, 255, 0.2)"
                          : "none",
                      }}
                      onClick={() =>
                        !isSelectingCustomer && handleCustomerSelect(customer)
                      }
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <Text
                              strong
                              style={{ fontSize: "16px", color: "#1890ff" }}
                            >
                              {customer.customerCode}
                            </Text>
                            <Text
                              style={{
                                fontSize: "10px",
                                background:
                                  customer.typeInfo === "SV"
                                    ? "#52c41a"
                                    : "#1890ff",
                                color: "white",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                fontWeight: "bold",
                              }}
                            >
                              {customer.typeInfo}
                            </Text>
                            {isCurrentlyLoading && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  marginLeft: "8px",
                                }}
                              >
                                <LoadingOutlined
                                  style={{ color: "#1890ff", fontSize: "12px" }}
                                />
                                <Text
                                  style={{ fontSize: "11px", color: "#1890ff" }}
                                >
                                  กำลังโหลด...
                                </Text>
                              </div>
                            )}
                          </div>
                          <div style={{ marginTop: "4px" }}>
                            <Text style={{ fontSize: "14px" }}>
                              {customer.customerPrefix} {customer.customerName}{" "}
                              {customer.customerSuffix}
                            </Text>
                          </div>
                          <div style={{ marginTop: "4px" }}>
                            <Text style={{ fontSize: "14px" }}>
                              Tel: {customer.phone}
                            </Text>
                          </div>
                        </div>
                        <Button
                          type={isCurrentlyLoading ? "default" : "primary"}
                          size="small"
                          style={{
                            borderRadius: "6px",
                            minWidth: "60px",
                            background: isCurrentlyLoading
                              ? "#f0f9ff"
                              : undefined,
                            borderColor: isCurrentlyLoading
                              ? "#1890ff"
                              : undefined,
                            color: isCurrentlyLoading ? "#1890ff" : undefined,
                          }}
                          loading={isCurrentlyLoading}
                          disabled={isSelectingCustomer}
                        >
                          {isCurrentlyLoading ? "กำลังโหลด" : "เลือก"}
                        </Button>
                      </div>
                      {isCurrentlyLoading && (
                        <div
                          style={{
                            marginTop: "12px",
                            height: "2px",
                            background: "#f0f0f0",
                            borderRadius: "1px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              background:
                                "linear-gradient(90deg, #1890ff, #40a9ff, #1890ff)",
                              backgroundSize: "200% 100%",
                              animation:
                                "loading-bar 1.5s ease-in-out infinite",
                            }}
                          />
                        </div>
                      )}
                    </Card>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CustomerSearchModal;
