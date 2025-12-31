import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Inventory from './pages/Inventory';
import POS from './pages/POS';
import Sales from './pages/Sales';
import Orders from './pages/Orders';
import CRM from './pages/CRM';
import Finance from './pages/Finance';
import Settings from './pages/Settings';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Reports from './pages/Reports';
import HR from './pages/HR';
import Attendance from './pages/Attendance';
import PrintCenter from './pages/PrintCenter';
import EnquiriesPage from './pages/Enquiries';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="enquiries" element={<EnquiriesPage />} />
              <Route path="pos" element={<POS />} />
              <Route path="sales" element={<Sales />} />
              <Route path="orders" element={<Orders />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="crm" element={<CRM />} />
              <Route path="print-center" element={<PrintCenter />} />

              {/* Management Routes */}
              <Route path="inventory" element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                  <Inventory />
                </ProtectedRoute>
              } />
              <Route path="hr" element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                  <HR />
                </ProtectedRoute>
              } />
              <Route path="reports" element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                  <Reports />
                </ProtectedRoute>
              } />

              {/* Admin Only Routes */}
              <Route path="finance" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Finance />
                </ProtectedRoute>
              } />
              <Route path="settings" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="users" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Users />
                </ProtectedRoute>
              } />
              <Route path="roles" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Roles />
                </ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
