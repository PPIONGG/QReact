import { useEffect, useRef } from 'react'
import { message } from 'antd'
import type { FormInstance } from 'antd'
import { calculateVatAmount } from '../services'
import type { CalculateVatRequest, CalculateDetail, CompanyInfo } from '../types'
import type { POLineItem } from '../components/POLineItemTable'

interface UseVATCalculationProps {
  form: FormInstance
  lineItems: POLineItem[]
  accessToken: string
  companyCode: string
  companyInfo: CompanyInfo | null
  // Watch values
  discountStringBeforeVAT: string | undefined
  exchangeRate: number | string | undefined
  vatRate: number | string | undefined
  adjustVatEnabled: boolean | undefined
  vatBasedForVATAmountCurrency: string | number | undefined
  vatAmountCurrencyWatch: number | undefined
  // Edit mode
  isEditMode: boolean
  isEditDataLoaded: boolean
}

export function useVATCalculation({
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
  isEditMode,
  isEditDataLoaded,
}: UseVATCalculationProps) {
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastCalcKey = useRef<string>('')

  useEffect(() => {
    if (!accessToken || !companyCode) return

    // In edit mode, wait until data is loaded from API before calculating
    if (isEditMode && !isEditDataLoaded) return

    // Check if there are any items with transactionCode (exclude deleted items)
    const hasValidItems = lineItems.some((item) => item.transactionCode && item.statusRow !== 'D')
    if (!hasValidItems) {
      // Reset all summary fields (except discountStringBeforeVAT - user input field)
      form.setFieldsValue({
        totalAmountCurrency: 0,
        totalAmountBeforeVATBaht: 0,
        amountDiscountCurrency: 0,
        amountDiscountBaht: 0,
        totalAmountCurrencyAfterDiscountBeforeVAT: 0,
        totalAmountBahtAfterDiscountBeforeVAT: 0,
        vatBasedForVATAmountCurrency: '0.00',
        vatAmountCurrency: 0,
        vatAmountBaht: 0,
        totalAmountCurrencyAfterVAT: 0,
        totalAmountAfterVATBaht: 0,
      })
      return
    }

    // Create a key to check if calculation params actually changed
    const validItems = lineItems.filter((item) => item.transactionCode && item.statusRow !== 'D')
    const itemsKey = validItems
      .map((item) => `${item.transactionCode}:${item.quantity}:${item.unitPriceCurrency}:${item.discount}`)
      .join('|')
    const calcKey = `${itemsKey}-${discountStringBeforeVAT}-${exchangeRate}-${vatRate}-${adjustVatEnabled}-${vatBasedForVATAmountCurrency}-${vatAmountCurrencyWatch}`

    // Skip if same calculation params
    if (lastCalcKey.current === calcKey) return

    const calculateTotals = async () => {
      // Update last calc key before API call
      lastCalcKey.current = calcKey

      const rate = parseFloat(String(exchangeRate)) || 1

      // Build calculate details from lineItems (exclude deleted items)
      const calculateDetails: CalculateDetail[] = lineItems
        .filter((item) => item.transactionCode && item.statusRow !== 'D')
        .map((item) => {
          const qty = item.quantity || 0
          const unitPrice = item.unitPriceCurrency || 0
          const totalAmount = qty * unitPrice
          return {
            useExpenseSameLocalCurrencyTrueFalse: false,
            excludeVATTrueFalse: false,
            flagExcludeExpenseExport: false,
            vLine: item.vline,
            transactionType: 'I',
            transactionCode: item.transactionCode,
            quantity: qty,
            unitPriceCurrency: unitPrice,
            discount: item.discount || '',
            totalAmountCurrency: totalAmount,
            unitPriceAfterDiscount: unitPrice,
            unitPriceLocalCurrencyAfterDiscount: unitPrice * rate,
            totalAmountCurrencyAfterDiscount: totalAmount,
            totalAmountAfterDiscountLocalCurrency: totalAmount * rate,
            vatBasedAmountCurrency: totalAmount,
            transactionTotalAmountBaht: totalAmount * rate,
            transactionTotalAmountBahtAfterDiscountBeforeVAT: totalAmount * rate,
            transactionVATAmountBaht: 0,
            transactionTotalAmountAfterVATBaht: 0,
          }
        })

      const totalFromDetails = calculateDetails.reduce((sum, item) => sum + item.totalAmountCurrency, 0)

      // Parse vatBasedForVATAmountCurrency value (remove comma before parsing)
      let vatBasedValue = 0
      if (adjustVatEnabled && vatBasedForVATAmountCurrency !== undefined && vatBasedForVATAmountCurrency !== null && vatBasedForVATAmountCurrency !== '') {
        vatBasedValue = parseFloat(String(vatBasedForVATAmountCurrency).replace(/,/g, '')) || 0
      }

      // Parse vatAmountCurrency value when adjustVatEnabled
      let vatAmountValue = 0
      if (adjustVatEnabled && vatAmountCurrencyWatch !== undefined && vatAmountCurrencyWatch !== null) {
        vatAmountValue = parseFloat(String(vatAmountCurrencyWatch)) || 0
      }

      const request: CalculateVatRequest = {
        calculateHeader: {
          noDigitQty: companyInfo?.noDigitQty ?? 2,
          noDigitUnitPrice: companyInfo?.noDigitUnitPrice ?? 2,
          noDigitTotal: companyInfo?.noDigitTotal ?? 2,
          adjustVATYesNo: adjustVatEnabled ? 'Y' : '',
          adjustTotalYesNo: false,
          exchangeRate: rate,
          vatRate: parseFloat(String(vatRate)) || 7,
          includeVATTrueFalse: false,
          totalAmountCurrency: totalFromDetails,
          totalAmountBeforeVATLocalCurrency: totalFromDetails * rate,
          discountStringBeforeVAT: discountStringBeforeVAT?.replace(/,/g, '') || '',
          amountDiscountCurrency: 0,
          amountDiscountBaht: 0,
          totalAmountCurrencyAfterDiscountBeforeVAT: totalFromDetails,
          totalAmountBahtAfterDiscountBeforeVAT: totalFromDetails * rate,
          vatAmountCurrency: vatAmountValue,
          vatAmountLocalCurrency: vatAmountValue * rate,
          vatBasedForVATAmountCurrency: vatBasedValue,
          vatBasedForVATAmountBaht: vatBasedValue * rate,
          totalAmountCurrencyAfterVAT: 0,
          totalAmountAfterVATLocalCurrency: 0,
        },
        calculateDetails,
      }

      try {
        const response = await calculateVatAmount(request, accessToken, companyCode)
        if (response.code === 0 && response.result) {
          const header = response.result.calculateHeader
          const fieldsToUpdate: Record<string, unknown> = {
            totalAmountCurrency: header.totalAmountCurrency,
            totalAmountBeforeVATBaht: header.totalAmountBeforeVATLocalCurrency,
            amountDiscountCurrency: header.amountDiscountCurrency,
            amountDiscountBaht: header.amountDiscountBaht,
            totalAmountCurrencyAfterDiscountBeforeVAT: header.totalAmountCurrencyAfterDiscountBeforeVAT,
            totalAmountBahtAfterDiscountBeforeVAT: header.totalAmountBahtAfterDiscountBeforeVAT,
            totalAmountCurrencyAfterVAT: header.totalAmountCurrencyAfterVAT,
            totalAmountAfterVATBaht: header.totalAmountCurrencyAfterVAT * rate,
          }

          // Always update vatBasedForVATAmountCurrency from API response
          fieldsToUpdate.vatBasedForVATAmountCurrency = header.vatBasedForVATAmountCurrency.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

          if (!adjustVatEnabled) {
            fieldsToUpdate.vatAmountCurrency = header.vatAmountCurrency
            fieldsToUpdate.vatAmountBaht = header.vatAmountCurrency * rate
          } else {
            fieldsToUpdate.vatAmountBaht = header.vatAmountLocalCurrency
          }

          form.setFieldsValue(fieldsToUpdate)
        }
      } catch (error) {
        console.error('Failed to calculate VAT:', error)
        message.warning('ไม่สามารถคำนวณ VAT ได้ กรุณาตรวจสอบข้อมูล')
      }
    }

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Debounce: wait 300ms before calling API
    debounceTimerRef.current = setTimeout(() => {
      calculateTotals()
    }, 300)

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [
    lineItems,
    discountStringBeforeVAT,
    exchangeRate,
    accessToken,
    companyCode,
    form,
    companyInfo,
    vatRate,
    adjustVatEnabled,
    vatBasedForVATAmountCurrency,
    vatAmountCurrencyWatch,
    isEditMode,
    isEditDataLoaded,
  ])
}
