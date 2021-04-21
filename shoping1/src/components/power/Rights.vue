<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item> 权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-table :data="rightsForm" style="width: 100%" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="authName" label="权限管理"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column label="权限等级">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <!-- {{scope.row}} -->
            <!-- 权限列表 表格渲染 -->
            <el-tag v-if="scope.row.level==='0'">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.level==='1'">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  created() {
    this.gitRightsForm()
  },
  data() {
    return {
      // 权限列表
      rightsForm: [],
    }
  },
  methods: {
    // 获取所有权限列表
    async gitRightsForm() {
      const { data: res } = await this.$http.get('/rights/list')
      //  console.log(res)
      if (res.meta.status != 200) return this.$message.error('获取权限列表失败')
      // 获取列表成功
      this.rightsForm = res.data
      // this.$message.success('获取权限列表成功')
    },
  },
}
</script>

<style lang="less" scope></style>
