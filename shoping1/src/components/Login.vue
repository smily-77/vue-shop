<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 标识 -->
      <div class="avatar_box">
        <img src="../assets\images/logo.png" alt="" />
      </div>
      <!-- 登录表单 -->
      <el-form
        label-width="0"
        class="login_form"
        :model="loginForm"
        :rules="loginRules"
        ref="loginFormRef"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            prefix-icon="iconfont icon-users"
            v-model="loginForm.username"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            prefix-icon="iconfont icon-3702mima"
            v-model="loginForm.password"
            type="password"
          ></el-input>
        </el-form-item>
        <!-- 登录和重置按钮 -->
        <el-row class="login_btn">
          <el-button type="primary" @click="loginBtn">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //登录表单的数据对象
      loginForm: {
        username: 'admin',
        password: '123456',
      },
      loginRules: {
        username: [
          { require: true, message: '请填写用户名', tigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名位数在3~10位之间',
            tigger: 'blur',
          },
        ],
        password: [
          { rewuire: true, message: '请填写密码', tigger: 'blur' },
          { min: 6, max: 15, message: '密码位数在6~15之间', tigger: 'blur' },
        ],
      },
    }
  },
  methods: {
    // 重置按钮方法
    resetLoginForm: function () {
      //console.log(this)
      this.$refs.loginFormRef.resetFields()
      // this.loginForm.username = '';
      // this.loginForm.password = '';
    },
    loginBtn: function () {
      //登录表单验证
      this.$refs.loginFormRef.validate(async (valida) => {
        //console.log(valida)
        //预验证不通过
        if (!valida) return
        //预验证通过
        const { data: res } = await this.$http.post('/login', this.loginForm)
        console.log(res)
        if (res.meta.status != 200)
          return (this.$message.error('登陆失败').showClose = true)
        this.$message.success('登录成功').showClose = true
        //1.登录成功后把token保存到sessionStorage中
        //1.1除了登录之外的所有API接口，必须在登陆之后才能访问
        // 1.2token只在当前网站打开期间生效，所以必须将token保存在sessionStorage中
        sessionStorage.setItem('token', 'res.meta.token')
        // 2.通过编程式导航跳转页面 路由地址  /home
        this.$router.push('/home')
      })
    },
  },
}
</script>

<style lang="less" scoped>
.login_container {
  background-color: rgb(166, 197, 229);
  height: 100%;
}
.login_box {
  width: 450px;
  height: 350px;
  background: rgb(248, 254, 210);
  border-radius: 5px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  .avatar_box {
    width: 130px;
    height: 130px;
    border: 1px solid #eee;
    border-radius: 50%;

    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgb(248, 254, 210);
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: rgb(248, 254, 210);
    }
  }
}

.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 10px 10px;
  box-sizing: border-box;
  .login_btn {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
