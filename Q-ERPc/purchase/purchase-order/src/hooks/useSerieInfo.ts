import { useEffect, useRef, useState } from 'react'
import type { FormInstance } from 'antd'
import type { Dayjs } from 'dayjs'
import { useAuthStore, useDocumentTypes, useSelectedDocumentType } from '../stores'
import { getSeriesAndGroupDoc } from '../services'
import type { SeriesAndGroupDocResult } from '../types'

interface UseSerieInfoProps {
  form: FormInstance
  isEditMode: boolean
  poDate: Dayjs | null
}

/**
 * Hook for fetching serie info when creating new PO
 * Calls API when document type changes or poDate changes
 */
export function useSerieInfo({ form, isEditMode, poDate }: UseSerieInfoProps) {
  const { accessToken, companyCode } = useAuthStore()
  const documentTypes = useDocumentTypes()
  const selectedDocumentTypeCode = useSelectedDocumentType()

  const [serieInfo, setSerieInfo] = useState<SeriesAndGroupDocResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Track last fetched params to prevent duplicate calls
  const lastFetchedParams = useRef<string | null>(null)

  useEffect(() => {
    // Skip if edit mode or missing required data
    if (isEditMode || !accessToken || !companyCode || !selectedDocumentTypeCode) return

    // poDate is required - must have a value
    if (!poDate) return

    const selectedDocType = documentTypes.find(
      (dt) => dt.documentTypeCode === selectedDocumentTypeCode
    )
    if (!selectedDocType) return

    // Format date as string for API
    const docDateString = poDate.format('YYYY-MM-DD')

    // Create unique key for current params to prevent duplicate fetch
    const currentParamsKey = `${selectedDocumentTypeCode}_${docDateString}`
    if (lastFetchedParams.current === currentParamsKey) return

    lastFetchedParams.current = currentParamsKey

    const fetchSerieInfo = async () => {
      setIsLoading(true)
      try {
        const currentYear = new Date().getFullYear() + 543

        const response = await getSeriesAndGroupDoc(
          {
            documentTypeCode: selectedDocumentTypeCode,
            yearForRunNo: currentYear,
            descT: selectedDocType.documentTypeCodeDescriptionT,
            descEng: selectedDocType.documentTypeCodeDescriptionE,
            docDate: docDateString,
          },
          accessToken,
          companyCode
        )

        if (response.code === 0 && response.result) {
          setSerieInfo(response.result)
          form.setFieldValue('pono', response.result.documentNo)
        }
      } catch (error) {
        console.error('Failed to fetch serie info:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSerieInfo()
  }, [isEditMode, accessToken, companyCode, selectedDocumentTypeCode, documentTypes, form, poDate])

  return {
    serieInfo,
    isLoading,
  }
}
