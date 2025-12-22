import { useCallback } from 'react'
import { Popover, Button, Checkbox, Flex, Typography, Tooltip } from 'antd'
import { SettingOutlined } from '@ant-design/icons'

const { Text } = Typography

export interface ColumnConfig {
  key: string
  title: string
  required?: boolean
}

interface ColumnSelectorProps {
  columns: ColumnConfig[]
  visibleColumns: string[]
  onChange: (visibleColumns: string[]) => void
}

export function ColumnSelector({ columns, visibleColumns, onChange }: ColumnSelectorProps) {
  const handleToggle = useCallback(
    (key: string, checked: boolean) => {
      if (checked) {
        onChange([...visibleColumns, key])
      } else {
        onChange(visibleColumns.filter((k) => k !== key))
      }
    },
    [onChange, visibleColumns]
  )

  const content = (
    <Flex vertical gap={4} style={{ minWidth: 180 }}>
      {columns.map((col) => (
        <Checkbox
          key={col.key}
          checked={visibleColumns.includes(col.key)}
          disabled={col.required}
          onChange={(e) => handleToggle(col.key, e.target.checked)}
        >
          <Text>{col.title}</Text>
          {col.required && (
            <Text type="secondary" style={{ fontSize: 11, marginLeft: 4 }}>
              (บังคับ)
            </Text>
          )}
        </Checkbox>
      ))}
    </Flex>
  )

  return (
    <Popover content={content} trigger="click" placement="bottomRight" title="แสดง/ซ่อน คอลัมน์">
      <Tooltip title="ตั้งค่าคอลัมน์">
        <Button type="text" size="small" icon={<SettingOutlined />} />
      </Tooltip>
    </Popover>
  )
}
