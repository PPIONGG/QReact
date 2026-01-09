import { Modal, Button, Flex, Table, message } from 'antd'
import { PrinterOutlined } from '@ant-design/icons'
import { useState, useCallback, useEffect } from 'react'
import type { ColumnsType } from 'antd/es/table'
import type { PrintForm } from '../types'
import { printFormService } from '../services'
import { useAuthStore } from '../stores'

// Document type print form code (constant)
const DOCUMENT_TYPE_PRINT_FORM_CODE = 'PODOG'

interface PrintFormSelectModalProps {
  open: boolean
  runNo: number | null
  documentTypeCode: string | null
  onCancel: () => void
}

export function PrintFormSelectModal({
  open,
  runNo,
  documentTypeCode,
  onCancel,
}: PrintFormSelectModalProps) {
  const { accessToken, companyCode } = useAuthStore()
  const [printForms, setPrintForms] = useState<PrintForm[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [selectedRowKey, setSelectedRowKey] = useState<number | null>(null)

  // Fetch print form list when modal opens
  useEffect(() => {
    if (open) {
      fetchPrintFormList()
    }
  }, [open])

  // Generate PDF and open in new tab
  const generatePDF = async (form: PrintForm) => {
    if (runNo === null || !documentTypeCode) return

    // Open window BEFORE async operation to avoid popup blocker
    const pdfWindow = window.open('', '_blank')

    if (!pdfWindow) {
      message.error('ไม่สามารถเปิดหน้าต่างใหม่ได้ กรุณาอนุญาต popup')
      return
    }

    // Show loading message in new window
    pdfWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>PO Report</title>
          <style>
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: #f5f5f5;
            }
            .loader {
              text-align: center;
            }
            .spinner {
              width: 50px;
              height: 50px;
              border: 4px solid #e0e0e0;
              border-top: 4px solid #1890ff;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 0 auto 20px;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            p {
              color: #666;
              font-size: 16px;
            }
          </style>
        </head>
        <body>
          <div class="loader">
            <div class="spinner"></div>
            <p>กำลังโหลดรายงาน...</p>
          </div>
        </body>
      </html>
    `)

    setIsGeneratingPDF(true)
    try {
      const pdfBlob = await printFormService.getPOReportPDF(
        {
          CompanyCode: companyCode || '',
          DocumentTypeCode: documentTypeCode,
          RunNo: runNo,
          DocumentTypePrintFormCode: DOCUMENT_TYPE_PRINT_FORM_CODE,
          OrderPrintFormInDocumentTypePrintForm: form.orderPrintFormInDocumentTypePrintForm,
        },
        accessToken || '',
        companyCode || ''
      )

      const blobUrl = URL.createObjectURL(pdfBlob)
      pdfWindow.location.href = blobUrl

      onCancel() // Close modal after success
    } catch (error) {
      console.error('Error generating PDF:', error)
      pdfWindow.close()
      message.error('เกิดข้อผิดพลาดในการสร้างรายงาน')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const fetchPrintFormList = async () => {
    setIsLoading(true)
    try {
      const response = await printFormService.getPrintFormList(
        DOCUMENT_TYPE_PRINT_FORM_CODE,
        accessToken || '',
        companyCode || ''
      )

      if (response.code === 0 && response.result) {
        const forms = response.result

        // If only one form, skip selection and generate PDF directly
        if (forms.length === 1) {
          setPrintForms(forms)
          setSelectedRowKey(forms[0].orderPrintFormInDocumentTypePrintForm)
          // Generate PDF immediately
          await generatePDF(forms[0])
          return
        }

        setPrintForms(forms)
        // Auto-select first item if available
        if (forms.length > 0) {
          setSelectedRowKey(forms[0].orderPrintFormInDocumentTypePrintForm)
        }
      } else {
        message.error(response.msg || 'ไม่สามารถดึงรายการฟอร์มได้')
        setPrintForms([])
      }
    } catch (error) {
      console.error('Error fetching print form list:', error)
      message.error('เกิดข้อผิดพลาดในการดึงรายการฟอร์ม')
      setPrintForms([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAfterClose = useCallback(() => {
    setSelectedRowKey(null)
    setPrintForms([])
  }, [])

  const handleConfirm = async () => {
    if (selectedRowKey === null) return

    const selectedForm = printForms.find(
      (form) => form.orderPrintFormInDocumentTypePrintForm === selectedRowKey
    )

    if (!selectedForm) return

    await generatePDF(selectedForm)
  }

  const columns: ColumnsType<PrintForm> = [
    {
      title: 'เลือก',
      key: 'select',
      width: 60,
      align: 'center',
      render: (_, record) => (
        <input
          type="checkbox"
          checked={selectedRowKey === record.orderPrintFormInDocumentTypePrintForm}
          onChange={() => {
            if (!isGeneratingPDF) {
              setSelectedRowKey(record.orderPrintFormInDocumentTypePrintForm)
            }
          }}
          disabled={isGeneratingPDF}
          style={{
            cursor: isGeneratingPDF ? 'not-allowed' : 'pointer',
            width: 16,
            height: 16,
          }}
        />
      ),
    },
    {
      title: 'หมายเหตุ',
      dataIndex: 'remark',
      key: 'remark',
    },
  ]

  return (
    <Modal
      open={open}
      title={
        <Flex align="center" gap={8}>
          <PrinterOutlined style={{ color: '#1890ff', fontSize: 22 }} />
          <span>เลือกฟอร์มสำหรับพิมพ์</span>
        </Flex>
      }
      footer={
        <Flex gap={8} justify="flex-end">
          <Button
            type="primary"
            onClick={handleConfirm}
            disabled={selectedRowKey === null}
            loading={isGeneratingPDF}
          >
            เลือกพิมพ์ฟอร์ม
          </Button>
          <Button onClick={onCancel} disabled={isGeneratingPDF}>
            ยกเลิก
          </Button>
        </Flex>
      }
      onCancel={onCancel}
      afterClose={handleAfterClose}
      centered
      width={500}
      destroyOnHidden
      maskClosable={false}
      closable={!isGeneratingPDF}
      keyboard={!isGeneratingPDF}
    >
      <Table
        columns={columns}
        dataSource={printForms}
        rowKey="orderPrintFormInDocumentTypePrintForm"
        loading={isLoading || isGeneratingPDF}
        pagination={false}
        size="small"
        onRow={(record) => ({
          onClick: () => {
            if (!isGeneratingPDF) {
              setSelectedRowKey(record.orderPrintFormInDocumentTypePrintForm)
            }
          },
          style: {
            cursor: isGeneratingPDF ? 'not-allowed' : 'pointer',
            backgroundColor:
              selectedRowKey === record.orderPrintFormInDocumentTypePrintForm
                ? '#e6f4ff'
                : undefined,
            opacity: isGeneratingPDF ? 0.5 : 1,
          },
        })}
      />
    </Modal>
  )
}
