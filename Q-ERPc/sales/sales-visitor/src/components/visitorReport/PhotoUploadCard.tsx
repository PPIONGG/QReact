import React from "react";
import { Card, Form, Upload, Typography } from "antd";
import { CameraOutlined } from "@ant-design/icons";

const { Text } = Typography;

const PhotoUploadCard: React.FC = () => {
  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          <CameraOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
          Visit Photos
        </div>
      }
      style={{ marginBottom: "24px" }}
      styles={{ header: { background: "#fafafa" } }}
    >
      <Form.Item name="photos">
        <Upload.Dragger
          multiple
          listType="picture-card"
          accept="image/*"
          fileList={[]}
          style={{
            background: "#fafafa",
            border: "2px dashed #d9d9d9",
            borderRadius: "6px",
          }}
          beforeUpload={() => false}
        >
          <div style={{ padding: "20px", textAlign: "center" }}>
            <CameraOutlined
              style={{
                fontSize: "36px",
                color: "#bfbfbf",
                marginBottom: "12px",
              }}
            />
            <div>
              <Text style={{ fontSize: "14px", color: "#666" }}>
                Click or drag photos here
              </Text>
            </div>
            <div style={{ marginTop: "8px" }}>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Support: JPG, PNG • Max 5MB each
              </Text>
            </div>
          </div>
        </Upload.Dragger>
      </Form.Item>
    </Card>
  );
};

export default PhotoUploadCard;