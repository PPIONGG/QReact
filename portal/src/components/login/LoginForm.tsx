import { Button, Form, Input, Select } from "antd";
import { UserOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import styles from "./LoginForm.module.css";

interface LoginFormProps {
  onSubmit: (values: { username: string; password: string }) => void;
  loginType: "Q" | "DB";
  onLoginTypeChange: (type: "Q" | "DB") => void;
  isLoading: boolean;
}

export default function LoginForm({
  onSubmit,
  loginType,
  onLoginTypeChange,
  isLoading,
}: LoginFormProps) {
  const { t } = useTranslation("portal-login");
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      onFinish={onSubmit}
      size="large"
      layout="vertical"
      disabled={isLoading}
    >
      <Form.Item
        label={<span className={styles.formLabel}>{t("userType")}</span>}
      >
        <Select
          value={loginType}
          onChange={onLoginTypeChange}
          options={[
            { label: "QERP (Q)", value: "Q" },
            { label: "DB", value: "DB" },
          ]}
          className={styles.selectInput}
        />
      </Form.Item>

      <Form.Item
        name="username"
        label={<span className={styles.formLabel}>{t("username")}</span>}
        rules={[{ required: true, message: t("usernameRequired") }]}
      >
        <Input
          prefix={<UserOutlined className={styles.inputIcon} />}
          placeholder={t("usernamePlaceholder")}
          autoComplete="username"
          className={styles.inputField}
        />
      </Form.Item>

      <Form.Item
        name="password"
        label={<span className={styles.formLabel}>{t("password")}</span>}
        rules={[{ required: true, message: t("passwordRequired") }]}
      >
        <Input.Password
          prefix={<LockOutlined className={styles.inputIcon} />}
          placeholder={t("passwordPlaceholder")}
          autoComplete="current-password"
          className={styles.inputField}
        />
      </Form.Item>

      <Form.Item className={styles.buttonFormItem}>
        <Button
          type="primary"
          htmlType="submit"
          loading={isLoading}
          block
          size="large"
          icon={!isLoading && <LoginOutlined />}
          className={styles.loginButton}
        >
          {t("loginButton")}
        </Button>
      </Form.Item>
    </Form>
  );
}
