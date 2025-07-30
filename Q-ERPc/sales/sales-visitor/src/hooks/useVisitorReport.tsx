import { useEffect, useRef, useState } from "react";
import { Form, message, Modal, notification } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useSalesVisitorStore } from "../store/sales-visitor";
import { VisitorFormData } from "../types";
import dayjs from "dayjs";
import { CheckCircleOutlined, ExclamationCircleOutlined, SaveOutlined } from "@ant-design/icons";

export const useVisitorReport = (mode: "new" | "edit") => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [isCustomerModalVisible, setIsCustomerModalVisible] = useState(false);

  const originalFormData = useRef<any>(null);

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
    clearCustomerDetails,
    clearListAllCustomer,
  } = useSalesVisitorStore();

  // Initial data loading
  useEffect(() => {
    if (mode === "edit" && id) {
      fetchVisitDetail(id);
    }
    return () => {
      if (mode === "edit") {
        clearVisitDetail();
      }
      clearCustomerDetails();
      clearListAllCustomer();
    };
  }, [mode, id, fetchVisitDetail, clearVisitDetail]);

  // Populate form for edit mode
  useEffect(() => {
    if (mode === "edit" && visitDetail?.status && visitDetail.data) {
      const data = visitDetail.data;
      const formData = {
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
      };
      
      form.setFieldsValue(formData);
      
      // เก็บข้อมูลต้นฉบับสำหรับเปรียบเทียบ
      originalFormData.current = {
        ...formData,
        visitDate: data.dateVisit ? dayjs(data.dateVisit).format("YYYY-MM-DD") : null,
      };
    }
  }, [visitDetail, mode, form]);

  // Handle save errors
  useEffect(() => {
    if (saveError) {
      notification.error({
        message: "Error",
        description: saveError,
        placement: "topRight",
        duration: 4,
      });
      clearSaveError();
    }
  }, [saveError, clearSaveError]);

  const handleCustomerModalOpen = () => {
    setIsCustomerModalVisible(true);
  };

  const handleCustomerModalClose = () => {
    setIsCustomerModalVisible(false);
  };

  const handleCustomerSelect = (customerData: any) => {
    form.setFieldsValue({
      customerCode: customerData.customerCode,
      customerName: customerData.customerName,
      contactPerson: customerData.contactPerson || "",
      tel: customerData.tel || "",
      email: customerData.email || "",
      address: customerData.address || "",
      salesClose: "",
      note: "",
      businessDetails: "",
      status: "",
    });

    message.success({
      content: "เลือกลูกค้าเรียบร้อยแล้ว",
      duration: 2,
    });
  };

   const hasFormChanges = () => {
    const currentFormData = form.getFieldsValue();
    
    if (mode === "new") {
      // สำหรับ new mode: เช็คว่ามีข้อมูลอะไรบ้างไหม
      return Object.values(currentFormData).some(
        (value) => value !== undefined && value !== null && value !== ""
      );
    } else {
      // สำหรับ edit mode: เปรียบเทียบกับข้อมูลต้นฉบับ
      if (!originalFormData.current) return false;
      
      const original = originalFormData.current;
      
      // แปลง visitDate เป็น string เพื่อเปรียบเทียบ
      const currentDateString = currentFormData.visitDate 
        ? dayjs.isDayjs(currentFormData.visitDate)
          ? currentFormData.visitDate.format("YYYY-MM-DD")
          : currentFormData.visitDate
        : null;
      
      const fieldsToCompare = [
        { current: currentDateString, original: original.visitDate },
        { current: currentFormData.visitor || "", original: original.visitor || "" },
        { current: currentFormData.customerCode || "", original: original.customerCode || "" },
        { current: currentFormData.customerName || "", original: original.customerName || "" },
        { current: currentFormData.contactPerson || "", original: original.contactPerson || "" },
        { current: currentFormData.tel || "", original: original.tel || "" },
        { current: currentFormData.email || "", original: original.email || "" },
        { current: currentFormData.address || "", original: original.address || "" },
        { current: currentFormData.salesClose || "", original: original.salesClose || "" },
        { current: currentFormData.note || "", original: original.note || "" },
        { current: currentFormData.businessDetails || "", original: original.businessDetails || "" },
        { current: currentFormData.status || "", original: original.status || "" },
      ];
      
      return fieldsToCompare.some(field => field.current !== field.original);
    }
  };

  const handleGoBack = () => {
    const hasChanges = hasFormChanges();
    
  if (hasChanges) {
    Modal.confirm({
      title: mode === "new" ? "Discard Changes?" : "Discard Changes?",
      icon: <ExclamationCircleOutlined />,
      content: mode === "new" 
        ? "You have unsaved changes. Are you sure you want to leave?"
        : "You have unsaved changes. Are you sure you want to leave without saving?",
      okText: "Yes, Leave",
      okType: "danger",
      cancelText: "Stay",
      onOk() {
        navigate("/sales/sales-visitor");
      },
    });
  } else {
    navigate("/sales/sales-visitor");
  }
  };

//   const handleSave = async () => {
//   try {
//     const values: VisitorFormData = await form.validateFields();
    
//     Modal.confirm({
//       title: mode === "new" ? "Create New Report?" : "Update Report?",
//       icon: <SaveOutlined style={{ color: "#52c41a" }} />,
//       content: mode === "new"
//         ? "คุณต้องการสร้างรายงานการเยี่ยมลูกค้าใหม่หรือไม่?"
//         : "คุณต้องการอัปเดตรายงานการเยี่ยมลูกค้านี้หรือไม่?",
//       okText: mode === "new" ? "Create Report" : "Update Report",
//       okType: "primary",
//       cancelText: "Cancel",
//       centered: true,
//       okButtonProps: {
//         style: { background: "#52c41a", borderColor: "#52c41a" },
//         icon: <SaveOutlined />,
//       },
//       async onOk() {
//         const authStorage = sessionStorage.getItem("auth-storage");
//         const parsedAuth = authStorage ? JSON.parse(authStorage) : null;
        
//         const requestBody = {
//           userName: parsedAuth?.state?.user?.username || "",
//           data: {
//             noItem: mode === "edit" && visitDetail?.data?.noItem ? visitDetail.data.noItem : 0,
//             customerCode: values.customerCode || "",
//             companyName: values.customerName || "",
//             visitorName: values.visitor || "",
//             dateVisit: values.visitDate
//               ? dayjs.isDayjs(values.visitDate)
//                 ? values.visitDate.format("YYYY-MM-DD")
//                 : values.visitDate
//               : "",
//             contactPerson: values.contactPerson || "",
//             tel: values.tel || "",
//             email: values.email || "",
//             address: values.address || "",
//             objective: "",
//             status: values.status || "",
//             note: values.note || "",
//             note2: values.businessDetails || "",
//             salesClose: values.salesClose || "",
//             latitude: 0,
//             longitude: 0,
//             currentLocation: "",
//             issuedStatusWithdraw: true,
//             salesCode: mode === "edit" && visitDetail?.data?.salesCode 
//               ? visitDetail.data.salesCode 
//               : parsedAuth?.state?.Salesinfo?.data?.salesCode || "",
//             salesName: mode === "edit" && visitDetail?.data?.salesName 
//               ? visitDetail.data.salesName 
//               : parsedAuth?.state?.Salesinfo?.data?.nameThai || "",
//             employeeCode: mode === "edit" && visitDetail?.data?.employeeCode 
//               ? visitDetail.data.employeeCode 
//               : parsedAuth?.state?.Salesinfo?.data?.employeeCode || "",
//             imageFilePatch: mode === "edit" && visitDetail?.data?.imageFilePatch 
//               ? visitDetail.data.imageFilePatch 
//               : "",
//             isUpdateImage: mode === "edit",
//           },
//         };

//         try {
//           const apiMode = mode === "new" ? "create" : "update";
//           const response = await saveVisitReport(requestBody, apiMode);

//           if (response.status) {
//             if (mode === "new") {
//               form.resetFields();
//               message.success("New visit report created successfully!");
//             } else {
//               message.success("Visit report updated successfully!");
//               // อัปเดตข้อมูลต้นฉบับ
//               originalFormData.current = {
//                 ...form.getFieldsValue(),
//                 visitDate: values.visitDate
//                   ? dayjs.isDayjs(values.visitDate)
//                     ? values.visitDate.format("YYYY-MM-DD")
//                     : values.visitDate
//                   : null,
//               };
//             }

//             setTimeout(() => {
//               navigate("/sales/sales-visitor");
//             }, 1000);
//           } else {
//             message.error(response.message || "Failed to save visit report");
//           }
//         } catch (error) {
//           message.error("Failed to save visit report");
//         }
//       },
//     });
//   } catch (validationError) {
//     message.warning("Please fill in all required fields");
//   }
// };

const handleSave = async () => {
  try {
    const values: VisitorFormData = await form.validateFields();
    showSaveConfirmation(values);
  } catch (validationError) {
    message.warning({
      content: "Please fill in all required fields",
      duration: 3,
    });
  }
};

const showSaveConfirmation = (values: VisitorFormData) => {
  const title = mode === "new" ? "Create New Report?" : "Update Report?";
  const content = mode === "new"
    ? "คุณต้องการสร้างรายงานการเยี่ยมลูกค้าใหม่หรือไม่?"
    : "คุณต้องการอัปเดตรายงานการเยี่ยมลูกค้านี้หรือไม่?";
  
  Modal.confirm({
    title: (
      <div style={{ display: "flex", alignItems: "center" }}>
        <SaveOutlined 
          style={{ 
            color: "#52c41a", 
            marginRight: "8px", 
            fontSize: "16px" 
          }} 
        />
        <span style={{ color: "#1f2937", fontWeight: "600" }}>
          {title}
        </span>
      </div>
    ),
    content: (
      <div style={{ padding: "8px 0" }}>
        <p style={{ 
          margin: 0, 
          color: "#6b7280", 
          fontSize: "14px",
          lineHeight: "1.5" 
        }}>
          {content}
        </p>
      </div>
    ),
    okText: mode === "new" ? "Create Report" : "Update Report",
    okType: "primary",
    cancelText: "Cancel",
    centered: true,
    width: 420,
    okButtonProps: {
      style: {
        background: "#52c41a",
        borderColor: "#52c41a",
        height: "36px",
        borderRadius: "6px",
        fontWeight: "500",
      },
      icon: <SaveOutlined />,
    },
    cancelButtonProps: {
      style: {
        height: "36px",
        borderRadius: "6px",
      },
    },
    styles: {
      header: {
        borderBottom: "1px solid #f0f0f0",
        paddingBottom: "16px",
      },
    },
    onOk() {
      return performSave(values);
    },
  });
};

const performSave = async (values: VisitorFormData) => {
  const authStorage = sessionStorage.getItem("auth-storage");
  const parsedAuth = authStorage ? JSON.parse(authStorage) : null;
  
  const requestBody = {
    userName: parsedAuth?.state?.user?.username || "",
    data: {
      noItem: mode === "edit" && visitDetail?.data?.noItem ? visitDetail.data.noItem : 0,
      customerCode: values.customerCode || "",
      companyName: values.customerName || "",
      visitorName: values.visitor || "",
      dateVisit: values.visitDate
        ? dayjs.isDayjs(values.visitDate)
          ? values.visitDate.format("YYYY-MM-DD")
          : values.visitDate
        : "",
      contactPerson: values.contactPerson || "",
      tel: values.tel || "",
      email: values.email || "",
      address: values.address || "",
      objective: "",
      status: values.status || "",
      note: values.note || "",
      note2: values.businessDetails || "",
      salesClose: values.salesClose || "",
      latitude: 0,
      longitude: 0,
      currentLocation: "",
      issuedStatusWithdraw: true,
      salesCode: mode === "edit" && visitDetail?.data?.salesCode 
        ? visitDetail.data.salesCode 
        : parsedAuth?.state?.Salesinfo?.data?.salesCode || "",
      salesName: mode === "edit" && visitDetail?.data?.salesName 
        ? visitDetail.data.salesName 
        : parsedAuth?.state?.Salesinfo?.data?.nameThai || "",
      employeeCode: mode === "edit" && visitDetail?.data?.employeeCode 
        ? visitDetail.data.employeeCode 
        : parsedAuth?.state?.Salesinfo?.data?.employeeCode || "",
      imageFilePatch: mode === "edit" && visitDetail?.data?.imageFilePatch 
        ? visitDetail.data.imageFilePatch 
        : "",
      isUpdateImage: mode === "edit",
    },
  };

  try {
    const apiMode = mode === "new" ? "create" : "update";
    const response = await saveVisitReport(requestBody, apiMode);

    if (response.status) {
      if (mode === "new") {
        form.resetFields();
        message.success({
          content: "New visit report created successfully!",
          icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
          duration: 3,
        });
      } else {
        message.success({
          content: "Visit report updated successfully!",
          icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
          duration: 3,
        });
        
        // อัปเดตข้อมูลต้นฉบับหลังจาก save สำเร็จ
        const currentFormData = form.getFieldsValue();
        originalFormData.current = {
          ...currentFormData,
          visitDate: currentFormData.visitDate
            ? dayjs.isDayjs(currentFormData.visitDate)
              ? currentFormData.visitDate.format("YYYY-MM-DD")
              : currentFormData.visitDate
            : null,
        };
      }

      // Smooth transition กลับหน้าหลัก
      setTimeout(() => {
        navigate("/sales/sales-visitor");
      }, 1200);
    } else {
      message.error({
        content: response.message || "Failed to save visit report",
        duration: 4,
      });
    }
  } catch (error) {
    console.error("Save error:", error);
    message.error({
      content: "Failed to save visit report. Please try again.",
      duration: 4,
    });
  }
};

  return {
    form,
    isCustomerModalVisible,
    visitDetail,
    detailLoading,
    detailError,
    saveLoading,
    handleCustomerModalOpen,
    handleCustomerModalClose,
    handleCustomerSelect,
    handleGoBack,
    handleSave,
    clearDetailError,
    fetchVisitDetail,
  };
};
