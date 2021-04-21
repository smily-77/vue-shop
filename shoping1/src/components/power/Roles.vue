<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item> 权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col
          ><el-button type="primary" @click="addRoleDialogVisible = true"
            >添加角色</el-button
          ></el-col
        >
      </el-row>
      <!-- 角色信息列表 -->
      <el-table :data="rolesList" style="width: 100%">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(items1, i1) in scope.row.children"
              :key="items1.id"
              :class="['dbbottom', i1 === 0 ? 'dbtop' : '', , 'vcenter']"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag
                  :class="['vcenter']"
                  closable
                  @close="removeRights(scope.row, items1.id)"
                  >{{ items1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级和三级权限 -->
              <el-col :span="19">
                <!-- 二级权限 -->
                <el-row
                  :class="[i2 === 0 ? '' : 'dbtop', 'vcenter']"
                  v-for="(items2, i2) in items1.children"
                  :key="items2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRights(scope.row, items2.id)"
                      >{{ items2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(items3, i3) in items2.children"
                      :key="items3.id"
                      :class="[i3 === 0 ? '' : 'dbtop']"
                      closable
                      @close="removeRights(scope.row, items3.id)"
                    >
                      {{ items3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 序号列 -->
        <el-table-column type="index"></el-table-column>
        <!-- 信息列表 -->
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="500">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              @click="deleteRole(scope.row.id)"
              >删除</el-button
            >
            <el-button
              type="warning"
              icon="el-icon-setting"
              @click="showRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="resetDefkeys"
    >
      <!-- 主体    树形控件 -->
      <el-tree
        :data="rightList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defkeys"
        ref="treeRef"
      ></el-tree>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleDialogVisible"
      width="50%"
      @close="addRoleDialogClose"
    >
      <!-- 添加角色对话框主体 -->
      <el-form
        ref="addRoleFormRef"
        :model="addRoleForm"
        :rules="RoleRules"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 添加角色对话框底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog
      title="编辑角色"
      :visible.sync="editRoleDialogVisible"
      width="50%"
      @close="editRoleDialogClose"
    >
      <!-- 编辑对话框主体 -->
      <el-form
        :model="editRoleList"
        :rules="RoleRules"
        ref="editRoleFormRef"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleList.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleList.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getRolesList()
  },
  data() {
    return {
      // 角色列表
      rolesList: [],
      // 权限列表
      rightList: [],
      // 分配权限对话框的显示和隐藏
      setRightDialogVisible: false,
      // 树形控件属性
      treeProps: {
        label: 'authName',
        children: 'children',
      },
      //树形控件默认选中数组
      defkeys: [],
      // 将要分配权限的角色id
      roleId: '',
      // 添加角色对话框的显示和隐藏
      addRoleDialogVisible: false,
      // 添加角色表单
      addRoleForm: {
        roleName: '',
        roleDesc: '',
      },
      // 角色信息验证规则
      RoleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 10, message: '角色名称在2~10位之间', trigger: 'blur' },
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 3, max: 15, message: '角色描述在3~15位之间', trigger: 'blur' },
        ],
      },
      // 编辑角色对话框的显示和隐藏
      editRoleDialogVisible: false,
      //将要编辑的角色信息
      editRoleList: {},
    }
  },
  methods: {
    // 获取角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get('/roles')
      // console.log(res)
      if (res.meta.status != 200) return this.$message.error('获取角色列表失败')
      // 获取成功
      this.rolesList = res.data
      // this.$message.success('获取角色列表成功')
      // console.log(this.rolesList)
    },

    // 删除角色指定权限
    async removeRights(role, rightId) {
      //  console.log(role)
      const removeResult = await this.$confirm(
        '此操作将永久删除该权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      if (removeResult != 'confirm')
        return this.$message.info('已取消删除改权限')
      // 确认删除
      const { data: res } = await this.$http.delete(
        `/roles/${role.id}/rights/${rightId}`
      )
      console.log(res)
      if (res.meta.status != 200) return this.$message.error('取消权限失败')
      // 给权限列表重新赋值
      role.children = res.data
      this.$message.success('取消权限成功')
    },

    // 分配权限按钮
    async showRightDialog(role) {
      // 将id赋值给roleId保存在data中，方便以后使用
      this.roleId = role.id
      // 获取权限列表
      const { data: res } = await this.$http.get('/rights/tree')
      // console.log(res)
      if (res.meta.status != 200) return this.$message.error('获取权限列表失败')
      // 将获取到的权限列表赋值给rightList权限列表
      this.rightList = res.data
      // 递归获取三级节点的id
      this.getRightId(role, this.defkeys)

      this.setRightDialogVisible = true
    },

    // 利用递归获取该角色下所有三级权限的id,并保存到defkeys数组中
    getRightId(node, arr) {
      // 如果是三级权限，则没有children
      // 则把id存入数组
      if (!node.children) {
        return arr.push(node.id)
      }
      // 不是三级权限 递归
      node.children.forEach((item) => {
        this.getRightId(item, arr)
      })
    },
    // 监听权限对话框的关闭，关闭的时候清空 树形控件默认选中数组 defkeys
    resetDefkeys() {
      this.defkeys = []
    },

    // 点击分配权限对话框的确定按钮
    async allotRights() {
      //得到请求参数  strId
      // 1.获取所有被选中和半选中按钮的key所组成的数组
      const keys = [
        ...this.$refs.treeRef.getHalfCheckedKeys(),
        ...this.$refs.treeRef.getCheckedKeys(),
      ]
      // 2.将权限 id数组转换成 以 , 分割的权限 id 字符串
      const strId = keys.join(',')

      // 调用接口
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: strId }
      )
      // console.log(res)
      if (res.meta.status != 200) return this.$message.error('角色授权失败')
      // 角色授权成功
      this.getRolesList()
      this.setRightDialogVisible = false
      this.$message.success('角色授权成功')
    },

    // 添加角色对话框的确认
    addRole() {
      // 对填入表单的数据进行预验证
      this.$refs.addRoleFormRef.validate(async (valida) => {
        if (!valida) return
        // 预验证通过
        const { data: res } = await this.$http.post('/roles', this.addRoleForm)
        // console.log(res)
        if (res.meta.status != 201) return this.$message.error('添加角色失败')
        // 请求成功
        // 更新角色列表
        this.getRolesList()
        // 关闭添加角色对话框
        this.addRoleDialogVisible = false
      })
    },

    // 监听添加角色对话框的关闭 对话框关闭时重置表单
    addRoleDialogClose() {
      this.$refs.addRoleFormRef.resetFields()
    },
    // 点击编辑按钮
    async showEditDialog(id) {
      // 根据id查找将要编辑的角色id
      const { data: res } = await this.$http.get('/roles/' + id)
      // console.log(res)
      if (res.meta.status != 200) return this.$message.error('获取信息失败')
      // 查找成功 将查找出的数据赋值给data里存储将要编辑的用户信息的对象editRoleList
      this.editRoleList = res.data
      // console.log(this.editRoleList)
      // 显示编辑对话框
      this.editRoleDialogVisible = true
    },

    // 编辑对话框的确认按钮
    async editRole() {
      // 对编辑的信息进行预验证
      this.$refs.editRoleFormRef.validate(async (valida) => {
        if (!valida) return
        // 预验证通过
        // 通过接口提交编辑角色
        const { data: res } = await this.$http.put(
          '/roles/' + this.editRoleList.roleId,
          {
            roleName: this.editRoleList.roleName,
            roleDesc: this.editRoleList.roleDesc,
          }
        )
        // console.log(res)
        if (res.meta.status != 200) return this.$message.error('编辑角色失败')
        // 请求成功
        // 更新角色列表
        this.getRolesList()
        // 关闭编辑对话框
        this.editRoleDialogVisible = false
      })
    },

    // 监听编辑对话框的关闭
    editRoleDialogClose() {
      this.$refs.editRoleFormRef.resetFields()
    },

    // 删除角色按钮
    async deleteRole(id) {
      const deleteResult = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      // console.log(deleteResult)
      // 点击取消删除
      if (deleteResult != 'confirm')
        return this.$message.info('已取消删除该角色')
      // 点击确认删除
      const { data: res } = await this.$http.delete('/roles/' + id)
      // console.log(res)
      if (res.meta.status != 200) return this.$message.error('删除该角色失败')
      // 删除成功
      // 更新角色列表
      this.getRolesList()
    },
  },
}
</script>

<style lang="less" scope>
.el-tag {
  margin: 7px;
}
.dbtop {
  border-top: 1px solid #f4ce7c;
}
.dbbottom {
  border-bottom: 1px solid #f4ce7c;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
