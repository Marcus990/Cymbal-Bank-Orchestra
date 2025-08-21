import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CymbalIcon } from './icons/CymbalIcon';
import { usePermissions } from '../contexts/PermissionsContext';
import example_profile_picture from '../assets/example_profile_photo.png';

export const Navigation: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { userName } = usePermissions();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show nav when scrolling up, hide when scrolling down
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[9999] transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="bg-black/50 backdrop-blur-md border-b border-cymbal-border">
        <div className="max-w-7xl py-2 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-2">
              <CymbalIcon className="w-6 h-6 sm:w-8 sm:h-8 text-cymbal-accent flex-shrink-0" />
              <h1 className="text-lg sm:text-xl font-bold text-cymbal-text-primary">
                Cymbal Bank
              </h1>
            </div>

            {/* Navigation Links */}
            <div className="hidden sm:flex items-center space-x-8">
              <button
                onClick={() => navigate('/onboarding')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/onboarding')
                    ? 'bg-cymbal-accent text-cymbal-deep-dark'
                    : 'text-cymbal-text-secondary hover:text-cymbal-text-primary hover:bg-slate-800/50'
                }`}
              >
                Onboarding
              </button>
              <button
                onClick={() => navigate('/home')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/home')
                    ? 'bg-cymbal-accent text-cymbal-deep-dark'
                    : 'text-cymbal-text-secondary hover:text-cymbal-text-primary hover:bg-slate-800/50'
                }`}
              >
                Home
              </button>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              {userName && (
                <span className="hidden sm:block text-sm text-cymbal-text-secondary">
                  Welcome, {userName}
                </span>
              )}

              <div className="p-[0.5%] w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-cymbal-accent/20 border border-cymbal-accent flex items-center justify-center overflow-hidden">
                <img 
                  src={example_profile_picture} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover object-center" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="sm:hidden bg-black/80 backdrop-blur-md border-b border-cymbal-border">
        <div className="px-4 py-2">
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => navigate('/onboarding')}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive('/onboarding')
                  ? 'bg-cymbal-accent text-cymbal-deep-dark'
                  : 'text-cymbal-text-secondary hover:text-cymbal-text-primary'
              }`}
            >
              Onboarding
            </button>
            <button
              onClick={() => navigate('/home')}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive('/home')
                  ? 'bg-cymbal-accent text-cymbal-deep-dark'
                  : 'text-cymbal-text-secondary hover:text-cymbal-text-primary'
              }`}
            >
              Home
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
