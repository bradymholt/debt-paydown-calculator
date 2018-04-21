import * as types from "../src/types";
import * as enums from "../src/enums";
import * as calculator from "../src/calculator";

it("calculates correct strategy amounts for multiple loans", async function() {
  let loans: types.Debt[] = [
    { id: 1, principal: 3000, rate: 15.5, minPayment: 38.75 },
    { id: 2, principal: 500, rate: 17.25, minPayment: 50 }
  ];

  const extraPayment = 400;
  let strategies = calculator.getPaymentStrategies(loans, extraPayment);

  assert.equal(strategies.length, 6);

  const highestBalanceStrategy = strategies.find(s => {
    return s.type == enums.StrategyTypeEnum.HighestBalanceFirst;
  })!;

  const lowestBalanceStrategy = strategies.find(s => {
    return s.type == enums.StrategyTypeEnum.LowestBalanceFirst;
  })!;

  assert.equal(highestBalanceStrategy.total, 3701.3);
  assert.equal(highestBalanceStrategy.interest, 201.3);
  assert.equal(lowestBalanceStrategy.total, 3697.93);
  assert.equal(lowestBalanceStrategy.interest, 197.93);
});

it("calculates correct number of payments for debts in a strategy", async function() {
  let loans: types.Debt[] = [
    { id: 1, principal: 5839, rate: 18.75, minPayment: 200 },
    { id: 2, principal: 1250, rate: 8.25, minPayment: 75 }
  ];

  const extraPayment = 400;
  let strategies = calculator.getPaymentStrategies(loans, extraPayment);

  assert.equal(strategies.length, 6);

  let highestBalanceStrategy = strategies.find(s => {
    return s.type == enums.StrategyTypeEnum.HighestBalanceFirst;
  })!;

  assert.equal(highestBalanceStrategy.debts.length, 2);

  let hbsDebt = highestBalanceStrategy.debts.find(d => {
    return d.principal == 5839;
  })!;

  assert.equal(hbsDebt.payments, 11);
});
