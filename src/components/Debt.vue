<template>
  <div class="box">
    <button type="button" v-if="deleteAllowed" v-on:click="deleteDebt" class="delete is-medium"></button>
    <div class="field is-horizontal">
      <div class="field-body">
        <div class="field is-narrow">
          <label class="label">Balance</label>
          <p class="control has-icons-left">
            <input class="input" type="text" v-model="data.principal" placeholder="Balance">
            <span class="icon is-small is-left">
              <i class="fas fa-dollar-sign"></i>
            </span>
          </p>
        </div>
        <div class="field is-narrow">
          <label class="label">Interest Rate</label>
          <p class="control has-icons-right">
            <input class="input is-success" type="text" v-model="data.rate" placeholder="Interest Rate">
            <span class="icon is-small is-right">
              <i class="fas fa-percent"></i>
            </span>
          </p>
        </div>
        <div class="field is-narrow">
          <label class="label">Minimum Payment</label>
          <p class="control has-icons-left">
            <input class="input is-success" type="text" v-model="data.minPayment" placeholder="Minimum Payment">
            <span class="icon is-small is-left">
              <i class="fas fa-dollar-sign"></i>
            </span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import * as types from "./../types";
import { Vue, Component, Prop, Emit, Watch } from "vue-property-decorator";

@Component
export default class Account extends Vue {
  @Prop() value: types.Debt;
  @Prop() deleteAllowed: boolean;

  data = this.value;

  created() {
    // clone value so we do not mutate it
    this.data = Object.assign({}, this.value);
  }

  @Watch("data", { deep: true })
  @Emit("input")
  onDataChanged() {}

  @Emit("delete")
  deleteDebt() {}
}
</script>

<style lang="scss" scoped>
.box {
  position: relative;
}
.delete {
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
}
</style>
