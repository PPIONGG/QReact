import React, { useState } from "react";
import {
  Card,
  Form,
  Upload,
  Typography,
  message,
  Button,
  Space,
  Modal,
} from "antd";
import { CameraOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { useSalesVisitorStore } from "../../store/sales-visitor";
import { RcFile } from "antd/es/upload";
import { API_CONFIG } from "../../api/config";

const { Text } = Typography;

interface PhotoUploadCardProps {
  mode?: "new" | "edit";
}

const PhotoUploadCard: React.FC<PhotoUploadCardProps> = ({ mode }) => {
  const {
    uploadSingleImage,
    removeUploadedImage,
    uploadedImage,
    uploadLoading,
    uploadError,
    currentUploadProgress,
    clearUploadError,
    getFilenameForSave,
  } = useSalesVisitorStore();

  // State สำหรับจัดการรูปภาพเดิม
  const [existingImageUrl, setExistingImageUrl] = React.useState<string | null>(
    null
  );

  // สร้าง full URL สำหรับแสดงรูป
  const createFullUrl = (url: string): string => {
    if (url.startsWith("http")) {
      return url;
    }
    const baseUrl = API_CONFIG.baseUrl;
    return `${baseUrl}${url}`;
  };
  // ตั้งค่ารูпภาพเดิมเมื่อเข้าโหมด edit
  React.useEffect(() => {
    if (mode === "edit") {
      setExistingImageUrl(createFullUrl(uploadedImage?.url || ""));
    }
  }, [mode]);

  // 🔧 เพิ่ม useEffect ใหม่นี้
  React.useEffect(() => {
    if (mode === "edit") {
      setExistingImageUrl(null);
    }
  }, [mode]);

  const hasAnyImage = uploadedImage !== null;

  const handleUpload = async (file: RcFile): Promise<boolean> => {
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("รูปภาพต้องมีขนาดไม่เกิน 5MB!");
      return false;
    }

    const isJpgOrPng =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/jpg";
    if (!isJpgOrPng) {
      message.error("รองรับเฉพาะไฟล์ JPG และ PNG เท่านั้น!");
      return false;
    }

    try {
      clearUploadError();
      // ถ้ามีรูปเดิมให้ลบทิ้งก่อน (เพราะรับทีละรูป)
      if (existingImageUrl) {
        setExistingImageUrl(null);
      }

      const result = await uploadSingleImage(file);
      message.success(`${file.name} อัปโหลดสำเร็จ!`);
      return false;
    } catch (error) {
      console.error("❌ Upload error:", error);
      message.error(`อัปโหลด ${file.name} ล้มเหลว`);
      return false;
    }
  };

  const handleRemove = () => {
    removeUploadedImage();
    message.success("ลบรูปภาพแล้ว");
  };

  const handleRemoveExisting = () => {
    setExistingImageUrl(null);
    message.success("ลบรูปภาพเดิมแล้ว");
  };

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const handlePreview = (url: string) => {
    setPreviewImage(url);
    setPreviewVisible(true);
  };

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
            <CameraOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
            Visit Photos
          </div>
        </div>
      }
      style={{ marginBottom: "24px" }}
      styles={{ header: { background: "#fafafa" } }}
    >
      {/* แสดง Error */}
      {uploadError && (
        <div
          style={{
            marginBottom: "16px",
            padding: "8px 12px",
            background: "#fff2f0",
            border: "1px solid #ffccc7",
            borderRadius: "6px",
            color: "#cf1322",
          }}
        >
          <Text type="danger">Error: {uploadError}</Text>
        </div>
      )}

      {/* แสดง Loading */}
      {uploadLoading && (
        <div
          style={{
            marginBottom: "16px",
            padding: "8px 12px",
            background: "#e6f7ff",
            border: "1px solid #91d5ff",
            borderRadius: "6px",
            color: "#1890ff",
          }}
        >
          <Text>กำลังอัपโหลด... {currentUploadProgress}%</Text>
        </div>
      )}

      {/* แสดงรูปภาพเดิม (ถ้ามี) */}
      {existingImageUrl && (
        <div style={{ marginBottom: "16px" }}>
          <Text
            strong
            style={{ display: "block", marginBottom: "12px", color: "#1890ff" }}
          >
            รูปภาพจากข้อมูลเดิม:
          </Text>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px",
              border: "1px solid #e6f7ff",
              borderRadius: "8px",
              marginBottom: "8px",
              background: "#f6ffed",
              transition: "box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* รูปภาพ thumbnail */}
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "6px",
                overflow: "hidden",
                border: "1px solid #d9d9d9",
                flexShrink: 0,
              }}
            >
              <img
                src={existingImageUrl}
                alt="Existing image"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>

            {/* ข้อมูลไฟล์ */}
            <div
              style={{
                flex: 1,
                marginLeft: "12px",
                minWidth: 0,
              }}
            >
              <div
                style={{
                  fontWeight: "500",
                  fontSize: "14px",
                  marginBottom: "4px",
                }}
              >
                รูปภาพจากฐานข้อมูล
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginBottom: "2px",
                }}
              >
                <span style={{ color: "#1890ff" }}>📁 จากข้อมูลเดิม</span>
              </div>
            </div>

            {/* ปุ่มจัดการ */}
            <Space size="small">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handlePreview(existingImageUrl)}
                style={{ color: "#1890ff" }}
                title="ดูรูปภาพ"
              />
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                onClick={handleRemoveExisting}
                danger
                title="ลบรูปภาพเดิม"
                disabled={uploadLoading}
              />
            </Space>
          </div>
        </div>
      )}

      {/* รายการรูปภาพใหม่ที่อัปโหลดแล้ว - Compact List Style */}
      {uploadedImage && (
        <div style={{ marginBottom: "16px" }}>
          <Text
            strong
            style={{ display: "block", marginBottom: "12px", color: "#52c41a" }}
          >
            รูปภาพที่อัปโหลดแล้ว:
          </Text>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px",
              border: "1px solid #f0f0f0",
              borderRadius: "8px",
              marginBottom: "8px",
              background: "#fafafa",
              transition: "box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* รูปภาพ thumbnail */}
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "6px",
                overflow: "hidden",
                border: "1px solid #d9d9d9",
                flexShrink: 0,
              }}
            >
              <img
                src={createFullUrl(uploadedImage.url)}
                alt={uploadedImage.originalName}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            {/* ข้อมูลไฟล์ */}
            <div
              style={{
                flex: 1,
                marginLeft: "12px",
                minWidth: 0,
                cursor: "pointer",
              }}
              onClick={() => handlePreview(createFullUrl(uploadedImage.url))}
            >
              <div
                style={{
                  fontWeight: "500",
                  fontSize: "14px",
                  marginBottom: "4px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {uploadedImage.originalName}
              </div>
              <div
                style={{ fontSize: "12px", color: "#666", marginBottom: "2px" }}
              >
                <span style={{ color: "#52c41a" }}>✅ อัปโหลดสำเร็จ</span>
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: "#999",
                  fontFamily: "monospace",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={uploadedImage.filename}
              >
                {uploadedImage.filename}
              </div>
            </div>

            {/* ปุ่มจัดการ */}
            <Space size="small">
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                onClick={handleRemove}
                danger
                title="ลบรูปภาพ"
                disabled={uploadLoading}
              />
            </Space>
          </div>
        </div>
      )}

      {/* Upload Area - แสดงเฉพาะเมื่อไม่มีรูปใดๆ */}
      {!hasAnyImage && (
        <Form.Item name="photos">
          <Upload.Dragger
            accept="image/*"
            fileList={[]}
            beforeUpload={handleUpload}
            disabled={uploadLoading}
            style={{
              background: uploadLoading ? "#f5f5f5" : "#fafafa",
              border: "2px dashed #d9d9d9",
              borderRadius: "8px",
              minHeight: "100px",
            }}
          >
            <div style={{ padding: "20px", textAlign: "center" }}>
              <CameraOutlined
                style={{
                  fontSize: "32px",
                  color: uploadLoading ? "#bfbfbf" : "#1890ff",
                  marginBottom: "12px",
                }}
              />
              <div>
                <Text
                  style={{
                    fontSize: "14px",
                    color: uploadLoading ? "#999" : "#666",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  {uploadLoading ? "กำลังอัปโหลด..." : "เพิ่มรูปภาพ"}
                </Text>
                <Text
                  style={{
                    fontSize: "14px",
                    color: uploadLoading ? "#999" : "#666",
                  }}
                >
                  Click or drag photo here
                </Text>
              </div>
              <div style={{ marginTop: "8px" }}>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Support: JPG, PNG • Max 5MB • One photo only
                </Text>
              </div>
            </div>
          </Upload.Dragger>
        </Form.Item>
      )}
      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        centered
        width="80%"
        styles={{
          body: {
            padding: "20px",
            textAlign: "center",
            maxHeight: "80vh",
            overflow: "auto",
          },
        }}
      >
        <img
          src={previewImage}
          style={{
            maxWidth: "100%",
            maxHeight: "70vh", // จำกัดความสูงไม่ให้เกิน 70% ของหน้าจอ
            height: "auto",
            width: "auto",
            objectFit: "contain", // รักษาสัดส่วนไม่ให้บิดเบี้ยว
            display: "block",
            margin: "0 auto",
          }}
        />
      </Modal>
    </Card>
  );
};

export default PhotoUploadCard;
