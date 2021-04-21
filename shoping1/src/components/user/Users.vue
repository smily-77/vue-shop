<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
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
        <el-table-column label="操作" width="300">
          <template slot-scope="scope">
            <!--编辑按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              @click="deleteUserById(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top" 
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                @click="setRoleDialogShow(scope.row)"
              ></el-button>
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

    <!--添加用户按钮的对话框  -->
    <el-dialog
      title="添加用户"
      :visible.sync="dialogVisible"
      width="50%"
      @close="addCloseDialog"
    >
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
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑用户按钮的对话框 -->
    <el-dialog
      title="编辑用户"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editCloseDialog"
    >
      <!-- 编辑对话框主体内容 -->
      <el-form
        :rules="editFormRules"
        ref="editFormRef"
        :model="editForm"
        label-width="80px"
      >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>

      <!-- 编辑对话框底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @close="setRoleCloseDialog"
    >
      <!-- 分配权限对话框的主体内容 -->
      <p>当前的用户 : {{ this.setRoleUser.username }}</p>
      <p>当前的角色 : {{ this.setRoleUser.role_name }}</p>
      <p>
        分配新的角色
        <!-- 权限角色选择器 -->
        <el-select v-model="seletedRoleId" placeholder="请选择">
          <el-option
            v-for="item in rolesList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveSetRole">确 定</el-button>
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
    // 自定义邮箱验证规则  需要写在自带的验证规则之前
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/

      if (regEmail.test(value)) {
        // 邮箱合法
        return callback()
      }
      // 邮箱不合法
      callback(new Error('请输入合法的邮箱'))
    }
    // 自定义电话号码验证规则
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

      if (regMobile.test(value)) {
        // 电话号码合法
        return callback()
      }
      // 电话号码不合法
      callback(new Error('请输入正确的号码'))
    }
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
      // 添加对话框的表单数据
      dialogForm: { username: '', password: '', email: '', mobile: '' },
      // 添加对话框的数据的验证规则
      dialogFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名在3~10位之间', trigger: 'blur' },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '密码在6~15位之间', trigger: 'blur' },
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' },
        ],
        mobile: [
          { required: true, message: '请请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' },
        ],
      },
      // 编辑对话框的显示和隐藏
      editDialogVisible: false,
      // 存放查询出将要修改的信息
      editForm: [],
      // 编辑对话框数据校验规则
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' },
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' },
        ],
      },
      //分配权限对话框的显示和隐藏
      setRoleDialogVisible: false,
      // 将要分配权限的用户信息
      setRoleUser: [],
      // 角色列表
      rolesList: [],
      // 分配权限框中 角色select框中 绑定的id值
      seletedRoleId: '',
    }
  },

  methods: {
    // 获取user信息
    getUsersList: async function () {
      const { data: res } = await this.$http.get('/users', {
        params: this.queryInfo,
      })
      // console.log(res)
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

    //状态修改按钮状态值的变化
    userStateChange: async function (userInfo) {
      //  console.log(userInfo)
      const { data: res } = await this.$http.put(
        `/users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      // console.log(res)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('修改用户状态失败')
      }
      this.$message.success('修改用户状态成功')
    },

    // 监听添加对话框关闭事件，当添加对话框关闭的时候清空表单
    addCloseDialog: function () {
      this.$refs.dialogFormRef.resetFields()
    },

    // 点击添加对话框，确定按钮添加用户
    addUser: function () {
      // 预验证 填入的数据是否符表单验证规则
      this.$refs.dialogFormRef.validate(async (valida) => {
        // console.log(valida)
        // 预验证不通过
        if (!valida) return
        // 预验证通过，添加用户数据
        const { data: res } = await this.$http.post('/users', this.dialogForm)
        // console.log(res)
        if (res.meta.status != 201) {
          return this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        // 添加对话框的关闭
        this.dialogVisible = false
        // 重新渲染用户列表
        this.getUsersList()
      })
    },

    // 点击编辑按钮,根据id查找用户信息，并显示
    showEditDialog: async function (id) {
      // 根据id查找要修改的用户信息
      // console.log(id)
      const { data: res } = await this.$http.get('/users/' + id)
      // console.log(res)
      if (res.meta.status != 200) return this.$message.error('获取用户信息失败')
      this.editForm = res.data
      // console.log(this.editForm)

      // 编辑对话框的显示
      this.editDialogVisible = true
    },
    // 监听编辑对话框的关闭事件，当对话框关闭的时候重置表单 （主要是一开始打开的时候验证提示不出现）
    editCloseDialog: function () {
      this.$refs.editFormRef.resetFields()
    },

    // 编辑对话框确定按钮,修改用户信息
    editUser: function () {
      // 先对输入编辑框的数据格式进行预验证
      this.$refs.editFormRef.validate(async (valida) => {
        // console.log(valida)
        // 预验证失败 ，则修改用户失败
        if (!valida) return this.$message.error('修改用户失败')
        // 预验证成功
        // 调用接口 ,修改数据
        const { data: res } = await this.$http.put(
          '/users/' + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile,
          }
        )
        // console.log(res)
        // 修改失败
        if (res.meta.status != 200) return this.$message.error('修改用户失败')
        // 修改成功
        // 关闭编辑对话框
        this.editDialogVisible = false
        // 更新用户列表显示的数据
        this.getUsersList()
        // 提示修改用户成功
        this.$message.success('修改用户成功')
      })
    },

    // 删除按钮,删除用户
    deleteUserById: async function (id) {
      // 弹出提示框确认是否要删除用户
      const deleteResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          // 当点击取消删除按钮时会报错，需要捕捉错误并返回
        }
      ).catch((err) => err)
      // console.log(deleteResult)
      // 如果返回deleteResult为confirm，则点击了确认删除
      // 如果返回deleteResult为cancel，则点击了取消删除
      // 用户点击取消删除
      if (deleteResult != 'confirm') return this.$message.info('已取消删除')
      // 点击确认删除
      // 调用接口 删除对应用户
      const { data: res } = await this.$http.delete('/users/' + id)
      // console.log(res)
      if (res.meta.status != 200) return this.$message.error('删除用户失败')
      //提示删除用户成功
      this.$message.success('删除用户成功')
      // 重新加载用户列表数据
      this.getUsersList()
    },

    // 分配权限按钮 显示对话框
    async setRoleDialogShow(role) {
      // this.seletedRoleId = role.role_name
      // 将点击的当前用户信息赋值给data里将要授权的用户信息数组setRoleUser
      this.setRoleUser = role
 
      // 获取所有权限角色列表
      const { data: res } = await this.$http.get('/roles')
      // console.log(res)
      if (res.meta.status != 200) return this.$message.error('获取角色列表失败')
      // 获取成功 将获取到的值保存到data的rolesList中
      this.rolesList = res.data
      this.setRoleDialogVisible = true
    },

    // 分配权限按钮对话框的确认按钮 保存分配的权限角色
    async saveSetRole() {
      // 用户没有选择
      if (!this.seletedRoleId)
        return this.$message.error('请选择分配的新的角色')
      // 用户有选择
      const { data: res } = await this.$http.put(
        `/users/${this.setRoleUser.id}/role`,
        {
          rid: this.seletedRoleId,
        }
      )
      console.log(res)
      if (res.meta.status != 200) return this.$message.error('分配角色失败')
      // 分配权限角色成功
      // 更新用户信息
      this.getUsersList()
      // 关闭权限设置对话框
      this.setRoleDialogVisible = false
    },
    
    // 监听分配权限对话框的关闭
    setRoleCloseDialog() {
      // 将要分配权限的用户信息数组 setRoleUser 和
      //  分配权限框中 角色select框中 绑定的id值 seletedRoleId 置空
      this.setRoleUser = []
      this.seletedRoleId = ''
    },
  },
}
</script>

<style lang="less" scoped>
.el-card {
  background-color: #fcfefb;
}
</style>
