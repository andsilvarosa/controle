import React from 'react';
import { TransactionModal } from './TransactionModal';
import { CategoryModal } from './CategoryModal';
import { RuleModal } from './RuleModal';
import { WalletModal } from './WalletModal';
import { BudgetModal } from './BudgetModal';
import { RecurrenceActionModal } from './RecurrenceActionModal';
import { ProfileModal } from './ProfileModal';
import { SecurityModal } from './SecurityModal';
import { useFinanceStore } from '../store/useFinanceStore';

export function ModalManager() {
  const { activeModal } = useFinanceStore();

  if (!activeModal) return null;

  return (
    <>
      {(activeModal === 'income' || activeModal === 'expense') && <TransactionModal />}
      {activeModal === 'category' && <CategoryModal />}
      {activeModal === 'rule' && <RuleModal />}
      {activeModal === 'wallet' && <WalletModal />}
      {activeModal === 'budget' && <BudgetModal />}
      {activeModal === 'recurrence-action' && <RecurrenceActionModal />}
      {activeModal === 'profile' && <ProfileModal />}
      {activeModal === 'security' && <SecurityModal />}
    </>
  );
}
