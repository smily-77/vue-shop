import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import "./plugins/element.js";
//映入icon图标文件
import "./assets/fonts/iconfont.css";
//引入全局样式
import "./assets/css/global.css";

import axios from "axios";
//设置基准路径
axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/";
// 将axios插件挂载到Vue.prototype.$http原型上，其它组件就可以直接使用$http
Vue.prototype.$http = axios;

Vue.config.productionTip = false;



new Vue({
    router,
    render: (h) => h(App),
}).$mount("#app");