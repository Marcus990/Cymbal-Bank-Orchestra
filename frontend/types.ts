
import type React from 'react';

export interface Permission {
  id: PermissionName;
  label: string;
  description: string;
  icon: React.FC<{ className?: string }>;
}

export type PermissionName =
  | 'read_transaction_history'
  | 'read_debts_history'
  | 'read_investments_history'
  | 'book_appointments'
  | 'read_networth'
  | 'read_cashflow'
  | 'execute_trades'
  | 'pay_bills';
