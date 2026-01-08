import { useEffect, useRef, useState } from 'react'
import type { FormInstance } from 'antd'
import dayjs from 'dayjs'
import { useAuthStore, useSelectedDocumentType } from '../stores'
import { getPOOrder, getSupplier, getUnitConversionList } from '../services'
import type { PODetail, UnitConversion, Warehouse } from '../types'
import type { POLineItem } from '../components/POLineItemTable'

interface UsePOEditDataProps {
  form: FormInstance
  isEditMode: boolean
  id: string | undefined
  warehouses: Warehouse[]
  setLineItems: React.Dispatch<React.SetStateAction<POLineItem[]>>
}

/**
 * Hook for fetching PO data when in edit mode
 */
export function usePOEditData({
  form,
  isEditMode,
  id,
  warehouses,
  setLineItems,
}: UsePOEditDataProps) {
  const { username, accessToken, companyCode } = useAuthStore()
  const selectedDocumentTypeCode = useSelectedDocumentType()

  const hasFetched = useRef(false)
  const [billingCode, setBillingCode] = useState<string | null>(null)

  // Set billingAddress when warehouses become available and billingCode is set
  useEffect(() => {
    if (!isEditMode || !billingCode || warehouses.length === 0) return

    const warehouse = warehouses.find((w) => w.code === billingCode)
    if (warehouse) {
      form.setFieldsValue({
        billingAddress: warehouse.addressThai || '',
      })
    }
  }, [isEditMode, warehouses, billingCode, form])

  useEffect(() => {
    if (!isEditMode || !id || !username || !accessToken || !companyCode || !selectedDocumentTypeCode)
      return

    // Prevent duplicate fetch
    if (hasFetched.current) return
    hasFetched.current = true

    const fetchPOOrder = async () => {
      try {
        const response = await getPOOrder(
          'PO',
          selectedDocumentTypeCode,
          parseInt(id),
          username,
          accessToken,
          companyCode
        )

        if (response.code === 0 && response.result) {
          const poOrder = response.result

          // Store billingCode for later use when warehouses are loaded
          setBillingCode(poOrder.billingCode || null)

          // Fetch supplier detail
          if (poOrder.supplierCode) {
            try {
              const supplierResponse = await getSupplier(
                'PO',
                selectedDocumentTypeCode,
                poOrder.supplierCode,
                accessToken,
                companyCode
              )
              if (supplierResponse.code === 0 && supplierResponse.result) {
                form.setFieldsValue({
                  fullAddress: supplierResponse.result.fullAddress || '',
                  supplierPhone: supplierResponse.result.phone || '',
                })
              }
            } catch (error) {
              console.error('Failed to fetch supplier detail:', error)
            }
          }

          // Try to get billingAddress from warehouses if already loaded
          const billingAddress = warehouses.find((w) => w.code === poOrder.billingCode)?.addressThai || ''

          // Set form values
          form.setFieldsValue({
            supplierCode: poOrder.supplierCode,
            supplierName: poOrder.supplierName,
            pono: poOrder.pono,
            podate: poOrder.podate ? dayjs(poOrder.podate) : null,
            targetShippingDate: poOrder.targetShippingDate
              ? dayjs(poOrder.targetShippingDate)
              : null,
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
            billingAddress,
            discountStringBeforeVAT: poOrder.discountStringBeforeVat
              ? poOrder.discountStringBeforeVat.includes('%')
                ? poOrder.discountStringBeforeVat
                : parseFloat(poOrder.discountStringBeforeVat).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : '',
            totalAmountCurrency: poOrder.totalAmountCurrency,
            amountDiscountCurrency: poOrder.amountDiscountCurrency,
            totalAmountCurrencyAfterDiscountBeforeVAT:
              poOrder.totalAmountCurrencyAfterDiscountBeforeVat,
            vatAmountCurrency: poOrder.vatamountCurrency,
            totalAmountCurrencyAfterVAT: poOrder.totalAmountCurrencyAfterVat,
            adjustVatEnabled: poOrder.adjustVATYesNo === 'Y',
          })

          // Set line items
          if (poOrder.poDetails && poOrder.poDetails.length > 0) {
            const items: POLineItem[] = await Promise.all(
              poOrder.poDetails.map(async (detail: PODetail, index: number) => {
                let unitOptions: { code: string; t: string }[] = []
                if (detail.defaultUnitCode) {
                  try {
                    const unitResponse = await getUnitConversionList(
                      detail.defaultUnitCode,
                      accessToken,
                      companyCode
                    )
                    if (unitResponse.code === 0 && unitResponse.result) {
                      unitOptions = unitResponse.result.map((u: UnitConversion) => ({
                        code: u.code,
                        t: u.t,
                      }))
                    }
                  } catch (error) {
                    console.error('Failed to fetch unit conversion list:', error)
                  }
                }

                return {
                  key: String(detail.noLine),
                  noLine: detail.noLine,
                  vline: index + 1,
                  transactionCode: detail.transactionCode,
                  transactionDescription: detail.transactionDescription,
                  quantity: detail.quantity,
                  purchaseUnitCode: detail.purchaseUnitCode,
                  unitPriceCurrency: detail.unitPriceCurrency,
                  discount: detail.discount,
                  unitOptions,
                  statusRow: 'E' as const,
                }
              })
            )
            setLineItems(items)
          }
        }
      } catch (error) {
        console.error('Failed to fetch PO order:', error)
      }
    }

    fetchPOOrder()
  }, [
    isEditMode,
    id,
    username,
    accessToken,
    companyCode,
    selectedDocumentTypeCode,
    form,
    warehouses,
    setLineItems,
  ])
}
