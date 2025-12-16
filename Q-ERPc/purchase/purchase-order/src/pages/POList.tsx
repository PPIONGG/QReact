import { useEffect, useMemo, useRef, useState } from 'react'
import { Card, Table, Typography, Tag, Flex, Button, Select, Input, Dropdown, Modal, message } from 'antd'
import { PlusOutlined, EditOutlined, EyeOutlined, SearchOutlined, PrinterOutlined, StopOutlined, ExclamationCircleOutlined, EllipsisOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, usePOStore, useDocumentTypes, useSelectedDocumentType, usePOHeaders, useSearchText } from '../stores'
import { getDocumentTypeRightList, getPOHeaderList, poCancel } from '../services'
import type { POHeader } from '../types'
import { POPrintPreview } from './POPrintPreview'
import dayjs from 'dayjs'

const { Title } = Typography

interface POListProps {
  canInsert?: boolean
  canEdit?: boolean
}

export function POList({ canInsert = true }: POListProps) {
  const navigate = useNavigate()

  // Auth store
  const { username, accessToken, companyCode } = useAuthStore()

  // Cancel modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [selectedPOForCancel, setSelectedPOForCancel] = useState<POHeader | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)

  // Print preview state
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false)
  const [selectedRunNoForPrint, setSelectedRunNoForPrint] = useState<number | null>(null)

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

  // Memoize document type options to prevent infinite loop
  const documentTypeOptions = useMemo(
    () =>
      documentTypes.map((dt) => ({
        value: dt.documentTypeCode,
        label: dt.documentTypeCodeDescriptionT,
      })),
    [documentTypes]
  )

  // Track if document types have been fetched
  const hasFetchedDocTypes = useRef(false)

  // Fetch document types on mount (only once)
  useEffect(() => {
    if (!username || !accessToken || !companyCode) return
    if (hasFetchedDocTypes.current) return

    hasFetchedDocTypes.current = true

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
  }, [username, accessToken, companyCode])

  // Fetch PO headers when document type changes
  useEffect(() => {
    if (!accessToken || !companyCode || !selectedDocumentType) return

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

  const handleCreate = () => {
    navigate('create')
  }

  const handleEdit = (id: number) => {
    navigate(`edit/${id}`)
  }

  const handleView = (record: POHeader) => {
    setSelectedRunNoForPrint(record.runNo)
    setPrintPreviewOpen(true)
  }

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

  // Get approval status display
  const getApprovalStatus = (status: string) => {
    switch (status) {
      case 'Y':
        return { text: 'อนุมัติ', color: 'green' }
      case 'W':
        return { text: 'รออนุมัติ', color: 'orange' }
      case 'N':
        return { text: 'ไม่อนุมัติ', color: 'red' }
      default:
        return { text: 'ร่าง', color: 'blue' }
    }
  }

  // Get delivery status display
  const getDeliveryStatus = (status: string) => {
    switch (status) {
      case 'Y':
        return { text: 'รับแล้ว', color: 'green' }
      case 'P':
        return { text: 'รับบางส่วน', color: 'orange' }
      default:
        return { text: 'ยังไม่รับ', color: 'default' }
    }
  }

  // Get record status display
  // recStatus: 0 = ปกติ, 1 = ยกเลิก
  const getRecStatus = (status: number) => {
    switch (status) {
      case 0:
        return { text: 'ปกติ', color: 'green' }
      case 1:
        return { text: 'ยกเลิก', color: 'red' }
      default:
        return { text: '-', color: 'default' }
    }
  }

  // Handle actions
  const handleCancel = (record: POHeader) => {
    setSelectedPOForCancel(record)
    setCancelModalOpen(true)
  }

  const handleConfirmCancel = async () => {
    if (!selectedPOForCancel || !username || !accessToken || !companyCode) return

    setIsCancelling(true)
    try {
      const request = {
        moduleCode: selectedPOForCancel.documentModuleCode,
        documentTypeCode: selectedPOForCancel.documentTypeCode,
        runNo: String(selectedPOForCancel.runNo),
        userName: username,
        priorityStatus: '1',
      }

      const response = await poCancel(request, accessToken, companyCode)

      if (response.code === 0) {
        message.success('ยกเลิกใบสั่งซื้อสำเร็จ')
        setCancelModalOpen(false)
        setSelectedPOForCancel(null)
        // Refresh PO list
        if (selectedDocumentType) {
          setIsLoadingPOHeaders(true)
          const listResponse = await getPOHeaderList(selectedDocumentType, accessToken, companyCode)
          if (listResponse.code === 0 && listResponse.result) {
            setPOHeaders(listResponse.result)
          }
          setIsLoadingPOHeaders(false)
        }
      } else {
        message.error(response.msg || 'เกิดข้อผิดพลาดในการยกเลิก')
      }
    } catch (error) {
      console.error('Failed to cancel PO:', error)
      message.error('เกิดข้อผิดพลาดในการยกเลิก')
    } finally {
      setIsCancelling(false)
    }
  }

  const handleCancelModalClose = () => {
    setCancelModalOpen(false)
    setSelectedPOForCancel(null)
  }

  const handlePrint = (record: POHeader) => {
    setSelectedRunNoForPrint(record.runNo)
    setPrintPreviewOpen(true)
  }

  const handleClosePrintPreview = () => {
    setPrintPreviewOpen(false)
    setSelectedRunNoForPrint(null)
  }

  const columns: ColumnsType<POHeader> = [
    {
      title: 'ลำดับ',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'เลขที่ใบสั่งซื้อ',
      dataIndex: 'pono',
      key: 'pono',
      width: 140,
    },
    {
      title: 'วันที่เอกสาร',
      dataIndex: 'podate',
      key: 'podate',
      width: 110,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'รหัสผู้ขาย',
      dataIndex: 'supplierCode',
      key: 'supplierCode',
      width: 100,
    },
    {
      title: 'ชื่อผู้ขาย',
      dataIndex: 'supplierName',
      key: 'supplierName',
    },
    {
      title: 'สถานะอนุมัติ',
      dataIndex: 'approvedStatus01',
      key: 'approvedStatus01',
      width: 100,
      align: 'center',
      render: (status: string) => {
        const { text, color } = getApprovalStatus(status)
        return <Tag color={color}>{text}</Tag>
      },
    },
    {
      title: 'สถานะรับสินค้า',
      dataIndex: 'deliveryStatus',
      key: 'deliveryStatus',
      width: 110,
      align: 'center',
      render: (status: string) => {
        const { text, color } = getDeliveryStatus(status)
        return <Tag color={color}>{text}</Tag>
      },
    },
    {
      title: 'สถานะ',
      dataIndex: 'recStatus',
      key: 'recStatus',
      width: 80,
      align: 'center',
      render: (status: number) => {
        const { text, color } = getRecStatus(status)
        return <Tag color={color}>{text}</Tag>
      },
    },
    {
      title: 'แก้ไขล่าสุด',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      width: 140,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'โดย',
      dataIndex: 'updatedUser',
      key: 'updatedUser',
      width: 100,
    },
    {
      title: 'ตัวเลือกเพิ่มเติม',
      key: 'action',
      width: 120,
      align: 'center',
      fixed: 'right',
      render: (_, record) => {
        const isDisabled = record.recStatus === 1
        const menuItems = [
          {
            key: 'edit',
            label: 'แก้ไข',
            icon: <EditOutlined />,
            disabled: isDisabled,
            onClick: () => handleEdit(record.runNo),
          },
          {
            key: 'cancel',
            label: 'ยกเลิกเอกสาร',
            icon: <StopOutlined />,
            // danger: true,
            disabled: isDisabled,
            onClick: () => handleCancel(record),
          },
          {
            key: 'view',
            label: 'ดูรายละเอียด',
            icon: <EyeOutlined />,
            disabled: isDisabled,
            onClick: () => handleView(record),
          },
          {
            key: 'print',
            label: 'พิมพ์',
            icon: <PrinterOutlined />,
            disabled: isDisabled,
            onClick: () => handlePrint(record),
          },
        ]

        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={['hover']}
            placement="bottomRight"
            disabled={isDisabled}
          >
            <Button
              type="text"
              size="small"
              icon={<EllipsisOutlined style={{ fontSize: 18 }} />}
              disabled={isDisabled}
            />
          </Dropdown>
        )
      },
    },
  ]

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

      {/* Search and Filter */}
      <Flex gap={16} style={{ marginBottom: 16 }} wrap="wrap">
        <Select
          placeholder="ประเภทเอกสาร"
          value={selectedDocumentType}
          onChange={setSelectedDocumentTypeCode}
          style={{ width: 250 }}
          loading={isLoadingDocTypes}
          options={documentTypeOptions}
        />
        <Input
          placeholder="ค้นหาเลขที่ PO, ผู้ขาย..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
          allowClear
        />
      </Flex>

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

      {/* Cancel Confirmation Modal */}
      <Modal
        open={cancelModalOpen}
        title={
          <Flex align="center" gap={8}>
            <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: 22 }} />
            <span>ยืนยันการยกเลิกใบสั่งซื้อ</span>
          </Flex>
        }
        onCancel={handleCancelModalClose}
        centered
        width={400}
        destroyOnClose
        maskClosable={false}
        footer={
          <Flex gap={8} justify="flex-end">
            <Button
              danger
              type="primary"
              loading={isCancelling}
              onClick={handleConfirmCancel}
            >
              ยืนยัน
            </Button>
            <Button onClick={handleCancelModalClose}>
              ยกเลิก
            </Button>
          </Flex>
        }
      >
        <Typography.Text style={{ marginLeft: 30 }}>
          ต้องการยกเลิกใบสั่งซื้อ {selectedPOForCancel?.pono} หรือไม่?
        </Typography.Text>
      </Modal>

      {/* Print Preview */}
      {selectedRunNoForPrint && (
        <POPrintPreview
          runNo={selectedRunNoForPrint}
          open={printPreviewOpen}
          onClose={handleClosePrintPreview}
        />
      )}
    </Card>
  )
}
