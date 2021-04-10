import Vue from 'vue'
import VueRouter from 'vue-router'
//登录
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'

Vue.use(VueRouter)

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/home', component: Home },
]

const router = new VueRouter({
    routes,
})


//添加路由守卫
router.beforeEach((to, form, next) => {
    //1.to 将要访问的路径
    //2.form 从哪个路径过来
    //3.next 是一个函数    next（）表示放行    next（'/login'）表示强制跳转

    //如果用户要访问登录路径，直接放行
    if (to.path === '/login') return next()
        //从sessionSTory中获取保存的token值
    var tokenStr = window.sessionStorage.getItem('token')
        //如果token不存在 跳转到登录界面
    if (!tokenStr) return next('/login')
        //如果token存在  放行
    next()
})

export default router