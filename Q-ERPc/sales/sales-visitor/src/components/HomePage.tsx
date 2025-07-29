import React from 'react';

const HomePage: React.FC = () => {
  
  const navigateToPage = (path: string) => {
    console.log('🎯 REMOTE: Navigating to', path);
    
    // เปลี่ยน URL ของ Host App
    const hostUrl = `${window.location.origin}${window.location.pathname}#/sales/sales-visitor${path}`;
    console.log('🔄 REMOTE: Will change Host URL to:', hostUrl);
    
    // วิธีง่ายๆ: เปลี่ยน hash ของ browser
    window.location.hash = `/sales/sales-visitor${path}`;
    
    console.log('✅ REMOTE: URL changed successfully');
  };

  return (
    <div>
      <h2 style={{ color: '#1890ff', marginBottom: '20px' }}>
        🏠 Sales Visitor - Home Page
      </h2>
      
      <div style={{ 
        padding: '15px', 
        backgroundColor: '#e6f7ff', 
        borderRadius: '6px',
        marginBottom: '25px',
        border: '1px solid #91d5ff'
      }}>
        <strong>📍 Current Location:</strong>
        <br />
        <code style={{ 
          fontSize: '11px', 
          backgroundColor: '#fff', 
          padding: '2px 4px',
          borderRadius: '3px'
        }}>
          {window.location.href}
        </code>
      </div>

      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ color: '#1890ff' }}>📋 Visitor List (Sample Data)</h3>
        <div style={{ 
          overflowX: 'auto',
          border: '1px solid #d9d9d9',
          borderRadius: '6px'
        }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            backgroundColor: '#fff'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#fafafa' }}>
                <th style={{ 
                  padding: '12px 8px', 
                  border: '1px solid #f0f0f0',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>ID</th>
                <th style={{ 
                  padding: '12px 8px', 
                  border: '1px solid #f0f0f0',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>Customer</th>
                <th style={{ 
                  padding: '12px 8px', 
                  border: '1px solid #f0f0f0',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>Visit Date</th>
                <th style={{ 
                  padding: '12px 8px', 
                  border: '1px solid #f0f0f0',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>Status</th>
                <th style={{ 
                  padding: '12px 8px', 
                  border: '1px solid #f0f0f0',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr >
                <td style={{ padding: '10px 8px', border: '1px solid #f0f0f0' }}>001</td>
                <td style={{ padding: '10px 8px', border: '1px solid #f0f0f0' }}>ABC Company Ltd.</td>
                <td style={{ padding: '10px 8px', border: '1px solid #f0f0f0' }}>2024-01-15</td>
                <td style={{ padding: '10px 8px', border: '1px solid #f0f0f0' }}>
                  <span style={{ 
                    backgroundColor: '#f6ffed',
                    color: '#52c41a',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    ✅ Completed
                  </span>
                </td>
                <td style={{ padding: '10px 8px', border: '1px solid #f0f0f0' }}>
                  <button 
                    onClick={() => navigateToPage('/edit/001')}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#1890ff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                    onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#40a9ff'}
                    onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1890ff'}
                  >
                    ✏️ Edit
                  </button>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '10px 8px', border: '1px solid #f0f0f0' }}>002</td>
                <td style={{ padding: '10px 8px', border: '1px solid #f0f0f0' }}>XYZ Corporation</td>
                <td style={{ padding: '10px 8px', border: '1px solid #f0f0f0' }}>2024-01-16</td>
                <td style={{ padding: '10px 8px', border: '1px solid #f0f0f0' }}>
                  <span style={{ 
                    backgroundColor: '#fff7e6',
                    color: '#fa8c16',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    ⏳ Pending
                  </span>
                </td>
                <td style={{ padding: '10px 8px', border: '1px solid #f0f0f0' }}>
                  <button 
                    onClick={() => navigateToPage('/edit/002')}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#1890ff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                    onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#40a9ff'}
                    onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1890ff'}
                  >
                    ✏️ Edit
                  </button>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '10px 8px', border: '1px solid #f0f0f0' }}>003</td>
                <td style={{ padding: '10px 8px', border: '1px solid #f0f0f0' }}>DEF Industries</td>
                <td style={{ padding: '10px 8px', border: '1px solid #f0f0f0' }}>2024-01-17</td>
                <td style={{ padding: '10px 8px', border: '1px solid #f0f0f0' }}>
                  <span style={{ 
                    backgroundColor: '#fff2e8',
                    color: '#fa541c',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    🔄 In Progress
                  </span>
                </td>
                <td style={{ padding: '10px 8px', border: '1px solid #f0f0f0' }}>
                  <button 
                    onClick={() => navigateToPage('/edit/003')}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#1890ff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                    onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#40a9ff'}
                    onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1890ff'}
                  >
                    ✏️ Edit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div style={{ textAlign: 'center' }}>
        <button 
          onClick={() => navigateToPage('/new')}
          style={{
            padding: '14px 28px',
            backgroundColor: '#52c41a',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(82,196,26,0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#73d13d';
            (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#52c41a';
            (e.target as HTMLButtonElement).style.transform = 'translateY(0px)';
          }}
        >
          ➕ New Visit Report
        </button>
      </div>

      <div style={{ 
        marginTop: '25px',
        padding: '12px', 
        backgroundColor: '#f9f9f9', 
        borderRadius: '6px',
        fontSize: '12px',
        color: '#666'
      }}>
        <strong>💡 Test Instructions:</strong>
        <ul style={{ marginTop: '8px', paddingLeft: '16px' }}>
          <li>คลิก "New Visit Report" เพื่อสร้างรายงานใหม่</li>
          <li>คลิก "Edit" เพื่อแก้ไขรายงานที่มีอยู่</li>
          <li>สังเกต URL ที่เปลี่ยนแปลงใน Browser</li>
          <li>ดู Debug Panel ที่มุมบนขวาของหน้าจอ</li>
        </ul>
      </div>
    </div>
  );
};

export default HomePage;