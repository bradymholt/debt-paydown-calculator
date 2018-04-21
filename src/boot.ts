import Vue from 'vue';
import VeeValidate from "vee-validate";
import App from './App.vue';

Vue.use(VeeValidate);
Vue.config.productionTip = false;

let v = new Vue({
  el: "#app",
  components: { App },
  template: `<App/>`
});
