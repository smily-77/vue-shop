import Vue from 'vue'
import VueRouter from 'vue-router'
//登录
// import Login from '../components/Login.vue'
const Login = () =>
    import ( /* webpackChunkName: "login_home_welcome" */ '../components/Login.vue')
    // 主页
    // import Home from '../components/Home.vue'
const Home = () =>
    import ( /* webpackChunkName: "login_home_welcome" */ '../components/Home.vue')
    // 欢迎页面
    // import Welcome from '../components/Welcome.vue'
const Welcome = () =>
    import (
        /* webpackChunkName: "login_home_welcome" */
        '../components/Welcome.vue'
    )

// 用户列表页
// import Users from '../components/user/Users.vue'
const Users = () =>
    import (
        /* webpackChunkName: "users_roles_rights" */
        '../components/user/Users.vue'
    )
    // 角色列表
    // import Roles from '../components/power/Roles.vue'
const Roles = () =>
    import (
        /* webpackChunkName: "users_roles_rights" */
        '../components/power/Roles.vue'
    )
    //权限列表
    // import Rights from '../components/power/Rights.vue'
const Rights = () =>
    import (
        /* webpackChunkName: "users_roles_rights" */
        '../components/power/Rights.vue'
    )


//商品列表
// import Goods from '../components/goods/Goods.vue'
const Goods = () =>
    import (
        /* webpackChunkName: "good_add_edit" */
        '../components/goods/Goods.vue'
    )
    // 添加商品
    // import Add from '../components/goods/Add.vue'
const Add = () =>
    import (
        /* webpackChunkName: "good_add_edit" */
        '../components/goods/Add.vue'
    )
    // 编辑商品
    // import Edit from '../components/goods/Edit.vue'
const Edit = () =>
    import (
        /* webpackChunkName: "good_add_edit" */
        '../components/goods/Edit.vue'
    )

//分类参数
// import Params from '../components/goods/Params'
const Params = () =>
    import (
        /* webpackChunkName: "params_categoraes" */
        '../components/goods/Params'
    )

//商品分类
// import Categories from '../components/goods/Categories'
const Categories = () =>
    import (
        /* webpackChunkName: "params_categoraes" */
        '../components/goods/Categories'
    )


// 订单列表
// import Orders from '../components/order/Orders'
const Orders = () =>
    import (
        /* webpackChunkName: "orders_report" */
        '../components/order/Orders'
    )

// 数据报表
// import Reports from '../components/report/Reports'
const Reports = () =>
    import (
        /* webpackChunkName: "orders_report" */
        '../components/report/Reports'
    )

Vue.use(VueRouter)

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
        path: '/home',
        component: Home,
        redirect: '/welcome',
        children: [
            { path: '/welcome', component: Welcome },
            { path: '/users', component: Users },
            { path: '/roles', component: Roles },
            { path: '/rights', component: Rights },
            { path: '/goods', component: Goods },
            { path: '/params', component: Params },
            { path: '/categories', component: Categories },
            { path: '/orders', component: Orders },
            { path: '/reports', component: Reports },
            { path: '/goods/add', component: Add },
            { path: '/goods/edit', component: Edit },
        ],
    },
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