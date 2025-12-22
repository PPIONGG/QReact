import { useEffect, useRef, useMemo, useState, useCallback } from 'react'
import { message } from 'antd'
import { useAuthStore, usePOStore, useDocumentTypes, useSelectedDocumentType, usePOHeaders, useSearchText } from '../stores'
import { getDocumentTypeRightList, getPOHeaderList, poCancel } from '../services'
import type { POHeader } from '../types'
import dayjs from 'dayjs'

export function usePOListData() {
  const { username, accessToken, companyCode } = useAuthStore()

  // PO store
  const documentTypes = useDocumentTypes()
  const selectedDocumentType = useSelectedDocumentType()
  const poHeaders = usePOHeaders()
  const searchText = useSearchText()
  const {
    isLoadingDocTypes,
    isLoadingPOHeaders,
    setDocumentTypes,
    setSelectedDocumentTypeCode,
    setIsLoadingDocTypes,
    setPOHeaders,
    setIsLoadingPOHeaders,
    setSearchText,
  } = usePOStore()

  // Cancel state
  const [isCancelling, setIsCancelling] = useState(false)

  // Memoize document type options
  const documentTypeOptions = useMemo(
    () =>
      documentTypes.map((dt) => ({
        value: dt.documentTypeCode,
        label: dt.documentTypeCodeDescriptionT,
      })),
    [documentTypes]
  )

  // Fetch document types on mount (only if not already loaded)
  useEffect(() => {
    if (!username || !accessToken || !companyCode) return
    // Skip if already have document types in store
    if (documentTypes.length > 0) return

    const fetchDocTypes = async () => {
      setIsLoadingDocTypes(true)
      try {
        const response = await getDocumentTypeRightList('PO', username, accessToken, companyCode)
        if (response.code === 0 && response.result) {
          setDocumentTypes(response.result)
        }
      } catch (error) {
        console.error('Failed to fetch document types:', error)
      } finally {
        setIsLoadingDocTypes(false)
      }
    }

    fetchDocTypes()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, accessToken, companyCode, documentTypes.length])

  // Track last fetched document type to prevent duplicate fetches
  const lastFetchedDocType = useRef<string | null>(null)

  // Fetch PO headers when document type changes
  useEffect(() => {
    if (!accessToken || !companyCode || !selectedDocumentType) return
    // Skip if same document type was already fetched
    if (lastFetchedDocType.current === selectedDocumentType && poHeaders.length > 0) return

    lastFetchedDocType.current = selectedDocumentType

    const fetchPOHeaders = async () => {
      setIsLoadingPOHeaders(true)
      try {
        const response = await getPOHeaderList(selectedDocumentType, accessToken, companyCode)
        if (response.code === 0 && response.result) {
          setPOHeaders(response.result)
        }
      } catch (error) {
        console.error('Failed to fetch PO headers:', error)
      } finally {
        setIsLoadingPOHeaders(false)
      }
    }

    fetchPOHeaders()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDocumentType, accessToken, companyCode])

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchText) return poHeaders

    const search = searchText.toLowerCase()
    return poHeaders.filter((po) => {
      return (
        po.pono.toLowerCase().includes(search) ||
        po.supplierCode.toLowerCase().includes(search) ||
        po.supplierName.toLowerCase().includes(search) ||
        po.updatedUser.toLowerCase().includes(search) ||
        dayjs(po.podate).format('DD/MM/YYYY').includes(search) ||
        dayjs(po.lastUpdated).format('DD/MM/YYYY HH:mm').includes(search)
      )
    })
  }, [poHeaders, searchText])

  // Cancel PO
  const cancelPO = useCallback(
    async (selectedPO: POHeader) => {
      if (!username || !accessToken || !companyCode) return false

      setIsCancelling(true)
      try {
        const request = {
          moduleCode: selectedPO.documentModuleCode,
          documentTypeCode: selectedPO.documentTypeCode,
          runNo: String(selectedPO.runNo),
          userName: username,
          priorityStatus: '1',
        }

        const response = await poCancel(request, accessToken, companyCode)

        if (response.code === 0) {
          message.success('ยกเลิกใบสั่งซื้อสำเร็จ')
          // Refresh PO list
          if (selectedDocumentType) {
            setIsLoadingPOHeaders(true)
            const listResponse = await getPOHeaderList(selectedDocumentType, accessToken, companyCode)
            if (listResponse.code === 0 && listResponse.result) {
              setPOHeaders(listResponse.result)
            }
            setIsLoadingPOHeaders(false)
          }
          return true
        } else {
          message.error(response.msg || 'เกิดข้อผิดพลาดในการยกเลิก')
          return false
        }
      } catch (error) {
        console.error('Failed to cancel PO:', error)
        message.error('เกิดข้อผิดพลาดในการยกเลิก')
        return false
      } finally {
        setIsCancelling(false)
      }
    },
    [username, accessToken, companyCode, selectedDocumentType, setIsLoadingPOHeaders, setPOHeaders]
  )

  return {
    // Data
    documentTypeOptions,
    selectedDocumentType,
    filteredData,
    searchText,
    // Loading states
    isLoadingDocTypes,
    isLoadingPOHeaders,
    isCancelling,
    // Actions
    setSelectedDocumentTypeCode,
    setSearchText,
    cancelPO,
  }
}
