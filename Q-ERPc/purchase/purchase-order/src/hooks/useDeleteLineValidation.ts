import { useState, useCallback } from 'react'
import { message } from 'antd'
import type { FormInstance } from 'antd'
import { calculateVatAmount } from '../services'
import type { CalculateVatRequest, CalculateDetail, CompanyInfo } from '../types'
import type { POLineItem } from '../components/POLineItemTable'

interface UseDeleteLineValidationProps {
  form: FormInstance
  lineItems: POLineItem[]
  accessToken: string
  companyCode: string
  companyInfo: CompanyInfo | null
}

interface DeleteValidationResult {
  isValid: boolean
  errorMessage?: string
}

export function useDeleteLineValidation({
  form,
  lineItems,
  accessToken,
  companyCode,
  companyInfo,
}: UseDeleteLineValidationProps) {
  const [isValidating, setIsValidating] = useState(false)

  const validateDelete = useCallback(
    async (keyToDelete: string): Promise<DeleteValidationResult> => {
      if (!accessToken || !companyCode) {
        return { isValid: true }
      }

      // Simulate deletion by filtering out the item to delete
      const itemToDelete = lineItems.find((item) => item.key === keyToDelete)
      if (!itemToDelete) {
        return { isValid: true }
      }

      // Simulate the state after deletion
      let simulatedItems: POLineItem[]
      if (itemToDelete.statusRow === 'E') {
        // Mark as deleted
        simulatedItems = lineItems.map((item) =>
          item.key === keyToDelete ? { ...item, statusRow: 'D' as const } : item
        )
      } else {
        // Remove from list
        simulatedItems = lineItems.filter((item) => item.key !== keyToDelete)
      }

      // Check if there will be any valid items after deletion
      const validItemsAfterDelete = simulatedItems.filter(
        (item) => item.transactionCode && item.statusRow !== 'D'
      )

      // If no valid items remain, no need to validate - it will just reset to 0
      if (validItemsAfterDelete.length === 0) {
        return { isValid: true }
      }

      setIsValidating(true)

      try {
        const exchangeRate = parseFloat(String(form.getFieldValue('exchangeRate'))) || 1
        const vatRate = parseFloat(String(form.getFieldValue('vatRate'))) || 7
        const discountStringBeforeVAT = form.getFieldValue('discountStringBeforeVAT') || ''
        const adjustVatEnabled = form.getFieldValue('adjustVatEnabled') || false
        const vatBasedForVATAmountCurrency = form.getFieldValue('vatBasedForVATAmountCurrency') || 0
        const vatAmountCurrencyWatch = form.getFieldValue('vatAmountCurrency') || 0

        // Build calculate details from simulated items (exclude deleted items)
        const calculateDetails: CalculateDetail[] = validItemsAfterDelete.map((item) => {
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
            unitPriceLocalCurrencyAfterDiscount: unitPrice * exchangeRate,
            totalAmountCurrencyAfterDiscount: totalAmount,
            totalAmountAfterDiscountLocalCurrency: totalAmount * exchangeRate,
            vatBasedAmountCurrency: totalAmount,
            transactionTotalAmountBaht: totalAmount * exchangeRate,
            transactionTotalAmountBahtAfterDiscountBeforeVAT: totalAmount * exchangeRate,
            transactionVATAmountBaht: 0,
            transactionTotalAmountAfterVATBaht: 0,
          }
        })

        const totalFromDetails = calculateDetails.reduce((sum, item) => sum + item.totalAmountCurrency, 0)

        // Parse vatBasedForVATAmountCurrency value (remove comma before parsing)
        let vatBasedValue = 0
        if (
          adjustVatEnabled &&
          vatBasedForVATAmountCurrency !== undefined &&
          vatBasedForVATAmountCurrency !== null &&
          vatBasedForVATAmountCurrency !== ''
        ) {
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
            exchangeRate: exchangeRate,
            vatRate: vatRate,
            includeVATTrueFalse: false,
            totalAmountCurrency: totalFromDetails,
            totalAmountBeforeVATLocalCurrency: totalFromDetails * exchangeRate,
            discountStringBeforeVAT: String(discountStringBeforeVAT).replace(/,/g, '') || '',
            amountDiscountCurrency: 0,
            amountDiscountBaht: 0,
            totalAmountCurrencyAfterDiscountBeforeVAT: totalFromDetails,
            totalAmountBahtAfterDiscountBeforeVAT: totalFromDetails * exchangeRate,
            vatAmountCurrency: vatAmountValue,
            vatAmountLocalCurrency: vatAmountValue * exchangeRate,
            vatBasedForVATAmountCurrency: vatBasedValue,
            vatBasedForVATAmountBaht: vatBasedValue * exchangeRate,
            totalAmountCurrencyAfterVAT: 0,
            totalAmountAfterVATLocalCurrency: 0,
          },
          calculateDetails,
        }

        const response = await calculateVatAmount(request, accessToken, companyCode)

        if (response.code === 0) {
          return { isValid: true }
        } else {
          return {
            isValid: false,
            errorMessage: response.msg || 'ไม่สามารถลบรายการได้',
          }
        }
      } catch (error: unknown) {
        console.error('Failed to validate delete:', error)

        // Extract error message from API response (400 Bad Request case)
        let errorMessage = 'ไม่สามารถลบรายการได้'
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { data?: { msg?: string } } }
          if (axiosError.response?.data?.msg) {
            errorMessage = axiosError.response.data.msg
          }
        }

        return { isValid: false, errorMessage }
      } finally {
        setIsValidating(false)
      }
    },
    [lineItems, accessToken, companyCode, companyInfo, form]
  )

  return {
    validateDelete,
    isValidating,
  }
}
