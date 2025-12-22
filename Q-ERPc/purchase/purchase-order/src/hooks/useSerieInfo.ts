import { useEffect, useRef, useState } from 'react'
import type { FormInstance } from 'antd'
import { useAuthStore, useDocumentTypes, useSelectedDocumentType } from '../stores'
import { getSeriesAndGroupDoc } from '../services'
import type { SeriesAndGroupDocResult } from '../types'

interface UseSerieInfoProps {
  form: FormInstance
  isEditMode: boolean
}

/**
 * Hook for fetching serie info when creating new PO
 */
export function useSerieInfo({ form, isEditMode }: UseSerieInfoProps) {
  const { accessToken, companyCode } = useAuthStore()
  const documentTypes = useDocumentTypes()
  const selectedDocumentTypeCode = useSelectedDocumentType()

  const [serieInfo, setSerieInfo] = useState<SeriesAndGroupDocResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const lastFetchedDocType = useRef<string | null>(null)

  useEffect(() => {
    if (isEditMode || !accessToken || !companyCode || !selectedDocumentTypeCode) return

    // Prevent duplicate fetch for same document type
    if (lastFetchedDocType.current === selectedDocumentTypeCode) return

    const selectedDocType = documentTypes.find(
      (dt) => dt.documentTypeCode === selectedDocumentTypeCode
    )
    if (!selectedDocType) return

    lastFetchedDocType.current = selectedDocumentTypeCode

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
  }, [isEditMode, accessToken, companyCode, selectedDocumentTypeCode, documentTypes, form])

  return {
    serieInfo,
    isLoading,
  }
}
