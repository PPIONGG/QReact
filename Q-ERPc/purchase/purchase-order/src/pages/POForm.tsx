import {
  Card,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Button,
  Flex,
  Typography,
  Tabs,
  Row,
  Col,
  Badge,
  Select,
  Table,
  Modal,
  Result,
  Spin,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  SaveOutlined,
  CloseOutlined,
  UserOutlined,
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  EllipsisOutlined,
  ShoppingCartOutlined,
  UndoOutlined,
  ExclamationCircleOutlined,
  ExpandAltOutlined,
  CompressOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import {
  useAuthStore,
  usePOStore,
  useDocumentTypes,
  useSelectedDocumentType,
} from "../stores";
import {
  getSeriesAndGroupDoc,
  getDocumentTypeRightList,
  getPaymentTermList,
  calculatePaymentDueDate,
  getCurrencyList,
  getUnitConversionList,
  getWarehouseList,
  calculateVatAmount,
  poInsert,
  poUpdate,
  getPOOrder,
  getSupplier,
  getCompanyInfo,
} from "../services";
import { SupplierSearchModal, ItemSearchModal } from "../components";
import type {
  SeriesAndGroupDocResult,
  Supplier,
  PaymentTerm,
  Currency,
  ItemListItem,
  UnitConversion,
  Warehouse,
  CalculateVatRequest,
  CalculateDetail,
  POInsertRequest,
  PODetail,
  CompanyInfo,
} from "../types";

// Extend dayjs for antd DatePicker
dayjs.extend(weekday);
dayjs.extend(localeData);

const { Text } = Typography;
const { TextArea } = Input;

interface POFormProps {
  canEdit?: boolean;
}

interface POLineItem {
  key: string;
  noLine: number; // Original line number from DB (for edit/delete)
  vline: number; // Display line number
  transactionCode: string;
  transactionDescription: string;
  quantity: number;
  purchaseUnitCode: string;
  unitPriceCurrency: number;
  discount: string;
  unitOptions?: { code: string; t: string }[];
  statusRow: "N" | "E" | "D"; // N = New, E = Edit, D = Delete
}

export function POForm({ canEdit = true }: POFormProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();

  // Auth & document type from store
  const { username, accessToken, companyCode } = useAuthStore();
  const documentTypes = useDocumentTypes();
  const selectedDocumentTypeCode = useSelectedDocumentType();
  const { setDocumentTypes, setSelectedDocumentTypeCode } = usePOStore();

  // Serie info state
  const [serieInfo, setSerieInfo] = useState<SeriesAndGroupDocResult | null>(
    null
  );
  const [isLoadingSerie, setIsLoadingSerie] = useState(false);

  // Payment term state
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([]);

  // Currency state
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  // Warehouse state
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  // Company info state (for noDigit settings)
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);

  // Supplier modal state
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);

  // Item modal state
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [selectedLineKey, setSelectedLineKey] = useState<string | null>(null);
  const [isLoadingItem, setIsLoadingItem] = useState(false);

  // Save modal state
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saving" | "success" | "error">("saving");
  const [saveErrorMessage, setSaveErrorMessage] = useState("");

  // Confirm modal state
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmModalType, setConfirmModalType] = useState<"save" | "cancel">("save");

  // Expand card state
  const [isExpanded, setIsExpanded] = useState(false);

  // Product line items state
  const [lineItems, setLineItems] = useState<POLineItem[]>([
    {
      key: "1",
      noLine: 1,
      vline: 1,
      transactionCode: "",
      transactionDescription: "",
      quantity: 0,
      purchaseUnitCode: "",
      unitPriceCurrency: 0,
      discount: "",
      statusRow: "N",
    },
  ]);

  // Watch date fields for validation
  const poDate = Form.useWatch("podate", form);
  const targetShippingDate = Form.useWatch("targetShippingDate", form);

  // Watch fields for calculation
  const discountStringBeforeVAT = Form.useWatch("discountStringBeforeVAT", form);
  const exchangeRate = Form.useWatch("exchangeRate", form);
  const currencyCode = Form.useWatch("currencyCode", form);

  const isEditMode = !!id;
  const isViewMode = searchParams.get("view") === "true";
  const isPrintMode = searchParams.get("print") === "true";
  const isReadOnly = isViewMode || !canEdit;

  const pageTitle = isViewMode
    ? "ดูรายละเอียดใบสั่งซื้อ"
    : isEditMode
    ? "แก้ไขใบสั่งซื้อ"
    : "สร้างใบสั่งซื้อ";

  // Fetch document types if not loaded (e.g., direct F5 on this page)
  useEffect(() => {
    if (isEditMode || !username || !accessToken || !companyCode) return;
    if (documentTypes.length > 0) return; // Already loaded

    const fetchDocTypes = async () => {
      try {
        const response = await getDocumentTypeRightList(
          "PO",
          username,
          accessToken,
          companyCode
        );
        if (response.code === 0 && response.result) {
          setDocumentTypes(response.result);
          // Auto-select first if none selected
          if (!selectedDocumentTypeCode && response.result.length > 0) {
            setSelectedDocumentTypeCode(response.result[0].documentTypeCode);
          }
        }
      } catch (error) {
        console.error("Failed to fetch document types:", error);
      }
    };

    fetchDocTypes();
  }, [
    isEditMode,
    username,
    accessToken,
    companyCode,
    documentTypes.length,
    selectedDocumentTypeCode,
    setDocumentTypes,
    setSelectedDocumentTypeCode,
  ]);

  // Fetch serie info when creating new PO
  useEffect(() => {
    if (isEditMode || !accessToken || !companyCode || !selectedDocumentTypeCode)
      return;

    // Find selected document type to get description
    const selectedDocType = documentTypes.find(
      (dt) => dt.documentTypeCode === selectedDocumentTypeCode
    );
    if (!selectedDocType) return;

    const fetchSerieInfo = async () => {
      setIsLoadingSerie(true);
      try {
        // Get current Thai Buddhist year
        const currentYear = new Date().getFullYear() + 543;

        const response = await getSeriesAndGroupDoc(
          {
            documentTypeCode: selectedDocumentTypeCode,
            yearForRunNo: currentYear,
            descT: selectedDocType.documentTypeCodeDescriptionT,
            descEng: selectedDocType.documentTypeCodeDescriptionE,
          },
          accessToken,
          companyCode
        );

        if (response.code === 0 && response.result) {
          setSerieInfo(response.result);
          // Set document number to form
          form.setFieldValue("pono", response.result.documentNo);
        }
      } catch (error) {
        console.error("Failed to fetch serie info:", error);
      } finally {
        setIsLoadingSerie(false);
      }
    };

    fetchSerieInfo();
  }, [
    isEditMode,
    accessToken,
    companyCode,
    selectedDocumentTypeCode,
    documentTypes,
    form,
  ]);

  // Fetch payment terms and currencies
  useEffect(() => {
    if (!accessToken || !companyCode) return;

    const fetchPaymentTerms = async () => {
      try {
        const response = await getPaymentTermList(accessToken, companyCode);
        if (response.code === 0 && response.result) {
          setPaymentTerms(response.result);
        }
      } catch (error) {
        console.error("Failed to fetch payment terms:", error);
      }
    };

    const fetchCurrencies = async () => {
      try {
        const response = await getCurrencyList(accessToken, companyCode);
        if (response.code === 0 && response.result) {
          setCurrencies(response.result);
        }
      } catch (error) {
        console.error("Failed to fetch currencies:", error);
      }
    };

    const fetchWarehouses = async () => {
      try {
        const response = await getWarehouseList(accessToken, companyCode);
        if (response.code === 0 && response.result) {
          setWarehouses(response.result);
        }
      } catch (error) {
        console.error("Failed to fetch warehouses:", error);
      }
    };

    const fetchCompanyInfo = async () => {
      try {
        const response = await getCompanyInfo(accessToken, companyCode);
        if (response.code === 0 && response.result) {
          setCompanyInfo(response.result);
        }
      } catch (error) {
        console.error("Failed to fetch company info:", error);
      }
    };

    fetchPaymentTerms();
    fetchCurrencies();
    fetchWarehouses();
    fetchCompanyInfo();
  }, [accessToken, companyCode]);

  // Fetch PO data for edit mode
  useEffect(() => {
    if (!isEditMode || !id || !username || !accessToken || !companyCode || !selectedDocumentTypeCode) return;

    const fetchPOOrder = async () => {
      try {
        const response = await getPOOrder(
          "PO",
          selectedDocumentTypeCode,
          parseInt(id),
          username,
          accessToken,
          companyCode
        );

        if (response.code === 0 && response.result) {
          const poOrder = response.result;

          // Fetch supplier detail to get fullAddress and phone
          if (poOrder.supplierCode) {
            try {
              const supplierResponse = await getSupplier(
                poOrder.supplierCode,
                accessToken,
                companyCode
              );
              if (supplierResponse.code === 0 && supplierResponse.result) {
                form.setFieldsValue({
                  fullAddress: supplierResponse.result.fullAddress || "",
                  supplierPhone: supplierResponse.result.phone || "",
                });
              }
            } catch (error) {
              console.error("Failed to fetch supplier detail:", error);
            }
          }

          // Set form values
          form.setFieldsValue({
            supplierCode: poOrder.supplierCode,
            supplierName: poOrder.supplierName,
            pono: poOrder.pono,
            podate: poOrder.podate ? dayjs(poOrder.podate) : null,
            targetShippingDate: poOrder.targetShippingDate ? dayjs(poOrder.targetShippingDate) : null,
            paymentTermCode: poOrder.paymentTermCode,
            paymentDueDate: poOrder.paymentDueDate ? dayjs(poOrder.paymentDueDate) : null,
            paymentTermRefDoc: poOrder.paymentTermRefDoc,
            currencyCode: poOrder.currencyCode,
            exchangeRate: poOrder.exchangeRate,
            contactName: poOrder.contactName,
            supplierRefDoc: poOrder.refNoYours,
            companyRefDoc: poOrder.refNoOurs,
            quotationRefDoc: poOrder.sellerRefNo,
            note: poOrder.note,
            memo: poOrder.memo,
            billingCode: poOrder.billingCode,
            // Lookup billingAddress from warehouses
            billingAddress: warehouses.find((w) => w.code === poOrder.billingCode)?.addressThai || "",
            discountStringBeforeVAT: poOrder.discountStringBeforeVat,
            totalAmountCurrency: poOrder.totalAmountCurrency,
            amountDiscountCurrency: poOrder.amountDiscountCurrency,
            totalAmountCurrencyAfterDiscountBeforeVAT: poOrder.totalAmountCurrencyAfterDiscountBeforeVat,
            vatAmountCurrency: poOrder.vatamountCurrency,
            totalAmountCurrencyAfterVAT: poOrder.totalAmountCurrencyAfterVat,
          });

          // Set line items from poDetails
          if (poOrder.poDetails && poOrder.poDetails.length > 0) {
            const items: POLineItem[] = await Promise.all(
              poOrder.poDetails.map(async (detail: PODetail, index: number) => {
                // Fetch unit options for each item
                let unitOptions: { code: string; t: string }[] = [];
                if (detail.defaultUnitCode) {
                  try {
                    const unitResponse = await getUnitConversionList(
                      detail.defaultUnitCode,
                      accessToken,
                      companyCode
                    );
                    if (unitResponse.code === 0 && unitResponse.result) {
                      unitOptions = unitResponse.result.map((u: UnitConversion) => ({ code: u.code, t: u.t }));
                    }
                  } catch (error) {
                    console.error("Failed to fetch unit conversion list:", error);
                  }
                }

                return {
                  key: String(detail.noLine), // Use noLine as key for tracking original line
                  noLine: detail.noLine, // Keep original noLine from DB
                  vline: index + 1, // Renumber vline for display (1, 2, 3, ...)
                  transactionCode: detail.transactionCode,
                  transactionDescription: detail.transactionDescription,
                  quantity: detail.quantity,
                  purchaseUnitCode: detail.purchaseUnitCode,
                  unitPriceCurrency: detail.unitPriceCurrency,
                  discount: detail.discount,
                  unitOptions,
                  statusRow: "E" as const, // Edit mode - existing row
                };
              })
            );
            setLineItems(items);
          }
        }
      } catch (error) {
        console.error("Failed to fetch PO order:", error);
      }
    };

    fetchPOOrder();
  }, [isEditMode, id, username, accessToken, companyCode, selectedDocumentTypeCode, form, warehouses]);

  // Auto print when in print mode and data is loaded
  useEffect(() => {
    if (isPrintMode && isViewMode && lineItems.length > 0 && lineItems[0].transactionCode) {
      // Wait a bit for the page to fully render
      const timer = setTimeout(() => {
        window.print();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isPrintMode, isViewMode, lineItems]);

  // Calculate VAT when lineItems or discount changes
  useEffect(() => {
    if (!accessToken || !companyCode) return;

    // Check if there are any items with transactionCode (exclude deleted items)
    const hasValidItems = lineItems.some((item) => item.transactionCode && item.statusRow !== "D");
    if (!hasValidItems) {
      // Reset all summary fields
      form.setFieldsValue({
        totalAmountCurrency: 0,
        totalAmountBeforeVATBaht: 0,
        amountDiscountCurrency: 0,
        amountDiscountBaht: 0,
        totalAmountCurrencyAfterDiscountBeforeVAT: 0,
        totalAmountBahtAfterDiscountBeforeVAT: 0,
        vatAmountCurrency: 0,
        vatAmountBaht: 0,
        totalAmountCurrencyAfterVAT: 0,
        totalAmountAfterVATBaht: 0,
      });
      return;
    }

    const calculateTotals = async () => {
      const rate = parseFloat(exchangeRate) || 1;

      // Build calculate details from lineItems (exclude deleted items)
      const calculateDetails: CalculateDetail[] = lineItems
        .filter((item) => item.transactionCode && item.statusRow !== "D")
        .map((item) => ({
          useExpenseSameLocalCurrencyTrueFalse: false,
          excludeVATTrueFalse: false,
          flagExcludeExpenseExport: false,
          vLine: item.vline,
          transactionType: "I",
          transactionCode: item.transactionCode,
          quantity: item.quantity || 0,
          unitPriceCurrency: item.unitPriceCurrency || 0,
          discount: item.discount || "",
          totalAmountCurrency: 0,
          unitPriceAfterDiscount: 0,
          unitPriceLocalCurrencyAfterDiscount: 0,
          totalAmountCurrencyAfterDiscount: 0,
          totalAmountAfterDiscountLocalCurrency: 0,
          vatBasedAmountCurrency: 0,
          transactionTotalAmountBaht: 0,
          transactionTotalAmountBahtAfterDiscountBeforeVAT: 0,
          transactionVATAmountBaht: 0,
          transactionTotalAmountAfterVATBaht: 0,
        }));

      const request: CalculateVatRequest = {
        calculateHeader: {
          noDigitQty: companyInfo?.noDigitQty ?? 2,
          noDigitUnitPrice: companyInfo?.noDigitUnitPrice ?? 2,
          noDigitTotal: companyInfo?.noDigitTotal ?? 2,
          adjustVATYesNo: "",
          adjustTotalYesNo: false,
          exchangeRate: rate,
          vatRate: 7,
          includeVATTrueFalse: false,
          totalAmountCurrency: 0,
          totalAmountBeforeVATLocalCurrency: 0,
          discountStringBeforeVAT: discountStringBeforeVAT || "",
          amountDiscountCurrency: 0,
          amountDiscountBaht: 0,
          totalAmountCurrencyAfterDiscountBeforeVAT: 0,
          totalAmountBahtAfterDiscountBeforeVAT: 0,
          vatAmountCurrency: 0,
          vatAmountLocalCurrency: 0,
          vatBasedForVATAmountCurrency: 0,
          vatBasedForVATAmountBaht: 0,
          totalAmountCurrencyAfterVAT: 0,
          totalAmountAfterVATLocalCurrency: 0,
        },
        calculateDetails,
      };

      try {
        const response = await calculateVatAmount(request, accessToken, companyCode);
        if (response.code === 0 && response.result) {
          const header = response.result.calculateHeader;
          form.setFieldsValue({
            totalAmountCurrency: header.totalAmountCurrency,
            totalAmountBeforeVATBaht: header.totalAmountBeforeVATLocalCurrency,
            amountDiscountCurrency: header.amountDiscountCurrency,
            amountDiscountBaht: header.amountDiscountBaht,
            totalAmountCurrencyAfterDiscountBeforeVAT: header.totalAmountCurrencyAfterDiscountBeforeVAT,
            totalAmountBahtAfterDiscountBeforeVAT: header.totalAmountBahtAfterDiscountBeforeVAT,
            vatAmountCurrency: header.vatAmountCurrency,
            vatAmountBaht: header.vatAmountCurrency * rate,
            totalAmountCurrencyAfterVAT: header.totalAmountCurrencyAfterVAT,
            totalAmountAfterVATBaht: header.totalAmountCurrencyAfterVAT * rate,
          });
        }
      } catch (error) {
        console.error("Failed to calculate VAT:", error);
        message.warning("ไม่สามารถคำนวณ VAT ได้ กรุณาตรวจสอบข้อมูล");
      }
    };

    calculateTotals();
  }, [lineItems, discountStringBeforeVAT, exchangeRate, accessToken, companyCode, form, companyInfo]);

  const handleCancel = () => {
    if (isReadOnly) {
      navigate("..");
      return;
    }
    setConfirmModalType("cancel");
    setConfirmModalOpen(true);
  };

  const handleSaveClick = async () => {
    try {
      // Validate form fields first
      await form.validateFields();

      // Validate: must have at least 1 line item with transactionCode (exclude deleted items)
      const validLineItems = lineItems.filter(
        (item) => item.transactionCode && item.statusRow !== "D"
      );
      if (validLineItems.length === 0) {
        message.error("กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ");
        return;
      }

      // Validate: quantity must be greater than 0 for all items with transactionCode
      const invalidQuantityItems = validLineItems.filter(
        (item) => !item.quantity || item.quantity <= 0
      );
      if (invalidQuantityItems.length > 0) {
        const lineNumbers = invalidQuantityItems.map((item) => item.vline).join(", ");
        message.error(`กรุณาระบุจำนวนสินค้าให้มากกว่า 0 (รายการที่ ${lineNumbers})`);
        return;
      }

      // If all validation passes, show confirm modal
      setConfirmModalType("save");
      setConfirmModalOpen(true);
    } catch {
      // Validation failed - form will show error messages automatically
    }
  };

  const handleConfirmOk = () => {
    setConfirmModalOpen(false);
    if (confirmModalType === "save") {
      form.submit();
    } else {
      navigate("..");
    }
  };

  const handleConfirmCancel = () => {
    setConfirmModalOpen(false);
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    // For new mode, require serieInfo
    if (!isEditMode && (!username || !accessToken || !companyCode || !serieInfo)) {
      console.error("Missing required data for submit");
      return;
    }

    // For edit mode, only require basic auth
    if (isEditMode && (!username || !accessToken || !companyCode)) {
      console.error("Missing required data for submit");
      return;
    }

    // Build poDetails from lineItems - include all items (N, E, D)
    // For deleted items (D), keep original noLine so API knows which record to delete
    // For non-deleted items (N, E), use vline for display order
    const poDetails: PODetail[] = lineItems
      .filter((item) => item.transactionCode || item.statusRow === "D") // Include deleted items too
      .map((item) => {
        const pricePerUnit = item.unitPriceCurrency || 0;
        const quantity = item.quantity || 0;
        const discount = item.discount || "";
        let discountPerUnit = 0;
        if (discount.includes("%")) {
          const percent = parseFloat(discount.replace("%", ""));
          discountPerUnit = (pricePerUnit * percent) / 100;
        } else {
          discountPerUnit = parseFloat(discount) || 0;
        }
        const totalAmountCurrency = pricePerUnit * quantity;
        const totalAmountAfterDiscount = (pricePerUnit - discountPerUnit) * quantity;

        return {
          // For deleted/existing items, use original noLine from DB
          // For new items (N), use vline as noLine
          noLine: item.statusRow === "N" ? item.vline : item.noLine,
          vline: item.vline,
          transactionCode: item.transactionCode,
          transactionDescription: item.transactionDescription,
          transactionCodeSupplier: "",
          quantity: quantity,
          defaultUnitCode: item.purchaseUnitCode,
          purchaseUnitCode: item.purchaseUnitCode,
          unitPriceCurrency: pricePerUnit,
          discount: discount,
          totalAmountCurrency: totalAmountCurrency,
          totalAmountAfterDiscount: totalAmountAfterDiscount,
          statusRow: item.statusRow, // Use actual statusRow (N, E, D)
          excludeVATTrueFalse: false,
        };
      });

    const request: POInsertRequest = {
      userName: username,
      poOrder: {
        documentModuleCode: "PO",
        documentTypeCode: selectedDocumentTypeCode || "",
        runNo: isEditMode ? parseInt(id || "0") : 0, // Use runNo from URL in edit mode
        pono: (values.pono as string) || "",
        podate: values.podate
          ? (values.podate as dayjs.Dayjs).format("YYYY-MM-DDTHH:mm:ss")
          : dayjs().format("YYYY-MM-DDTHH:mm:ss"),
        refNoYours: (values.supplierRefDoc as string) || "",
        refNoOurs: (values.companyRefDoc as string) || "",
        supplierCode: (values.supplierCode as string) || "",
        supplierPrefix: "",
        supplierName: (values.supplierName as string) || "",
        supplierSuffix: "",
        targetShippingDate: values.targetShippingDate
          ? (values.targetShippingDate as dayjs.Dayjs).format("YYYY-MM-DDTHH:mm:ss")
          : null,
        paymentTermCode: (values.paymentTermCode as string) || "",
        paymentDueDate: values.paymentDueDate
          ? (values.paymentDueDate as dayjs.Dayjs).format("YYYY-MM-DDTHH:mm:ss")
          : null,
        currencyCode: (values.currencyCode as string) || "THB",
        exchangeRate: parseFloat(values.exchangeRate as string) || 1,
        totalAmountCurrency: (values.totalAmountCurrency as number) || 0,
        vatrate: 7,
        vatamountCurrency: (values.vatAmountCurrency as number) || 0,
        totalAmountCurrencyAfterVat: (values.totalAmountCurrencyAfterVAT as number) || 0,
        amountDiscountCurrency: (values.amountDiscountCurrency as number) || 0,
        totalAmountCurrencyAfterDiscountBeforeVat: (values.totalAmountCurrencyAfterDiscountBeforeVAT as number) || 0,
        discountStringBeforeVat: (values.discountStringBeforeVAT as string) || "",
        note: (values.note as string) || "",
        totalAmountIncludeVattrueFalse: false,
        costCenterCode: "",
        costCenterName: "",
        billingCode: (values.billingCode as string) || "",
        contactName: (values.contactName as string) || "",
        paymentTermRefDoc: (values.paymentTermRefDoc as string) || "",
        memo: (values.memo as string) || "",
        sellerRefNo: (values.quotationRefDoc as string) || "",
        poDetails: poDetails,
      },
    };

    console.log("=== Form Values ===");
    console.log("billingCode:", values.billingCode);
    console.log("=== Mode ===", isEditMode ? "EDIT" : "NEW");
    console.log("=== Request ===");
    console.log(JSON.stringify(request, null, 2));

    // Show saving modal
    setSaveModalOpen(true);
    setSaveStatus("saving");
    setSaveErrorMessage("");

    try {
      if (isEditMode) {
        // Edit mode - call POUpdate API
        const response = await poUpdate(request, accessToken, companyCode);
        console.log("=== POUpdate Response ===");
        console.log(JSON.stringify(response, null, 2));

        if (response.code === 0) {
          // Success
          setSaveStatus("success");
          // Wait a moment to show success then navigate
          setTimeout(() => {
            setSaveModalOpen(false);
            navigate("..");
          }, 1500);
        } else {
          setSaveStatus("error");
          setSaveErrorMessage(response.msg || "เกิดข้อผิดพลาดในการบันทึก");
        }
      } else {
        // New mode - call POInsert API
        const response = await poInsert(request, accessToken, companyCode);
        console.log("=== POInsert Response ===");
        console.log(JSON.stringify(response, null, 2));

        if (response.code === 0) {
          // Success
          setSaveStatus("success");
          // Wait a moment to show success then navigate
          setTimeout(() => {
            setSaveModalOpen(false);
            navigate("..");
          }, 1500);
        } else {
          setSaveStatus("error");
          setSaveErrorMessage(response.msg || "เกิดข้อผิดพลาดในการบันทึก");
        }
      }
    } catch (error) {
      console.error(isEditMode ? "POUpdate error:" : "POInsert error:", error);
      setSaveStatus("error");
      setSaveErrorMessage("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const handleSupplierSelect = async (supplier: Supplier) => {
    form.setFieldsValue({
      supplierCode: supplier.code,
      supplierName: supplier.nameThai,
      paymentTermCode: supplier.paymentTermCode,
    });

    // Fetch supplier detail to get fullAddress and phone
    if (accessToken && companyCode) {
      try {
        const response = await getSupplier(supplier.code, accessToken, companyCode);
        if (response.code === 0 && response.result) {
          form.setFieldsValue({
            fullAddress: response.result.fullAddress || "",
            supplierPhone: response.result.phone || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch supplier detail:", error);
      }
    }

    // Calculate payment due date if supplier has paymentTermCode
    if (supplier.paymentTermCode) {
      handlePaymentTermChange(supplier.paymentTermCode);
    }
  };

  // Line items handlers
  const handleAddLine = () => {
    // Find max vline from visible items (not deleted)
    const visibleItems = lineItems.filter((item) => item.statusRow !== "D");
    const newVline = visibleItems.length + 1;
    // For new items, noLine will be assigned by API, use 0 as placeholder
    setLineItems([
      ...lineItems,
      {
        key: crypto.randomUUID(), // Use UUID for unique key
        noLine: 0, // New row - will be assigned by API
        vline: newVline,
        transactionCode: "",
        transactionDescription: "",
        quantity: 0,
        purchaseUnitCode: "",
        unitPriceCurrency: 0,
        discount: "",
        statusRow: "N", // New row
      },
    ]);
  };

  const handleDeleteLine = (key: string) => {
    const itemToDelete = lineItems.find((item) => item.key === key);
    if (!itemToDelete) return;

    if (itemToDelete.statusRow === "E") {
      // Edit mode item - mark as deleted instead of removing, then renumber vline
      const updated = lineItems.map((item) =>
        item.key === key ? { ...item, statusRow: "D" as const } : item
      );
      // Renumber vline for visible items
      let vlineCounter = 1;
      const renumbered = updated.map((item) => {
        if (item.statusRow === "D") {
          return item; // Keep deleted items as is (keep original vline for noLine)
        }
        return { ...item, vline: vlineCounter++ };
      });
      setLineItems(renumbered);
    } else {
      // New item - remove from array and renumber
      const filtered = lineItems.filter((item) => item.key !== key);
      // Renumber vline for visible items only
      let vlineCounter = 1;
      const renumbered = filtered.map((item) => {
        if (item.statusRow === "D") {
          return item; // Keep deleted items as is
        }
        return { ...item, vline: vlineCounter++ };
      });
      setLineItems(renumbered);
    }
  };

  const handleUndoDelete = (key: string) => {
    // Restore deleted row back to E status and renumber vline
    const updated = lineItems.map((item) =>
      item.key === key ? { ...item, statusRow: "E" as const } : item
    );
    // Renumber vline for visible items
    let vlineCounter = 1;
    const renumbered = updated.map((item) => {
      if (item.statusRow === "D") {
        return item; // Keep deleted items as is
      }
      return { ...item, vline: vlineCounter++ };
    });
    setLineItems(renumbered);
  };

  const handleLineChange = (
    vline: number,
    field: keyof POLineItem,
    value: unknown
  ) => {
    setLineItems((prev) =>
      prev.map((item) =>
        item.vline === vline ? { ...item, [field]: value } : item
      )
    );
  };

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

  const openModalProductList = (key: string) => {
    setSelectedLineKey(key);
    setItemModalOpen(true);
  };

  const handleItemSelect = async (item: ItemListItem) => {
    if (selectedLineKey === null) return;
    if (!accessToken || !companyCode) return;

    setIsLoadingItem(true);

    // Fetch unit conversion list for this item
    let unitOptions: UnitConversion[] = [];
    if (item.defaultUnitCode) {
      try {
        const response = await getUnitConversionList(
          item.defaultUnitCode,
          accessToken,
          companyCode
        );
        if (response.code === 0 && response.result) {
          unitOptions = response.result;
        }
      } catch (error) {
        console.error("Failed to fetch unit conversion list:", error);
        message.warning("ไม่สามารถโหลดหน่วยสินค้าได้");
      }
    }

    setLineItems((prev) =>
      prev.map((lineItem) =>
        lineItem.key === selectedLineKey
          ? {
              ...lineItem,
              transactionCode: item.code,
              transactionDescription: item.purchaseNameT || item.t,
              purchaseUnitCode: item.purchaseUnitCode || "",
              unitOptions: unitOptions.map((u) => ({ code: u.code, t: u.t })),
            }
          : lineItem
      )
    );

    setIsLoadingItem(false);
  };

  // Table columns
  const columns: ColumnsType<POLineItem> = [
    {
      title: "No.",
      key: "vline",
      width: 60,
      align: "center",
      render: (_, record) => {
        // For deleted rows, show "-"
        if (record.statusRow === "D") {
          return "-";
        }
        // For visible rows, show vline
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
              onClick={() => openModalProductList(record.key)}
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
      render: (text, record) => <Input value={text} placeholder="ชื่อสินค้า" readOnly disabled={record.statusRow === "D"} />,
    },
    {
      title: "จำนวน",
      dataIndex: "quantity",
      key: "quantity",
      width: 120,
      align: "right",
      render: (text, record) => (
        <InputNumber
          value={text}
          min={0}
          placeholder="0.00"
          style={{ width: "100%" }}
          className="input-number-right"
          precision={2}
          disabled={isReadOnly || record.statusRow === "D"}
          formatter={(value) => {
            if (!value && value !== 0) return "";
            const num = parseFloat(value.toString());
            return num.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
          }}
          parser={(value) => value?.replace(/,/g, "") as unknown as number}
          onChange={(value) =>
            handleLineChange(record.vline, "quantity", value || 0)
          }
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
          disabled={isReadOnly || !record.transactionCode || record.statusRow === "D"}
          onChange={(value) =>
            handleLineChange(record.vline, "purchaseUnitCode", value)
          }
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
        <InputNumber
          value={text}
          min={0}
          placeholder="0.00"
          style={{ width: "100%" }}
          className="input-number-right"
          precision={2}
          disabled={isReadOnly || record.statusRow === "D"}
          formatter={(value) => {
            if (!value && value !== 0) return "";
            const num = parseFloat(value.toString());
            return num.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
          }}
          parser={(value) => value?.replace(/,/g, "") as unknown as number}
          onChange={(value) =>
            handleLineChange(record.vline, "unitPriceCurrency", value || 0)
          }
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
          <Input
            value={text}
            style={{ width: "100%", textAlign: "right" }}
            disabled={isReadOnly || record.statusRow === "D" || hasNoPrice}
            placeholder={hasNoPrice ? "กรอกราคาก่อน" : ""}
            onChange={(e) => {
              const value = e.target.value;
              const regex = /^[0-9]*\.?[0-9]*%?$/;
              if (regex.test(value) || value === "") {
                handleLineChange(record.vline, "discount", value);
              }
            }}
            onBlur={(e) => {
              let value = e.target.value.trim();
              if (value && !value.includes("%")) {
                const num = parseFloat(value);
                if (!isNaN(num)) {
                  // ตรวจสอบว่าส่วนลดต้องไม่เกินราคา/หน่วย
                  if (num > pricePerUnit) {
                    value = pricePerUnit.toFixed(2);
                  } else {
                    value = num.toFixed(2);
                  }
                }
              } else if (value.includes("%")) {
                // ตรวจสอบว่า % ต้องไม่เกิน 100
                const percent = parseFloat(value.replace("%", ""));
                if (!isNaN(percent) && percent > 100) {
                  value = "100%";
                }
              }
              handleLineChange(record.vline, "discount", value);
            }}
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

        // Show undo button for deleted rows
        if (record.statusRow === "D") {
          return (
            <Button
              type="text"
              icon={<UndoOutlined />}
              onClick={() => handleUndoDelete(record.key)}
              title="ยกเลิกการลบ"
            />
          );
        }

        // Show delete button for non-deleted rows (N or E)
        return (
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteLine(record.key)}
          />
        );
      },
    },
  ];

  const handlePaymentTermChange = async (paymentTermCode: string) => {
    if (!paymentTermCode || !accessToken || !companyCode) {
      form.setFieldValue("paymentDueDate", null);
      return;
    }

    // Get reference date from podate field (format: YYYY-MM-DD for API)
    const poDate = form.getFieldValue("podate") as dayjs.Dayjs | null;
    const refDate = poDate
      ? poDate.format("YYYY-MM-DD")
      : dayjs().format("YYYY-MM-DD");

    try {
      const response = await calculatePaymentDueDate(
        paymentTermCode,
        refDate,
        accessToken,
        companyCode
      );
      if (response.code === 0 && response.result) {
        form.setFieldValue("paymentDueDate", dayjs(response.result));
      }
    } catch (error) {
      console.error("Failed to calculate payment due date:", error);
    }
  };

  return (
    <Flex vertical style={{ height: "calc(100vh - 120px)" }}>
      {/* Header */}
      <Flex
        justify="space-between"
        align="center"
        style={{ flexShrink: 0, marginBottom: 12 }}
      >
        <Text strong style={{ fontSize: 16 }}>
          {pageTitle}
        </Text>
        {!isReadOnly && (
          <Flex gap={8}>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSaveClick}
            >
              บันทึก
            </Button>
            <Button icon={<CloseOutlined />} onClick={handleCancel}>
              กลับ
            </Button>
          </Flex>
        )}
        {isReadOnly && <Button onClick={handleCancel}>กลับ</Button>}
      </Flex>

      {/* Content - มี scrollbar เมื่อเนื้อหาเยอะ */}
      <div className="antd-scrollbar" style={{ flex: 1, overflow: "auto" }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={isReadOnly}
          initialValues={{
            podate: dayjs(),
            currencyCode: "THB",
            exchangeRate: 1,
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
        >
          {/* Section: ผู้ขาย */}
          <Card style={{ marginBottom: 16, display: isExpanded ? "none" : "block" }}>
            <Flex align="center" gap={12} style={{ marginBottom: 16 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  backgroundColor: "#1890ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <UserOutlined style={{ color: "#fff", fontSize: 16 }} />
              </div>
              <Text strong style={{ fontSize: 16 }}>
                ผู้ขาย
              </Text>
              {!isEditMode && serieInfo && (
                <Badge
                  count={`ลำดับที่ ${serieInfo.yearForRunNo}/${serieInfo.nextNumber}`}
                  style={{ backgroundColor: "#52c41a" }}
                />
              )}
              {!isEditMode && isLoadingSerie && (
                <Badge
                  count="กำลังโหลด..."
                  style={{ backgroundColor: "#1890ff" }}
                />
              )}
            </Flex>

            <Row gutter={[16, 0]}>
              {/* Row 1 */}
              <Col span={8}>
                <Form.Item
                  label="รหัสผู้ขาย"
                  name="supplierCode"
                  rules={[{ required: true, message: "กรุณาเลือกผู้ขาย" }]}
                >
                  <Input
                    placeholder="รหัสผู้ขาย"
                    readOnly
                    suffix={
                      <Button
                        type="text"
                        size="small"
                        icon={<SearchOutlined />}
                        onClick={() => setSupplierModalOpen(true)}
                        disabled={isReadOnly}
                        style={{ margin: -4 }}
                      />
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="เลขที่ใบสั่งซื้อ"
                  name="pono"
                  rules={[{ required: true, message: "กรุณาระบุเลขที่ใบสั่งซื้อ" }]}
                >
                  <Input placeholder="Auto" readOnly />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="วันที่ใบสั่งซื้อ"
                  name="podate"
                  rules={[{ required: true, message: "กรุณาเลือกวันที่ใบสั่งซื้อ" }]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    placeholder="เลือกวันที่"
                    format="DD/MM/YYYY"
                    disabledDate={(current) => {
                      // ต้องไม่เกินวันที่กำหนดส่งผู้สั่งซื้อ
                      if (targetShippingDate && current) {
                        return current.isAfter(targetShippingDate, "day");
                      }
                      return false;
                    }}
                    onChange={() => {
                      const paymentTermCode = form.getFieldValue("paymentTermCode");
                      if (paymentTermCode) {
                        handlePaymentTermChange(paymentTermCode);
                      }
                    }}
                  />
                </Form.Item>
              </Col>

              {/* Row 2 */}
              <Col span={8}>
                <Form.Item label="ชื่อผู้ขาย" name="supplierName">
                  <Input placeholder="ชื่อผู้ขาย" readOnly />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="กำหนดส่งผู้สั่งซื้อ"
                  name="targetShippingDate"
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    placeholder="เลือกวันที่"
                    format="DD/MM/YYYY"
                    disabledDate={(current) => {
                      // ต้องไม่น้อยกว่าวันที่ใบสั่งซื้อ
                      if (poDate && current) {
                        return current.isBefore(poDate, "day");
                      }
                      return false;
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8} />
              {/* Row 3 */}
              <Col span={8}>
                <Form.Item label="ที่อยู่" name="fullAddress">
                  <TextArea rows={3} placeholder="ที่อยู่" readOnly />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="รหัสชำระ"
                  name="paymentTermCode"
                  rules={[{ required: true, message: "กรุณาเลือกรหัสชำระ" }]}
                >
                  <Select
                    placeholder="เลือกรหัสชำระ"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    options={paymentTerms.map((pt) => ({
                      value: pt.code,
                      label: pt.descriptionOnSalesThai,
                    }))}
                    onChange={handlePaymentTermChange}
                  />
                </Form.Item>
              </Col>
              <Col span={8} />

              {/* Row 4 */}
              <Col span={8}>
                <Form.Item label="โทรศัพท์" name="supplierPhone">
                  <Input placeholder="เบอร์โทร" readOnly />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="วันที่ชำระ" name="paymentDueDate">
                  <DatePicker
                    style={{ width: "100%" }}
                    placeholder="เลือกวันที่"
                    format="DD/MM/YYYY"
                    disabledDate={(current) => {
                      // ต้องไม่ย้อนหลังจากวันที่ใบสั่งซื้อ
                      if (poDate && current) {
                        return current.isBefore(poDate, "day");
                      }
                      return false;
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="อ้างอิงชำระ" name="paymentTermRefDoc">
                  <Input placeholder="อ้างอิงชำระ" />
                </Form.Item>
              </Col>

              {/* Row 5 */}
              <Col span={8}>
                <Form.Item label="ผู้ติดต่อ" name="contactName">
                  <Input placeholder="ชื่อผู้ติดต่อ" />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="สกุลเงิน"
                  name="currencyCode"
                  rules={[{ required: true, message: "กรุณาเลือกสกุลเงิน" }]}
                >
                  <Select
                    placeholder="เลือกสกุลเงิน"
                    showSearch
                    optionFilterProp="label"
                    options={currencies.map((c) => ({
                      value: c.code,
                      label: `${c.code} - ${c.t}`,
                    }))}
                    onChange={(value) => {
                      if (value === "THB") {
                        form.setFieldValue("exchangeRate", 1);
                      }
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item label="อัตราแลกเปลี่ยน" name="exchangeRate">
                  <InputNumber
                    style={{ width: "100%" }}
                    className="input-number-right"
                    placeholder="1"
                    min={0}
                    precision={4}
                    disabled={isReadOnly || currencyCode === "THB"}
                  />
                </Form.Item>
              </Col>
              <Col span={8} />
            </Row>
          </Card>

          <Flex gap={16} style={{ display: isExpanded ? "none" : "flex" }}>
            <Card style={{ flex: 1 }}>
              {/* Tabs: สถานที่ส่งสินค้า / เอกสารอ้างอิง */}
              <Tabs defaultActiveKey="billing">
                <Tabs.TabPane tab="คลังสินค้า" key="billing" forceRender>
                  <Flex vertical gap={12}>
                    <Form.Item
                      label="คลังสินค้า"
                      name="billingCode"
                      style={{ marginBottom: 0 }}
                      rules={[{ required: true, message: "กรุณาเลือกคลังสินค้า" }]}
                    >
                      <Select
                        placeholder="เลือกคลังสินค้า"
                        showSearch
                        optionFilterProp="label"
                        options={warehouses.map((w) => ({
                          value: w.code,
                          label: w.nameT,
                        }))}
                        onChange={(value) => {
                          const selected = warehouses.find((w) => w.code === value);
                          form.setFieldValue("billingAddress", selected?.addressThai || "");
                        }}
                      />
                    </Form.Item>
                    <Form.Item label="ที่อยู่คลังสินค้า" name="billingAddress" style={{ marginBottom: 0 }}>
                      <TextArea rows={3} readOnly />
                    </Form.Item>
                  </Flex>
                </Tabs.TabPane>
                <Tabs.TabPane tab="เอกสารอ้างอิง" key="refDoc" forceRender>
                  <Flex vertical gap={12}>
                    <Form.Item label="อ้างอิงผู้ขาย" name="supplierRefDoc" style={{ marginBottom: 0 }}>
                      <Input />
                    </Form.Item>
                    <Form.Item label="อ้างอิงบริษัท" name="companyRefDoc" style={{ marginBottom: 0 }}>
                      <Input />
                    </Form.Item>
                    <Form.Item label="ใบเสนอราคา" name="quotationRefDoc" style={{ marginBottom: 0 }}>
                      <Input />
                    </Form.Item>
                  </Flex>
                </Tabs.TabPane>
              </Tabs>
            </Card>
            <Card style={{ flex: 1 }}>
              {/* Tabs: หมายเหตุ / บันทึก */}
              <Tabs defaultActiveKey="remark">
                <Tabs.TabPane tab="หมายเหตุ" key="remark" forceRender>
                  <Form.Item name="note" style={{ marginBottom: 0 }}>
                    <TextArea rows={4} placeholder="หมายเหตุเพิ่มเติม" />
                  </Form.Item>
                </Tabs.TabPane>
                <Tabs.TabPane tab="บันทึก" key="note" forceRender>
                  <Form.Item name="memo" style={{ marginBottom: 0 }}>
                    <TextArea rows={4} placeholder="บันทึกภายใน" />
                  </Form.Item>
                </Tabs.TabPane>
              </Tabs>
            </Card>
          </Flex>

          {/* Section: รายการสินค้า */}
          <Card style={{ marginTop: isExpanded ? 0 : 16 }}>
            <Flex align="center" justify="space-between" style={{ marginBottom: 16 }}>
              <Flex align="center" gap={12}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    backgroundColor: "#52c41a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ShoppingCartOutlined style={{ color: "#fff", fontSize: 16 }} />
                </div>
                <Text strong style={{ fontSize: 16 }}>
                  รายการสินค้า
                </Text>
              </Flex>
              <Button
                type="text"
                icon={isExpanded ? <CompressOutlined /> : <ExpandAltOutlined />}
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "ย่อ" : "ขยาย"}
              />
            </Flex>

            <Table
              columns={columns}
              dataSource={lineItems}
              pagination={false}
              size="small"
              scroll={{ x: 1200 }}
              rowKey="key"
              loading={isLoadingItem}
              rowClassName={(record) => (record.statusRow === "D" ? "deleted-row" : "")}
            />

            {!isReadOnly && (
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={handleAddLine}
                block
                style={{ marginTop: 16,outline: "none" }}
              >
                เพิ่มรายการ
              </Button>
            )}
          </Card>

          {/* Summary Section */}
          <Card style={{ marginTop: 16 }}>
            <Flex vertical gap={12} align="flex-end">
              {/* รวมมูลค่า */}
              <Flex align="center" gap={16}>
                <Text strong style={{ width: 220, textAlign: "left" }}>รวมมูลค่า:</Text>
                <Form.Item name="totalAmountCurrency" noStyle>
                  <InputNumber
                    style={{ width: 150 }}
                    className="input-number-right"
                    placeholder="0.00"
                    precision={2}
                    readOnly
                    formatter={(value) => {
                      if (!value && value !== 0) return "";
                      const num = parseFloat(value.toString());
                      return num.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      });
                    }}
                    parser={(value) => value?.replace(/,/g, "") as unknown as number}
                  />
                </Form.Item>
                <Text strong style={{ width: 50 }}>สกุลเงิน</Text>
                <Form.Item name="totalAmountBeforeVATBaht" noStyle>
                  <InputNumber
                    style={{ width: 150 }}
                    className="input-number-right"
                    placeholder="0.00"
                    precision={2}
                    readOnly
                    formatter={(value) => {
                      if (!value && value !== 0) return "";
                      const num = parseFloat(value.toString());
                      return num.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      });
                    }}
                    parser={(value) => value?.replace(/,/g, "") as unknown as number}
                  />
                </Form.Item>
                <Text strong style={{ width: 30 }}>บาท</Text>
              </Flex>

              {/* ส่วนลด */}
              <Flex align="center" gap={16}>
                <Flex align="center" gap={8} style={{ width: 220 }}>
                  <Text strong style={{ textAlign: "left" }}>ส่วนลด:</Text>
                  <Form.Item name="discountStringBeforeVAT" noStyle>
                    <Input
                      style={{ width: 80, textAlign: "right" }}
                      disabled={isReadOnly}
                      onChange={(e) => {
                        const value = e.target.value;
                        const regex = /^[0-9]*\.?[0-9]*%?$/;
                        if (!regex.test(value) && value !== "") {
                          e.preventDefault();
                        }
                      }}
                      onBlur={(e) => {
                        let value = e.target.value.trim();
                        if (value && !value.includes("%")) {
                          const num = parseFloat(value);
                          if (!isNaN(num)) {
                            value = num.toFixed(2);
                            form.setFieldValue("discountStringBeforeVAT", value);
                          }
                        }
                      }}
                    />
                  </Form.Item>
                  <Text strong style={{ textAlign: "left" }}>จำนวนลด:</Text>
                </Flex>
                <Form.Item name="amountDiscountCurrency" noStyle>
                  <InputNumber
                    style={{ width: 150 }}
                    className="input-number-right"
                    placeholder="0.00"
                    precision={2}
                    readOnly
                    formatter={(value) => {
                      if (!value && value !== 0) return "";
                      const num = parseFloat(value.toString());
                      return num.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      });
                    }}
                    parser={(value) => value?.replace(/,/g, "") as unknown as number}
                  />
                </Form.Item>
                <Text strong style={{ width: 50 }}>สกุลเงิน</Text>
                <Form.Item name="amountDiscountBaht" noStyle>
                  <InputNumber
                    style={{ width: 150 }}
                    className="input-number-right"
                    placeholder="0.00"
                    precision={2}
                    readOnly
                    formatter={(value) => {
                      if (!value && value !== 0) return "";
                      const num = parseFloat(value.toString());
                      return num.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      });
                    }}
                    parser={(value) => value?.replace(/,/g, "") as unknown as number}
                  />
                </Form.Item>
                <Text strong style={{ width: 30 }}>บาท</Text>
              </Flex>

              {/* ยอดเงินหลังลด */}
              <Flex align="center" gap={16}>
                <Text strong style={{ width: 220, textAlign: "left" }}>ยอดเงินหลังลด:</Text>
                <Form.Item name="totalAmountCurrencyAfterDiscountBeforeVAT" noStyle>
                  <InputNumber
                    style={{ width: 150 }}
                    className="input-number-right"
                    placeholder="0.00"
                    precision={2}
                    readOnly
                    formatter={(value) => {
                      if (!value && value !== 0) return "";
                      const num = parseFloat(value.toString());
                      return num.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      });
                    }}
                    parser={(value) => value?.replace(/,/g, "") as unknown as number}
                  />
                </Form.Item>
                <Text strong style={{ width: 50 }}>สกุลเงิน</Text>
                <Form.Item name="totalAmountBahtAfterDiscountBeforeVAT" noStyle>
                  <InputNumber
                    style={{ width: 150 }}
                    className="input-number-right"
                    placeholder="0.00"
                    precision={2}
                    readOnly
                    formatter={(value) => {
                      if (!value && value !== 0) return "";
                      const num = parseFloat(value.toString());
                      return num.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      });
                    }}
                    parser={(value) => value?.replace(/,/g, "") as unknown as number}
                  />
                </Form.Item>
                <Text strong style={{ width: 30 }}>บาท</Text>
              </Flex>

              {/* ภาษี */}
              <Flex align="center" gap={16}>
                <Text  strong style={{ width: 220, textAlign: "left" }}>ภาษี:</Text>
                <Form.Item name="vatAmountCurrency" noStyle>
                  <InputNumber
                    style={{ width: 150 }}
                    className="input-number-right"
                    placeholder="0.00"
                    precision={2}
                    readOnly
                    formatter={(value) => {
                      if (!value && value !== 0) return "";
                      const num = parseFloat(value.toString());
                      return num.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      });
                    }}
                    parser={(value) => value?.replace(/,/g, "") as unknown as number}
                  />
                </Form.Item>
                <Text strong style={{ width: 50 }}>สกุลเงิน</Text>
                <Form.Item name="vatAmountBaht" noStyle>
                  <InputNumber
                    style={{ width: 150 }}
                    className="input-number-right"
                    placeholder="0.00"
                    precision={2}
                    readOnly
                    formatter={(value) => {
                      if (!value && value !== 0) return "";
                      const num = parseFloat(value.toString());
                      return num.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      });
                    }}
                    parser={(value) => value?.replace(/,/g, "") as unknown as number}
                  />
                </Form.Item>
                <Text strong style={{ width: 30 }}>บาท</Text>
              </Flex>

              {/* รวมเงินทั้งสิ้น */}
              <Flex align="center" gap={16}>
                <Text strong style={{ width: 220, textAlign: "left" }}>รวมเงินทั้งสิ้น:</Text>
                <Form.Item name="totalAmountCurrencyAfterVAT" noStyle>
                  <InputNumber
                    style={{ width: 150 }}
                    className="input-number-right"
                    placeholder="0.00"
                    precision={2}
                    readOnly
                    formatter={(value) => {
                      if (!value && value !== 0) return "";
                      const num = parseFloat(value.toString());
                      return num.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      });
                    }}
                    parser={(value) => value?.replace(/,/g, "") as unknown as number}
                  />
                </Form.Item>
                <Text strong style={{ width: 50 }}>สกุลเงิน</Text>
                <Form.Item name="totalAmountAfterVATBaht" noStyle>
                  <InputNumber
                    style={{ width: 150 }}
                    className="input-number-right"
                    placeholder="0.00"
                    precision={2}
                    readOnly
                    formatter={(value) => {
                      if (!value && value !== 0) return "";
                      const num = parseFloat(value.toString());
                      return num.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      });
                    }}
                    parser={(value) => value?.replace(/,/g, "") as unknown as number}
                  />
                </Form.Item>
                <Text strong style={{ width: 30 }}>บาท</Text>
              </Flex>
            </Flex>
          </Card>
        </Form>
      </div>

      {/* Supplier Search Modal */}
      <SupplierSearchModal
        open={supplierModalOpen}
        onCancel={() => setSupplierModalOpen(false)}
        onSelect={handleSupplierSelect}
      />

      {/* Item Search Modal */}
      <ItemSearchModal
        open={itemModalOpen}
        onCancel={() => setItemModalOpen(false)}
        onSelect={handleItemSelect}
      />

      {/* Confirm Modal */}
      <Modal
        open={confirmModalOpen}
        title={
          <Flex align="center" gap={8}>
            <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: 22 }} />
            <span>{confirmModalType === "save" ? "ยืนยันการบันทึก" : "ยืนยันการยกเลิก"}</span>
          </Flex>
        }
        footer={
          <Flex gap={8} justify="flex-end">
            <Button type="primary" onClick={handleConfirmOk}>
              {confirmModalType === "save" ? "บันทึก" : "ยืนยัน"}
            </Button>
            <Button onClick={handleConfirmCancel}>
              {confirmModalType === "save" ? "ยกเลิก" : "ไม่"}
            </Button>
          </Flex>
        }
        onCancel={handleConfirmCancel}
        centered
        width={400}
        destroyOnClose
        maskClosable={false}
      >
        <Typography.Text style={{ marginLeft: 30 }}>
          {confirmModalType === "save"
            ? isEditMode
              ? "ต้องการบันทึกการแก้ไขใบสั่งซื้อหรือไม่?"
              : "ต้องการบันทึกใบสั่งซื้อหรือไม่?"
            : isEditMode
            ? "ต้องการยกเลิกการแก้ไขใบสั่งซื้อหรือไม่?"
            : "ต้องการยกเลิกการสร้างใบสั่งซื้อหรือไม่?"}
        </Typography.Text>
      </Modal>

      {/* Save Status Modal */}
      <Modal
        open={saveModalOpen}
        footer={null}
        closable={saveStatus === "error"}
        onCancel={() => setSaveModalOpen(false)}
        centered
        width={400}
      >
        {saveStatus === "saving" && (
          <Flex vertical align="center" gap={16} style={{ padding: "24px 0" }}>
            <Spin size="large" />
            <Typography.Text style={{ fontSize: 16 }}>
              กำลังบันทึกข้อมูล...
            </Typography.Text>
          </Flex>
        )}
        {saveStatus === "success" && (
          <Result
            status="success"
            title="บันทึกสำเร็จ"
            subTitle={isEditMode ? "อัปเดตใบสั่งซื้อเรียบร้อยแล้ว" : "สร้างใบสั่งซื้อเรียบร้อยแล้ว"}
          />
        )}
        {saveStatus === "error" && (
          <Result
            status="error"
            title="บันทึกไม่สำเร็จ"
            subTitle={saveErrorMessage}
            extra={
              <Button type="primary" onClick={() => setSaveModalOpen(false)}>
                ปิด
              </Button>
            }
          />
        )}
      </Modal>

      {/* Style for right-aligned input numbers and deleted rows */}
      <style>{`
        .input-number-right .ant-input-number-input {
          text-align: right;
        }
        .deleted-row {
          background-color: #fff2f0 !important;
          opacity: 0.7;
        }
        .deleted-row td {
          background-color: #fff2f0 !important;
        }
        .deleted-row:hover td {
          background-color: #ffccc7 !important;
        }
      `}</style>
    </Flex>
  );
}
