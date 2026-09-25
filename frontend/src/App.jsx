import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import CinematicIntro from './components/intro/CinematicIntro';
import LandingPage from './pages/LandingPage';
import CommandCenterPage from './pages/CommandCenterPage';
import RiskIntelligencePage from './pages/RiskIntelligencePage';
import CompliancePage from './pages/CompliancePage';
import EarlyWarningPage from './pages/EarlyWarningPage';
import WorksExplorerPage from './pages/WorksExplorerPage';
import InvestigationPage from './pages/InvestigationPage';
import GeographyPage from './pages/GeographyPage';
import VendorIntelligencePage from './pages/VendorIntelligencePage';
import AnalyticsPage from './pages/AnalyticsPage';
import ReportsPage from './pages/ReportsPage';
import MethodologyPage from './pages/MethodologyPage';
import CitizenEvidencePage from './pages/CitizenEvidencePage';

// AppShell Layout Wrapper for Dashboard Application
const AppLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-row text-slate-100 font-sans antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header />
        <main className="flex-1 bg-slate-950 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Product Landing Page directly at / */}
        <Route path="/" element={<LandingPage />} />

        {/* Intro Route */}
        <Route path="/intro" element={<CinematicIntro />} />

        {/* Application Dashboard Shell Routes */}
        <Route element={<AppLayout />}>
          <Route path="/command-center" element={<CommandCenterPage />} />
          <Route path="/risk-intelligence" element={<RiskIntelligencePage />} />
          <Route path="/compliance" element={<CompliancePage />} />
          <Route path="/early-warning" element={<EarlyWarningPage />} />
          <Route path="/works" element={<WorksExplorerPage />} />
          <Route path="/works/:id" element={<WorksExplorerPage />} />
          <Route path="/investigations" element={<InvestigationPage />} />
          <Route path="/citizen-evidence" element={<CitizenEvidencePage />} />
          <Route path="/geography" element={<GeographyPage />} />
          <Route path="/agency-intelligence" element={<VendorIntelligencePage />} />
          <Route path="/vendor-intelligence" element={<VendorIntelligencePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/methodology" element={<MethodologyPage />} />
        </Route>

        {/* Catch-all Redirect to Landing Page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
