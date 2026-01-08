import { Card, Form, Button, Flex, Typography, Badge, message } from 'antd'
import {
  SaveOutlined,
  CloseOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
  ExpandAltOutlined,
  CompressOutlined,
} from '@ant-design/icons'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
import dayjs from 'dayjs'
import weekday from 'dayjs/plugin/weekday'
import localeData from 'dayjs/plugin/localeData'
import {
  SupplierSearchModal,
  ItemSearchModal,
  POLineItemTable,
  SaveStatusModal,
  POSummarySection,
  SupplierSection,
  POFormTabs,
} from '../components'
import { ConfirmModal } from '../../../../../shared/src'
import type { POLineItem } from '../components/POLineItemTable'
import type { SaveStatus } from '../components/SaveStatusModal'
import { usePOFormData } from '../hooks/usePOFormData'
import { useVATCalculation } from '../hooks/useVATCalculation'
import { useDeleteLineValidation } from '../hooks/useDeleteLineValidation'
import {
  calculatePaymentDueDate,
  getUnitConversionList,
  getSupplier,
  poInsert,
  poUpdate,
} from '../services'
import type { Supplier, ItemListItem, UnitConversion, PODetail, POInsertRequest } from '../types'

// Extend dayjs for antd DatePicker
dayjs.extend(weekday)
dayjs.extend(localeData)

const { Text } = Typography

interface POFormProps {
  canEdit?: boolean
}

export function POForm({ canEdit = true }: POFormProps) {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const [form] = Form.useForm()

  const isEditMode = !!id
  const isViewMode = searchParams.get('view') === 'true'
  const isPrintMode = searchParams.get('print') === 'true'
  const isReadOnly = isViewMode || !canEdit

  // Use custom hook for data fetching
  const {
    username,
    accessToken,
    companyCode,
    selectedDocumentTypeCode,
    serieInfo,
    isLoadingSerie,
    paymentTerms,
    currencies,
    warehouses,
    companyInfo,
    lineItems,
    setLineItems,
  } = usePOFormData({ form, isEditMode, id })

  // Modal states
  const [supplierModalOpen, setSupplierModalOpen] = useState(false)
  const [itemModalOpen, setItemModalOpen] = useState(false)
  const [selectedLineKey, setSelectedLineKey] = useState<string | null>(null)
  const [isLoadingItem, setIsLoadingItem] = useState(false)

  // Save modal state
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saving')
  const [saveErrorMessage, setSaveErrorMessage] = useState('')

  // Confirm modal state
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [confirmModalType, setConfirmModalType] = useState<'save' | 'cancel'>('save')

  // Expand card state
  const [isExpanded, setIsExpanded] = useState(false)

  // Watch form fields
  const poDate = Form.useWatch('podate', form)
  const targetShippingDate = Form.useWatch('targetShippingDate', form)
  const discountStringBeforeVAT = Form.useWatch('discountStringBeforeVAT', form)
  const exchangeRate = Form.useWatch('exchangeRate', form)
  const currencyCode = Form.useWatch('currencyCode', form)
  const vatRate = Form.useWatch('vatRate', form)
  const adjustVatEnabled = Form.useWatch('adjustVatEnabled', form)
  const vatBasedForVATAmountCurrency = Form.useWatch('vatBasedForVATAmountCurrency', form)
  const vatAmountCurrencyWatch = Form.useWatch('vatAmountCurrency', form)

  // VAT calculation hook
  useVATCalculation({
    form,
    lineItems,
    accessToken,
    companyCode,
    companyInfo,
    discountStringBeforeVAT,
    exchangeRate,
    vatRate,
    adjustVatEnabled,
    vatBasedForVATAmountCurrency,
    vatAmountCurrencyWatch,
  })

  // Delete line validation hook
  const { validateDelete, isValidating: isValidatingDelete } = useDeleteLineValidation({
    form,
    lineItems,
    accessToken,
    companyCode,
    companyInfo,
  })

  // Auto print when in print mode
  useEffect(() => {
    if (isPrintMode && isViewMode && lineItems.length > 0 && lineItems[0].transactionCode) {
      const timer = setTimeout(() => {
        window.print()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isPrintMode, isViewMode, lineItems])

  const pageTitle = isViewMode
    ? 'ดูรายละเอียดใบสั่งซื้อ'
    : isEditMode
    ? 'แก้ไขใบสั่งซื้อ'
    : 'สร้างใบสั่งซื้อ'

  // Handlers
  const handleCancel = useCallback(() => {
    if (isReadOnly) {
      navigate('..')
      return
    }
    setConfirmModalType('cancel')
    setConfirmModalOpen(true)
  }, [isReadOnly, navigate])

  const handleSaveClick = useCallback(async () => {
    try {
      await form.validateFields()

      const validLineItems = lineItems.filter((item) => item.transactionCode && item.statusRow !== 'D')
      if (validLineItems.length === 0) {
        message.error('กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ')
        return
      }

      const invalidQuantityItems = validLineItems.filter((item) => !item.quantity || item.quantity <= 0)
      if (invalidQuantityItems.length > 0) {
        const lineNumbers = invalidQuantityItems.map((item) => item.vline).join(', ')
        message.error(`กรุณาระบุจำนวนสินค้าให้มากกว่า 0 (รายการที่ ${lineNumbers})`)
        return
      }

      setConfirmModalType('save')
      setConfirmModalOpen(true)
    } catch {
      // Validation failed
    }
  }, [form, lineItems])

  const handleConfirmOk = useCallback(() => {
    setConfirmModalOpen(false)
    if (confirmModalType === 'save') {
      form.submit()
    } else {
      navigate('..')
    }
  }, [confirmModalType, form, navigate])

  const handleConfirmCancel = useCallback(() => {
    setConfirmModalOpen(false)
  }, [])

  const handleSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      if (!isEditMode && (!username || !accessToken || !companyCode || !serieInfo)) {
        console.error('Missing required data for submit')
        return
      }

      if (isEditMode && (!username || !accessToken || !companyCode)) {
        console.error('Missing required data for submit')
        return
      }

      // Build poDetails
      const poDetails: PODetail[] = lineItems
        .filter((item) => item.transactionCode || item.statusRow === 'D')
        .map((item) => {
          const pricePerUnit = item.unitPriceCurrency || 0
          const quantity = item.quantity || 0
          const discount = item.discount || ''
          let discountPerUnit = 0
          if (discount.includes('%')) {
            const percent = parseFloat(discount.replace('%', ''))
            discountPerUnit = (pricePerUnit * percent) / 100
          } else {
            discountPerUnit = parseFloat(discount) || 0
          }
          const totalAmountCurrency = pricePerUnit * quantity
          const totalAmountAfterDiscount = (pricePerUnit - discountPerUnit) * quantity

          return {
            noLine: item.statusRow === 'N' ? item.vline : item.noLine,
            vline: item.vline,
            transactionCode: item.transactionCode,
            transactionDescription: item.transactionDescription,
            transactionCodeSupplier: '',
            quantity: quantity,
            defaultUnitCode: item.purchaseUnitCode,
            purchaseUnitCode: item.purchaseUnitCode,
            unitPriceCurrency: pricePerUnit,
            discount: discount,
            totalAmountCurrency: totalAmountCurrency,
            totalAmountAfterDiscount: totalAmountAfterDiscount,
            statusRow: item.statusRow,
            excludeVATTrueFalse: false,
          }
        })

      const request: POInsertRequest = {
        userName: username,
        poOrder: {
          documentModuleCode: 'PO',
          documentTypeCode: selectedDocumentTypeCode || '',
          runNo: isEditMode ? parseInt(id || '0') : 0,
          pono: (values.pono as string) || '',
          podate: values.podate
            ? (values.podate as dayjs.Dayjs).format('YYYY-MM-DDTHH:mm:ss')
            : dayjs().format('YYYY-MM-DDTHH:mm:ss'),
          refNoYours: (values.supplierRefDoc as string) || '',
          refNoOurs: (values.companyRefDoc as string) || '',
          supplierCode: (values.supplierCode as string) || '',
          supplierPrefix: '',
          supplierName: (values.supplierName as string) || '',
          supplierSuffix: '',
          targetShippingDate: values.targetShippingDate
            ? (values.targetShippingDate as dayjs.Dayjs).format('YYYY-MM-DDTHH:mm:ss')
            : null,
          paymentTermCode: (values.paymentTermCode as string) || '',
          paymentDueDate: values.paymentDueDate
            ? (values.paymentDueDate as dayjs.Dayjs).format('YYYY-MM-DDTHH:mm:ss')
            : null,
          currencyCode: (values.currencyCode as string) || 'THB',
          exchangeRate: parseFloat(values.exchangeRate as string) || 1,
          totalAmountCurrency: (values.totalAmountCurrency as number) || 0,
          vatrate: 7,
          vatamountCurrency: (values.vatAmountCurrency as number) || 0,
          totalAmountCurrencyAfterVat: (values.totalAmountCurrencyAfterVAT as number) || 0,
          amountDiscountCurrency: (values.amountDiscountCurrency as number) || 0,
          totalAmountCurrencyAfterDiscountBeforeVat:
            (values.totalAmountCurrencyAfterDiscountBeforeVAT as number) || 0,
          discountStringBeforeVat: (values.discountStringBeforeVAT as string) || '',
          note: (values.note as string) || '',
          totalAmountIncludeVattrueFalse: false,
          costCenterCode: '',
          costCenterName: '',
          billingCode: (values.billingCode as string) || '',
          contactName: (values.contactName as string) || '',
          paymentTermRefDoc: (values.paymentTermRefDoc as string) || '',
          memo: (values.memo as string) || '',
          sellerRefNo: (values.quotationRefDoc as string) || '',
          adjustVATYesNo: values.adjustVatEnabled ? 'Y' : '',
          poDetails: poDetails,
        },
      }

      setSaveModalOpen(true)
      setSaveStatus('saving')
      setSaveErrorMessage('')

      try {
        const response = isEditMode
          ? await poUpdate(request, accessToken, companyCode)
          : await poInsert(request, accessToken, companyCode)

        if (response.code === 0) {
          setSaveStatus('success')
          setTimeout(() => {
            setSaveModalOpen(false)
            navigate('..')
          }, 1500)
        } else {
          setSaveStatus('error')
          setSaveErrorMessage(response.msg || 'เกิดข้อผิดพลาดในการบันทึก')
        }
      } catch (error) {
        console.error(isEditMode ? 'POUpdate error:' : 'POInsert error:', error)
        setSaveStatus('error')
        setSaveErrorMessage('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง')
      }
    },
    [username, accessToken, companyCode, serieInfo, isEditMode, id, selectedDocumentTypeCode, lineItems, navigate]
  )

  const handleSupplierSelect = useCallback(
    async (supplier: Supplier) => {
      form.setFieldsValue({
        supplierCode: supplier.code,
        supplierName: supplier.nameThai,
        paymentTermCode: supplier.paymentTermCode,
      })

      if (accessToken && companyCode) {
        try {
          const response = await getSupplier(supplier.code, accessToken, companyCode)
          if (response.code === 0 && response.result) {
            form.setFieldsValue({
              fullAddress: response.result.fullAddress || '',
              supplierPhone: response.result.phone || '',
            })
          }
        } catch (error) {
          console.error('Failed to fetch supplier detail:', error)
        }
      }

      if (supplier.paymentTermCode) {
        handlePaymentTermChange(supplier.paymentTermCode)
      }
    },
    [form, accessToken, companyCode]
  )

  const handlePaymentTermChange = useCallback(
    async (paymentTermCode: string) => {
      if (!paymentTermCode || !accessToken || !companyCode) {
        form.setFieldValue('paymentDueDate', null)
        return
      }

      const poDateValue = form.getFieldValue('podate') as dayjs.Dayjs | null
      const refDate = poDateValue ? poDateValue.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')

      try {
        const response = await calculatePaymentDueDate(paymentTermCode, refDate, accessToken, companyCode)
        if (response.code === 0 && response.result) {
          form.setFieldValue('paymentDueDate', dayjs(response.result))
        }
      } catch (error) {
        console.error('Failed to calculate payment due date:', error)
      }
    },
    [form, accessToken, companyCode]
  )

  // Line item handlers
  const handleAddLine = useCallback(() => {
    const visibleItems = lineItems.filter((item) => item.statusRow !== 'D')
    const newVline = visibleItems.length + 1
    setLineItems([
      ...lineItems,
      {
        key: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        noLine: 0,
        vline: newVline,
        transactionCode: '',
        transactionDescription: '',
        quantity: 0,
        purchaseUnitCode: '',
        unitPriceCurrency: 0,
        discount: '',
        statusRow: 'N',
      },
    ])
  }, [lineItems, setLineItems])

  const handleDeleteLine = useCallback(
    async (key: string) => {
      const itemToDelete = lineItems.find((item) => item.key === key)
      if (!itemToDelete) return

      // Validate delete through API before actually deleting
      const validationResult = await validateDelete(key)
      if (!validationResult.isValid) {
        message.error(validationResult.errorMessage || 'ไม่สามารถลบรายการได้')
        return
      }

      let newLineItems: typeof lineItems

      if (itemToDelete.statusRow === 'E') {
        const updated = lineItems.map((item) =>
          item.key === key ? { ...item, statusRow: 'D' as const } : item
        )
        let vlineCounter = 1
        newLineItems = updated.map((item) => {
          if (item.statusRow === 'D') return item
          return { ...item, vline: vlineCounter++ }
        })
      } else {
        const filtered = lineItems.filter((item) => item.key !== key)
        let vlineCounter = 1
        newLineItems = filtered.map((item) => {
          if (item.statusRow === 'D') return item
          return { ...item, vline: vlineCounter++ }
        })
      }

      setLineItems(newLineItems)

      // Clear discount when all valid items are deleted
      const hasValidItems = newLineItems.some((item) => item.transactionCode && item.statusRow !== 'D')
      if (!hasValidItems) {
        form.setFieldValue('discountStringBeforeVAT', '')
      }
    },
    [lineItems, setLineItems, validateDelete, form]
  )

  const handleUndoDelete = useCallback(
    (key: string) => {
      const updated = lineItems.map((item) =>
        item.key === key ? { ...item, statusRow: 'E' as const } : item
      )
      let vlineCounter = 1
      const renumbered = updated.map((item) => {
        if (item.statusRow === 'D') return item
        return { ...item, vline: vlineCounter++ }
      })
      setLineItems(renumbered)
    },
    [lineItems, setLineItems]
  )

  const handleLineChange = useCallback(
    (key: string, field: keyof POLineItem, value: unknown) => {
      setLineItems((prev) => prev.map((item) => (item.key === key ? { ...item, [field]: value } : item)))
    },
    [setLineItems]
  )

  const openModalProductList = useCallback((key: string) => {
    setSelectedLineKey(key)
    setItemModalOpen(true)
  }, [])

  const handleItemSelect = useCallback(
    async (item: ItemListItem) => {
      if (selectedLineKey === null) return
      if (!accessToken || !companyCode) return

      setIsLoadingItem(true)

      let unitOptions: UnitConversion[] = []
      if (item.defaultUnitCode) {
        try {
          const response = await getUnitConversionList(item.defaultUnitCode, accessToken, companyCode)
          if (response.code === 0 && response.result) {
            unitOptions = response.result
          }
        } catch (error) {
          console.error('Failed to fetch unit conversion list:', error)
          message.warning('ไม่สามารถโหลดหน่วยสินค้าได้')
        }
      }

      setLineItems((prev) =>
        prev.map((lineItem) =>
          lineItem.key === selectedLineKey
            ? {
                ...lineItem,
                transactionCode: item.code,
                transactionDescription: item.purchaseNameT || item.t,
                purchaseUnitCode: item.purchaseUnitCode || '',
                unitOptions: unitOptions.map((u) => ({ code: u.code, t: u.t })),
              }
            : lineItem
        )
      )

      setIsLoadingItem(false)
    },
    [selectedLineKey, accessToken, companyCode, setLineItems]
  )

  return (
    <Flex vertical style={{ height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <Flex justify="space-between" align="center" style={{ flexShrink: 0, marginBottom: 12 }}>
        <Flex align="center" gap={8}>
          <Text strong style={{ fontSize: 16 }}>
            {pageTitle}
          </Text>
          {!isEditMode && serieInfo && (
            <Badge
              count={`เลขที่ ${serieInfo.yearForRunNo}/${serieInfo.nextNumber}`}
              style={{ backgroundColor: '#52c41a', fontSize: 16 }}
            />
          )}
          {!isEditMode && isLoadingSerie && (
            <Badge count="กำลังโหลด..." style={{ backgroundColor: '#1890ff' }} />
          )}
        </Flex>
        {!isReadOnly && (
          <Flex gap={8}>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveClick}>
              บันทึก
            </Button>
            <Button icon={<CloseOutlined />} onClick={handleCancel}>
              กลับ
            </Button>
          </Flex>
        )}
        {isReadOnly && <Button onClick={handleCancel}>กลับ</Button>}
      </Flex>

      {/* Content */}
      <div className="antd-scrollbar" style={{ flex: 1, overflow: 'auto' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={isReadOnly}
          initialValues={{
            podate: dayjs(),
            currencyCode: 'THB',
            exchangeRate: 1,
            vatRate: 7,
            adjustVatEnabled: false,
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
              e.preventDefault()
            }
          }}
        >
          {/* Supplier Section */}
          <SupplierSection
            form={form}
            isReadOnly={isReadOnly}
            isExpanded={isExpanded}
            paymentTerms={paymentTerms}
            currencies={currencies}
            currencyCode={currencyCode}
            poDate={poDate}
            targetShippingDate={targetShippingDate}
            onSupplierSearch={() => setSupplierModalOpen(true)}
            onPaymentTermChange={handlePaymentTermChange}
          />

          {/* Tabs Section */}
          <POFormTabs form={form} isExpanded={isExpanded} warehouses={warehouses} />

          {/* Line Items Section */}
          <Card style={{ marginTop: isExpanded ? 0 : 16 }}>
            <Flex align="center" justify="space-between" style={{ marginBottom: 16 }}>
              <Flex align="center" gap={12}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: '#52c41a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShoppingCartOutlined style={{ color: '#fff', fontSize: 16 }} />
                </div>
                <Text strong style={{ fontSize: 16 }}>
                  รายการสินค้า
                </Text>
              </Flex>
              <Button
                type="text"
                icon={isExpanded ? <CompressOutlined /> : <ExpandAltOutlined />}
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'ย่อ' : 'ขยาย'}
              />
            </Flex>

            <POLineItemTable
              lineItems={lineItems}
              isReadOnly={isReadOnly}
              isLoadingItem={isLoadingItem}
              isValidatingDelete={isValidatingDelete}
              onLineChange={handleLineChange}
              onDeleteLine={handleDeleteLine}
              onUndoDelete={handleUndoDelete}
              onOpenProductModal={openModalProductList}
            />

            {!isReadOnly && (
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={handleAddLine}
                block
                style={{ marginTop: 16, outline: 'none' }}
              >
                เพิ่มรายการ
              </Button>
            )}
          </Card>

          {/* Summary Section */}
          <POSummarySection
            form={form}
            currencyCode={currencyCode}
            isReadOnly={isReadOnly}
            adjustVatEnabled={adjustVatEnabled}
          />
        </Form>
      </div>

      {/* Modals */}
      <SupplierSearchModal
        open={supplierModalOpen}
        onCancel={() => setSupplierModalOpen(false)}
        onSelect={handleSupplierSelect}
      />

      <ItemSearchModal
        open={itemModalOpen}
        onCancel={() => setItemModalOpen(false)}
        onSelect={handleItemSelect}
      />

      <ConfirmModal
        open={confirmModalOpen}
        title={confirmModalType === 'save' ? 'ยืนยันการบันทึก' : 'ยืนยันการยกเลิก'}
        message={
          confirmModalType === 'save'
            ? isEditMode
              ? 'ต้องการบันทึกการแก้ไขใบสั่งซื้อหรือไม่?'
              : 'ต้องการบันทึกใบสั่งซื้อหรือไม่?'
            : isEditMode
            ? 'ต้องการยกเลิกการแก้ไขใบสั่งซื้อหรือไม่?'
            : 'ต้องการยกเลิกการสร้างใบสั่งซื้อหรือไม่?'
        }
        confirmText={confirmModalType === 'save' ? 'บันทึก' : 'ยืนยัน'}
        cancelText={confirmModalType === 'save' ? 'ยกเลิก' : 'ไม่'}
        onConfirm={handleConfirmOk}
        onCancel={handleConfirmCancel}
      />

      <SaveStatusModal
        open={saveModalOpen}
        status={saveStatus}
        errorMessage={saveErrorMessage}
        isEditMode={isEditMode}
        onClose={() => setSaveModalOpen(false)}
      />

      {/* Styles */}
      <style>{`
        .input-number-right .ant-input-number-input {
          text-align: right;
        }
        .summary-total-input {
          background-color: transparent !important;
          border: none !important;
        }
        .summary-total-input .ant-input-number-input {
          color: #fff !important;
          text-align: right;
          font-size: 18px;
          font-weight: bold;
        }
        .summary-total-input.ant-input-number-disabled {
          background-color: transparent !important;
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
  )
}
