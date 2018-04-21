import * as types from "../types";
import * as ynab from "ynab";

export async function fetchYNABAccounts(accessToken:string) {
  const ynabAPI = new ynab.api(accessToken);
  let accounts: ynab.Account[] = [];

  try {
    const firstBudget = (await ynabAPI.budgets.getBudgets()).data.budgets.sort(
      (a, b) => {
        if (a.last_modified_on == b.last_modified_on) {
          return 0;
        }

        return (a.last_modified_on || 0) < (b.last_modified_on || 0) ? -1 : 1;
      }
    )[0];
    const creditAccounts = (await ynabAPI.accounts.getAccounts(
      firstBudget.id
    )).data.accounts.filter(a => {
      return a.type == ynab.Account.TypeEnum.CreditCard;
    });
    accounts = creditAccounts;
  } catch (err) {
    console.log(`Error connecting to YNAB: ${err.error.detail}`);
  }

  return accounts;
}
