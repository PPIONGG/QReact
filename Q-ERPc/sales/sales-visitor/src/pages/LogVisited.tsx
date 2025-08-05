import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Typography,
  Table,
  Space,
  Tag,
  Row,
  Col,
  Input,
  Alert,
} from "antd";
import {
  PlusOutlined,
  FileTextOutlined,
  SearchOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSalesVisitorStore } from "../store/sales-visitor";

interface TableDataItem {
  key: string;
  customerCode: string;
  customerName: string;
  dateVisit: string;
  visitorName: string;
  salesCode: string;
  employeeCode: string | null;
  noItem: number;
}

const { Title, Text } = Typography;
const { Search } = Input;

const LogVisited: React.FC = () => {
  const navigate = useNavigate();
  const { fetchListVisited, ListVisited, loading, error, clearError } =
    useSalesVisitorStore();
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const authStorage = sessionStorage.getItem("auth-storage");
    if (authStorage) {
      const parsedAuth = JSON.parse(authStorage);
      fetchListVisited(parsedAuth.state.Salesinfo.data.salesCode);
    }
  }, [fetchListVisited]);

  const navigateToPage = (id?: number) => {
    if (!id) {
      // new visit report
      const hostUrl = `${window.location.origin}${window.location.pathname}#/sales/sales-visitor/new`;
      window.location.hash = `/sales/sales-visitor/new`;
      return;
    } else {
      // edit visit report
      // เปลี่ยน URL ของ Host App
      const hostUrl = `${window.location.origin}${window.location.pathname}#/sales/sales-visitor/edit/${id}`;
      // เปลี่ยน hash ของ browser
      window.location.hash = `/sales/sales-visitor/edit/${id}`;
    }
  };

  // Use API data directly
  const allTableData: TableDataItem[] =
    ListVisited?.data?.map((item, index) => ({
      key: item.noItem ? `item-${item.noItem}` : `item-${index}`,
      customerCode: item.customerCode,
      customerName: item.customerName,
      dateVisit: item.dateVisit,
      visitorName: item.visitorName,
      salesCode: item.salesCode,
      employeeCode: item.employeeCode,
      noItem: item.noItem,
    })) || [];

  // Filter data based on search text
  const tableData = allTableData.filter(
    (item) =>
      item.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.customerCode.toLowerCase().includes(searchText.toLowerCase()) ||
      item.visitorName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.salesCode.toLowerCase().includes(searchText.toLowerCase()) ||
      (item.employeeCode &&
        item.employeeCode.toLowerCase().includes(searchText.toLowerCase()))
  );

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const columns: any[] = [
    {
      title: "Customer Code",
      dataIndex: "customerCode",
      key: "customerCode",
      width: 120,
      // render: (text: string) => <Tag color="blue">{text}</Tag>,
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Customer Name",
      dataIndex: "customerName",
      key: "customerName",
      render: (text: string) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* <FileTextOutlined style={{ marginRight: "8px", color: "#1890ff" }} /> */}
          <Text strong>{text}</Text>
        </div>
      ),
    },
    {
      title: "Visit Date",
      dataIndex: "dateVisit",
      key: "dateVisit",
      width: 150,
      sorter: (a: TableDataItem, b: TableDataItem) =>
        new Date(a.dateVisit).getTime() - new Date(b.dateVisit).getTime(),
      render: (date: string) => (
        <Text>
          {new Date(date).toLocaleDateString("th-TH")}{" "}
          {new Date(date).toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      ),
    },
    {
      title: "Visitor Name",
      dataIndex: "visitorName",
      key: "visitorName",
      width: 150,
      render: (visitorName: string) => <Text>{visitorName || "Unknown"}</Text>,
    },
    {
      title: "Sales Code",
      dataIndex: "salesCode",
      key: "salesCode",
      width: 100,
      // render: (salesCode: string) => <Tag color="green">{salesCode}</Tag>,
      render: (salesCode: string) => <Text strong>{salesCode}</Text>,
    },
    {
      title: "Employee Code",
      dataIndex: "employeeCode",
      key: "employeeCode",
      width: 120,
      render: (employeeCode: string | null) =>
        employeeCode ? (
          <Tag color="orange">{employeeCode}</Tag>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      fixed: "right",
      render: (_: any, record: TableDataItem) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => navigateToPage(record.noItem)}
          >
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "10px" }}>
      <div style={{ marginBottom: "14px" }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              VISITOR LOGS
            </Title>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => navigateToPage()}
              style={{
                borderRadius: "6px",
                height: "40px",
                fontSize: "14px",
              }}
            >
              New Visit Report
            </Button>
          </Col>
        </Row>
      </div>

      {error && (
        <Alert
          message="Error loading data"
          description={error}
          type="error"
          closable
          onClose={clearError}
          style={{ marginBottom: "16px" }}
        />
      )}

      <Card>
        <div style={{ marginBottom: "16px" }}>
          <Row gutter={16}>
            <Col xs={24} sm={12} lg={8}>
              <Search
                placeholder="Search customer name, code, visitor, sales..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                value={searchText}
                onChange={handleSearchChange}
                onSearch={handleSearch}
              />
            </Col>
          </Row>
        </div>
        <Table
          columns={columns}
          dataSource={tableData}
          rowKey="key"
          pagination={{
            total: tableData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items${
                searchText ? ` (filtered from ${allTableData.length})` : ""
              }`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default LogVisited;
