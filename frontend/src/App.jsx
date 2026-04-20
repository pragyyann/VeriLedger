import { useState } from 'react';
import { motion } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import TopBar from './components/layout/TopBar.tsx';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import { Web3HeroAnimated } from './components/ui/animated-web3-landing-page';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import LedgerTable from './components/LedgerTable';
import AuditStatus from './components/AuditStatus';
import BlockchainStatus from './components/BlockchainStatus';
import ExportPanel from './components/ExportPanel';
import { BackgroundPaths } from './components/ui/background-paths';
import './index.css';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('veriledger_auth') === 'true';
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [analyticsData, setAnalyticsData] = useState(null);

  const handleTransactionAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Router>
      <AppContent
        refreshTrigger={refreshTrigger}
        setRefreshTrigger={setRefreshTrigger}
        handleTransactionAdded={handleTransactionAdded}
        analyticsData={analyticsData}
        setAnalyticsData={setAnalyticsData}
      />
    </Router>
  );
}

function AppContent({ refreshTrigger, setRefreshTrigger, handleTransactionAdded, analyticsData, setAnalyticsData }) {
  const location = useLocation();
  const isPublicRoute = ['/', '/login', '/demo'].includes(location.pathname);

  return (
      <div className="relative min-h-screen bg-black overflow-hidden flex flex-col">
        {!isPublicRoute && (
            <div className="fixed inset-0 z-0 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617]">
                <BackgroundPaths />
            </div>
        )}

        <TopBar setRefreshTrigger={setRefreshTrigger} />

        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`relative z-10 w-full flex-grow ${!isPublicRoute ? "max-w-7xl mx-auto px-4 md:px-8 pb-12" : ""}`}
        >
          <Routes>
            {/* PUBLIC SAAS ROUTES */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/demo" element={<Web3HeroAnimated />} />

            {/* DASHBOARD */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <div className="space-y-8">
                  <Dashboard
                    key={`dash-${refreshTrigger}`}
                    refreshTrigger={refreshTrigger}
                    onAnalyticsLoaded={setAnalyticsData}
                    onTransactionAdded={handleTransactionAdded}
                  />
                </div>
              </ProtectedRoute>
            } />

            {/* LEDGER */}
            <Route path="/ledger" element={
              <ProtectedRoute>
                <div className="space-y-8 max-w-5xl mx-auto">
                  <TransactionForm onTransactionAdded={handleTransactionAdded} />
                  <LedgerTable refreshTrigger={refreshTrigger} />
                  <ExportPanel />
                </div>
              </ProtectedRoute>
            } />

            {/* AUDIT */}
            <Route path="/audit" element={
              <ProtectedRoute>
                <div className="max-w-3xl mx-auto mt-12 space-y-6">
                  <AuditStatus key={`audit-${refreshTrigger}`} />
                  <ExportPanel />
                </div>
              </ProtectedRoute>
            } />

            {/* BLOCKCHAIN */}
            <Route path="/blockchain" element={
              <ProtectedRoute>
                <div className="max-w-3xl mx-auto mt-12">
                  <BlockchainStatus />
                </div>
              </ProtectedRoute>
            } />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </div>
  );
}

export default App;
