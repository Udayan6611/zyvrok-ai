import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import LegalPage from './pages/LegalPage';
import StudioPage from './pages/StudioPage';
import PricingPage from './pages/PricingPage';
import HistoryPage from './pages/HistoryPage';
import AuthPage from './pages/AuthPage';

function Layout() {
  const location = useLocation();
  const isCustomLayout = ['/legal', '/studio', '/pricing', '/history', '/login'].includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-[#fafafa]">
      {!isCustomLayout && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/legal.html" element={<LegalPage />} />
          <Route path="/studio" element={<StudioPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </main>
      {!isCustomLayout && <Footer />}
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
