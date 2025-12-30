import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';

// Placeholder components for routes not yet implemented
const Inventory = () => <div>Inventory Page (Coming Soon)</div>;
const Orders = () => <div>Orders Page (Coming Soon)</div>;
const CRM = () => <div>CRM Page (Coming Soon)</div>;
const HR = () => <div>HR Page (Coming Soon)</div>;
const Finance = () => <div>Finance Page (Coming Soon)</div>;
const Settings = () => <div>Settings Page (Coming Soon)</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="orders" element={<Orders />} />
          <Route path="crm" element={<CRM />} />
          <Route path="hr" element={<HR />} />
          <Route path="finance" element={<Finance />} />
          <Route path="settings" element={<Settings />} />
          {/* Redirect unknown routes to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
