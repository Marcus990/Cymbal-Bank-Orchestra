
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PermissionToggle } from '../components/PermissionToggle';
import { PERMISSIONS_LIST } from '../constants';
import { usePermissions } from '../contexts/PermissionsContext';
import type { PermissionName } from '../types';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { setPermissions } = usePermissions();
  
  const initialPermissions = useMemo(() => {
    return PERMISSIONS_LIST.reduce((acc, permission) => {
      acc[permission.id] = true;
      return acc;
    }, {} as Record<PermissionName, boolean>);
  }, []);
  
  const [enabledPermissions, setEnabledPermissions] = useState<Record<PermissionName, boolean>>(initialPermissions);
  const [userName, setUserName] = useState('');

  const handleToggle = (id: PermissionName) => {
    setEnabledPermissions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectAll = () => {
    setEnabledPermissions(initialPermissions);
  };
  
  const handleDeselectAll = () => {
     const allFalse = PERMISSIONS_LIST.reduce((acc, permission) => {
      acc[permission.id] = false;
      return acc;
    }, {} as Record<PermissionName, boolean>);
    setEnabledPermissions(allFalse);
  };

  const handleContinue = () => {
    // Store the permissions and user name in the context before navigating
    setPermissions(enabledPermissions, userName);
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-black text-cymbal-text-primary font-sans antialiased">
       <div className="absolute top-0 left-0 w-full h-full bg-grid-slate-700/[0.1] [mask-image:linear-gradient(to_bottom,white_10%,transparent_100%)] z-0"></div>
              <div className="relative isolate min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 z-10" style={{ paddingTop: '120px' }}>
        <main className="w-full max-w-3xl mx-auto mt-4 sm:mt-8 mb-6 sm:mb-8 px-2 sm:px-0">
          <div className="text-center mb-8 sm:mb-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400 mb-4 sm:mb-6 px-2">
              The Rhythm of Your Wallet
            </h1>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-cymbal-text-secondary px-4 sm:px-0">
              You are now the conductor of your financial journey. Our agents are your orchestra and are here to help. Please grant permissions that you would like our agents to access!
            </p>
          </div>

          {/* User Name Input */}
          <div className="bg-cymbal-dark/50 backdrop-blur-sm border border-cymbal-border rounded-xl shadow-2xl shadow-slate-950/50 mb-6">
            <div className="p-4 sm:p-6">
              <h2 className="font-semibold text-base sm:text-lg text-cymbal-text-primary mb-3 sm:mb-4">Personal Information</h2>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label htmlFor="userName" className="block text-sm font-medium text-cymbal-text-secondary mb-2">
                    What should we call you? *
                  </label>
                  <input
                    type="text"
                    id="userName"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value.trim())}
                    placeholder="Enter your name"
                    className={`w-full rounded-lg text-cymbal-text-primary placeholder-slate-400 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-cymbal-accent border transition-colors ${
                      userName.trim() ? 'bg-slate-900 border-cymbal-border' : 'bg-slate-900 border-red-500'
                    }`}
                    required
                    minLength={2}
                    maxLength={50}
                  />
                  {!userName.trim() && (
                    <p className="mt-2 text-xs sm:text-sm text-red-400">
                      Please enter your name to continue
                    </p>
                  )}
                  {userName.trim() && userName.trim().length < 2 && (
                    <p className="mt-2 text-xs sm:text-sm text-red-400">
                      Name must be at least 2 characters long
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-cymbal-dark/50 backdrop-blur-sm border border-cymbal-border rounded-xl shadow-2xl shadow-slate-950/50">
            <div className="p-4 sm:p-6 border-b border-cymbal-border flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                <h2 className="font-semibold text-base sm:text-lg text-cymbal-text-primary">Orchestra Permissions</h2>
                <div className="flex items-center justify-center sm:justify-end space-x-3 sm:space-x-4">
                    <button onClick={handleSelectAll} className="text-xs sm:text-sm font-medium text-cymbal-accent hover:text-cymbal-accent-hover transition-colors px-3 py-1 rounded">Enable All</button>
                    <button onClick={handleDeselectAll} className="text-xs sm:text-sm font-medium text-cymbal-text-secondary hover:text-cymbal-text-primary transition-colors px-3 py-1 rounded">Disable All</button>
                </div>
            </div>
            <ul className="divide-y divide-cymbal-border">
              {PERMISSIONS_LIST.map((permission) => (
                <li key={permission.id}>
                  <PermissionToggle
                    permission={permission}
                    isEnabled={enabledPermissions[permission.id]}
                    onToggle={() => handleToggle(permission.id)}
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 sm:mt-12 text-center px-4 sm:px-0">
            <button
              onClick={handleContinue}
              disabled={!userName.trim() || userName.trim().length < 2}
              className={`w-full sm:w-auto font-bold text-base sm:text-lg py-3 sm:py-4 px-8 sm:px-12 rounded-full transition-all duration-300 ease-in-out transform shadow-[0_0_20px_theme(colors.cymbal.accent)] ${
                userName.trim() && userName.trim().length >= 2
                  ? 'bg-cymbal-accent text-cymbal-deep-dark hover:bg-cymbal-accent-hover hover:scale-105' 
                  : 'bg-slate-600 text-slate-400 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
            {(!userName.trim() || userName.trim().length < 2) && (
              <p className="mt-3 text-sm text-cymbal-text-secondary">
                Please enter a valid name (at least 2 characters) to continue
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default OnboardingPage;
