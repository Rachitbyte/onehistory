import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { SidebarProvider } from './SidebarContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import AppointmentsPage from './pages/AppointmentsPage';
import CaseDetail from './pages/CaseDetail';
import ConsentsPage from './pages/ConsentsPage';
import AuditLog from './pages/AuditLog';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import HistoryPage from './pages/HistoryPage';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <BrowserRouter>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <div className="flex flex-1 flex-col">
              <Routes>
                <Route path="/about" element={<AboutPage />} />
                <Route path="/login" element={<Login />} />

                {/* Authenticated Layout */}
                <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/appointments" element={<AppointmentsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/case/:id" element={<CaseDetail />} />
                  <Route path="/consents" element={<ConsentsPage />} />
                  <Route path="/consent" element={<Navigate to="/consents" />} /> {/* Redirect old/alt path */}
                  <Route path="/audit" element={<AuditLog />} />
                </Route>

                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </SidebarProvider>
    </AuthProvider>
  );
}

export default App;
