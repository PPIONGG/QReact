import React from "react";
import { Alert, Card, message } from "antd";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store/auth.store";
import BackgroundOverlay from "../components/login/BackgroundOverlay";
import LoginHeader from "../components/login/LoginHeader";
import LoginForm from "../components/login/LoginForm";
import styles from "./Login.module.css";

export default function Login() {
  const { login, isLoadingLogin, errorLogin, clearErrorLogin } = useAuthStore();
  const { i18n } = useTranslation();
  const [loginType, setLoginType] = React.useState<"Q" | "DB">("Q");

    // แสดง error message เมื่อมี error
  React.useEffect(() => {
    if (errorLogin) {
      message.error({
        content: errorLogin,
        duration: 4,
        key: 'login-error', // ป้องกันแสดงซ้ำ
      });
      clearErrorLogin(); // เคลียร์ error หลังแสดง
    }
  }, [errorLogin, clearErrorLogin]);
  
  const handleSubmit = async (values: {
    username: string;
    password: string;
  }) => {
    await login(values.username, values.password, loginType);
  };


  const handleLoginTypeChange = (type: "Q" | "DB") => {
    setLoginType(type);
  };

  const toggleLanguage = () => {
    const newLanguage = i18n.language === "th" ? "en" : "th";
    i18n.changeLanguage(newLanguage);
  };

  return (
    <BackgroundOverlay>
      <Card
        className={styles.loginCard}
        styles={{
          body: {
            padding: 0,
          },
        }}
      >
        <div className={styles.cardBody}>
          <div
            className={styles.languageToggle}
            onClick={toggleLanguage}
            title={`Switch to ${i18n.language === "th" ? "English" : "ไทย"}`}
          >
            {i18n.language}
          </div>

          <LoginHeader />

          <LoginForm
            onSubmit={handleSubmit}
            loginType={loginType}
            onLoginTypeChange={handleLoginTypeChange}
            isLoading={isLoadingLogin}
          />
        </div>
      </Card>
    </BackgroundOverlay>
  );
}
