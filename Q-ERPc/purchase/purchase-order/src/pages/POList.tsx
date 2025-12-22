import { useState, useCallback } from 'react'
import { Card, Table, Typography, Flex, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { POSearchFilter } from '../components/POSearchFilter'
import { CancelPOModal } from '../components/CancelPOModal'
import { usePOColumns } from '../hooks/usePOColumns'
import { usePOListData } from '../hooks/usePOListData'
import { POPrintPreview } from './POPrintPreview'
import type { POHeader } from '../types'

const { Title } = Typography

interface POListProps {
  canInsert?: boolean
  canEdit?: boolean
}

export function POList({ canInsert = true }: POListProps) {
  const navigate = useNavigate()

  // Cancel modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [selectedPOForCancel, setSelectedPOForCancel] = useState<POHeader | null>(null)

  // Print preview state
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false)
  const [selectedRunNoForPrint, setSelectedRunNoForPrint] = useState<number | null>(null)

  // Data hook
  const {
    documentTypeOptions,
    selectedDocumentType,
    filteredData,
    searchText,
    isLoadingDocTypes,
    isLoadingPOHeaders,
    isCancelling,
    setSelectedDocumentTypeCode,
    setSearchText,
    cancelPO,
  } = usePOListData()

  // Handlers
  const handleCreate = useCallback(() => {
    navigate('create')
  }, [navigate])

  const handleEdit = useCallback(
    (runNo: number) => {
      navigate(`edit/${runNo}`)
    },
    [navigate]
  )

  const handleView = useCallback((record: POHeader) => {
    setSelectedRunNoForPrint(record.runNo)
    setPrintPreviewOpen(true)
  }, [])

  const handleCancel = useCallback((record: POHeader) => {
    setSelectedPOForCancel(record)
    setCancelModalOpen(true)
  }, [])

  const handlePrint = useCallback((record: POHeader) => {
    setSelectedRunNoForPrint(record.runNo)
    setPrintPreviewOpen(true)
  }, [])

  const handleConfirmCancel = useCallback(async () => {
    if (!selectedPOForCancel) return

    const success = await cancelPO(selectedPOForCancel)
    if (success) {
      setCancelModalOpen(false)
      setSelectedPOForCancel(null)
    }
  }, [selectedPOForCancel, cancelPO])

  const handleCancelModalClose = useCallback(() => {
    setCancelModalOpen(false)
    setSelectedPOForCancel(null)
  }, [])

  const handleClosePrintPreview = useCallback(() => {
    setPrintPreviewOpen(false)
    setSelectedRunNoForPrint(null)
  }, [])

  // Table columns
  const columns = usePOColumns({
    onEdit: handleEdit,
    onView: handleView,
    onCancel: handleCancel,
    onPrint: handlePrint,
  })

  return (
    <Card style={{ width: '100%' }}>
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            รายการใบสั่งซื้อ
          </Title>
        </div>
        {canInsert && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            สร้างใบสั่งซื้อ
          </Button>
        )}
      </Flex>

      <POSearchFilter
        documentTypeOptions={documentTypeOptions}
        selectedDocumentType={selectedDocumentType}
        onDocumentTypeChange={setSelectedDocumentTypeCode}
        searchText={searchText}
        onSearchChange={setSearchText}
        isLoadingDocTypes={isLoadingDocTypes}
      />

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="runNo"
        pagination={{ pageSize: 10 }}
        size="middle"
        bordered
        loading={isLoadingPOHeaders}
        scroll={{ x: 1200 }}
      />

      <CancelPOModal
        open={cancelModalOpen}
        selectedPO={selectedPOForCancel}
        isLoading={isCancelling}
        onConfirm={handleConfirmCancel}
        onClose={handleCancelModalClose}
      />

      <POPrintPreview
        key={selectedRunNoForPrint ?? 0}
        runNo={selectedRunNoForPrint ?? 0}
        open={printPreviewOpen}
        onClose={handleClosePrintPreview}
      />
    </Card>
  )
}
