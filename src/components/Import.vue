<template>
  <div v-bind:class="[{'is-active': active}]" class="modal">
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Import YNAB Accounts</p>
        <button class="delete" aria-label="close" @click="cancel"></button>
      </header>
      <section class="modal-card-body">
        <p>The following credit accounts were found on your YNAB account. Please enter the interest rate and minimum payment and then click Import.</p>
        <Debt v-for="(acct, index) in accounts" v-model="accounts[index]" :delete-allowed="true" @delete="deleteAccount" @errors="accountErrorsChanged" :validate-all="validateAll" @validated="validated" :key="acct.id" />
      </section>
      <footer class="modal-card-foot">
        <button class="button is-success" @click="importAccounts">Import</button>
        <button class="button" @click="cancel">Cancel</button>
      </footer>
    </div>
  </div>
</template>

<script lang="ts">
import * as types from "../types";
import * as ynab from "ynab";
import Debt from "./Debt.vue";
import { Vue, Component, Prop, Emit, Watch } from "vue-property-decorator";

@Component({ components: { Debt } })
export default class Import extends Vue {
  @Prop() ynabAccounts: Array<ynab.Account>;

  accounts: Array<types.DisplayDebt> = [];
  validateAll = false;

  get active() {
    return this.accounts.length > 0;
  }

  @Watch("ynabAccounts")
  ynabAccountsChanged(newValue: any, oldValue: any) {
    this.accounts = this.ynabAccounts.map(c => {
      return {
        id: c.id,
        principal: ynab.utils
          .convertMilliUnitsToCurrencyAmount(Math.abs(c.balance))
          .toString(),
        rate: "",
        minPayment: "",
        valid: false
      };
    });
  }

  deleteAccount(account: types.DisplayDebt) {
    const acctToRemove = this.accounts.find(a => a.id == account.id);
    if (acctToRemove) {
      this.accounts.splice(this.accounts.indexOf(acctToRemove), 1);
    }
  }

  accountErrorsChanged(errors: types.DisplayDebtErrors) {
    const account = this.accounts.find(d => d.id == errors.id.toString());
    account!.valid = !errors.errors;
  }

  get hasErrors() {
    return !!this.accounts.find(d => !d.valid);
  }

  importAccounts() {
    // trigger validation and then continue in validated() method
    this.validateAll = true;
  }

  validated() {
    this.validateAll = false;

    if (!this.hasErrors) {
      this.$emit("importAccounts", this.accounts);
      this.cancel();
    }
  }

  cancel() {
    this.accounts = [];
  }
}
</script>
