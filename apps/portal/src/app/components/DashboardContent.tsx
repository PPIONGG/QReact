import React, { useEffect, useMemo } from 'react';
import { ActiveApp, MenuItem } from '../types';
import { useAuthStore } from '../store/auth.store';

interface DashboardContentProps {
  activeApp: ActiveApp;
  menuItems: MenuItem[];
  onMenuClick: (key: string) => void;
  getAppUrl: (appName: string, subApp?: string) => string;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  activeApp,
  menuItems,
  onMenuClick,
  getAppUrl,
}) => {
  const { user } = useAuthStore();
  // const { fetchSalesinfo, Salesinfo, loading } = useAuthStore();

useEffect(() => {
  const loadSalesInfo = async () => {
    try {
      const testuser = user?.username ? user.username.replace(/^QERP_/i, '') : null
      await fetchSalesinfo(testuser || '');
    } catch (error) {
      console.error('❌ Failed to fetch sales info:', error);
      return;
    }
  };

  loadSalesInfo();
}, []);

  // ✅ ปรับปรุง permission check ให้เร็วขึ้น
  const permissionStatus = useMemo(() => {
    // หน้าหลักเข้าได้เสมอ
    if (activeApp.parentId === 'home') {
      return { hasPermission: true, showLoading: false };
    }

    // ถ้าไม่มี user ให้ไม่มีสิทธ
    if (!user ) {
      return { hasPermission: false, showLoading: false };
    }

    // ถ้ายังโหลดข้อมูลอยู่
    if (loading) {
      return { hasPermission: false, showLoading: true };
    }

    // ถ้าไม่มี Salesinfo ให้ถือว่าไม่มีสิทธิ์
    if (!Salesinfo) {
      return { hasPermission: false, showLoading: false };
    }

    // เช็คจาก Salesinfo.status
    return { 
      hasPermission: Salesinfo.status, 
      showLoading: false 
    };
  }, [activeApp.parentId, user, loading, Salesinfo]);

  // ✅ ปรับปรุง renderContent ให้เร็วขึ้น
  const renderContent = useMemo(() => {
    if (activeApp.parentId === 'home') {
      return (
        <div
          style={{
            height: '100%',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <h2 style={{ margin: 0, color: '#64748b' }}>🏠 Dashboard Home</h2>
          <p style={{ margin: 0, color: '#94a3b8' }}>
            เลือกเมนูด้านซ้ายเพื่อเริ่มใช้งาน
          </p>

          {/* แสดงข้อมูลพนักงาน ถ้ามี */}
          {Salesinfo && Salesinfo.status && (
            <div
              style={{
                marginTop: '20px',
                padding: '16px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                maxWidth: '400px',
                width: '100%',
              }}
            >
              <p
                style={{
                  margin: '0 0 8px 0',
                  fontWeight: 500,
                  color: '#475569',
                }}
              >
                ข้อมูลพนักงาน:
              </p>
              <p style={{ margin: 0, color: '#64748b' }}>
                {Salesinfo.data?.prefixThai}
                {Salesinfo.data?.nameThai} ({Salesinfo.data?.employeeCode})
              </p>
              <p
                style={{
                  margin: '4px 0 0 0',
                  fontSize: '14px',
                  color: '#94a3b8',
                }}
              >
                Sales Code: {Salesinfo.data?.salesCode}
              </p>
            </div>
          )}

          {/* แสดงข้อความเมื่อไม่มีสิทธิ์ */}
          {Salesinfo && !Salesinfo.status && (
            <div
              style={{
                marginTop: '20px',
                padding: '16px',
                backgroundColor: '#fef2f2',
                borderRadius: '8px',
                border: '1px solid #fecaca',
                maxWidth: '400px',
                width: '100%',
              }}
            >
              <p
                style={{
                  margin: '0 0 8px 0',
                  fontWeight: 500,
                  color: '#dc2626',
                }}
              >
                ⚠️ แจ้งเตือน:
              </p>
              <p style={{ margin: 0, color: '#991b1b' }}>
                {Salesinfo.message || 'คุณไม่มีสิทธิ์เข้าถึงระบบ'}
              </p>
            </div>
          )}

          {/* Loading state สำหรับหน้า home */}
          {loading && !Salesinfo && (
            <div
              style={{
                marginTop: '20px',
                padding: '16px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                maxWidth: '400px',
                width: '100%',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  border: '2px solid #f3f4f6',
                  borderTop: '2px solid #3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 8px',
                }}
              />
              <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                กำลังโหลดข้อมูลพนักงาน...
              </p>
            </div>
          )}
        </div>
      );
    }

    // สำหรับ iframe apps
    const currentMenuItem = menuItems.find(
      (item) => item.id === activeApp.parentId
    );

    const currentSubItem = currentMenuItem?.subItems?.find(
      (sub) => sub.id === activeApp.subId
    );

    return (
      <iframe
        src={getAppUrl(activeApp.parentId, activeApp.subId?.split('-')[1])}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
          margin: 0,
          padding: 0,
        }}
        title={`${
          currentSubItem?.name || currentMenuItem?.name || 'Application'
        } Application`}
        onError={(e) => {
          console.error('❌ Iframe loading error:', e);
        }}
        onLoad={() => {
          console.log('✅ Iframe loaded successfully');
        }}
        frameBorder="0"
        scrolling="auto"
        allowFullScreen
      />
    );
  }, [activeApp, menuItems, getAppUrl, Salesinfo, loading]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Content หลัก - แสดงเสมอ */}
      {renderContent}

      {/* ✅ ปรับปรุง Loading overlay ให้แสดงเฉพาะเมื่อจำเป็น */}
      {permissionStatus.showLoading && activeApp.parentId !== 'home' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f4f6',
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 16px',
              }}
            />
            <p style={{ 
              margin: 0, 
              color: '#64748b', 
              fontSize: '16px',
              fontWeight: 500 
            }}>
              กำลังตรวจสอบสิทธิ์...
            </p>
            <p style={{ 
              margin: '8px 0 0 0', 
              color: '#94a3b8', 
              fontSize: '14px' 
            }}>
              กรุณารอสักครู่
            </p>
          </div>
        </div>
      )}

      {/* ✅ แสดง NoPermissionOverlay เมื่อไม่มีสิทธิ์ */}
      {!permissionStatus.hasPermission && 
       !permissionStatus.showLoading && 
       activeApp.parentId !== 'home' && (
        <NoPermissionOverlay />
      )}

      {/* CSS Animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          /* ✅ เพิ่ม transition สำหรับ smooth loading */
          .dashboard-content iframe {
            transition: opacity 0.2s ease-in-out;
          }
          
          .dashboard-content iframe[src=""] {
            opacity: 0;
          }
        `}
      </style>
    </div>
  );
};

export default DashboardContent;