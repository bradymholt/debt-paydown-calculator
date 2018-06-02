<template>
  <div class="box">
    <button type="button" v-if="deleteAllowed" v-on:click="$emit('delete', data)" class="delete is-medium"></button>
    <div class="field is-horizontal">
      <div class="field-body">
        <div class="field is-narrow">
          <label class="label">Balance</label>
          <p class="control has-icons-left">
            <input type="text" v-model="data.principal" placeholder="Balance" v-validate="'required|regex:\\d+.?\\d*'" :class="{'input': true, 'is-danger': errors.has(data.id + '_principal') }" :name="data.id + '_principal'">
            <span class="icon is-small is-left">
              <i class="fas fa-dollar-sign"></i>
            </span>
            <span v-show="errors.has(data.id + '_principal')" class="help is-danger">Must be an amount</span>
          </p>
        </div>
        <div class="field is-narrow">
          <label class="label">Interest Rate</label>
          <p class="control has-icons-right">
            <input class="input" type="text" v-model="data.rate" placeholder="Interest Rate" @blur="rateBlur" v-validate="'required|regex:\\d+.?\\d*'" :class="{'input': true, 'is-danger': errors.has(data.id + '_rate') }" :name="data.id + '_rate'">
            <span class="icon is-small is-right">
              <i class="fas fa-percent"></i>
            </span>
            <span v-show="errors.has(data.id + '_rate')" class="help is-danger">Must be an amount</span>
          </p>
        </div>
        <div class="field is-narrow">
          <label class="label">Minimum Payment</label>
          <p class="control has-icons-left">
            <input class="input" type="text" v-model="data.minPayment" placeholder="Minimum Payment" v-validate="'required|regex:\\d+.?\\d*'" :class="{'input': true,  'is-danger': errors.has(data.id + '_minPayment') }" :name="data.id + '_minPayment'">
            <span class="icon is-small is-left">
              <i class="fas fa-dollar-sign"></i>
            </span>
            <span v-show="errors.has(data.id + '_minPayment')" class="help is-danger">Must be an amount</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import * as types from "./../types";
import * as calculator from "../lib/calculator";
import { Vue, Component, Prop, Emit, Watch, Inject } from "vue-property-decorator";

@Component
export default class Debt extends Vue {
  @Prop() value: types.Debt;
  @Prop() deleteAllowed: boolean;
  @Inject() $validator: any;

  data = this.value;
  loaded = false;

  created() {
    // clone value so we do not mutate it
    this.data = Object.assign({}, this.value);
  }

  mounted() {
    this.$nextTick(function() {
      // This runs after entire view has been rendered
      this.loaded = true;
    });
  }

  @Watch("data", { deep: true })
  onDataChanged(data: any) {
    if (this.loaded) {
      this.$emit("input", data);
    }
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
