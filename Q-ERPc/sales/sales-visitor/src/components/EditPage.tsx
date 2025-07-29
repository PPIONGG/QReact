import React from 'react';
import { useParams } from 'react-router-dom';

const EditPage: React.FC = () => {
  const { id } = useParams();
  const isNewMode = !id;

  React.useEffect(() => {
    console.log('📝 REMOTE: EditPage loaded', { id, isNewMode });
  }, [id, isNewMode]);

  const goBack = () => {
    console.log('🎯 REMOTE: Going back to home');
    window.location.hash = '/sales/sales-visitor';
    console.log('✅ REMOTE: Navigated back to home');
  };

  const handleSave = () => {
    const action = isNewMode ? 'created' : 'updated';
    console.log(`💾 REMOTE: Report ${action}`);
    alert(`Report ${action} successfully!`);
    
    // กลับไปหน้าหลักหลังจาก save
    setTimeout(() => {
      goBack();
    }, 1500);
  };

  return (
    <div>
      <h2 style={{ color: '#1890ff', marginBottom: '20px' }}>
        {isNewMode ? '➕ Create New Visit Report' : `✏️ Edit Visit Report #${id}`}
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
        <br /><br />
        <strong>📝 Mode:</strong> <span style={{ 
          color: isNewMode ? '#52c41a' : '#1890ff',
          fontWeight: 'bold'
        }}>
          {isNewMode ? 'Create New Report' : `Edit Report ID: ${id}`}
        </span>
      </div>

      <div style={{ 
        backgroundColor: '#fff',
        border: '1px solid #d9d9d9',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '25px'
      }}>
        <h3 style={{ color: '#1890ff', marginBottom: '20px' }}>📝 Report Form</h3>
        
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: '500',
              color: '#262626'
            }}>
              Customer Name: <span style={{ color: '#ff4d4f' }}>*</span>
            </label>
            <input 
              type="text" 
              placeholder="Enter customer name" 
              defaultValue={!isNewMode ? `Customer ${id} Company Ltd.` : ''}
              style={{ 
                padding: '10px 12px', 
                width: '100%',
                maxWidth: '400px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                fontSize: '14px',
                transition: 'border-color 0.3s ease'
              }} 
              onFocus={(e) => e.target.style.borderColor = '#1890ff'}
              onBlur={(e) => e.target.style.borderColor = '#d9d9d9'}
            />
          </div>
          
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: '500',
              color: '#262626'
            }}>
              Visit Date: <span style={{ color: '#ff4d4f' }}>*</span>
            </label>
            <input 
              type="date" 
              defaultValue="2024-01-15"
              style={{ 
                padding: '10px 12px', 
                width: '100%',
                maxWidth: '200px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                fontSize: '14px',
                transition: 'border-color 0.3s ease'
              }} 
              onFocus={(e) => e.target.style.borderColor = '#1890ff'}
              onBlur={(e) => e.target.style.borderColor = '#d9d9d9'}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: '500',
              color: '#262626'
            }}>
              Visitor Name:
            </label>
            <input 
              type="text" 
              placeholder="Enter visitor name" 
              defaultValue={!isNewMode ? 'John Smith' : ''}
              style={{ 
                padding: '10px 12px', 
                width: '100%',
                maxWidth: '300px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                fontSize: '14px',
                transition: 'border-color 0.3s ease'
              }} 
              onFocus={(e) => e.target.style.borderColor = '#1890ff'}
              onBlur={(e) => e.target.style.borderColor = '#d9d9d9'}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: '500',
              color: '#262626'
            }}>
              Contact Person:
            </label>
            <input 
              type="text" 
              placeholder="Enter contact person" 
              defaultValue={!isNewMode ? 'Jane Doe' : ''}
              style={{ 
                padding: '10px 12px', 
                width: '100%',
                maxWidth: '300px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                fontSize: '14px',
                transition: 'border-color 0.3s ease'
              }} 
              onFocus={(e) => e.target.style.borderColor = '#1890ff'}
              onBlur={(e) => e.target.style.borderColor = '#d9d9d9'}
            />
          </div>
          
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: '500',
              color: '#262626'
            }}>
              Visit Notes:
            </label>
            <textarea 
              placeholder="Enter visit notes and details" 
              defaultValue={!isNewMode ? `Visit notes for customer ${id}.\nMeeting went well, customer interested in our products.` : ''}
              rows={4}
              style={{ 
                padding: '10px 12px', 
                width: '100%',
                maxWidth: '500px', 
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                fontSize: '14px',
                resize: 'vertical',
                fontFamily: 'inherit',
                transition: 'border-color 0.3s ease'
              }} 
              onFocus={(e) => e.target.style.borderColor = '#1890ff'}
              onBlur={(e) => e.target.style.borderColor = '#d9d9d9'}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: '500',
              color: '#262626'
            }}>
              Status:
            </label>
            <select 
              defaultValue={!isNewMode ? 'completed' : 'pending'}
              style={{ 
                padding: '10px 12px', 
                width: '100%',
                maxWidth: '200px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: '#fff',
                transition: 'border-color 0.3s ease'
              }} 
              onFocus={(e) => e.target.style.borderColor = '#1890ff'}
              onBlur={(e) => e.target.style.borderColor = '#d9d9d9'}
            >
              <option value="pending">⏳ Pending</option>
              <option value="in_progress">🔄 In Progress</option>
              <option value="completed">✅ Completed</option>
              <option value="cancelled">❌ Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        justifyContent: 'flex-start',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={goBack}
          style={{
            padding: '12px 24px',
            backgroundColor: '#f5f5f5',
            color: '#595959',
            border: '1px solid #d9d9d9',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#e6f7ff';
            (e.target as HTMLButtonElement).style.borderColor = '#91d5ff';
          }}
          onMouseOut={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#f5f5f5';
            (e.target as HTMLButtonElement).style.borderColor = '#d9d9d9';
          }}
        >
          ← Back to List
        </button>
        
        <button 
          onClick={handleSave}
          style={{
            padding: '12px 24px',
            backgroundColor: '#52c41a',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 2px 8px rgba(82,196,26,0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#73d13d';
            (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
            (e.target as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(82,196,26,0.4)';
          }}
          onMouseOut={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#52c41a';
            (e.target as HTMLButtonElement).style.transform = 'translateY(0px)';
            (e.target as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(82,196,26,0.3)';
          }}
        >
          💾 {isNewMode ? 'Create Report' : 'Update Report'}
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
        <strong>💡 Test Actions:</strong>
        <ul style={{ marginTop: '8px', paddingLeft: '16px' }}>
          <li>แก้ไขข้อมูลในฟอร์ม</li>
          <li>คลิก "{isNewMode ? 'Create' : 'Update'} Report" เพื่อบันทึก</li>
          <li>คลิก "Back to List" เพื่อกลับไปหน้าหลัก</li>
          <li>สังเกต URL และ Console Log</li>
        </ul>
      </div>
    </div>
  );
};

export default EditPage;