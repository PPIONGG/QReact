import { useEffect, useRef, useState } from "react";
import { Form, message, notification } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSalesVisitorStore } from "../store/sales-visitor";
import { VisitorFormData } from "../types";
import dayjs from "dayjs";
import {
  CheckCircleOutlined,
} from "@ant-design/icons";

export const useVisitorReport = (mode: "new" | "edit") => {
  const { t } = useTranslation('sales-visitor');
  
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [isCustomerModalVisible, setIsCustomerModalVisible] = useState(false);

  // ⭐ เพิ่ม state สำหรับ custom modals
  const [isBackConfirmVisible, setIsBackConfirmVisible] = useState(false);
  const [isSaveConfirmVisible, setIsSaveConfirmVisible] = useState(false);
  const [pendingSaveData, setPendingSaveData] = useState<VisitorFormData | null>(null);

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
    uploadedImage,
    clearUploadedImage,
    clearUploadError,
    getFilenameForSave,
    setExistingImageAsUploaded,
  } = useSalesVisitorStore();

  // ⭐ useEffect สำหรับ set default visitor name
  useEffect(() => {
    if (mode === "new") {
      const authStorage = sessionStorage.getItem("auth-storage");
      if (authStorage) {
        try {
          const parsedAuth = JSON.parse(authStorage);
          const visitorName = parsedAuth?.state?.Salesinfo?.data?.nameThai;

          if (visitorName) {
            form.setFieldsValue({
              visitor: visitorName,
            });
          }
        } catch (error) {
          console.error("Error parsing auth storage:", error);
        }
      }
    }
  }, [mode, form]);

  // Initial data loading และ cleanup
  useEffect(() => {
    if (mode === "edit" && id) {
      fetchVisitDetail(id);
    }

    // Cleanup function
    return () => {
      if (mode === "edit") {
        clearVisitDetail();
      }
      clearCustomerDetails();
      clearListAllCustomer();
      clearUploadedImage();
      clearUploadError();
    };
  }, [
    mode,
    id,
    fetchVisitDetail,
    clearVisitDetail,
    clearCustomerDetails,
    clearListAllCustomer,
    clearUploadedImage,
    clearUploadError,
  ]);

  // Populate form for edit mode
  useEffect(() => {
    if (mode === "edit" && visitDetail?.status && visitDetail.data) {
      const data = visitDetail.data;
      const formData = {
        visitDate: data.dateVisit ? dayjs(data.dateVisit) : null,
        visitor: data.visitorName,
        customerCode: data.customerCode,
        customerName: [
          data.customerPrefix,
          data.companyName,
          data.customerSuffix,
        ]
          .filter(Boolean)
          .join(" ")
          .trim(),        
        contactPerson: data.contactPerson,
        tel: data.tel,
        email: data.email,
        address: data.address,
        salesClose: data.salesClose,
        note: data.note,
        businessDetails: data.note2,
        status: data.status,
        customerPrefix : data.customerPrefix || null,
        customerSuffix : data.customerSuffix || null,
      };

      form.setFieldsValue(formData);

      // เก็บข้อมูลต้นฉบับสำหรับเปรียบเทียบ
      originalFormData.current = {
        ...formData,
        visitDate: data.dateVisit
          ? dayjs(data.dateVisit).format("YYYY-MM-DD")
          : null,
      };

      if (data.imageFilePatch) {
        const existingImageObj = {
          filename: data.imageFilePatch.split("/").pop() || "",
          url: data.imageFilePatch,
          originalName: t('imageFromDatabase'),
          size: 0,
        };
        setExistingImageAsUploaded(existingImageObj);
      }
    }
  }, [visitDetail, mode, form, t, setExistingImageAsUploaded]);

  // Handle save errors
  useEffect(() => {
    if (saveError) {
      notification.error({
        message: t('error'),
        description: saveError,
        placement: "topRight",
        duration: 4,
      });
      clearSaveError();
    }
  }, [saveError, clearSaveError, t]);

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
      customerPrefix: customerData.customerPrefix,
      customerSuffix: customerData.customerSuffix,
    });

    clearUploadedImage();
    clearUploadError();

    message.success({
      content: t('customerSelectedSuccess'),
      duration: 2,
    });
  };

  const hasFormChanges = () => {
    const currentFormData = form.getFieldsValue();

    if (mode === "new") {
      // สำหรับ new mode: เช็คว่ามีข้อมูลหรือรูปภาพไหม
      const hasFormData = Object.values(currentFormData).some(
        (value) => value !== undefined && value !== null && value !== ""
      );
      const hasPhotos = uploadedImage !== null;

      return hasFormData || hasPhotos;
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
        {
          current: currentFormData.visitor || "",
          original: original.visitor || "",
        },
        {
          current: currentFormData.customerCode || "",
          original: original.customerCode || "",
        },
        {
          current: currentFormData.customerName || "",
          original: original.customerName || "",
        },
        {
          current: currentFormData.contactPerson || "",
          original: original.contactPerson || "",
        },
        { current: currentFormData.tel || "", original: original.tel || "" },
        {
          current: currentFormData.email || "",
          original: original.email || "",
        },
        {
          current: currentFormData.address || "",
          original: original.address || "",
        },
        {
          current: currentFormData.salesClose || "",
          original: original.salesClose || "",
        },
        { current: currentFormData.note || "", original: original.note || "" },
        {
          current: currentFormData.businessDetails || "",
          original: original.businessDetails || "",
        },
        {
          current: currentFormData.status || "",
          original: original.status || "",
        },
      ];

      const hasFormChanges = fieldsToCompare.some(
        (field) => field.current !== field.original
      );

      const hasPhotoChanges = uploadedImage !== null;

      return hasFormChanges || hasPhotoChanges;
    }
  };

  // ⭐ ปรับปรุง handleGoBack ให้ใช้ custom modal
  const handleGoBack = () => {
    const hasChanges = hasFormChanges();

    if (hasChanges) {
      setIsBackConfirmVisible(true);
    } else {
      form.resetFields();
      clearUploadedImage();
      clearUploadError();
      navigate("/sales/sales-visitor");
    }
  };

  // ⭐ handler สำหรับ back confirm modal
  const handleBackConfirm = () => {
    form.resetFields();
    clearUploadedImage();
    clearUploadError();
    navigate("/sales/sales-visitor");
    setIsBackConfirmVisible(false);
  };

  const handleBackCancel = () => {
    setIsBackConfirmVisible(false);
  };

  // ⭐ ปรับปรุง handleSave ให้ใช้ custom modal
  const handleSave = async () => {
    try {
      const values: VisitorFormData = await form.validateFields();
      setPendingSaveData(values);
      setIsSaveConfirmVisible(true);
    } catch (validationError) {
      message.warning({
        content: t('pleaseCompleteAllFields'),
        duration: 3,
      });
    }
  };

  // ⭐ handler สำหรับ save confirm modal
  const handleSaveConfirm = async () => {
    if (pendingSaveData) {
      setIsSaveConfirmVisible(false);
      await performSave(pendingSaveData);
      setPendingSaveData(null);
    }
  };

  const handleSaveCancel = () => {
    setIsSaveConfirmVisible(false);
    setPendingSaveData(null);
  };

  const performSave = async (values: VisitorFormData) => {
    const authStorage = sessionStorage.getItem("auth-storage");
    const parsedAuth = authStorage ? JSON.parse(authStorage) : null;

    const photoFilenames = getFilenameForSave();

    const requestBody = {
      userName: parsedAuth?.state?.user?.username || "",
      data: {
        noItem:
          mode === "edit" && visitDetail?.data?.noItem
            ? visitDetail.data.noItem
            : 0,
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
        salesCode:
          mode === "edit" && visitDetail?.data?.salesCode
            ? visitDetail.data.salesCode
            : parsedAuth?.state?.Salesinfo?.data?.salesCode || "",
        salesName:
          mode === "edit" && visitDetail?.data?.salesName
            ? visitDetail.data.salesName
            : parsedAuth?.state?.Salesinfo?.data?.nameThai || "",
        employeeCode:
          mode === "edit" && visitDetail?.data?.employeeCode
            ? visitDetail.data.employeeCode
            : parsedAuth?.state?.Salesinfo?.data?.employeeCode || "",
        imageFilePatch: photoFilenames || "",
        isUpdateImage: mode === "edit" || photoFilenames ? true : false,
        isDeleteImage: mode === "edit" && !photoFilenames ? true : false,
        customerPrefix: values.customerPrefix || null,
        customerSuffix: values.customerSuffix || null,
        salesPrefix: null,
        salesSuffix: null,
      },
    };

    try {
      const apiMode = mode === "new" ? "create" : "update";
      const response = await saveVisitReport(requestBody, apiMode);

      if (response.status) {
        if (mode === "new") {
          form.resetFields();
          clearUploadedImage();
          message.success({
            content: t('newReportCreatedSuccess'),
            icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
            duration: 3,
          });
        } else {
          message.success({
            content: t('reportUpdatedSuccess'),
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
          clearUploadedImage();
          form.resetFields();
        }

        navigate("/sales/sales-visitor");

      } else {
        message.error({
          content: response.message || t('saveReportFailed'),
          duration: 4,
        });
      }
    } catch (error) {
      console.error("Save error:", error);
      message.error({
        content: t('saveReportFailedTryAgain'),
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
    uploadedImage,
    hasUnsavedPhotos: uploadedImage !== null,
    
    // ⭐ เพิ่ม states และ handlers สำหรับ custom modals
    isBackConfirmVisible,
    isSaveConfirmVisible,
    
    handleCustomerModalOpen,
    handleCustomerModalClose,
    handleCustomerSelect,
    handleGoBack,
    handleSave,
    handleBackConfirm,
    handleBackCancel,
    handleSaveConfirm,
    handleSaveCancel,
    clearDetailError,
    fetchVisitDetail,
  };
};