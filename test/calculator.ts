import * as types from "../src/types";
import * as calculator from "../src/calculator";

it("foo", async function() {
  let loans: types.IAccount[] = [
    { id: 1, principal: "3000", rate: "15.5", minPayment: "38.75" },
    { id: 2, principal: "500", rate: "17.25", minPayment: "50" }
  ];

  const extraPayment = 400;
  let strategies = calculator.getStrategies(loans, extraPayment);

  assert.equal(strategies.length, 6);

  assert.exists(
    strategies.find(s => {
      return (
        s.type == types.StrategyTypeEnum.HighestBalanceFirst &&
        s.total == 3743.3
      );
    })
  );
  assert.exists(
    strategies.find(s => {
      return (
        s.type == types.StrategyTypeEnum.LowestBalanceFirst &&
        s.total == 3739.65
      );
    })
  );
});
