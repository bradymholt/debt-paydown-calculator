export interface IAccount {
  id: number;
  principal: string;
  rate: string;
  minPayment: string;
}

export interface IStrategyAccount extends IAccount {
  balance: number;
  interest: number;
  schedule: Array<any>;
  periodRate: number;
  payments: number;
  isInterestOnly: boolean;
}

export enum StrategyTypeEnum {
  HighestBalanceFirst,
  LowestBalanceFirst,
  HighestInterestRateFirst,
  LowestInterestRateFirst,
  BalanceMinimumPaymentRatio,
  BalanceInterestRateRatio
}

export interface IStrategy {
  type: StrategyTypeEnum;
  name: string;
  description: string;
  principal: number;
  interest: number;
  total: number;
}
