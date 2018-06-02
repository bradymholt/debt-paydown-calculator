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
      <Debt v-for="(debt, index) in debts" v-model="debts[index]" @input="debtChanged" @delete="deleteDebt" :delete-allowed="debtDeleteAllowed" :key="debt.id" />
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
      <button class="button is-success" v-on:click="calculate" type="button">Calculate</button>
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
    <Import v-bind:ynab-accounts="ynabAccounts" @importAccounts="importAccounts" />
  </div>
</template>

<script lang="ts">
import "bulma";
import { load as loadIcons } from "./iconLoader";
import * as types from "./types";
import Debt from "./components/Debt.vue";
import Strategy from "./components/Strategy.vue";
import Import from "./components/Import.vue";
import { Component, Vue } from "vue-property-decorator";
import * as calculator from "./lib/calculator";
import * as randomizer from "./lib/randomizer";
import * as ynabAccountLoader from "./lib/ynabAccountLoader";
import * as ynab from "ynab";
import Account from "./components/Debt.vue";
const config = require("./config.json");

loadIcons();

@Component({
  components: { Debt, Strategy, Import }
})
export default class App extends Vue {
  additionalAmount = "";
  debts: Array<types.DisplayDebt> = [];
  strategies: types.PaymentStrategy[] = [];
  ynabAccounts: Array<ynab.Account> = [];
  strategiesVisible = false;

  async created() {
    if (!await this.loadYNABDebts()) {
      this.additionalAmount = randomizer.getRandomNumber(0, 500).toFixed(2);
      this.debts = randomizer.getRandomDebts(3);
      this.showStrategies();
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
      minPayment: "",
      valid: false
    });
  }

  connectToYNAB() {
    const redirectUri =
      window.location.href.indexOf("localhost") > -1
        ? "urn:ietf:wg:oauth:2.0:oob"
        : window.location.href;
    const uri = `https://app.youneedabudget.com/oauth/authorize?client_id=${
      config.clientId
    }&redirect_uri=${redirectUri}&response_type=token`;
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
      token = params.access_token;
      window.location.hash = "";
      return token;
    }
  }

  async loadYNABDebts() {
    let loaded = false;
    let ynabAccessToken = this.grabYNABToken();

    if (ynabAccessToken) {
      this.ynabAccounts = await ynabAccountLoader.fetchYNABAccounts(
        ynabAccessToken
      );

      loaded = this.ynabAccounts.length > 0;
    }
    return loaded;
  }

  deleteDebt(debt: types.DisplayDebt) {
    const debtToDelete = this.debts.find(d => d.id == debt.id);
    this.debts.splice(this.debts.indexOf(debtToDelete!), 1);
    this.calculate();
  }

  debtChanged() {
    this.strategiesVisible = false;
  }

  importAccounts(accounts: Array<types.DisplayDebt>) {
    this.debts = accounts;
  }

  async calculate() {
    await this.$validator.validateAll();
    if (this.$validator.errors.items.length == 0) {
      this.showStrategies();
    }
  }

  showStrategies() {
    this.strategies = calculator.getPaymentStrategies(
      this.debts,
      this.additionalAmount
    );
    this.strategiesVisible = true;
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
