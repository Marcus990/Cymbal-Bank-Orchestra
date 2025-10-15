
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PermissionsProvider, usePermissions } from './contexts/PermissionsContext';
// import { InsightsProvider, useInsights } from './contexts/InsightsContext';
import { Navigation } from './components/Navigation';
// import { InsightsBar } from './components/InsightsBar';
import OnboardingPage from './pages/OnboardingPage';
import { HomePage } from './pages/HomePage';

const AppRoutes: React.FC = () => {
  const { hasCompletedOnboarding } = usePermissions();
  // const { insights } = useInsights();

  return (
    <>
      <Navigation />
      {/* {hasCompletedOnboarding && <InsightsBar insights={insights} />} */}
      <div className={hasCompletedOnboarding ? 'pt-16' : 'pt-16'}>
        <Routes>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/" element={<Navigate to={hasCompletedOnboarding ? "/home" : "/onboarding"} />} />
        </Routes>
      </div>
    </>
  );
};

function App(): React.ReactNode {
  return (
    <PermissionsProvider>
      {/* <InsightsProvider> */}
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      {/* </InsightsProvider> */}
    </PermissionsProvider>
  );
}

export default App;
