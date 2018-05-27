import { DisplayDebt } from "../types";
import { getMinimumPayment } from "./calculator";

export function getRandomNumber(min = 1000, max = 20000) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomDebts(
  count: number = 3,
  minPrincipal = 2000,
  minRate = 5
) {
  let debts: Array<DisplayDebt> = [];
  for (let i = 0; i < count; i++) {
    debts.push(generateRandomDebt(minPrincipal, minRate));
  }
  return debts;
}

function generateRandomDebt(minPrincipal = 2000, minRate = 5): DisplayDebt {
  let principal = (Math.random() * 5001 + minPrincipal).toFixed(2);
  let rate = (Math.random() * 16 + minRate).toFixed(2);
  let minPayment = getMinimumPayment(Number(principal), Number(rate)).toFixed(
    2
  );
  return {
    id: getRandomNumber().toString(),
    principal,
    rate,
    minPayment,
    valid: true
  };
}
