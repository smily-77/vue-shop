<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item><a href="/">用户管理</a></el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索框和添加按钮 栏珊布局 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 搜索框 -->
          <div class="grid-content bg-purple">
            <el-input
              placeholder="请输入内容"
              v-model="queryInfo.query"
              clearable
              @clear="getUsersList"
            >
              <el-button
                slot="append"
                icon="el-icon-search"
                @click="getUsersList"
              ></el-button>
            </el-input>
          </div>
        </el-col>
        <el-col :span="2">
          <!-- 添加按钮 -->
          <div class="grid-content bg-purple">
            <el-button type="primary" @click="dialogVisible = true"
              >添加</el-button
            >
          </div>
        </el-col>
      </el-row>

      <!-- user信息列表区域 -->
      <el-table :data="userLists" style="width: 100%" stripe border>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <!-- 信息列 -->
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <!-- {{scope.row}}  -->
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="{}">
            <!--编辑按钮 -->
            <el-button type="primary" icon="el-icon-edit"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete"></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button type="warning" icon="el-icon-setting"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 底部数据分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!--添加用户按钮对话框  -->
    <el-dialog title="添加用户" :visible.sync="dialogVisible" width="50%">
      <!-- 对话框主体区域 -->
      <el-form
        :model="dialogForm"
        :rules="dialogFormRules"
        ref="dialogFormRef"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="dialogForm.username"></el-input>
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input v-model="dialogForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="dialogForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="dialogForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部区域 -->
      <span slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getUsersList()
  },

  data() {
    return {
      // 获取用户参数列表
      queryInfo: {
        query: '',
        // 当前用户的页数
        pagenum: 2,
        // 当前每页显示多少条数据
        pagesize: 2,
      },
      total: 0,
      // 存放user信息列表
      userLists: [],
      // 添加对话框的显示和隐藏
      dialogVisible: false,
      dialogForm: { username: '', password: '', email: '', mobile: '' },
      dialogFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名在3~10位之间', trigger: 'blur' },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '密码在6~15位之间', trigger: 'blur' },
        ],
        email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
        mobile: [
          { required: true, message: '请请输入手机号', trigger: 'blur' },
        ],
      },
    }
  },

  methods: {
    // 获取user信息
    getUsersList: async function () {
      const { data: res } = await this.$http.get('/users', {
        params: this.queryInfo,
      })
      console.log(res)
      if (res.meta.status != 200) {
        return this.$message.error('获取用户列表失败')
      } else {
        this.total = res.data.total
        this.userLists = res.data.users
      }
    },
    // 监听pageSize(每页放多少数据)的变化
    handleSizeChange: function (newSize) {
      console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getUsersList()
    },
    // 监听当前页面页码的变化
    handleCurrentChange: function (newPage) {
      console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getUsersList()
    },
    //按钮状态值的变化
    userStateChange: async function (userInfo) {
      //  console.log(userInfo)
      const { data: res } = await this.$http.put(
        `/users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      // console.log(res)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.me_state
        return this.$message.error('修改用户状态失败')
      }
      this.$message.success('修改用户状态成功')
    },
  },
}
</script>

<style lang="less" scoped>
.el-card {
  background-color: #fcfefb;
}
</style>
