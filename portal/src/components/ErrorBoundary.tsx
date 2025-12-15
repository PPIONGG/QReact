import React, { Component } from 'react'
import type { ReactNode } from 'react'
import { Result, Button } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
    window.location.href = '/home'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const isModuleLoadError =
        this.state.error?.message?.includes('Failed to fetch') ||
        this.state.error?.message?.includes('ERR_CONNECTION_REFUSED')

      return (
        <Result
          status="error"
          icon={<ExclamationCircleOutlined />}
          title={isModuleLoadError ? 'ไม่สามารถโหลด Module ได้' : 'เกิดข้อผิดพลาด'}
          subTitle={
            isModuleLoadError
              ? 'ไม่สามารถเชื่อมต่อกับ Remote Module กรุณาตรวจสอบว่า Remote App กำลังทำงานอยู่'
              : this.state.error?.message || 'เกิดข้อผิดพลาดที่ไม่คาดคิด'
          }
          extra={[
            <Button type="primary" key="home" onClick={this.handleReset}>
              กลับหน้าหลัก
            </Button>,
            <Button key="reload" onClick={() => window.location.reload()}>
              โหลดหน้าใหม่
            </Button>,
          ]}
        >
          {isModuleLoadError && (
            <div style={{ marginTop: 16, textAlign: 'left', maxWidth: 600, margin: '0 auto' }}>
              <p style={{ marginBottom: 8, fontWeight: 500 }}>วิธีแก้ไข:</p>
              <ol style={{ paddingLeft: 20 }}>
                <li>เปิด Terminal และรันคำสั่ง: <code>npm run dev</code></li>
                <li>หรือรัน Remote Apps แยก: <code>npm run sales-visitor</code> หรือ <code>npm run purchase-order</code></li>
                <li>รอจนกว่า Remote Apps จะทำงาน แล้วกด "โหลดหน้าใหม่"</li>
              </ol>
            </div>
          )}
        </Result>
      )
    }

    return this.props.children
  }
}
