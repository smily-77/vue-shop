import Vue from 'vue'
import App from './App.vue'
import router from './router'
// import './plugins/element.js'
//映入icon图标文件
import './assets/fonts/iconfont.css'
//引入全局样式
import './assets/css/global.css'
// 引入表格组件
import TreeTable from 'vue-table-with-tree-grid'
// 引入富文本编辑器组件
import VueQuillEditor from 'vue-quill-editor'

// 引入rogress 页面加载顶部进度条效果
import Nprogress from 'nprogress'





import axios from 'axios'
//设置基准路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
    // 在request拦截器中 需要显示精度条
    //添加拦截器，  为需要授权的 API ，在请求头中使用 Authorization 字段提供 token 令牌
axios.interceptors.request.use((config) => {
    // 显示进度条
    Nprogress.start()
        // console.log(config);
    config.headers.Authorization = window.sessionStorage.getItem('token')
        //最后必须returnconfig
    return config
})

// 在response拦截器中 需要隐藏进度条
axios.interceptors.response.use((config) => {
        // 隐藏进度条
        Nprogress.done()
        return config
    })
    // 将axios插件挂载到Vue.prototype.$http原型上，其它组件就可以直接使用$http
Vue.prototype.$http = axios


Vue.config.productionTip = false

// 设置表格组件位全局组件
Vue.component('tree-table', TreeTable)
    // 设置富文本编辑器组件为全局组件
Vue.use(VueQuillEditor)

// 全局的时间过滤器
Vue.filter('dateFormat', function(originVal) {
    const dt = new Date(originVal)

    const y = dt.getFullYear()
    const m = (dt.getMonth() + 1 + '').padStart(2, '0')
    const d = (dt.getDate() + '').padStart(2, '0')
    const hh = (dt.getHours() + '').padStart(2, '0')
    const mm = (dt.getMinutes() + '').padStart(2, '0')
    const ss = (dt.getSeconds() + '').padStart(2, '0')

    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})


new Vue({
    router,
    render: (h) => h(App),
}).$mount('#app')