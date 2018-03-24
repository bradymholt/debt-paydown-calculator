<template>
  <div class="column is-one-third">
    <div class="card">
      <div class="card-image">
        <figure class="image is-4by3">
          <img src="@/assets/chart.png" :alt="data.name">
        </figure>
      </div>
      <div class="card-content">
        <p class="title is-4 is-spaced">{{ data.name }}</p>
        <p class="subtitle is-6"> {{ formattedTotal }} </p>
        <div class="content">
         {{ data.description }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import * as types from "./../types";
import { Vue, Component, Prop, Emit, Watch } from "vue-property-decorator";

@Component
export default class Strategy extends Vue {
  @Prop() data: types.PaymentStrategy;

  get formattedTotal() {
    return `$${this.data.total.toFixed(2)}`;
  }
}
</script>

<style lang="scss" scoped>

</style>
