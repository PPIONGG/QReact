import { Table, Input, Select, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  EllipsisOutlined,
  DeleteOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { memo, useCallback } from "react";
import { EditableNumberCell } from "./EditableNumberCell";
import { EditableDiscountCell } from "./EditableDiscountCell";

export interface POLineItem {
  key: string;
  noLine: number;
  vline: number;
  transactionCode: string;
  transactionDescription: string;
  quantity: number;
  purchaseUnitCode: string;
  unitPriceCurrency: number;
  discount: string;
  unitOptions?: { code: string; t: string }[];
  statusRow: "N" | "E" | "D";
}

interface POLineItemTableProps {
  lineItems: POLineItem[];
  isReadOnly: boolean;
  isLoadingItem: boolean;
  isValidatingDelete?: boolean;
  onLineChange: (key: string, field: keyof POLineItem, value: unknown) => void;
  onDeleteLine: (key: string) => void;
  onUndoDelete: (key: string) => void;
  onOpenProductModal: (key: string) => void;
}

const calculateDiscountPerUnit = (
  discount: string,
  pricePerUnit: number
): number => {
  if (!discount) return 0;
  if (discount.includes("%")) {
    const percent = parseFloat(discount.replace("%", ""));
    return (pricePerUnit * percent) / 100;
  }
  return parseFloat(discount) || 0;
};

export const POLineItemTable = memo(function POLineItemTable({
  lineItems,
  isReadOnly,
  isLoadingItem,
  isValidatingDelete = false,
  onLineChange,
  onDeleteLine,
  onUndoDelete,
  onOpenProductModal,
}: POLineItemTableProps) {

  const handleQuantityChange = useCallback(
    (key: string, value: number) => {
      onLineChange(key, "quantity", value);
    },
    [onLineChange]
  );

  const handleUnitPriceChange = useCallback(
    (key: string, value: number) => {
      onLineChange(key, "unitPriceCurrency", value);
    },
    [onLineChange]
  );

  const handleDiscountChange = useCallback(
    (key: string, value: string) => {
      onLineChange(key, "discount", value);
    },
    [onLineChange]
  );

  const handleUnitChange = useCallback(
    (key: string, value: string) => {
      onLineChange(key, "purchaseUnitCode", value);
    },
    [onLineChange]
  );

  const columns: ColumnsType<POLineItem> = [
    {
      title: "No.",
      key: "vline",
      width: 60,
      align: "center",
      render: (_, record) => {
        if (record.statusRow === "D") {
          return "-";
        }
        return record.vline;
      },
    },
    {
      title: "รหัสสินค้า",
      dataIndex: "transactionCode",
      key: "transactionCode",
      width: 150,
      render: (text, record) => (
        <Input
          value={text}
          placeholder="รหัสสินค้า"
          readOnly
          disabled={record.statusRow === "D"}
          suffix={
            <Button
              type="text"
              icon={<EllipsisOutlined />}
              size="small"
              onClick={() => onOpenProductModal(record.key)}
              disabled={isReadOnly || record.statusRow === "D"}
            />
          }
        />
      ),
    },
    {
      title: "ชื่อสินค้า",
      dataIndex: "transactionDescription",
      key: "transactionDescription",
      width: 250,
      render: (text, record) => (
        <Input
          value={text}
          placeholder="ชื่อสินค้า"
          readOnly
          disabled={record.statusRow === "D"}
        />
      ),
    },
    {
      title: "จำนวน",
      dataIndex: "quantity",
      key: "quantity",
      width: 120,
      align: "right",
      render: (text, record) => (
        <EditableNumberCell
          value={text}
          disabled={isReadOnly || record.statusRow === "D"}
          onChange={(value) => handleQuantityChange(record.key, value)}
        />
      ),
    },
    {
      title: "หน่วย",
      dataIndex: "purchaseUnitCode",
      key: "purchaseUnitCode",
      width: 150,
      render: (text, record) => (
        <Select
          value={text || undefined}
          placeholder="เลือกหน่วย"
          style={{ width: "100%" }}
          disabled={
            isReadOnly || !record.transactionCode || record.statusRow === "D"
          }
          onChange={(value) => handleUnitChange(record.key, value)}
          options={
            record.unitOptions?.map((unit) => ({
              label: unit.t,
              value: unit.code,
            })) || []
          }
          showSearch
          optionFilterProp="label"
          notFoundContent={
            !record.transactionCode ? "กรุณาเลือกสินค้าก่อน" : "ไม่พบข้อมูล"
          }
        />
      ),
    },
    {
      title: "ราคา/หน่วย",
      dataIndex: "unitPriceCurrency",
      key: "unitPriceCurrency",
      width: 150,
      align: "right",
      render: (text, record) => (
        <EditableNumberCell
          value={text}
          disabled={isReadOnly || record.statusRow === "D"}
          onChange={(value) => handleUnitPriceChange(record.key, value)}
        />
      ),
    },
    {
      title: "ส่วนลด/หน่วย",
      dataIndex: "discount",
      key: "discount",
      width: 150,
      align: "right",
      render: (text, record) => {
        const pricePerUnit = record.unitPriceCurrency || 0;
        const hasNoPrice = pricePerUnit <= 0;

        return (
          <EditableDiscountCell
            value={text}
            disabled={isReadOnly || record.statusRow === "D" || hasNoPrice}
            placeholder={hasNoPrice ? "กรอกราคาก่อน" : ""}
            maxValue={pricePerUnit}
            onChange={(value) => handleDiscountChange(record.key, value)}
          />
        );
      },
    },
    {
      title: "ยอดรวม",
      dataIndex: "totalAmountAfterDiscount",
      key: "totalAmountAfterDiscount",
      width: 150,
      align: "right",
      render: (_, record) => {
        const pricePerUnit = record.unitPriceCurrency || 0;
        const quantity = record.quantity || 0;
        const discountPerUnit = calculateDiscountPerUnit(
          record.discount,
          pricePerUnit
        );
        const priceAfterDiscount = pricePerUnit - discountPerUnit;
        const amount = priceAfterDiscount * quantity;

        return (
          <span>
            {amount.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        );
      },
    },
    {
      title: "",
      key: "action",
      width: 60,
      align: "center",
      render: (_, record) => {
        if (isReadOnly) return null;

        if (record.statusRow === "D") {
          return (
            <Button
              type="text"
              icon={<UndoOutlined />}
              onClick={() => onUndoDelete(record.key)}
              title="ยกเลิกการลบ"
            />
          );
        }

        return (
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDeleteLine(record.key)}
            loading={isValidatingDelete}
            disabled={isValidatingDelete}
          />
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={lineItems}
      pagination={false}
      size="small"
      scroll={{ x: 1200 }}
      rowKey="key"
      loading={isLoadingItem}
      rowClassName={(record) =>
        record.statusRow === "D" ? "deleted-row" : ""
      }
    />
  );
});
