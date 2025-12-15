import { useEffect, useState } from 'react'
import { Flex, Spin, Button, Typography } from 'antd'
import { PrinterOutlined, CloseOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useAuthStore, useSelectedDocumentType } from '../stores'
import { getPOOrder } from '../services'
import type { PODetail } from '../types'

const { Text } = Typography

interface POPrintPreviewProps {
  runNo: number
  open: boolean
  onClose: () => void
}

interface POOrderData {
  pono: string
  podate: string
  supplierCode: string
  supplierName: string
  fullAddress?: string
  phone?: string
  targetShippingDate?: string
  paymentTermCode?: string
  paymentDueDate?: string
  currencyCode: string
  exchangeRate: number
  contactName?: string
  refNoYours?: string
  refNoOurs?: string
  sellerRefNo?: string
  note?: string
  memo?: string
  billingCode?: string
  billingName?: string
  billingAddress?: string
  totalAmountCurrency: number
  amountDiscountCurrency: number
  discountStringBeforeVat?: string
  totalAmountCurrencyAfterDiscountBeforeVat: number
  vatamountCurrency: number
  totalAmountCurrencyAfterVat: number
  poDetails: PODetail[]
}

export function POPrintPreview({ runNo, open, onClose }: POPrintPreviewProps) {
  const { username, accessToken, companyCode } = useAuthStore()
  const selectedDocumentTypeCode = useSelectedDocumentType()
  const [loading, setLoading] = useState(true)
  const [poData, setPOData] = useState<POOrderData | null>(null)

  useEffect(() => {
    if (!open || !runNo || !username || !accessToken || !companyCode || !selectedDocumentTypeCode) {
      return
    }

    const fetchPOData = async () => {
      setLoading(true)
      try {
        const response = await getPOOrder(
          'PO',
          selectedDocumentTypeCode,
          runNo,
          username,
          accessToken,
          companyCode
        )
        if (response.code === 0 && response.result) {
          setPOData(response.result as unknown as POOrderData)
        }
      } catch (error) {
        console.error('Failed to fetch PO data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPOData()
  }, [open, runNo, username, accessToken, companyCode, selectedDocumentTypeCode])

  const handlePrint = () => {
    window.print()
  }

  if (!open) return null

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const formatDate = (date: string | undefined) => {
    if (!date) return ''
    return dayjs(date).format('DD/MM/YYYY')
  }

  // Calculate total pages (simple version - 1 page for now)
  const totalPages = 1
  const currentPage = 1

  return (
    <div className="print-preview-overlay">
      {/* Toolbar - hidden when printing */}
      <div className="print-toolbar no-print">
        <Flex justify="center" gap={16} style={{ padding: '16px', background: '#1890ff' }}>
          <Button type="primary" icon={<PrinterOutlined />} onClick={handlePrint} style={{ background: '#52c41a', borderColor: '#52c41a' }}>
            พิมพ์เอกสาร
          </Button>
          <Button icon={<CloseOutlined />} onClick={onClose}>
            ปิด
          </Button>
        </Flex>
      </div>

      {/* Print Content */}
      <div className="print-content-wrapper">
        {loading ? (
          <Flex justify="center" align="center" style={{ minHeight: 400 }}>
            <Spin size="large" />
          </Flex>
        ) : poData ? (
          <div className="document-page">
            {/* Main Border */}
            <div className="document-border">
              {/* Header */}
              <div className="doc-header">
                <div className="header-left">
                  <div className="company-logo">
                    <img src="/logo.png" alt="Logo" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                    <span className="logo-text">LOGO</span>
                  </div>
                  <div className="company-info">
                    <div className="company-name-th">บริษัท แฟลก วิคทอรี่ จำกัด (สำนักงานใหญ่)</div>
                    <div className="company-address-th">1 ซอยสุขสวัสดิ์ 31 แขวงราษฎร์บูรณะ เขตราษฎร์บูรณะ กรุงเทพฯ 10140</div>
                    <div className="company-contact">โทรศัพท์: 02-8730025-6 โทรสาร: 02-8730027</div>
                    <div className="company-tax">เลขที่ผู้เสียภาษี 0105553123053</div>
                  </div>
                </div>
                <div className="header-right">
                  <div className="page-number">Page {currentPage}/{totalPages}</div>
                </div>
              </div>

              {/* Document Title */}
              <div className="doc-title">
                <div className="title-text">ใบสั่งซื้อ</div>
                <div className="title-info">
                  <div className="title-row">
                    <span className="label">วันที่ใบสั่งซื้อ :</span>
                    <span className="value">{formatDate(poData.podate)}</span>
                  </div>
                  <div className="title-row">
                    <span className="label">เลขที่ใบสั่งซื้อ :</span>
                    <span className="value highlight">{poData.pono}</span>
                  </div>
                </div>
              </div>

              {/* Supplier & Delivery Info */}
              <div className="info-section">
                <div className="info-left">
                  <div className="info-group">
                    <div className="info-row">
                      <span className="label">ชื่อ ผู้ขาย</span>
                      <span className="label-en">สถานที่ส่งสินค้า</span>
                    </div>
                    <div className="info-row">
                      <span className="value">{poData.supplierCode}</span>
                      <span className="value">{poData.billingCode || ''}</span>
                    </div>
                    <div className="info-row full">
                      <span className="value">{poData.supplierName}</span>
                    </div>
                    <div className="info-row full address">
                      <span className="value">{poData.fullAddress || ''}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">โทรศัพท์:</span>
                      <span className="value">{poData.phone || ''}</span>
                    </div>
                  </div>
                </div>
                <div className="info-right">
                  <div className="info-row">
                    <span className="label">กำหนดส่งสินค้า :</span>
                    <span className="value">{formatDate(poData.targetShippingDate)}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">การชำระเงิน :</span>
                    <span className="value">{poData.paymentTermCode || 'เงินสด'}</span>
                  </div>
                </div>
              </div>

              {/* Request Text */}
              <div className="request-text">
                <div className="text-th">โปรดจัดส่งสินค้าตามรายการและเงื่อนไขราคาที่ได้ตกลงดังนี้</div>
                <div className="text-en">PLEASE SUPPLY YOURSGOODS IN ACCORDANCE TO PRICE AND DESCRIPTION MENTIONED UNDER:</div>
              </div>

              {/* Items Table */}
              <table className="items-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>ลำดับ</th>
                    <th style={{ width: '80px' }}>เลขที่รหัสซื้อ</th>
                    <th style={{ width: '100px' }}>รหัส</th>
                    <th>รายการ</th>
                    <th style={{ width: '60px' }}>จำนวน</th>
                    <th style={{ width: '50px' }}>หน่วย</th>
                    <th style={{ width: '80px' }}>หน่วยละ</th>
                    <th style={{ width: '60px' }}>ส่วนลด</th>
                    <th style={{ width: '90px' }}>จำนวนเงิน</th>
                  </tr>
                </thead>
                <tbody>
                  {poData.poDetails.map((item, index) => (
                    <tr key={item.noLine}>
                      <td className="center">{index + 1}</td>
                      <td></td>
                      <td>{item.transactionCode}</td>
                      <td>{item.transactionDescription}</td>
                      <td className="right">{formatNumber(item.quantity)}</td>
                      <td className="center">{item.purchaseUnitCode}</td>
                      <td className="right">{formatNumber(item.unitPriceCurrency)}</td>
                      <td className="right">{item.discount || ''}</td>
                      <td className="right">{formatNumber(item.totalAmountAfterDiscount)}</td>
                    </tr>
                  ))}
                  {/* Fill empty rows */}
                  {Array.from({ length: Math.max(0, 8 - poData.poDetails.length) }).map((_, i) => (
                    <tr key={`empty-${i}`} className="empty-row">
                      <td>&nbsp;</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Bottom Section */}
              <div className="bottom-section">
                <div className="bottom-left">
                  <div className="remarks-section">
                    <div className="remarks-label">รายละเอียดและเงื่อนไขเพิ่มเติม</div>
                    <div className="remarks-row">
                      <span className="label">หมายเหตุ</span>
                      <span className="value">{poData.note || ''}</span>
                    </div>
                  </div>
                  <div className="discount-note">
                    **ส่วนลดร้อยละสิบส่งสินค้าภายในสามเสาร์**
                  </div>
                </div>
                <div className="bottom-right">
                  <div className="summary-row">
                    <span className="label">รวมเงินสิน / Total</span>
                    <span className="value">{formatNumber(poData.totalAmountCurrency)}</span>
                  </div>
                  <div className="summary-row">
                    <span className="label">หักส่วนลดการค้า / Trans Discount</span>
                    <span className="value">{formatNumber(poData.amountDiscountCurrency)}</span>
                  </div>
                  <div className="summary-row">
                    <span className="label">มูลค่าสินค้าก่อนภาษี / Excluding Vat</span>
                    <span className="value">{formatNumber(poData.totalAmountCurrencyAfterDiscountBeforeVat)}</span>
                  </div>
                  <div className="summary-row">
                    <span className="label">ภาษีมูลค่าเพิ่ม / 7%</span>
                    <span className="value">{formatNumber(poData.vatamountCurrency)}</span>
                  </div>
                  <div className="summary-row total">
                    <span className="label">รวมมูลค่าสินค้า / Sub Total</span>
                    <span className="value">{formatNumber(poData.totalAmountCurrencyAfterVat)}</span>
                  </div>
                </div>
              </div>

              {/* Signature Section */}
              <div className="signature-section">
                <div className="signature-box">
                  <div className="signature-line"></div>
                  <div className="signature-label">ผู้ขาย/Seller</div>
                </div>
                <div className="signature-box">
                  <div className="signature-line"></div>
                  <div className="signature-label">ผู้จัดทำ/REPORT BY</div>
                </div>
                <div className="signature-box">
                  <div className="signature-line"></div>
                  <div className="signature-label">ผู้อนุมัติ/APPROVED BY</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Flex justify="center" align="center" style={{ minHeight: 400 }}>
            <Text type="secondary">ไม่พบข้อมูล</Text>
          </Flex>
        )}
      </div>

      {/* Print Styles */}
      <style>{`
        .print-preview-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #525659;
          z-index: 1000;
          overflow: auto;
        }

        .print-content-wrapper {
          padding: 20px;
          display: flex;
          justify-content: center;
        }

        .document-page {
          width: 210mm;
          min-height: 297mm;
          background: white;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          padding: 10mm;
        }

        .document-border {
          border: 1px solid #333;
          min-height: calc(297mm - 20mm);
          padding: 5mm;
          font-family: 'Sarabun', 'Tahoma', sans-serif;
          font-size: 11px;
        }

        /* Header */
        .doc-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding-bottom: 5px;
        }

        .header-left {
          display: flex;
          gap: 10px;
        }

        .company-logo {
          width: 80px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .company-logo img {
          max-width: 100%;
          max-height: 100%;
        }

        .logo-text {
          color: #1890ff;
          font-weight: bold;
          font-size: 14px;
        }

        .company-info {
          font-size: 10px;
        }

        .company-name-th {
          color: #1890ff;
          font-size: 14px;
          font-weight: bold;
        }

        .company-address-th, .company-contact, .company-tax {
          color: #666;
        }

        .header-right {
          text-align: right;
        }

        .page-number {
          font-size: 10px;
          color: #666;
        }

        /* Document Title */
        .doc-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #1890ff;
          padding-bottom: 5px;
          margin-bottom: 10px;
        }

        .title-text {
          font-size: 18px;
          font-weight: bold;
          color: #1890ff;
        }

        .title-info {
          text-align: right;
        }

        .title-row {
          margin-bottom: 2px;
        }

        .title-row .label {
          color: #666;
        }

        .title-row .value {
          margin-left: 10px;
        }

        .title-row .value.highlight {
          color: #1890ff;
          font-weight: bold;
        }

        /* Info Section */
        .info-section {
          display: flex;
          margin-bottom: 10px;
          font-size: 10px;
        }

        .info-left {
          flex: 2;
        }

        .info-right {
          flex: 1;
          text-align: right;
        }

        .info-row {
          display: flex;
          gap: 20px;
          margin-bottom: 2px;
        }

        .info-row.full {
          display: block;
        }

        .info-row.address {
          min-height: 30px;
        }

        .info-row .label {
          color: #1890ff;
        }

        .info-row .label-en {
          color: #1890ff;
        }

        .info-row .value {
          color: #333;
        }

        /* Request Text */
        .request-text {
          background: #f5f5f5;
          padding: 5px 10px;
          margin-bottom: 10px;
          font-size: 9px;
        }

        .text-th {
          color: #1890ff;
        }

        .text-en {
          color: #1890ff;
          font-size: 8px;
        }

        /* Items Table */
        .items-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10px;
          margin-bottom: 10px;
        }

        .items-table th {
          background: #fff;
          border: 1px solid #999;
          padding: 4px;
          text-align: center;
          font-weight: normal;
          color: #1890ff;
        }

        .items-table td {
          border: 1px solid #999;
          padding: 4px;
          vertical-align: top;
        }

        .items-table td.center {
          text-align: center;
        }

        .items-table td.right {
          text-align: right;
        }

        .items-table .empty-row td {
          height: 20px;
        }

        /* Bottom Section */
        .bottom-section {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
          font-size: 10px;
        }

        .bottom-left {
          flex: 1;
        }

        .remarks-section {
          margin-bottom: 10px;
        }

        .remarks-label {
          color: #1890ff;
          margin-bottom: 5px;
        }

        .remarks-row .label {
          color: #1890ff;
          margin-right: 10px;
        }

        .discount-note {
          color: #ff4d4f;
          font-size: 9px;
        }

        .bottom-right {
          width: 250px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 3px 0;
          border-bottom: 1px dashed #ddd;
        }

        .summary-row .label {
          color: #1890ff;
        }

        .summary-row .value {
          text-align: right;
          min-width: 80px;
        }

        .summary-row.total {
          border-bottom: none;
          border-top: 1px solid #1890ff;
          font-weight: bold;
          margin-top: 5px;
          padding-top: 5px;
        }

        .summary-row.total .value {
          color: #1890ff;
        }

        /* Signature Section */
        .signature-section {
          display: flex;
          justify-content: space-between;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
        }

        .signature-box {
          text-align: center;
          width: 150px;
        }

        .signature-line {
          border-bottom: 1px solid #333;
          height: 40px;
          margin-bottom: 5px;
        }

        .signature-label {
          color: #1890ff;
          font-size: 10px;
        }

        /* Print Styles */
        @media print {
          .no-print {
            display: none !important;
          }

          .print-preview-overlay {
            position: static;
            background: white;
          }

          .print-content-wrapper {
            padding: 0;
          }

          .document-page {
            width: 100%;
            min-height: auto;
            box-shadow: none;
            padding: 5mm;
          }

          .document-border {
            min-height: auto;
          }

          @page {
            size: A4;
            margin: 5mm;
          }
        }
      `}</style>
    </div>
  )
}
