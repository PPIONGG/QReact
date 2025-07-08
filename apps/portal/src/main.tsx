import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';
import '@qreact/shared-styles/global.css';
import '@ant-design/v5-patch-for-react-19';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
