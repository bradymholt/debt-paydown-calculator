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
      <h5 class="title is-5">Debts</h5>
      <Debt v-for="(debt, index) in debts" v-model="debts[index]" @input="calculateStrategies" @delete="deleteDebt" :delete-allowed="debtDeleteAllowed" :key="debt.id" />
      <button class="button is-success" v-on:click="addDebt" type="button">Add Another Loan</button>
      <hr/>
      <div class="box">
        Available monthly to pay off debt:
        <div class="control has-icons-left">
          <input class="input" type="text" v-model="additionalAmount" placeholder="Amount">
          <span class="icon is-small is-left">
            <i class="fas fa-dollar-sign"></i>
          </span>
        </div>
      </div>
    </section>
    <section class="section">
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

loadIcons();

@Component({
  components: { Debt, Strategy }
})
export default class App extends Vue {
  additionalAmount: number = 234.23;
  debts: types.Debt[] = [
    { id: 1, principal: "3000", rate: "15.5", minPayment: "38.75" },
    { id: 2, principal: "500", rate: "17.25", minPayment: "50" }
  ];
  strategies: types.PaymentStrategy[] = [];

  created() {
    this.calculateStrategies();
  }

  get debtDeleteAllowed() {
    return this.debts.length > 1;
  }

  addDebt() {
    this.debts.push({
      id: Date.now(),
      principal: "",
      rate: "",
      minPayment: ""
    });
  }

  deleteDebt(debt: types.Debt) {
    this.debts.splice(this.debts.indexOf(debt), 1);
  }

  calculateStrategies() {
    console.log("TEST")
    this.strategies = calculator.getPaymentStrategies(
      this.debts,
      this.additionalAmount
    );
  }
}
</script>

<style lang="scss">

</style>
