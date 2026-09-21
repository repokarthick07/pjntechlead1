import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Dashboard } from './pages/Dashboard';
import { OutreachMode } from './pages/OutreachMode';
import { Leads } from './pages/Leads';
import { FileImport } from './pages/FileImport';
import { Templates } from './pages/Templates';
import { FollowUps } from './pages/FollowUps';
import { ImportHistory } from './pages/ImportHistory';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-xs font-semibold text-slate-400">Loading PJN LeadFlow...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Outreach mode has full-screen focused workspace layout
  const isOutreachPage = location.pathname === '/outreach';

  if (isOutreachPage) {
    return <OutreachMode />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 pb-12">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/import" element={<FileImport />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/follow-ups" element={<FollowUps />} />
            <Route path="/history" element={<ImportHistory />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
