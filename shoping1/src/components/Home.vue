<template>
  <div>
    
    <el-row>
      <el-button type="info" @click="logout">退出</el-button>
    </el-row>
  </div>
</template>

<script>
export default {
  methods: {
    logout: function () {
      //清除token
      window.sessionStorage.clear()
      // 编程式导航跳转到登录页面
      this.$router.push('/login')
    },
  },
 }
</script>

<style lang="less" scoped></style>
