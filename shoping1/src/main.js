import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
//映入icon图标文件
import './assets/fonts/iconfont.css'
//引入全局样式
import './assets/css/global.css'
// 引入表格组件
import TreeTable from 'vue-table-with-tree-grid'

import axios from 'axios'
//设置基准路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
    //添加拦截器，  为需要授权的 API ，在请求头中使用 Authorization 字段提供 token 令牌
axios.interceptors.request.use((config) => {
        // console.log(config);
        config.headers.Authorization = window.sessionStorage.getItem('token')
            //最后必须returnconfig
        return config
    })
    // 将axios插件挂载到Vue.prototype.$http原型上，其它组件就可以直接使用$http
Vue.prototype.$http = axios

Vue.config.productionTip = false

// 设置位全局组件
Vue.component('tree-table', TreeTable)

new Vue({
    router,
    render: (h) => h(App),
}).$mount('#app')