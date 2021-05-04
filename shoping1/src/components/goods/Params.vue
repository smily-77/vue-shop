<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片试图 -->
    <el-card>
      <!-- 提示警告文字 -->
      <el-alert
        title="注意：只允许为第三分类设置相关参数！"
        type="warning"
        show-icon
        :closable="false"
      >
      </el-alert>
      <!-- 选择分类区域 -->
      <el-row class="select">
        <el-col :span="3" class="span">
          <span>选择商品分类 : </span>
          <!-- 级联选择框 -->
        </el-col>
        <el-col :span="8">
          <el-cascader
            v-model="cateKeys"
            :options="cateList"
            :props="cateProps"
            @change="cateChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 动态参数控制面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            :disabled="isDisabled"
            @click="addDialogVisible = true"
            >添加参数</el-button
          >
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData">
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循坏渲染tag -->
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 添加tag标签  实现添加按钮和输入框的转换 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <!-- 作用域插槽 -->
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  @click="editParamBtn(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  @click="deleteParam(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性控制面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            :disabled="isDisabled"
            @click="addDialogVisible = true"
            >添加属性</el-button
          >
          <!-- 静态参数表格 -->
          <el-table :data="onlyTableData">
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循坏渲染tag -->
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 添加tag标签  实现添加按钮和输入框的转换 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <!-- 作用域插槽 -->
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  @click="editParamBtn(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  @click="deleteParam(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数/属性对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClose"
    >
      <!-- 对话框主体 -->
      <el-form
        :model="addForm"
        :rules="formRules"
        ref="addFormRef"
        label-width="110px"
      >
        <el-form-item :label="titleText + '名称'" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParamBtn">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑参数/属性对话框 -->
    <el-dialog
      :title="'编辑' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClose"
    >
      <!-- 对话框主体 -->
      <el-form
        :model="editForm"
        :rules="formRules"
        ref="editFormRef"
        label-width="110px"
      >
        <el-form-item :label="titleText + '名称'" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParam">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getCateList()
  },

  data() {
    return {
      // 商品全部分类
      cateList: [],
      //   级联选择属性配置
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      // 级联选择框被选中的id数组
      cateKeys: [],
      // tab页被激活的name
      activeName: 'many',
      //   动态参数列表数据
      manyTableData: [],
      // 静态属性列表
      onlyTableData: [],
      // 添加参数对话框的显示和隐藏
      addDialogVisible: false,
      //  添加参数对象
      addForm: {
        attr_name: '',
      },
      //   添加/编辑参数验证规则
      formRules: {
        attr_name: [{ required: true, message: `请输入名称`, trigger: 'blur' }],
      },
      // 编辑对话框的显示和隐藏
      editDialogVisible: false,
      // 将要编辑的参数信息
      editForm: {},
    }
  },

  methods: {
    // 获取商品全部分类
    async getCateList() {
      const { data: res } = await this.$http.get('/categories')
      //   console.log(res)
      if (res.meta.status != 200) return
      // 请求成功
      this.cateList = res.data
    },

    //   级联选择框变化就会触发这个函数
    async cateChange() {
      // 获取参数列表的方法
      this.getParams()
    },

    // tab页签点击的处理函数
    handleTabClick() {
      // 获取参数列表的方法
      this.getParams()
    },

    // 获取参数列表的方法
    async getParams() {
      // 选中的不是第三级分类
      if (this.cateKeys.length != 3) {
        this.cateKeys = []
        this.manyTableData=[]
        this.onlyTableData=[]
        return
      } else {
        // 选中的是三级分类
        //   发送请求 获取参数列表
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}}/attributes`,
          {
            params: {
              sel: this.activeName,
            },
          }
        )
        if (res.meta.status != 200)
          return this.$message.error('获取参数列表失败')
        // 请求成功
        //将获取的数据 里面的attr_vals 只服从格式转换为数组格式 ，方便渲染展开列
        res.data.forEach((item) => {
          // 如果attr_vals为空，则返回一个空数组有
          // attr_vals为空进行分割的化，会产生一个空格 展开列会出现一个空的tag标签
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
          // 添加tag按钮 输入框与按钮的显示和隐藏
          item.inputVisible = false
          // 添加tag按钮 输入框输入的值
          item.inputValue = ''
        })
        // console.log(res)
        // 判断参数列表是动态属性还是静态参数的数据 并赋值
        if (this.activeName === 'many') {
          this.manyTableData = res.data
        } else {
          this.onlyTableData = res.data
        }
      }
    },

    // 监听添加参数对话框的关闭
    addDialogClose() {
      this.$refs.addFormRef.resetFields()
    },

    // 添加参数对话框确定按钮
    addParamBtn() {
      // 预验证
      this.$refs.addFormRef.validate(async (valida) => {
        if (!valida) return
        // 预验证通过
        // 发送请求
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        )
        if (res.meta.status != 201) return this.$message.error('添加失败')
        // 请求成功
        this.$message.success('添加成功')
        // 重新加载参数列表
        this.getParams()
        this.addDialogVisible = false
      })
    },

    // 编辑参数按钮
    async editParamBtn(paramId) {
      // console.log(paramId)
      // 根据id查找将要修改的参数信息
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/` + paramId,
        {
          params: {
            attr_sel: this.activeName,
          },
        }
      )
      if (res.meta.status != 200) return
      // 请求成功
      this.editForm = res.data
      this.editDialogVisible = true
    },

    // 编辑对话框的确定按钮
    editParam() {
      // 预验证
      this.$refs.editFormRef.validate(async (valida) => {
        if (!valida) return
        // 预验证通过
        // 发送编辑请求
        const { data: res } = await this.$http.put(
          `/categories/${this.cateId}/attributes/` + this.editForm.attr_id,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.editForm.attr_sel,
            attr_vals: this.editForm.attr_vals,
          }
        )
        if (res.meta.status != 200) return this.$message.error('编辑参数失败')
        // 请求成功
        this.$message.success('编辑参数成功')
        this.getParams()
        this.editDialogVisible = false
      })
    },

    // 监听编辑对话框的关闭
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },

    // 删除参数按钮
    async deleteParam(paramId) {
      // 消息弹框是否确认删除
      const deleteResult = await this.$confirm(
        '此操作将永久删除, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      // 用户取消了删除
      if (deleteResult != 'confirm') return this.$message.info('已取消了删除')
      // 用户确认删除
      // 发送删除请求
      const { data: res } = await this.$http.delete(
        `/categories/${this.cateId}/attributes/` + paramId
      )
      if (res.meta.status != 200) return this.$http.error('删除失败')
      // 请求成功
      this.getParams()
      this.$message.success('删除成功')
    },

    // 添加teg按钮 输入框中焦点离开和按下enter都会触发的事件
    handleInputConfirm(row) {
      // 如果input框里面输入无效内容 则清空后再隐藏
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        // input隐藏
        row.inputVisible = false
        return
      }
      // 如果没有return 则证明输入了内容
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      // input隐藏
      row.inputVisible = false
      // 发送添加动态参数或者静态属性请求
      // 将对attr_vals的操作保存到数据库中
      this.saveAttrVals(row)
    },

    // 将对attr_vals的操作保存到数据库中
    async saveAttrVals(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          // 要将attr_vals重新转换为空格分割的字符串
          attr_vals: row.attr_vals.join(' '),
        }
      )
      console.log(res)
      if (res.meta.status != 200) return this.$message.error('修改参数失败')
      // 请求成功
      // this.getParams()
      this.$message.success('修改参数成功')
    },

    // 按下添加tag 使input显示
    showInput(row) {
      row.inputVisible = true
      // input自动获取焦点
      // nextTick方法的作用：当页面上的元素被重新渲染之后，才会指向回调函数中的代码
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },

    // tag标签的关闭操作
    handleClose(i, row) {
      // 将数组attr_vals里i开始删除，删除1个
      row.attr_vals.splice(i, 1)
      // 将对attr_vals的操作保存到数据库中
      this.saveAttrVals(row)
    },
  },

  computed: {
    // 当没有选择分类时，禁用tab页标里面的按钮
    isDisabled() {
      if (this.cateKeys.length != 3) {
        return true
      } else {
        return false
      }
    },

    // 得到获取参数列表请求的参数  分类id
    cateId() {
      if (this.cateKeys.length === 3) {
        return this.cateKeys[this.cateKeys.length - 1]
      } else {
        return null
      }
    },

    // 动态计算对话框的名称
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    },
  },
}
</script>

<style lang="less" scope>
.select {
  margin: 15px 0;
}
.input-new-tag {
  width: 120px !important;
}
.span{
  height:40px;
  line-height: 40px;
}

</style>
