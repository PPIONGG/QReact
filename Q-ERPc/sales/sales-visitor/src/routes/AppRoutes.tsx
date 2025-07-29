import { Route, Routes } from 'react-router-dom';
import LogVisited from '../pages/LogVisited';
import VisitorReport from '../pages/VisitorReport';

export const AppRoutes = () => {
  return (
        <Routes>

          {/* 🔧 สำหรับ Remote Standalone */}
          <Route path="/" element={<LogVisited />} />
          <Route path="/new" element={<VisitorReport mode='new'/>} />
          <Route path="/edit/:id" element={<VisitorReport  mode='edit'/>} />

          {/* 🔧 สำหรับ Host Embedded */}
          <Route path="/sales/sales-visitor" element={<LogVisited />} />
          <Route path="/sales/sales-visitor/new" element={<VisitorReport mode='new'/>} />
          <Route path="/sales/sales-visitor/edit/:id" element={<VisitorReport mode='edit'/>} />
        </Routes>
  );
};
