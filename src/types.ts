import * as enums from "./enums";

type Stringified<T> = { [P in keyof T]: string };

export interface Debt {
  id: number;
  principal: number;
  rate: number;
  minPayment: number;
}

export type StringifiedDebt = Stringified<Debt>;

export interface DisplayDebt extends StringifiedDebt {
  valid: boolean;
}

export interface DisplayDebtErrors {
  id: number;
  errors: boolean;
}

export interface StrategyDebtScheduleItem {
  amount: number;
  interest: number;
  principal: number;
  balance: number;
}

export interface StrategyDebt extends Debt {
  balance: number;
  interest: number;
  schedule: Array<StrategyDebtScheduleItem>;
  periodRate: number;
  payments: number;
}

export interface PaymentStrategy {
  id: number;
  type: enums.StrategyTypeEnum;
  name: string;
  description: string;
  debts: Array<StrategyDebt>;
  principal: number;
  interest: number;
  total: number;
  payments: number;
}

export interface StrategyDefinition {
  type: enums.StrategyTypeEnum;
  name: string;
  description: string;
  sorter: (loans: StrategyDebt[]) => StrategyDebt[];
}
