import React, { useEffect, useMemo, useState } from 'react';
import { ActiveApp, MenuItem } from '../types';
import { useAuthStore } from '@qreact/store';
import { Card, Row, Col, Button, Typography, Space } from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  TeamOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import slide1Image from '../assets/Q-ERPc_2.jpg';
import slide2Image from '../assets/Q-ERPc.jpg';
import NoPermissionOverlay from './NoPermissionOverlay';
import { getAppUrl } from '../utils/getAppUrl';

const { Title, Paragraph, Text } = Typography;

interface DashboardContentProps {
  activeApp: ActiveApp;
  menuItems: MenuItem[];
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  activeApp,
  menuItems,
}) => {
  const { Salesinfo, user, fetchSalesinfo, isloadingSalesinfo } =
    useAuthStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  // ฟังก์ชันสำหรับทำความสะอาดชื่อผู้ใช้ เบื้องต้น
  const cleanUsername = (username: string): string => {
    return username.replace(/^QERP_/i, '');
  };

  useEffect(() => {
    if (user && user.username && !Salesinfo) {
      fetchSalesinfo(cleanUsername(user.username));
    }
  }, [user, Salesinfo]);

  const slides = [
    {
      id: 1,
      image: slide1Image,
    },
    {
      id: 2,
      image: slide2Image,
    },
  ];

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const permissionStatus = useMemo(() => {
    // หน้าหลักเข้าได้เสมอ
    if (activeApp.parentId === 'home') {
      return { hasPermission: true, showLoading: false };
    }

    // ถ้าไม่มี user ให้ไม่มีสิทธ
    if (!user) {
      return { hasPermission: false, showLoading: false };
    }

    // ถ้ายังโหลดข้อมูลอยู่
    if (isloadingSalesinfo) {
      return { hasPermission: false, showLoading: true };
    }

    // ถ้าไม่มี Salesinfo ให้ถือว่าไม่มีสิทธิ์
    if (!Salesinfo) {
      return { hasPermission: false, showLoading: false };
    }

    // เช็คจาก Salesinfo.status
    return {
      hasPermission: Salesinfo.status,
      showLoading: false,
    };
  }, [activeApp.parentId, user, isloadingSalesinfo, Salesinfo]);

  const renderContent = useMemo(() => {
    if (activeApp.parentId === 'home') {
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            overflow: 'auto',
          }}
        >
          {/* Slider Section */}
          <div
            style={{
              width: '100%',
              height: '70vh',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Slider Container */}
            <div
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Slides */}
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      transform: `translateX(${(index - currentSlide) * 100}%)`,
                      transition: 'transform 0.5s ease-in-out',
                      backgroundImage: `url(${slide.image})`,
                      backgroundSize: 'contain',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                    }}
                  ></div>
                ))}
              </div>
              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                style={{
                  position: 'absolute',
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  zIndex: 100,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                }}
              >
                <LeftOutlined />
              </button>

              <button
                onClick={nextSlide}
                style={{
                  position: 'absolute',
                  right: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  zIndex: 100,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                }}
              >
                <RightOutlined />
              </button>
            </div>

            {/* Dots Navigation */}
            <div
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '10px',
                zIndex: 100,
              }}
            >
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: '2px solid rgba(0,0,0,0.3)',
                    backgroundColor:
                      index === currentSlide
                        ? '#e74c3c'
                        : 'rgba(255,255,255,0.8)',
                    cursor: 'pointer',
                    // transition: 'all 0.3s ease',
                    // boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Additional Content Section */}
          <div
            style={{
              background: '#f0f2f5',
              padding: '60px 0',
              minHeight: '30vh',
            }}
          >
            <div
              style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 24px',
              }}
            >
              {/* Hero Section */}
              <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <Title
                  level={2}
                  style={{
                    color: '#2c3e50',
                    marginBottom: '16px',
                    fontSize: '36px',
                  }}
                >
                  ระบบ Q-ERP ที่ครอบคลุมทุกความต้องการของธุรกิจ
                </Title>
                <Paragraph
                  style={{
                    fontSize: '18px',
                    color: '#666',
                    maxWidth: '800px',
                    margin: '0 auto 32px',
                    lineHeight: '1.6',
                  }}
                >
                  โซลูชันครบวงจรสำหรับการจัดการธุรกิจ ตั้งแต่การผลิต การขาย
                  การจัดการสินค้าคงคลัง ไปจนถึงการบริหารทรัพยากรบุคคล
                  ด้วยเทคโนโลยี Cloud ที่ทันสมัย
                </Paragraph>
                <Space size="large">
                  <Button
                    type="primary"
                    size="large"
                    style={{
                      backgroundColor: '#e74c3c',
                      borderColor: '#e74c3c',
                      height: '50px',
                      padding: '0 32px',
                      fontSize: '16px',
                    }}
                  >
                    เริ่มใช้งานฟรี
                  </Button>
                  <Button
                    size="large"
                    style={{
                      height: '50px',
                      padding: '0 32px',
                      fontSize: '16px',
                    }}
                  >
                    ดูข้อมูลเพิ่มเติม
                  </Button>
                </Space>
              </div>

              {/* Features Section */}
              <Row gutter={[32, 32]} style={{ marginBottom: '60px' }}>
                <Col xs={24} sm={12} lg={6}>
                  <Card
                    style={{
                      textAlign: 'center',
                      height: '100%',
                      border: 'none',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    }}
                  >
                    <RocketOutlined
                      style={{
                        fontSize: '48px',
                        color: '#3498db',
                        marginBottom: '16px',
                      }}
                    />
                    <Title level={4} style={{ color: '#2c3e50' }}>
                      เร็วและมีประสิทธิภาพ
                    </Title>
                    <Paragraph style={{ color: '#666' }}>
                      ระบบทำงานรวดเร็ว รองรับการใช้งานพร้อมกันหลายๆ คน
                      ช่วยเพิ่มประสิทธิภาพการทำงาน
                    </Paragraph>
                  </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                  <Card
                    style={{
                      textAlign: 'center',
                      height: '100%',
                      border: 'none',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    }}
                  >
                    <SafetyOutlined
                      style={{
                        fontSize: '48px',
                        color: '#27ae60',
                        marginBottom: '16px',
                      }}
                    />
                    <Title level={4} style={{ color: '#2c3e50' }}>
                      ความปลอดภัยสูง
                    </Title>
                    <Paragraph style={{ color: '#666' }}>
                      ระบบรักษาความปลอดภัยระดับองค์กร
                      ข้อมูลของคุณได้รับการป้องกันอย่างเข้มงวด
                    </Paragraph>
                  </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                  <Card
                    style={{
                      textAlign: 'center',
                      height: '100%',
                      border: 'none',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    }}
                  >
                    <TeamOutlined
                      style={{
                        fontSize: '48px',
                        color: '#9b59b6',
                        marginBottom: '16px',
                      }}
                    />
                    <Title level={4} style={{ color: '#2c3e50' }}>
                      ทีมสนับสนุนมืออาชีพ
                    </Title>
                    <Paragraph style={{ color: '#666' }}>
                      ทีมซัพพอร์ตพร้อมให้คำปรึกษาและช่วยเหลือ 24/7 ตลอดการใช้งาน
                    </Paragraph>
                  </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                  <Card
                    style={{
                      textAlign: 'center',
                      height: '100%',
                      border: 'none',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    }}
                  >
                    <CheckCircleOutlined
                      style={{
                        fontSize: '48px',
                        color: '#e74c3c',
                        marginBottom: '16px',
                      }}
                    />
                    <Title level={4} style={{ color: '#2c3e50' }}>
                      ใช้งานง่าย
                    </Title>
                    <Paragraph style={{ color: '#666' }}>
                      ออกแบบให้ใช้งานง่าย เข้าใจได้ทันที
                      ไม่ต้องผ่านการฝึกอบรมที่ซับซ้อน
                    </Paragraph>
                  </Card>
                </Col>
              </Row>

              {/* Statistics Section */}
              <div
                style={{
                  background:
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '20px',
                  padding: '60px 40px',
                  textAlign: 'center',
                  color: 'white',
                  marginBottom: '60px',
                }}
              >
                <Title
                  level={2}
                  style={{ color: 'white', marginBottom: '40px' }}
                >
                  ผลงานที่น่าประทับใจ
                </Title>
                <Row gutter={[32, 32]}>
                  <Col xs={24} sm={8}>
                    <div>
                      <Title
                        level={1}
                        style={{
                          color: 'white',
                          fontSize: '48px',
                          margin: '0 0 8px 0',
                        }}
                      >
                        500+
                      </Title>
                      <Text
                        style={{
                          color: 'rgba(255,255,255,0.9)',
                          fontSize: '18px',
                        }}
                      >
                        บริษัทที่ไว้วางใจ
                      </Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div>
                      <Title
                        level={1}
                        style={{
                          color: 'white',
                          fontSize: '48px',
                          margin: '0 0 8px 0',
                        }}
                      >
                        99.9%
                      </Title>
                      <Text
                        style={{
                          color: 'rgba(255,255,255,0.9)',
                          fontSize: '18px',
                        }}
                      >
                        Uptime ระบบ
                      </Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div>
                      <Title
                        level={1}
                        style={{
                          color: 'white',
                          fontSize: '48px',
                          margin: '0 0 8px 0',
                        }}
                      >
                        24/7
                      </Title>
                      <Text
                        style={{
                          color: 'rgba(255,255,255,0.9)',
                          fontSize: '18px',
                        }}
                      >
                        บริการสนับสนุน
                      </Text>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Modules Section */}
              <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <Title
                  level={2}
                  style={{
                    color: '#2c3e50',
                    marginBottom: '16px',
                  }}
                >
                  โมดูลที่ครอบคลุมทุกด้านธุรกิจ
                </Title>
                <Paragraph
                  style={{
                    fontSize: '16px',
                    color: '#666',
                    marginBottom: '40px',
                  }}
                >
                  เลือกใช้เฉพาะโมดูลที่ต้องการ
                  หรือใช้ครบทุกโมดูลเพื่อประสิทธิภาพสูงสุด
                </Paragraph>

                <Row gutter={[16, 16]} justify="center">
                  {[
                    'Manufacturing',
                    'Trading',
                    'Q-WMS',
                    'Q-Hotel',
                    'Q-IIOT',
                    'Q-POS',
                    'Q-HRM',
                    'Q-ECommerce',
                    'Q-Attendance',
                  ].map((module, index) => (
                    <Col key={index}>
                      <Button
                        style={{
                          backgroundColor:
                            index % 2 === 0 ? '#e74c3c' : '#2c3e50',
                          borderColor: index % 2 === 0 ? '#e74c3c' : '#2c3e50',
                          color: 'white',
                          height: '40px',
                          padding: '0 20px',
                          borderRadius: '20px',
                          fontSize: '14px',
                        }}
                      >
                        {module}
                      </Button>
                    </Col>
                  ))}
                </Row>
              </div>

              {/* Call to Action */}
              <div
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '60px 40px',
                  textAlign: 'center',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                }}
              >
                <Title
                  level={2}
                  style={{
                    color: '#2c3e50',
                    marginBottom: '16px',
                  }}
                >
                  พร้อมที่จะเริ่มต้นแล้วหรือยัง?
                </Title>
                <Paragraph
                  style={{
                    fontSize: '18px',
                    color: '#666',
                    marginBottom: '32px',
                    maxWidth: '600px',
                    margin: '0 auto 32px',
                  }}
                >
                  ลองใช้ Q-ERP ฟรี 30 วัน พร้อมการสนับสนุนจากทีมผู้เชี่ยวชาญ
                  ไม่มีค่าใช้จ่ายเพิ่มเติม ไม่ต้องผูกพัน
                </Paragraph>
                <Space size="large">
                  <Button
                    type="primary"
                    size="large"
                    style={{
                      backgroundColor: '#e74c3c',
                      borderColor: '#e74c3c',
                      height: '50px',
                      padding: '0 40px',
                      fontSize: '16px',
                    }}
                  >
                    เริ่มทดลองใช้ฟรี
                  </Button>
                  <Button
                    size="large"
                    style={{
                      height: '50px',
                      padding: '0 32px',
                      fontSize: '16px',
                    }}
                  >
                    ติดต่อฝ่ายขาย
                  </Button>
                </Space>
              </div>
            </div>
          </div>
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
  }, [activeApp, menuItems, getAppUrl, Salesinfo, isloadingSalesinfo]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {renderContent}

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
            <p
              style={{
                margin: 0,
                color: '#64748b',
                fontSize: '16px',
                fontWeight: 500,
              }}
            >
              กำลังตรวจสอบสิทธิ์...
            </p>
            <p
              style={{
                margin: '8px 0 0 0',
                color: '#94a3b8',
                fontSize: '14px',
              }}
            >
              กรุณารอสักครู่
            </p>
          </div>
        </div>
      )}

      {!permissionStatus.hasPermission &&
        !permissionStatus.showLoading &&
        activeApp.parentId !== 'home' && <NoPermissionOverlay />}

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
