<template>
  <div class="column is-one-third">
    <div class="card">
      <payment-chart :strategy="data" />
      <div class="card-content">
        <p class="title is-4 is-spaced">{{ data.name }}</p>
        <p class="subtitle is-6">Total: {{ formattedTotal }} </p>
        <div class="content">
          <p>It will take <strong>{{ payoffTimeText }}</strong> to repay {{this.data.principal}} in debt plus <strong>{{this.data.interest}}</strong> in interest.</p>
          <div>{{ data.description }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import * as types from "./../types";
import PaymentChart from "./PaymentChart.vue";
import { Vue, Component, Prop, Emit, Watch } from "vue-property-decorator";
import { convertMonthsToTimespanText } from "../calculator";

@Component({ components: { PaymentChart } })
export default class Strategy extends Vue {
  @Prop() data: types.PaymentStrategy;

  get formattedTotal() {
    return `$${this.data.total.toFixed(2)}`;
  }

  get payoffTimeText() {
    return convertMonthsToTimespanText(this.data.payments);
  }
}
</script>

<style lang="scss" scoped>

</style>
