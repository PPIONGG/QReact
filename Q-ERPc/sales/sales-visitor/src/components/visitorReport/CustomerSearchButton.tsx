import React from "react";
import { Button } from "antd";
import { TeamOutlined } from "@ant-design/icons";

interface CustomerSearchButtonProps {
  onClick: () => void;
}

const CustomerSearchButton: React.FC<CustomerSearchButtonProps> = ({ onClick }) => {
  return (
    <div style={{ textAlign: "center", marginBottom: "24px" }}>
      <Button
        type="primary"
        size="large"
        icon={<TeamOutlined />}
        onClick={onClick}
        style={{
          background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
          border: "none",
          borderRadius: "25px",
          height: "50px",
          fontSize: "16px",
          fontWeight: "600",
          padding: "0 40px",
          boxShadow: "0 4px 15px rgba(82, 196, 26, 0.3)",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(82, 196, 26, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 15px rgba(82, 196, 26, 0.3)";
        }}
      >
        ลูกค้าในระบบ
      </Button>
    </div>
  );
};

export default CustomerSearchButton;