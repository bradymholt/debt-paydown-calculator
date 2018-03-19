<template>
  <div class="box">
    <div class="field is-horizontal">
      <div class="field-body">
        <div class="field">
          <p class="control is-expanded has-icons-left">
            <input class="input" type="text" v-model="data.balance" placeholder="Balance">
            <span class="icon is-small is-left">
              <i class="fas fa-dollar-sign"></i>
            </span>
          </p>
        </div>
        <div class="field">
          <p class="control is-expanded has-icons-right">
            <input class="input is-success" type="text" v-model="data.percentage" placeholder="Percentage">
            <span class="icon is-small is-right">
              <i class="fas fa-percent"></i>
            </span>
          </p>
        </div>
        <div class="field">
          <p class="control is-expanded has-icons-left">
            <input class="input is-success" type="text" v-model="data.payment" placeholder="Payment">
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
import { Vue, Component, Prop, Emit, Watch } from "vue-property-decorator";

@Component
export default class Account extends Vue {
  @Prop() value: IAccount;
  data = this.value;

  created() {
    // clone value so we do not mutate it
    this.data = Object.assign({}, this.value);
  }

  @Watch("data")
  @Emit("input")
  onDataChanged() {}
}
</script>

<style lang="scss" scoped>

</style>
