import type { PartyBalance } from "../account-transactions/account-transaction.types";

export type { PartyBalance };

export interface ReceivablesReport {
  generatedAt: Date;
  parties: PartyBalance[];
  totalOwed: string;
}

export interface PayablesReport {
  generatedAt: Date;
  parties: PartyBalance[];
  totalCredit: string;
}

export interface BalancesReport {
  generatedAt: Date;
  parties: PartyBalance[];
  totalReceivables: string;
  totalPayables: string;
}