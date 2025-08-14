
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import OnboardingPage from './pages/OnboardingPage';
import { HomePage } from './pages/HomePage';

function App(): React.ReactNode {
  return (
    <HashRouter>
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/home" element={<HomePage />} />
        {/* <Route path="/" element={<Navigate to="/home" />} /> */}
      </Routes>
    </HashRouter>
  );
}

export default App;
