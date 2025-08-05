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
  SearchOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useSalesVisitorStore } from "../store/sales-visitor";
import { useWindowSize } from "../hooks/useWindowSize";
import { ColumnsType } from "antd/es/table";
import { ListVisitedItem } from "../types/api";
import { compareDates, formatDate, formatDateTime } from "../utils/dateUtils";

interface TableDataItem extends ListVisitedItem {
  key: string;
}

const { Title, Text } = Typography;
const { Search } = Input;

const portalHeaderHeight = 64;
const headervisorHeight = 316;

const LogVisited: React.FC = () => {
  const windowSize = useWindowSize();
  const testHeight =
    windowSize.height - (headervisorHeight + portalHeaderHeight);

  const { fetchListVisited, ListVisited, loading, error, clearError } =
    useSalesVisitorStore();
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const authStorage = sessionStorage.getItem("auth-storage");
    if (authStorage) {
      const parsedAuth = JSON.parse(authStorage);

      const salesCode = parsedAuth?.state?.Salesinfo?.data?.salesCode;
      if (salesCode) {
        fetchListVisited(salesCode);
      }
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
      lastUpdated: item.lastUpdated,
      createdDate: item.createdDate,
      customerPrefix: item.customerPrefix,
      customerSuffix: item.customerSuffix,
      recStatus: item.recStatus,
    })) || [];

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

  const columns: ColumnsType<TableDataItem> = [
    {
      title: "Customer Code",
      dataIndex: "customerCode",
      key: "customerCode",
      width: 120,
      // render: (text: string) => <Tag color="blue">{text}</Tag>,
      render: (text: string) => <Text strong>{text || "-"}</Text>,
    },
    {
      title: "Customer Name",
      dataIndex: "customerName",
      key: "customerName",
      render: (text: string) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Text>{text}</Text>
        </div>
      ),
    },
    {
      title: "Visit Date",
      dataIndex: "dateVisit",
      key: "dateVisit",
      width: 150,
      sorter: (a: TableDataItem, b: TableDataItem) =>
        compareDates(a.lastUpdated, b.lastUpdated),
      render: (date: string | Date | null) => (
        <Text type={date ? undefined : "secondary"}>{formatDate(date)}</Text>
      ),
    },
    {
      title: "Last Updated",
      dataIndex: "lastUpdated",
      key: "lastUpdated",
      width: 150,
      align: "center",
      sorter: (a: TableDataItem, b: TableDataItem) =>
        compareDates(a.lastUpdated, b.lastUpdated),
      render: (date: string | Date | null) => (
        <Text type={date ? undefined : "secondary"}>
          {formatDateTime(date)}
        </Text>
      ),
    },
    {
      title: "Created Date",
      dataIndex: "createdDate",
      key: "createdDate",
      width: 150,
      align: "center",
      sorter: (a: TableDataItem, b: TableDataItem) =>
        compareDates(a.createdDate, b.createdDate),
      render: (date: string | Date | null) => (
        <Text type={date ? undefined : "secondary"}>
          {formatDateTime(date)}
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
      render: (salesCode: string) => <Text>{salesCode}</Text>,
    },
    {
      title: "Employee Code",
      dataIndex: "employeeCode",
      key: "employeeCode",
      width: 120,
      render: (employeeCode: string | null) =>
        employeeCode ? (
          <Text>{employeeCode}</Text>
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
              icon={<PlusOutlined />}
              onClick={() => navigateToPage()}
              style={{
                borderRadius: "6px",
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
          scroll={{ x: 1200, y: testHeight }}
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default LogVisited;
