import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { Layout } from "antd";
import { AppRoutes } from "./routes/AppRoutes";

const { Content } = Layout;

const App: React.FC = () => {
  return (
    <HashRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Layout>
        <Content style={{ padding: "0px" }}>
          <AppRoutes />
        </Content>
      </Layout>
    </HashRouter>
  );
};

export default App;
