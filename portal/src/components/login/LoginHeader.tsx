import { Typography } from "antd";
import { useTranslation } from "react-i18next";
import styles from "./LoginHeader.module.css";

const { Title, Text } = Typography;

export default function LoginHeader() {
  const { t } = useTranslation("portal-login");

  return (
    <div className={styles.headerContainer}>
      <Title level={2} className={styles.title}>
        {t("title")}
      </Title>
      <Text type="secondary" className={styles.subtitle}>
        {t("subtitle")}
      </Text>
    </div>
  );
}
