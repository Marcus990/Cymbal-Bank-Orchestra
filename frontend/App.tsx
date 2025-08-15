
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PermissionsProvider, usePermissions } from './contexts/PermissionsContext';
import OnboardingPage from './pages/OnboardingPage';
import { HomePage } from './pages/HomePage';

const AppRoutes: React.FC = () => {
  const { hasCompletedOnboarding } = usePermissions();

  return (
    <Routes>
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/" element={<Navigate to={hasCompletedOnboarding ? "/home" : "/onboarding"} />} />
    </Routes>
  );
};

function App(): React.ReactNode {
  return (
    <PermissionsProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </PermissionsProvider>
  );
}

export default App;
