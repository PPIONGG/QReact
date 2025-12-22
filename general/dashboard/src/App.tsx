import { Carousel, Typography } from 'antd'
import banner1 from './assets/Q-ERPc.jpg'
import banner2 from './assets/Q-ERPc_2.jpg'

const { Title } = Typography

interface AppProps {
  username?: string
  accessToken?: string
  companyCode?: string
}

// Banner images
const bannerImages = [
  { id: 1, src: banner1, alt: 'Q-ERPc Banner 1' },
  { id: 2, src: banner2, alt: 'Q-ERPc Banner 2' },
]

function App(_props: AppProps) {
  return (
    <div>
      <Carousel autoplay autoplaySpeed={5000} style={{ maxWidth: '100%' }}>
        {bannerImages.map((banner) => (
          <div key={banner.id}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#f5f5f5',
              }}
            >
              <img
                src={banner.src}
                alt={banner.alt}
                style={{
                  maxWidth: '100%',
                  maxHeight: 'calc(100vh - 180px)',
                  objectFit: 'contain',
                }}
              />
            </div>
          </div>
        ))}
      </Carousel>
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
          ยินดีต้อนรับสู่ Q-ERPc
        </Title>
      </div>
    </div>
  )
}

export default App
