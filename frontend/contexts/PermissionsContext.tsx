import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { PermissionName } from '../types';

interface PermissionsContextType {
  permissions: Record<PermissionName, boolean>;
  userName: string;
  setPermissions: (permissions: Record<PermissionName, boolean>, userName: string) => void;
  getPermissionContext: () => string;
  hasCompletedOnboarding: boolean;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};

interface PermissionsProviderProps {
  children: ReactNode;
}

export const PermissionsProvider: React.FC<PermissionsProviderProps> = ({ children }) => {
  const [permissions, setPermissionsState] = useState<Record<PermissionName, boolean>>({});
  const [userName, setUserNameState] = useState('');
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Load permissions and user name from localStorage on mount
  useEffect(() => {
    const savedPermissions = localStorage.getItem('userPermissions');
    const savedUserName = localStorage.getItem('userName');
    
    if (savedPermissions) {
      try {
        const parsed = JSON.parse(savedPermissions);
        setPermissionsState(parsed);
        setHasCompletedOnboarding(true);
      } catch (error) {
        console.error('Failed to parse saved permissions:', error);
      }
    }
    
    if (savedUserName) {
      setUserNameState(savedUserName);
    }
  }, []);

  const setPermissions = (newPermissions: Record<PermissionName, boolean>, newUserName: string) => {
    setPermissionsState(newPermissions);
    setUserNameState(newUserName);
    setHasCompletedOnboarding(true);
    // Save to localStorage
    localStorage.setItem('userPermissions', JSON.stringify(newPermissions));
    localStorage.setItem('userName', newUserName);
  };

  const getPermissionContext = (): string => {
    const permissionDescriptions: string[] = [];
    
    if (!permissions.read_transaction_history) {
      permissionDescriptions.push("You do not have access to the user's transaction history");
    }
    if (!permissions.read_debts_history) {
      permissionDescriptions.push("You do not have access to the user's debt information");
    }
    if (!permissions.read_investments_history) {
      permissionDescriptions.push("You do not have access to the user's investment portfolio");
    }
    if (!permissions.read_networth) {
      permissionDescriptions.push("You do not have access to the user's net worth data");
    }
    if (!permissions.read_cashflow) {
      permissionDescriptions.push("You do not have access to the user's cash flow information");
    }
    if (!permissions.book_appointments) {
      permissionDescriptions.push("You cannot book appointments on behalf of the user");
    }
    if (!permissions.execute_trades) {
      permissionDescriptions.push("You cannot execute investment trades on behalf of the user");
    }
    if (!permissions.pay_bills) {
      permissionDescriptions.push("You cannot pay bills or make payments on behalf of the user");
    }

    let context = '';
    
    // Add user ID context
    if (userName) {
      context += `The user's ID is ${userName}. You must never ask for the user for their name or ID. Always assume their user ID is ${userName}.\n\n`;
    }
    
    // Add permission context
    if (permissionDescriptions.length === 0) {
      context += "You have full access to all user financial data and can perform all available actions.";
    } else {
      context += `Permission Context: ${permissionDescriptions.join('. ')}. Please respect these limitations when responding to user queries.`;
    }

    return context;
  };

  return (
    <PermissionsContext.Provider value={{ permissions, userName, setPermissions, getPermissionContext, hasCompletedOnboarding }}>
      {children}
    </PermissionsContext.Provider>
  );
};
