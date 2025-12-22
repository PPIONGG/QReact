import { useEffect, useRef, useState } from 'react'
import type { FormInstance } from 'antd'
import { useAuthStore, usePOStore, useDocumentTypes, useSelectedDocumentType } from '../stores'
import { getDocumentTypeRightList } from '../services'
import { useMasterData } from './useMasterData'
import { useSerieInfo } from './useSerieInfo'
import { usePOEditData } from './usePOEditData'
import type { POLineItem } from '../components/POLineItemTable'

interface UsePOFormDataProps {
  form: FormInstance
  isEditMode: boolean
  id: string | undefined
}

/**
 * Main hook for PO form data management
 * Composes smaller hooks for master data, serie info, and edit data
 */
export function usePOFormData({ form, isEditMode, id }: UsePOFormDataProps) {
  const { username, accessToken, companyCode } = useAuthStore()
  const documentTypes = useDocumentTypes()
  const selectedDocumentTypeCode = useSelectedDocumentType()
  const { setDocumentTypes, setSelectedDocumentTypeCode } = usePOStore()

  // Line items state
  const [lineItems, setLineItems] = useState<POLineItem[]>([
    {
      key: '1',
      noLine: 1,
      vline: 1,
      transactionCode: '',
      transactionDescription: '',
      quantity: 0,
      purchaseUnitCode: '',
      unitPriceCurrency: 0,
      discount: '',
      statusRow: 'N',
    },
  ])

  // Track if document types have been fetched
  const hasFetchedDocTypes = useRef(false)

  // Use composed hooks
  const { paymentTerms, currencies, warehouses, companyInfo } = useMasterData()
  const { serieInfo, isLoading: isLoadingSerie } = useSerieInfo({ form, isEditMode })

  // Fetch PO data for edit mode
  usePOEditData({
    form,
    isEditMode,
    id,
    warehouses,
    setLineItems,
  })

  // Fetch document types if not loaded (e.g., direct F5 on this page)
  useEffect(() => {
    if (isEditMode || !username || !accessToken || !companyCode) return
    if (documentTypes.length > 0) return
    if (hasFetchedDocTypes.current) return

    hasFetchedDocTypes.current = true

    const fetchDocTypes = async () => {
      try {
        const response = await getDocumentTypeRightList('PO', username, accessToken, companyCode)
        if (response.code === 0 && response.result) {
          setDocumentTypes(response.result)
          if (!selectedDocumentTypeCode && response.result.length > 0) {
            setSelectedDocumentTypeCode(response.result[0].documentTypeCode)
          }
        }
      } catch (error) {
        console.error('Failed to fetch document types:', error)
      }
    }

    fetchDocTypes()
  }, [
    isEditMode,
    username,
    accessToken,
    companyCode,
    documentTypes.length,
    selectedDocumentTypeCode,
    setDocumentTypes,
    setSelectedDocumentTypeCode,
  ])

  return {
    // Auth
    username,
    accessToken,
    companyCode,
    // Document types
    documentTypes,
    selectedDocumentTypeCode,
    // Serie info
    serieInfo,
    isLoadingSerie,
    // Master data
    paymentTerms,
    currencies,
    warehouses,
    companyInfo,
    // Line items
    lineItems,
    setLineItems,
  }
}
