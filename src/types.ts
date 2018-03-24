import * as enums from "./enums";

export interface Debt {
  id: number;
  principal: string;
  rate: string;
  minPayment: string;
}

export interface StrategyLoan extends Debt {
  balance: number;
  interest: number;
  schedule: Array<any>;
  periodRate: number;
  payments: number;
  isInterestOnly: boolean;
}

export interface PaymentStrategy {
  type: enums.StrategyTypeEnum;
  name: string;
  description: string;
  principal: number;
  interest: number;
  total: number;
}

export interface StrategyDefinition {
  type: enums.StrategyTypeEnum;
  name: string;
  description: string;
  sorter: (loans: StrategyLoan[]) => StrategyLoan[];
}
