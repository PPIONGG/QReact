import { useState, useCallback, useEffect } from 'react'
import { Card, Table, Typography, Flex, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { POSearchFilter } from '../components/POSearchFilter'
import { CancelPOModal } from '../components/CancelPOModal'
import { RejectReasonModal } from '../components/RejectReasonModal'
import { CheckStatusModal } from '../components/CheckStatusModal'
import { PrintFormSelectModal } from '../components/PrintFormSelectModal'
import { ConfirmModal } from '../../../../../shared/src/components/ConfirmModal'
import type { ApprovalActionParams } from '../components/ApprovalStatusTag'
import { usePOColumns, getDefaultVisibleColumns } from '../hooks/usePOColumns'
import { usePOListData } from '../hooks/usePOListData'
import { useApprovedConfig } from '../hooks/useApprovedConfig'
import { POPrintPreview } from './POPrintPreview'
import type { POHeader, CheckStatusMode } from '../types'
import { poService } from '../services'
import { useAuthStore } from '../stores'

type CheckStatusModalState = 'confirm' | 'loading' | 'error'

const VISIBLE_COLUMNS_STORAGE_KEY = 'po-list-visible-columns'

const { Title } = Typography

interface POListProps {
  canInsert?: boolean
  canEdit?: boolean
}

// Load visible columns from localStorage
const loadVisibleColumns = (): string[] => {
  try {
    const stored = localStorage.getItem(VISIBLE_COLUMNS_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Ignore parse errors
  }
  return getDefaultVisibleColumns()
}

export function POList({ canInsert = true }: POListProps) {
  const navigate = useNavigate()
  const { accessToken, companyCode } = useAuthStore()

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<string[]>(loadVisibleColumns)

  // Save to localStorage when visible columns change
  useEffect(() => {
    localStorage.setItem(VISIBLE_COLUMNS_STORAGE_KEY, JSON.stringify(visibleColumns))
  }, [visibleColumns])

  // Cancel modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [selectedPOForCancel, setSelectedPOForCancel] = useState<POHeader | null>(null)

  // Print preview state
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false)
  const [selectedRunNoForPrint, setSelectedRunNoForPrint] = useState<number | null>(null)

  // Print form select modal state
  const [printFormSelectOpen, setPrintFormSelectOpen] = useState(false)
  const [selectedRunNoForPrintForm, setSelectedRunNoForPrintForm] = useState<number | null>(null)
  const [selectedDocTypeCodeForPrintForm, setSelectedDocTypeCodeForPrintForm] = useState<string | null>(null)

  // Reject reason modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [pendingRejectParams, setPendingRejectParams] = useState<ApprovalActionParams | null>(null)

  // Approval confirmation modal state
  const [approvalConfirmOpen, setApprovalConfirmOpen] = useState(false)
  const [pendingApprovalParams, setPendingApprovalParams] = useState<ApprovalActionParams | null>(null)

  // Selected row state
  const [selectedRowKey, setSelectedRowKey] = useState<number | null>(null)

  // CheckStatus modal state
  const [checkStatusModalOpen, setCheckStatusModalOpen] = useState(false)
  const [checkStatusMode, setCheckStatusMode] = useState<CheckStatusMode | null>(null)
  const [checkStatusPO, setCheckStatusPO] = useState<POHeader | null>(null)
  const [checkStatusModalState, setCheckStatusModalState] = useState<CheckStatusModalState>('confirm')
  const [checkStatusErrorMessage, setCheckStatusErrorMessage] = useState<string | null>(null)

  // Data hook
  const {
    documentTypeOptions,
    selectedDocumentType,
    filteredData,
    searchText,
    isLoadingDocTypes,
    isLoadingPOHeaders,
    isCancelling,
    isSubmittingApproval,
    setSelectedDocumentTypeCode,
    setSearchText,
    cancelPO,
    handleApprovalAction,
  } = usePOListData()

  // Approved config hook
  const { configuredLevels, actionsByLevel, getActionsForLevel, isLoading: isLoadingConfig } = useApprovedConfig()

  // Handlers
  const handleCreate = useCallback(() => {
    navigate('create')
  }, [navigate])

  const handleEdit = useCallback((record: POHeader) => {
    setCheckStatusPO(record)
    setCheckStatusMode('Edit')
    setCheckStatusModalState('confirm')
    setCheckStatusErrorMessage(null)
    setCheckStatusModalOpen(true)
  }, [])

  const handleView = useCallback((record: POHeader) => {
    setSelectedRunNoForPrintForm(record.runNo)
    setSelectedDocTypeCodeForPrintForm(record.documentTypeCode)
    setPrintFormSelectOpen(true)
  }, [])

  const handleCancel = useCallback((record: POHeader) => {
    setCheckStatusPO(record)
    setCheckStatusMode('Cancel')
    setCheckStatusModalState('confirm')
    setCheckStatusErrorMessage(null)
    setCheckStatusModalOpen(true)
  }, [])

  // CheckStatus modal confirm handler
  const handleCheckStatusConfirm = useCallback(async () => {
    if (!checkStatusPO || !checkStatusMode) return

    setCheckStatusModalState('loading')

    try {
      const response = await poService.checkStatus(
        {
          documentModuleCode: 'PO',
          documentTypeCode: checkStatusPO.documentTypeCode,
          runNo: checkStatusPO.runNo,
          mode: checkStatusMode,
        },
        accessToken || '',
        companyCode || ''
      )

      if (response.code === 0 && response.result) {
        if (response.result.canProceed) {
          // Success - close modal and proceed
          setCheckStatusModalOpen(false)

          if (checkStatusMode === 'Edit') {
            navigate(`edit/${checkStatusPO.runNo}`)
          } else {
            // Cancel mode - open cancel confirmation modal
            setSelectedPOForCancel(checkStatusPO)
            setCancelModalOpen(true)
          }
        } else {
          // Cannot proceed - show error message
          setCheckStatusErrorMessage(response.result.message || 'ไม่สามารถดำเนินการได้')
          setCheckStatusModalState('error')
        }
      } else {
        setCheckStatusErrorMessage(response.msg || 'เกิดข้อผิดพลาดในการตรวจสอบสถานะ')
        setCheckStatusModalState('error')
      }
    } catch (error) {
      console.error('CheckStatus error:', error)
      setCheckStatusErrorMessage('เกิดข้อผิดพลาดในการตรวจสอบสถานะ')
      setCheckStatusModalState('error')
    }
  }, [checkStatusPO, checkStatusMode, accessToken, companyCode, navigate])

  const handleCheckStatusModalClose = useCallback(() => {
    setCheckStatusModalOpen(false)
    setCheckStatusPO(null)
    setCheckStatusMode(null)
    setCheckStatusErrorMessage(null)
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

  // Print form select handlers
  const handlePrintFormSelectClose = useCallback(() => {
    setPrintFormSelectOpen(false)
    setSelectedRunNoForPrintForm(null)
    setSelectedDocTypeCodeForPrintForm(null)
  }, [])

  // Approval action handler
  const handleApprovalClick = useCallback(
    (params: ApprovalActionParams) => {
      if (params.action === 'reject') {
        // Open modal to get reason
        setPendingRejectParams(params)
        setRejectModalOpen(true)
      } else {
        // Approve or cancel - show confirmation modal
        setPendingApprovalParams(params)
        setApprovalConfirmOpen(true)
      }
    },
    []
  )

  // Approval confirmation handler
  const handleApprovalConfirm = useCallback(async () => {
    if (!pendingApprovalParams) return

    await handleApprovalAction(pendingApprovalParams)
    // Always close modal after API call (success or error)
    setApprovalConfirmOpen(false)
    setPendingApprovalParams(null)
  }, [pendingApprovalParams, handleApprovalAction])

  const handleApprovalConfirmClose = useCallback(() => {
    setApprovalConfirmOpen(false)
    setPendingApprovalParams(null)
  }, [])

  const handleRejectConfirm = useCallback(
    async (reason: string) => {
      if (!pendingRejectParams) return

      await handleApprovalAction({
        ...pendingRejectParams,
        comment: reason,
      })
      // Always close modal after API call (success or error)
      setRejectModalOpen(false)
      setPendingRejectParams(null)
    },
    [pendingRejectParams, handleApprovalAction]
  )

  const handleRejectModalClose = useCallback(() => {
    setRejectModalOpen(false)
    setPendingRejectParams(null)
  }, [])

  // Table columns
  const columns = usePOColumns({
    onEdit: handleEdit,
    onView: handleView,
    onCancel: handleCancel,
    onPrint: handlePrint,
    onApprovalAction: handleApprovalClick,
    visibleColumns,
    onVisibleColumnsChange: setVisibleColumns,
    configuredLevels,
    actionsByLevel,
    // Legacy props for backward compatibility
    approvedActions01: getActionsForLevel(1),
    approvedActions02: getActionsForLevel(2),
  })

  return (
    <>
      <style>{`
        .cancelled-row td {
          background-color: #fff2f0 !important;
        }
        .cancelled-row:hover td {
          background-color: #ffccc7 !important;
        }
        .selected-row td {
          background-color: #e6f4ff !important;
        }
        .selected-row:hover td {
          background-color: #bae0ff !important;
        }
        .cancelled-row.selected-row td {
          background-color: #fff2f0 !important;
        }
      `}</style>
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
        loading={isLoadingPOHeaders || isLoadingConfig}
        scroll={{ x: 'max-content' }}
        rowClassName={(record) => {
          const classes: string[] = []
          if (record.recStatus === 1) classes.push('cancelled-row')
          if (record.runNo === selectedRowKey) classes.push('selected-row')
          return classes.join(' ')
        }}
        onRow={(record) => ({
          onClick: () => setSelectedRowKey(record.runNo),
        })}
      />

      <CheckStatusModal
        open={checkStatusModalOpen}
        mode={checkStatusMode}
        poNo={checkStatusPO?.pono || ''}
        state={checkStatusModalState}
        errorMessage={checkStatusErrorMessage}
        onConfirm={handleCheckStatusConfirm}
        onClose={handleCheckStatusModalClose}
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

      <RejectReasonModal
        open={rejectModalOpen}
        confirmLoading={isSubmittingApproval}
        onConfirm={handleRejectConfirm}
        onCancel={handleRejectModalClose}
      />

      <ConfirmModal
        open={approvalConfirmOpen}
        title={
          pendingApprovalParams?.action === 'approve'
            ? 'ยืนยันการอนุมัติ'
            : pendingApprovalParams?.level === 2
              ? 'ยืนยันรออนุมัติ'
              : 'ยืนยันการยกเลิก'
        }
        message={
          pendingApprovalParams?.action === 'approve'
            ? 'คุณต้องการอนุมัติเอกสารนี้ใช่หรือไม่?'
            : pendingApprovalParams?.level === 2
              ? 'คุณต้องการเปลี่ยนสถานะเป็นรออนุมัติใช่หรือไม่?'
              : 'คุณต้องการยกเลิกการอนุมัติเอกสารนี้ใช่หรือไม่?'
        }
        type={pendingApprovalParams?.action === 'approve' ? 'info' : 'warning'}
        confirmText={
          pendingApprovalParams?.action === 'approve'
            ? 'อนุมัติ'
            : pendingApprovalParams?.level === 2
              ? 'รออนุมัติ'
              : 'ยกเลิก'
        }
        cancelText="ปิด"
        confirmLoading={isSubmittingApproval}
        onConfirm={handleApprovalConfirm}
        onCancel={handleApprovalConfirmClose}
      />

      <PrintFormSelectModal
        open={printFormSelectOpen}
        runNo={selectedRunNoForPrintForm}
        documentTypeCode={selectedDocTypeCodeForPrintForm}
        onCancel={handlePrintFormSelectClose}
      />
    </Card>
    </>
  )
}
