// The original source for this module was extracted and modified from the
// Yeti Debt Snowball Calculator project (https://github.com/emberfeather/yeti/blob/master/script/yeti.js).
// Copyright 2011 Randy Merrill

import * as types from "../types";
import { StrategyTypeEnum } from "../enums";
import { getRandomNumber } from "./randomizer";

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
      "This strategy is calculated as a counter-point to the Debt Snowball (Lowest Balance) strategy to show how much of a difference the order makes.",
    sorter: function(debts: types.StrategyDebt[]) {
      return debts.sort(function(a, b) {
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
    sorter: function(debts: types.StrategyDebt[]) {
      return debts.sort(function(a, b) {
        var diff = a.principal - b.principal;

        // If they have the same interest rate, want the one with the lowest balance first
        if (diff === 0) {
          return b.rate - a.rate;
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
    sorter: function(debts: types.StrategyDebt[]) {
      return debts.sort(function(a, b) {
        var diff = b.rate - a.rate;

        // If they have the same interest rate, want the one with the lowest balance first
        if (diff === 0) {
          return a.principal - b.principal;
        }

        return diff;
      });
    }
  },
  {
    type: StrategyTypeEnum.LowestInterestRateFirst,
    name: "Lowest Interest Rate First",
    description:
      "This strategy is calculated as a counter-point to the Debt Avalanche (Highest Interest Rate) strategy to show how much of a difference the order makes.",
    sorter: function(loans: types.StrategyDebt[]) {
      return loans.sort(function(a, b) {
        var diff = a.rate - b.rate;

        // If they have the same interest rate, want the one with the lowest balance first
        if (diff === 0) {
          return a.principal - b.principal;
        }

        return diff;
      });
    }
  },
  {
    type: StrategyTypeEnum.BalanceMinimumPaymentRatio,
    name: "Balance/Minimum Payment Ratio",
    description:
      "This strategy attempts to find debts that will be easy to pay off and add the most to your snowball for the next debt.  This is a preferred strategy as it can be mentally and emotionally easier than the Highest Interest Rate strategy and usually quicker than the Lowest Balance strategy.",
    sorter: function(loans: types.StrategyDebt[]) {
      return loans.sort(function(a, b) {
        var ratio = a.principal / a.minPayment - b.principal / b.minPayment;

        // If they have the same ratio, want the one with the lowest balance first
        if (ratio === 0) {
          return a.principal - b.principal;
        }

        return ratio;
      });
    }
  },
  {
    type: StrategyTypeEnum.BalanceInterestRateRatio,
    name: "Balance/Interest Rate Ratio",
    description:
      "This strategy attempts to find debts that will be easy to pay off and add the most to your snowball for the next debt.  This is a preferred strategy as if can be mentally and emotionally easier than the Highest Interest Rate strategy and quicker than the Lowest Balance strategy.",
    sorter: function(loans: types.StrategyDebt[]) {
      return loans.sort(function(a, b) {
        var ratio = a.principal / a.rate - b.principal / b.rate;

        // If they have the same ratio, want the one with the lowest balance first
        if (ratio === 0) {
          return a.principal - b.principal;
        }

        return ratio;
      });
    }
  }
];

/**
 * Given a list of loans, calculates a list of payment strategies
 * @param displayDebts
 * @param extraPayment
 */
export function getPaymentStrategies(
  displayDebts: types.DisplayDebt[],
  extraPayment: string
) {
  let paymentStrategies: types.PaymentStrategy[] = [];

  let debts = displayDebts
    .filter(l => {
      return l.principal && l.rate && l.minPayment;
    })
    .map(l => {
      return {
        id: Number(l),
        principal: Number(l.principal),
        rate: Number(l.rate),
        minPayment: Number(l.minPayment)
      };
    });

  for (let definition of strategyDefinitions) {
    let strategy = calculateStrategy(debts, definition, Number(extraPayment));
    paymentStrategies.push(strategy);
  }

  return paymentStrategies;
}

export function getMinimumPayment(principal: number, rate: number) {
  let periodInterest = principal * (rate / 12 / 100);
  let calculatedMinPayment = Number(
    Math.max(25, periodInterest, principal * 0.01).toFixed(2)
  );
  return calculatedMinPayment;
}

export function convertMonthsToTimespanText(months: number) {
  let years = Math.floor(months / 12);
  var relativeMonths = months % 12;

  var output = "";

  if (years > 0) {
    output += ` ${years} year${years != 1 ? "s" : ""}`;
  }

  if (relativeMonths > 0) {
    output += ` ${relativeMonths}  month${relativeMonths != 1 ? "s" : ""}`;
  }

  return output;
}

/**
 * Given an array of loans, calculates a debt payment schedule for a strategy
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

  // Use a copy of the loans to let the strategies have their own order
  let strategyLoans = <types.StrategyDebt[]>JSON.parse(JSON.stringify(debts));
  let debtOrder = <types.StrategyDebt[]>strategyDefinition.sorter(
    strategyLoans
  );

  let availableToPay = Number(extraPayment);

  // Prime the debt for scheduling
  for (let debt of debtOrder) {
    // Make sure debt values are numbers
    debt.principal = Number(debt.principal);
    debt.rate = Number(debt.rate);
    debt.minPayment = Number(debt.minPayment);

    debt.balance = debt.principal;
    debt.interest = 0;
    debt.schedule = [];
    debt.periodRate = debt.rate / paymentsPerYear;
    availableToPay += debt.minPayment;
  }

  while (hasBalance) {
    let available = availableToPay;

    // Handle minimum payments
    for (let debt of debtOrder) {
      if (debt.balance > 0) {
        let amount = Math.min(debt.balance, debt.minPayment);
        let interest = debt.balance * (debt.periodRate / 100);
        let principal = amount - interest;

        debt.balance = debt.balance - principal;
        debt.interest = debt.interest + interest;
        available -= amount;

        debt.schedule.push({
          amount: amount,
          interest: interest,
          principal: principal,
          balance: debt.balance
        });
      }
    }

    // Handle extra money
    for (let debt of debtOrder) {
      if (debt.balance > 0) {
        let amount = Math.min(debt.balance, available);

        debt.balance -= amount;
        available -= amount;

        let pos = debt.schedule.length - 1;

        debt.schedule[pos].amount = debt.schedule[pos].amount + amount;
        debt.schedule[pos].principal =
          (debt.schedule[pos].principal || 0) + amount;

        debt.schedule[pos].balance = Number(debt.balance.toFixed(2));

        // Check if all the extra money is spent
        if (available <= 0) {
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
    id: getRandomNumber(0, 20000),
    type: strategyDefinition.type,
    name: strategyDefinition.name,
    description: strategyDefinition.description,
    debts: strategyLoans,
    principal: 0,
    interest: 0,
    total: 0,
    payments: 0
  };

  // Determine some post-calulation properties
  for (let debt of debtOrder) {
    debt.payments = debt.schedule.length;

    strategy.payments = Math.max(strategy.payments, debt.payments);
    strategy.principal += debt.principal;
    strategy.interest += debt.interest;
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
