import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false;


let v = new Vue({
  el: "#app",
  components: { App },
  template: `<App/>`
});
