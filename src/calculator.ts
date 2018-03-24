// The original source for this module was extracted and modified from the
// Yeti Debt Snowball Calculator project (https://github.com/emberfeather/yeti/blob/master/script/yeti.js).
// Copyright 2011 Randy Merrill

import * as types from "./types";

interface StrategyConfigDetail {
  type: types.StrategyTypeEnum;
  name: string;
  description: string;
  sorter: (loans: types.IStrategyAccount[]) => types.IStrategyAccount[];
}

const strategyConfig: Array<StrategyConfigDetail> = [
  {
    type: types.StrategyTypeEnum.HighestBalanceFirst,
    name: "Highest Balance First",
    description: "",
    sorter: function(loans: types.IStrategyAccount[]) {
      return loans.sort(function(a, b) {
        var diff = Number(b.principal) - Number(a.principal);

        // If they have the same interest rate, want the one with the lowest balance first
        if (diff === 0) {
          return Number(b.rate) - Number(a.rate);
        }

        return diff;
      });
    }
  },
  {
    type: types.StrategyTypeEnum.LowestBalanceFirst,
    name: "Lowest Balance First",
    description: "",
    sorter: function(loans: types.IStrategyAccount[]) {
      return loans.sort(function(a, b) {
        var diff = Number(a.principal) - Number(b.principal);

        // If they have the same interest rate, want the one with the lowest balance first
        if (diff === 0) {
          return Number(b.rate) - Number(a.rate);
        }

        return diff;
      });
    }
  },
  {
    type: types.StrategyTypeEnum.HighestInterestRateFirst,
    name: "Highest Interest Rate First",
    description: "",
    sorter: function(loans: types.IStrategyAccount[]) {
      return loans.sort(function(a, b) {
        var diff = Number(b.rate) - Number(a.rate);

        // If they have the same interest rate, want the one with the lowest balance first
        if (diff === 0) {
          return Number(a.principal) - Number(b.principal);
        }

        return diff;
      });
    }
  },
  {
    type: types.StrategyTypeEnum.LowestInterestRateFirst,
    name: "Lowest Interest Rate First",
    description: "",
    sorter: function(loans: types.IStrategyAccount[]) {
      return loans.sort(function(a, b) {
        var diff = Number(a.rate) - Number(b.rate);

        // If they have the same interest rate, want the one with the lowest balance first
        if (diff === 0) {
          return Number(a.principal) - Number(b.principal);
        }

        return diff;
      });
    }
  },
  {
    type: types.StrategyTypeEnum.BalanceMinimumPaymentRatio,
    name: "Balance/Minimum Payment Ratio",
    description: "",
    sorter: function(loans: types.IStrategyAccount[]) {
      return loans.sort(function(a, b) {
        var ratio =
          Number(a.principal) / Number(a.minPayment) -
          Number(b.principal) / Number(b.minPayment);

        // If they have the same ratio, want the one with the lowest balance first
        if (ratio === 0) {
          return Number(a.principal) - Number(b.principal);
        }

        return ratio;
      });
    }
  },
  {
    type: types.StrategyTypeEnum.BalanceInterestRateRatio,
    name: "Balance/Interest Rate Ratio",
    description: "",
    sorter: function(loans: types.IStrategyAccount[]) {
      return loans.sort(function(a, b) {
        var ratio =
          Number(a.principal) / Number(a.rate) -
          Number(b.principal) / Number(b.rate);

        // If they have the same ratio, want the one with the lowest balance first
        if (ratio === 0) {
          return Number(a.principal) - Number(b.principal);
        }

        return ratio;
      });
    }
  }
];

export function getStrategies(loans: types.IAccount[], extraPayment: number) {
  let strategies: types.IStrategy[] = [];
  let configs = strategyConfig;
  for (var config of configs) {
    let strategy = calculateStrategy(config, loans, extraPayment);
    strategies.push(strategy);
  }

  return strategies;
}

/**
 * Given an array of loans already sorted per the strategy, calculates loan payment schedule
 * @param strategy
 * @param loans
 * @param extraPayment
 */
function calculateStrategy(
  strategyConfig: StrategyConfigDetail,
  loans: types.IAccount[],
  extraPayment: number
) {
  let schedule = [];
  let hasBalance = true;
  let extraUsed = 0;

  const ppy = 12;

  // Use a copy of the loans to let the strategies have their own order
  let strategyLoans = <types.IStrategyAccount[]>JSON.parse(
    JSON.stringify(loans)
  );
  let loanOrder = <types.IStrategyAccount[]>strategyConfig.sorter(
    strategyLoans
  );

  // Prime the loan for scheduling
  for (let loan of loanOrder) {
    loan.balance = Number(loan.principal);
    loan.interest = 0;
    loan.schedule = [];
    loan.periodRate = Number(loan.rate) / ppy;
  }

  while (hasBalance) {
    let extra = extraPayment;

    // Handle minimum payments
    for (let loan of loanOrder) {
      if (loan.balance > 0) {
        let amount = Math.min(loan.balance, Number(loan.minPayment));
        let interest = loan.balance * (loan.periodRate / 100);
        let principal = amount - interest;

        loan.balance = loan.balance - Number(principal);
        loan.interest = loan.interest + interest;
        extra -= amount;

        loan.schedule.push({
          amount: amount,
          interest: interest,
          principal: principal,
          balance: loan.balance
        });
      }
    }

    // Keep track of how much extra we used
    extraUsed = extra;

    // Handle extra money
    for (let loan of loanOrder) {
      if (loan.balance > 0) {
        let amount = Math.min(loan.balance, extra);

        loan.balance -= amount;
        extra -= amount;

        let pos = loan.schedule.length - 1;

        loan.schedule[pos].amount = loan.schedule[pos].amount + amount;
        loan.schedule[pos].principal =
          (loan.schedule[pos].principal || 0) + amount;

        loan.schedule[pos].balance = loan.balance.toFixed(2);

        // Check if all the extra money is spent
        if (extra <= 0) {
          break;
        }
      }
    }

    // Determine if all the loans have been repaid
    hasBalance = !!loanOrder.find(l => {
      return l.balance > 0;
    });
  }

  const strategy: types.IStrategy = {
    type: strategyConfig.type,
    name: strategyConfig.name,
    description: strategyConfig.description,
    principal: 0,
    interest: 0,
    total: 0
  };

  // Determine some post-calulation properties
  for (let loan of loanOrder) {
    loan.payments = loan.schedule.length;

    strategy.principal += Number(loan.principal);
    strategy.interest += Number(loan.interest);
    strategy.total = strategy.principal + strategy.interest;
  }

  strategy.principal = moneyRound(strategy.principal);
  strategy.interest = moneyRound(strategy.interest);
  strategy.total = moneyRound(strategy.total);

  return strategy;
}

function moneyRound(amount: number, precision: number = 2) {
  var factor = Math.pow(10, precision);
  return Math.round(amount * factor) / factor;
}
