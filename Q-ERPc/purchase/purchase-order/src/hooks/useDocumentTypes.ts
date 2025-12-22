import { useState, useEffect, useRef } from 'react'
import { getDocumentTypeRightList } from '../services'
import type { DocumentType } from '../types'

interface UseDocumentTypesOptions {
  moduleCode: string
  userName: string
  accessToken: string
  packageCode: string
}

interface UseDocumentTypesResult {
  documentTypes: DocumentType[]
  isLoading: boolean
  error: string | null
  /** Options formatted for Select component */
  options: { value: string; label: string }[]
}

export function useDocumentTypes({
  moduleCode,
  userName,
  accessToken,
  packageCode,
}: UseDocumentTypesOptions): UseDocumentTypesResult {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasFetched = useRef(false)

  useEffect(() => {
    if (!moduleCode || !userName || !accessToken || !packageCode) {
      return
    }

    // Prevent duplicate fetch
    if (hasFetched.current) return
    hasFetched.current = true

    const fetchDocumentTypes = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await getDocumentTypeRightList(
          moduleCode,
          userName,
          accessToken,
          packageCode
        )

        if (response.code === 0 && response.result) {
          setDocumentTypes(response.result)
        } else {
          setError(response.msg || 'Failed to fetch document types')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocumentTypes()
  }, [moduleCode, userName, accessToken, packageCode])

  // Format options for Select component
  const options = documentTypes.map((dt) => ({
    value: dt.documentTypeCode,
    label: dt.documentTypeCodeDescriptionT,
  }))

  return {
    documentTypes,
    isLoading,
    error,
    options,
  }
}
