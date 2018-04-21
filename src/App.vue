<template>
  <div class="container">
    <section class="section">
      <div class="container">
        <h1 class="title">
          Debt Paydown Calculator
        </h1>
        <h2 class="subtitle">
          Compare methods to payoff your debt
        </h2>
        <hr/>
      </div>
      <div class="columns">
        <div class="column">
          <h5 class="title is-5">Debts</h5>
        </div>
        <div class="column add-another">
          <button class="button" v-on:click="connectToYNAB" type="button"><img width="25px" height="25px" src="@/assets/ynab-icon.png" alt="YNAB Icon">Connect to YNAB</button>
          <button class="button is-info" v-on:click="addDebt" type="button">Add Another Debt</button>
        </div>
      </div>
      <Debt v-for="(debt, index) in debts" v-model="debts[index]" @input="debtChanged" @delete="deleteDebt" @errors="debtsErrorsChanged" :delete-allowed="debtDeleteAllowed" :validate-all="validateAll" :key="debt.id" />
      <hr/>
      <div class="box">
        Additional amount to pay towards debt:
        <div class="control has-icons-left">
          <input class="input" type="text" v-model="additionalAmount" placeholder="Amount" v-validate="'required|regex:\\d+.?\\d*'" :class="{'input': true, 'is-danger': errors.has('additionalAmount') }" name="additionalAmount">
          <span class="icon is-small is-left">
            <i class="fas fa-dollar-sign"></i>
          </span>
        </div>
      </div>
      <button class="button is-success" :disabled="hasErrors" v-on:click="calculate" type="button">Calculate</button>
    </section>
    <section v-if="strategiesVisible" class="section">
      <h5 class="title is-5">Strategies</h5>
      <div class="columns" v-for="i in Math.ceil(strategies.length / 3)" v-bind:key="i">
        <Strategy v-for="strategy in strategies.slice((i-1)*3,i*3)" :data="strategy" v-bind:key="strategy.id" />
      </div>
    </section>
    <footer class="footer">
      <div class="container">
        <div class="content has-text-centered">
          <p>
            Created by
            <a href="https://www.geekytidbits.com">Brady Holt</a>. The source code is licensed
            <a href="http://opensource.org/licenses/mit-license.php">MIT</a>. The website content is licensed
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script lang="ts">
import "bulma";
import { load as loadIcons } from "./iconLoader";
import * as types from "./types";
import Debt from "./components/Debt.vue";
import Strategy from "./components/Strategy.vue";
import { Component, Vue, Watch } from "vue-property-decorator";
import * as calculator from "./calculator";
import * as randomizer from "./randomizer";
import * as ynab from "ynab";
import Account from "./components/Debt.vue";
const config = require("./config.json");

loadIcons();

@Component({
  components: { Debt, Strategy }
})
export default class App extends Vue {
  additionalAmount = randomizer.getRandomNumber(0, 500).toFixed(2);
  debts: Array<types.DisplayDebt> = [];
  strategies: types.PaymentStrategy[] = [];
  strategiesVisible = false;
  debtsHaveErrors = false;
  validateAll = false;
  ynabAccessToken = "";

  async created() {
    this.grabYNABToken();

    if (this.ynabAccessToken) {
      this.loadYNABAccounts();
    } else {
      this.debts = randomizer.getRandomDebts(3);
      this.strategiesVisible = true;
      this.debtsHaveErrors = false;
      this.calculate();
    }
  }

  get debtDeleteAllowed() {
    return this.debts.length > 1;
  }

  addDebt() {
    this.debts.push({
      id: Date.now().toString(),
      principal: "",
      rate: "",
      minPayment: ""
    });
  }

  connectToYNAB() {
    const uri = `https://app.youneedabudget.com/oauth/authorize?client_id=${
      config.clientId
    }&redirect_uri=${config.redirectUri}&response_type=token`;
    location.replace(uri);
  }

  grabYNABToken() {
    let token = null;
    const search = window.location.hash
      .substring(1)
      .replace(/&/g, '","')
      .replace(/=/g, '":"');
    if (search && search !== "") {
      // Try to get access_token from the hash returned by OAuth
      const params = JSON.parse('{"' + search + '"}', function(key, value) {
        return key === "" ? value : decodeURIComponent(value);
      });
      this.ynabAccessToken = token = params.access_token;
      window.location.hash = "";
    }
  }

  async loadYNABAccounts() {
    const ynabAPI = new ynab.api(this.ynabAccessToken);
    try {
      const firstBudget = (await ynabAPI.budgets.getBudgets()).data.budgets[0];
      const creditAccounts = (await ynabAPI.accounts.getAccounts(
        firstBudget.id
      )).data.accounts.filter(a => {
        return a.type == ynab.Account.TypeEnum.CreditCard;
      });
      this.debts = creditAccounts.map(c => {
        return {
          id: c.id,
          principal: ynab.utils
            .convertMilliUnitsToCurrencyAmount(c.balance)
            .toString(),
          rate: "",
          minPayment: ""
        };
      });
    } catch (err) {
      console.log(`Error connecting to YNAB: ${err.error.detail}`);
    }

    if (this.debts.length == 0) {
      this.addDebt();
    }
  }

  deleteDebt(debt: types.DisplayDebt) {
    this.debts.splice(this.debts.indexOf(debt), 1);
    this.calculate();
  }

  debtChanged() {
    this.strategiesVisible = false;
  }

  debtsErrorsChanged(hasErrors: boolean) {
    this.debtsHaveErrors = hasErrors;
  }

  get hasErrors() {
    return this.debtsHaveErrors || this.$validator.errors.items.length > 0;
  }

  calculate() {
    this.validateAll = true;
    if (!this.hasErrors) {
      this.strategies = calculator.getPaymentStrategies(
        this.debts,
        this.additionalAmount
      );
      this.strategiesVisible = true;
    }
  }
}
</script>

<style lang="scss">
.add-another {
  width: 160px;
  text-align: right;
}

button > img {
  margin-right: 10px;
}
</style>
