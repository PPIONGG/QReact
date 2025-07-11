import { Typography } from 'antd';
import { useTranslation } from '@qreact/i18n';
const { Title, Text } = Typography;

export default function LoginHeader() {
  const { t } = useTranslation('portal-login');

  return (
    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
      <Title
        level={2}
        style={{
          marginBottom: '8px',
          color: '#b30000',
          fontSize: '28px',
          fontWeight: 600,
        }}
      >
        {t('title')}
      </Title>
      <Text type="secondary" style={{ fontSize: '16px', color: '#666' }}>
        {t('subtitle')}
      </Text>
    </div>
  );
}
