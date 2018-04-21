<template>
  <div>
    <canvas id="line-chart" :width="width" :height="height" ref="canvas" />
  </div>
</template>

<script lang="ts">
import * as types from "../types";
import { Chart, ChartOptions, ChartData } from "chart.js";
import { CreateElement } from "vue";
import { Vue, Component, Prop, Emit, Watch } from "vue-property-decorator";

@Component
export default class PaymentChart extends Vue {
  @Prop() strategy: types.PaymentStrategy;

  @Prop({ default: 800 })
  width: number;
  @Prop({ default: 200 })
  height: number;

  _chart: Chart;

  colors = [
    "#3366cc",
    "#dc3912",
    "#ff9900",
    "#109618",
    "#990099",
    "#0099c6",
    "#dd4477",
    "#66aa00",
    "#b82e2e",
    "#316395",
    "#3366cc"
  ];

  mounted() {
    this.renderChart(this.chartData, {
      responsive: true,
      maintainAspectRatio: false,
      elements: { point: { radius: 0 } },
      scales: {
        xAxes: [
          {
            display: true
          }
        ]
      }
    });
  }

  renderChart(data: ChartData, options: ChartOptions) {
    let context2d = (<HTMLCanvasElement>this.$refs.canvas).getContext("2d");
    this._chart = new Chart(context2d!, {
      type: "line",
      data: data,
      options: options
    });
  }

  beforeDestroy() {
    if (this._chart) {
      this._chart.destroy();
    }
  }

  get chartData(): ChartData {
    return {
      labels: Array(this.strategy.payments).fill(""),
      datasets: this.strategy.debts.map(d => {
        const color = this.colors.shift();
        return {
          label: d.principal.toString(),
          fill: false,
          backgroundColor: color,
          borderColor: color,
          data: d.schedule.map(s => {
            return s.balance;
          }),
          borderWidth: 2
        };
      })
    };
  }
}
</script>

<style lang="scss" scoped>

</style>
