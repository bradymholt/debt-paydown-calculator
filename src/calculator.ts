// The original source for this module was extracted and modified from the
// Yeti Debt Snowball Calculator project (https://github.com/emberfeather/yeti/blob/master/script/yeti.js).
// Copyright 2011 Randy Merrill

import * as types from "./types";
import { StrategyTypeEnum } from "./enums";

/**
 * Define Strategies
 *
 * Strategies are used to determine the order that loans should be paid.
 */
const strategyDefinitions: Array<types.StrategyDefinition> = [
  {
    type: StrategyTypeEnum.HighestBalanceFirst,
    name: "Highest Balance First",
    description:
      "This is calculated as a counter-point to the Debt Snowball (Lowest Balance) strategy to show how much of a difference the order makes.",
    sorter: function(loans: types.StrategyLoan[]) {
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
    type: StrategyTypeEnum.LowestBalanceFirst,
    name: "Debt Snowball (Lowest Balance First)",
    description:
      "By paying off loans with the lowest balance first you can increase your snowball quickly.  This is one of the most commonly promoted strategies and often is easier mentally and emotionally to execute since you are able to build momentum quickly and feel good about the progress you make.",
    sorter: function(loans: types.StrategyLoan[]) {
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
    type: StrategyTypeEnum.HighestInterestRateFirst,
    name: "Debt Avalanche (Highest Interest Rate First)",
    description:
      "By paying off the loans with the highest interest rate first you often end up paying less in interest in total.  This will often save the most money, but may be the most mentally and emotionally challenging to execute since it often takes longer to feel like it is having any effect.",
    sorter: function(loans: types.StrategyLoan[]) {
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
    type: StrategyTypeEnum.LowestInterestRateFirst,
    name: "Lowest Interest Rate First",
    description:
      "This is calculated as a counter-point to the Debt Avalanche (Highest Interest Rate) strategy to show how much of a difference the order makes.",
    sorter: function(loans: types.StrategyLoan[]) {
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
    type: StrategyTypeEnum.BalanceMinimumPaymentRatio,
    name: "Balance/Minimum Payment Ratio",
    description:
      "Attempts to find debts that will be easy to pay off and add the most to your snowball for the next loan.  This is a preferred strategy as it can be mentally and emotionally easier than the Highest Interest Rate strategy and usually quicker than the Lowest Balance strategy.",
    sorter: function(loans: types.StrategyLoan[]) {
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
    type: StrategyTypeEnum.BalanceInterestRateRatio,
    name: "Balance/Interest Rate Ratio",
    description:
      "Attempts to find debts that will be easy to pay off and add the most to your snowball for the next loan.  This is a preferred strategy as if can be mentally and emotionally easier than the Highest Interest Rate strategy and quicker than the Lowest Balance strategy.",
    sorter: function(loans: types.StrategyLoan[]) {
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

/**
 * Given a list of loans, calculates a list of payment strategies
 * @param loans
 * @param extraPayment
 */
export function getPaymentStrategies(
  loans: types.Debt[],
  extraPayment: number
) {
  let paymentStrategies: types.PaymentStrategy[] = [];
  for (let definition of strategyDefinitions) {
    let strategy = calculateStrategy(loans, definition, extraPayment);
    paymentStrategies.push(strategy);
  }

  return paymentStrategies;
}

/**
 * Given an array of loans, calculates a loan payment schedule for a strategy
 * @param strategy
 * @param debts
 * @param extraPayment
 */
function calculateStrategy(
  debts: types.Debt[],
  strategyDefinition: types.StrategyDefinition,
  extraPayment: number
) {
  const paymentsPerYear = 12;

  let schedule = [];
  let hasBalance = true;
  let extraUsed = 0;

  // Use a copy of the loans to let the strategies have their own order
  let strategyLoans = <types.StrategyLoan[]>JSON.parse(JSON.stringify(debts));
  let debtOrder = <types.StrategyLoan[]>strategyDefinition.sorter(
    strategyLoans
  );

  // Prime the loan for scheduling
  for (let debt of debtOrder) {
    debt.balance = Number(debt.principal);
    debt.interest = 0;
    debt.schedule = [];
    debt.periodRate = Number(debt.rate) / paymentsPerYear;
  }

  while (hasBalance) {
    let extra = extraPayment;

    // Handle minimum payments
    for (let debt of debtOrder) {
      if (debt.balance > 0) {
        let amount = Math.min(debt.balance, Number(debt.minPayment));
        let interest = debt.balance * (debt.periodRate / 100);
        let principal = amount - interest;

        debt.balance = debt.balance - Number(principal);
        debt.interest = debt.interest + interest;
        extra -= amount;

        debt.schedule.push({
          amount: amount,
          interest: interest,
          principal: principal,
          balance: debt.balance
        });
      }
    }

    // Keep track of how much extra we used
    extraUsed = extra;

    // Handle extra money
    for (let debt of debtOrder) {
      if (debt.balance > 0) {
        let amount = Math.min(debt.balance, extra);

        debt.balance -= amount;
        extra -= amount;

        let pos = debt.schedule.length - 1;

        debt.schedule[pos].amount = debt.schedule[pos].amount + amount;
        debt.schedule[pos].principal =
          (debt.schedule[pos].principal || 0) + amount;

        debt.schedule[pos].balance = debt.balance.toFixed(2);

        // Check if all the extra money is spent
        if (extra <= 0) {
          break;
        }
      }
    }

    // Determine if all the loans have been repaid
    hasBalance = !!debtOrder.find(l => {
      return l.balance > 0;
    });
  }

  const strategy: types.PaymentStrategy = {
    type: strategyDefinition.type,
    name: strategyDefinition.name,
    description: strategyDefinition.description,
    principal: 0,
    interest: 0,
    total: 0
  };

  // Determine some post-calulation properties
  for (let debt of debtOrder) {
    debt.payments = debt.schedule.length;

    strategy.principal += Number(debt.principal);
    strategy.interest += Number(debt.interest);
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
