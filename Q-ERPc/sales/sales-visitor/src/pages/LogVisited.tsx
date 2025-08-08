import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Typography,
  Table,
  Space,
  Row,
  Col,
  Input,
  Alert,
} from "antd";
import { PlusOutlined, SearchOutlined, EditOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next"; // ⭐ เพิ่ม import
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
  const { t } = useTranslation("sales-visitor");

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
      const hostUrl = `${window.location.origin}${window.location.pathname}#/sales/sales-visitor/new`;
      window.location.hash = `/sales/sales-visitor/new`;
      return;
    } else {
      const hostUrl = `${window.location.origin}${window.location.pathname}#/sales/sales-visitor/edit/${id}`;
      window.location.hash = `/sales/sales-visitor/edit/${id}`;
    }
  };

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

  // ⭐ แก้ไข columns ให้ใช้ translation
  const columns: ColumnsType<TableDataItem> = [
    {
      title: t("customerCode"),
      dataIndex: "customerCode",
      key: "customerCode",
      width: 120,
      render: (text: string) => <Text strong>{text || "-"}</Text>,
    },
    // {
    //   title: t("customerName"),
    //   dataIndex: "customerName",
    //   key: "customerName",
    //   render: (text: string) => (
    //     <div style={{ display: "flex", alignItems: "center" }}>
    //       <Text>{text}</Text>
    //     </div>
    //   ),
    // },
    {
      title: t("customerName"),
      dataIndex: "customerName",
      key: "customerName",
      render: (text: string, record: TableDataItem) => {
        // สร้างชื่อลูกค้าแบบเต็ม
        const prefix = record.customerPrefix || "";
        const name = record.customerName || text || "";
        const suffix = record.customerSuffix || "";

        const fullCustomerName = `${prefix} ${name} ${suffix}`
          .trim()
          .replace(/\s+/g, " ");

        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Text>{fullCustomerName}</Text>
          </div>
        );
      },
    },
    {
      title: t("visitDate"),
      dataIndex: "dateVisit",
      key: "dateVisit",
      width: 150,
      sorter: (a: TableDataItem, b: TableDataItem) =>
        compareDates(a.dateVisit, b.dateVisit),
      render: (date: string | Date | null) => (
        <Text type={date ? undefined : "secondary"}>{formatDate(date)}</Text>
      ),
    },
    {
      title: t("lastUpdated"),
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
      title: t("createdDate"),
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
      title: t("visitorName"),
      dataIndex: "visitorName",
      key: "visitorName",
      width: 150,
      render: (visitorName: string) => (
        <Text>{visitorName || t("unknown")}</Text>
      ),
    },
    {
      title: t("salesCode"),
      dataIndex: "salesCode",
      key: "salesCode",
      width: 100,
      render: (salesCode: string) => <Text>{salesCode}</Text>,
    },
    {
      title: t("employeeCode"),
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
      title: t("actions"),
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
            {t("edit")}
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
              {t("visitorLogs")}
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
              {t("createVisitReport")}
            </Button>
          </Col>
        </Row>
      </div>
      {error && (
        <Alert
          message={t("errorLoadingData")}
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
                placeholder={t("search")}
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
              `${range[0]}-${range[1]} ${t("totalItems")} ${total} ${t(
                "items"
              )}${
                searchText ? ` (${t("filtered")} ${allTableData.length})` : ""
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
