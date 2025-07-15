import { HashRouter } from 'react-router-dom';
import { Layout } from 'antd';
import { AppRoutes } from './routes/AppRoutes';

const { Content } = Layout;

export function App() {
  return (
    <HashRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Layout>
        <Content style={{ padding: '0px' }}>
          <AppRoutes />
        </Content>
      </Layout>
    </HashRouter>
  );
}

export default App;
