<template>
  <div class="container">
    <section class="section">
      <div class="container">
        <h1 class="title">
          Debt Paydown Calculator
        </h1>
        <h2 class="subtitle">
          Find the best method to payoff your debt
        </h2>
        <hr/>
      </div>
      <h5 class="title is-5">Credit Cards</h5>
      <template v-for="(account, index) in accounts">
        <Account v-model="accounts[index]" v-bind:key="account.id" />
      </template>
      <h5 class="title is-5">Strategies</h5>
      <template v-for="strategy in strategies">
        <Strategy :data="strategy" v-bind:key="strategy.id" />
      </template>
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
import Account from "./components/Account.vue";
import Strategy from "./components/Strategy.vue";
import { Component, Vue, Watch } from "vue-property-decorator";

loadIcons();

@Component({
  components: { Account, Strategy }
})
export default class App extends Vue {
  accounts: IAccount[] = [
    { id: 1, balance: 10, percentage: 15.5, payment: 25 },
    { id: 2, balance: 100, percentage: 17.25, payment: 200 }
  ];
  strategies: IStrategy[] | null = null;

  created() {
    this.strategies = [{ id: 2, description: "ds" }];
  }
}
</script>

<style lang="scss">

</style>
