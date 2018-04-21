<template>
  <div class="box">
    <button type="button" v-if="deleteAllowed" v-on:click="deleteDebt" class="delete is-medium"></button>
    <div class="field is-horizontal">
      <div class="field-body">
        <div class="field is-narrow">
          <label class="label">Balance</label>
          <p class="control has-icons-left">
            <input type="text" v-model="data.principal" placeholder="Balance" v-validate="'required|regex:\\d+.?\\d*'" :class="{'input': true, 'is-danger': errors.has('principal') }" name="principal">
            <span class="icon is-small is-left">
              <i class="fas fa-dollar-sign"></i>
            </span>
            <span v-show="errors.has('principal')" class="help is-danger">Must be an amount</span>
          </p>
        </div>
        <div class="field is-narrow">
          <label class="label">Interest Rate</label>
          <p class="control has-icons-right">
            <input class="input" type="text" v-model="data.rate" placeholder="Interest Rate" @blur="rateBlur" v-validate="'required|regex:\\d+.?\\d*'" :class="{'input': true, 'is-danger': errors.has('rate') }" name="rate">
            <span class="icon is-small is-right">
              <i class="fas fa-percent"></i>
            </span>
            <span v-show="errors.has('rate')" class="help is-danger">Must be an amount</span>
          </p>
        </div>
        <div class="field is-narrow">
          <label class="label">Minimum Payment</label>
          <p class="control has-icons-left">
            <input class="input" type="text" v-model="data.minPayment" placeholder="Minimum Payment" v-validate="'required|regex:\\d+.?\\d*'" :class="{'input': true,  'is-danger': errors.has('minPayment') }" name="minPayment">
            <span class="icon is-small is-left">
              <i class="fas fa-dollar-sign"></i>
            </span>
            <span v-show="errors.has('minPayment')" class="help is-danger">Must be an amount</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import * as types from "./../types";
import * as calculator from "../calculator";
import { Vue, Component, Prop, Emit, Watch } from "vue-property-decorator";

@Component
export default class Account extends Vue {
  @Prop() value: types.Debt;
  @Prop() deleteAllowed: boolean;
  @Prop() validateAll: boolean;

  data = this.value;

  created() {
    // clone value so we do not mutate it
    this.data = Object.assign({}, this.value);
  }

  @Watch("data", { deep: true })
  @Emit("input")
  onDataChanged() {}

  deleteDebt() {
    this.$emit("delete", this.data);
  }

  rateBlur() {
    let calculatedMinPayment = calculator.getMinimumPayment(
      this.data.principal,
      this.data.rate
    );
    if (
      !this.data.minPayment ||
      isNaN(this.data.minPayment) ||
      Number(this.data.minPayment < calculatedMinPayment)
    ) {
      this.data.minPayment = Number(calculatedMinPayment.toFixed(2));
    }
  }

  @Watch("errors.items")
  errorsChanged(newValue: any, oldValue: any) {
    this.$emit("errors", newValue.length > 0);
  }

  @Watch("validateAll")
  validateAllChanged() {
    (<any>this).$validator.validateAll();
  }
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
