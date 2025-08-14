
import React, { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { PermissionToggle } from '../components/PermissionToggle';
import { PERMISSIONS_LIST } from '../constants';
import type { PermissionName } from '../types';

const OnboardingPage: React.FC = () => {
  const initialPermissions = useMemo(() => {
    return PERMISSIONS_LIST.reduce((acc, permission) => {
      acc[permission.id] = true;
      return acc;
    }, {} as Record<PermissionName, boolean>);
  }, []);
  
  const [enabledPermissions, setEnabledPermissions] = useState<Record<PermissionName, boolean>>(initialPermissions);

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

  return (
    <div className="min-h-screen bg-black text-cymbal-text-primary font-sans antialiased">
       <div className="absolute top-0 left-0 w-full h-full bg-grid-slate-700/[0.1] [mask-image:linear-gradient(to_bottom,white_10%,transparent_100%)]"></div>
      <div className="relative isolate min-h-screen flex flex-col items-center justify-center p-4">
        <Header />
        <main className="w-full max-w-3xl mx-auto mt-12 mb-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400">
              Tune Your Financial Experience
            </h1>
            <p className="mt-4 text-lg text-cymbal-text-secondary">
              Grant permissions to our AI financial co-pilot to personalize your journey. 
              You can change these at any time.
            </p>
          </div>

          <div className="bg-cymbal-dark/50 backdrop-blur-sm border border-cymbal-border rounded-xl shadow-2xl shadow-slate-950/50">
            <div className="p-6 border-b border-cymbal-border flex justify-between items-center">
                <h2 className="font-semibold text-lg text-cymbal-text-primary">Co-pilot Permissions</h2>
                <div className="flex items-center space-x-4">
                    <button onClick={handleSelectAll} className="text-sm font-medium text-cymbal-accent hover:text-cymbal-accent-hover transition-colors">Enable All</button>
                    <button onClick={handleDeselectAll} className="text-sm font-medium text-cymbal-text-secondary hover:text-cymbal-text-primary transition-colors">Disable All</button>
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

          <div className="mt-12 text-center">
            <button className="w-full md:w-auto bg-cymbal-accent text-cymbal-deep-dark font-bold text-lg py-4 px-12 rounded-full transition-all duration-300 ease-in-out hover:bg-cymbal-accent-hover hover:scale-105 transform shadow-[0_0_20px_theme(colors.cymbal.accent)]">
              Continue
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default OnboardingPage;
