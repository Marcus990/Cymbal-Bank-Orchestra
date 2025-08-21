
import React from 'react';
import type { Permission } from '../types';

interface PermissionToggleProps {
  permission: Permission;
  isEnabled: boolean;
  onToggle: (id: string) => void;
}

export const PermissionToggle: React.FC<PermissionToggleProps> = ({ permission, isEnabled, onToggle }) => {
  const { id, label, description, icon: Icon } = permission;

  return (
    <div className="flex items-start justify-between p-4 sm:p-6 hover:bg-slate-800/50 transition-colors duration-200 cursor-pointer" onClick={() => onToggle(id)}>
      <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
        <div className="flex-shrink-0 mt-1">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-cymbal-accent" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-cymbal-text-primary text-sm sm:text-base leading-tight">{label}</h3>
          <p className="text-xs sm:text-sm text-cymbal-text-secondary mt-1 leading-relaxed hidden xs:block">{description}</p>
          <p className="text-xs text-cymbal-text-secondary mt-1 leading-relaxed xs:hidden">{description.length > 60 ? description.substring(0, 60) + '...' : description}</p>
        </div>
      </div>
      <div className="flex-shrink-0 ml-3 sm:ml-6">
        <button
          type="button"
          role="switch"
          aria-checked={isEnabled}
          onClick={(e) => {
              e.stopPropagation();
              onToggle(id);
          }}
          className={`${
            isEnabled ? 'bg-cymbal-accent' : 'bg-slate-700'
          } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cymbal-accent focus:ring-offset-2 focus:ring-offset-cymbal-dark`}
        >
          <span
            aria-hidden="true"
            className={`${
              isEnabled ? 'translate-x-5' : 'translate-x-0'
            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
          ></span>
        </button>
      </div>
    </div>
  );
};
