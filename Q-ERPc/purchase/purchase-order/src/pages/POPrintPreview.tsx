import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Flex, Spin, Button, Typography } from 'antd'
import { PrinterOutlined, CloseOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useAuthStore, useSelectedDocumentType } from '../stores'
import { getPOOrder, getSupplier } from '../services'
import { formatNumber } from '../utils'
import type { POOrder } from '../types'
import '../styles/printPreview.css'

const { Text } = Typography

interface POPrintPreviewProps {
  runNo: number
  open: boolean
  onClose: () => void
}

// Extended POOrder with supplier details for print
interface POOrderData extends POOrder {
  fullAddress?: string
  phone?: string
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
          const poOrder = response.result

          // Fetch supplier detail to get fullAddress and phone
          let fullAddress = ''
          let phone = ''
          if (poOrder.supplierCode) {
            try {
              const supplierResponse = await getSupplier(
                poOrder.supplierCode,
                accessToken,
                companyCode
              )
              if (supplierResponse.code === 0 && supplierResponse.result) {
                fullAddress = supplierResponse.result.fullAddress || ''
                phone = supplierResponse.result.phone || ''
              }
            } catch (err) {
              console.error('Failed to fetch supplier detail:', err)
            }
          }

          // Set PO data with supplier details
          console.log('poOrder.poDetails:', poOrder.poDetails)
          const newPoData = {
            ...poOrder,
            fullAddress,
            phone,
          }
          console.log('newPoData.poDetails:', newPoData.poDetails)
          setPOData(newPoData)
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
    // Add class to body for print styling
    document.body.classList.add('printing-po-preview')
    window.print()
    // Remove class after print dialog closes
    document.body.classList.remove('printing-po-preview')
  }

  console.log('POPrintPreview render - open:', open, 'loading:', loading, 'poData:', poData, 'poDetails:', poData?.poDetails)

  if (!open) return null

  const formatDate = (date: string | null | undefined) => {
    if (!date) return ''
    return dayjs(date).format('DD/MM/YYYY')
  }

  // Calculate total pages (simple version - 1 page for now)
  const totalPages = 1
  const currentPage = 1

  const content = (
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
            {(() => { console.log('Rendering poData.poDetails:', poData.poDetails); return null })()}
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
              <div style={{ color: 'red', fontWeight: 'bold' }}>DEBUG: poDetails length = {(poData.poDetails || []).length}</div>
              <table className="items-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>ลำดับ</th>
                    <th style={{ width: '80px' }}>เลขที่รหัสซื้อ</th>
                    <th style={{ width: '100px' }}>รหัส</th>
                    <th>รายการ</th>
                    <th style={{ width: '60px' }}>จำนวน</th>
                    <th style={{ width: '50px' }}>หน่วย</th>
                    <th style={{ width: '80px' }}>ราคา/ต่อหน่วย</th>
                    <th style={{ width: '60px' }}>ส่วนลด</th>
                    <th style={{ width: '90px' }}>จำนวนเงิน</th>
                  </tr>
                </thead>
                <tbody>
                  {(poData.poDetails || []).map((item, index) => (
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
                  {Array.from({ length: Math.max(0, 8 - (poData.poDetails || []).length) }).map((_, i) => (
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

    </div>
  )

  return createPortal(content, document.body)
}
