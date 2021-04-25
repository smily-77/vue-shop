<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加分类 -->
      <el-row>
        <el-col
          ><el-button type="primary" @click="showAddCate"
            >添加分类</el-button
          ></el-col
        >
      </el-row>
      <!-- 商品分类表格 -->
      <tree-table
        :data="goodsList"
        :columns="columns"
        show-index
        index-text="#"
        :show-row-hover="false"
        :selection-type="false"
        :expand-type="false"
        border
        class="treeTable"
      >
        <!-- 是否有效列模板 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            style="color: #409eff"
            v-if="scope.row.cat_deleted === false"
          ></i>
          <i class="el-icon-error" style="color: #f4ce7c" v-else></i>
        </template>
        <!-- 排序列模板 -->
        <template slot="sort" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0" size="mini">一级分类</el-tag>
          <el-tag
            type="success"
            v-else-if="scope.row.cat_level == 1"
            size="mini"
            >二级分类</el-tag
          >
          <el-tag type="warning" v-else size="mini">三级分类</el-tag>
        </template>

        <!-- 操作列模板 -->
        <template slot="opt" slot-scope="scope">
          <div>
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editCateShow(scope.row.cat_id)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteCateBtn(scope.row.cat_id)"
              >删除</el-button
            >
          </div>
        </template>
      </tree-table>
      <!-- 底部分页效果 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="30%"
      @close="addCateDianlogClose"
    >
      <!-- 主体 -->
      <el-form
        :model="addCate"
        :rules="cateRules"
        ref="addCateRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCate.cat_name"></el-input>
        </el-form-item>
        <!-- 级联框 -->
        <!-- v-model  选中项绑定值 为数组 -->
        <!-- options  用来绑定数据源 -->
        <!-- props 用来指定配置对象 -->
        <!-- @change监听选择的变化 -->
        <el-form-item label="父级分类">
          <el-cascader
            v-model="aprentId"
            :options="parentCateList"
            :props="parentCateProps"
            @change="parentCateChange"
            clearable
            class="parentSelect"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCateBtn">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑对话框-->
    <el-dialog
      title="编辑分类"
      :visible.sync="editCateDialogVisible"
      width="50%"
      @close="editCateClose"
    >
      <el-form
        :model="editCateList"
        :rules="cateRules"
        ref="editCateRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateList.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateBtn">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    // 加载商品分类列表
    this.getGoodList()
  },

  data() {
    return {
      // 查询商品分类数据列表参数
      queryInfo: {
        type: [3],
        pagenum: 1,
        pagesize: 5,
      },
      //   商品分类数据列表
      goodsList: [],
      //   分类总页数
      total: 0,
      // 表格各列的配置
      columns: [
        { label: '分类名称', prop: 'cat_name' },
        {
          label: '是否有效',
          //将当前列定义为模板列
          type: 'template',
          //当前列的模板名称
          template: 'isok',
        },
        {
          label: '排序',
          // 将当前列定义为模板列
          type: 'template',
          // 当前列的模板名称
          template: 'sort',
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt',
        },
      ],
      // T添加分类对话框的显示和隐藏
      addCateDialogVisible: false,
      // 父级分类数据
      parentCateList: [],

      // 添加的分类数据对象
      addCate: {
        // 分类名称
        cat_name: '',
        // 父类id
        cat_pid: 0,
        // 分类层级 默认添加一级分类
        cat_level: 0,
      },
      // 分类·表单·验证规则
      cateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 1, max: 15, message: '分类名称在1~15位之间', trigger: 'blur' },
        ],
      },
      // 联级选择配置
      parentCateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      // 级联被选中的父级id数组
      aprentId: [],
      // 编辑分类对话框的显示和隐藏
      editCateDialogVisible: false,
      // 将要编辑的信息
      editCateList: {},
    }
  },

  methods: {
    // 获取商品分类数据列表
    async getGoodList() {
      const { data: res } = await this.$http.get('/categories', {
        params: this.queryInfo,
      })
      console.log(res.data)
      if (res.meta.status != 200)
        return this.$message.error('获取商品分类数据列表失败')
      // 请求成功
      this.goodsList = res.data.result
      this.total = res.data.total
    },

    // 监听当时每页显示数据条数pageSize的变化
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize
      this.getGoodList()
    },
    // 监听当前页码的变化
    handleCurrentChange(newpage) {
      this.queryInfo.pagenum = newpage
      this.getGoodList()
    },

    // 获取父级分类
    async getParentsCate() {
      const { data: res } = await this.$http.get('/categories', {
        params: { type: [2] },
      })
      // console.log(res)
      if (res.meta.status != 200) return
      // 请求成功
      this.parentCateList = res.data
    },

    // 添加分类按钮
    showAddCate() {
      // 获取父级分类
      this.getParentsCate()
      this.addCateDialogVisible = true
    },

    // 级联选择发生变化触发这个函数
    parentCateChange(value) {
      // console.log(this.aprentId)
      // 如果aprentId.length>0 证明有选择父级分类
      // aprentId.length=0  没有选择父级分类 则默认为一级分类
      if (this.aprentId.length > 0) {
        // 分类的父亲的id值
        this.addCate.cat_pid = this.aprentId[this.aprentId.length - 1]
        // 分类的等级
        this.addCate.cat_level = this.aprentId.length
        return
      } else {
        this.addCate.cat_pid = 0
        this.addCate.cat_level = 0
      }
    },

    // 添加分类对话框的确定按钮
    addCateBtn() {
      // console.log(this.addCate)
      // 预验证
      this.$refs.addCateRef.validate(async (valida) => {
        if (!valida) return
        //  预验证通过
        // 发送添加分类请求
        const { data: res } = await this.$http.post('/categories', this.addCate)
        // console.log(res)
        if (res.meta.status != 201) return this.$message.error('添加分类失败')
        // 请求成功
        this.getGoodList()
        this.addCateDialogVisible = false
      })
    },

    // 监听添加分类对话框的关闭 重置表单数据
    addCateDianlogClose() {
      this.$refs.addCateRef.resetFields()
      this.aprentId = []
      this.addCate.cat_pid = ''
      this.addCate.cat_level = 0
    },

    // 编辑按钮
    async editCateShow(id) {
      console.log(id)
      // 根据id查找将要编辑的分类信息
      const { data: res } = await this.$http.get('/categories/' + id)
      // console.log(res)
      if (res.meta.status != 200) return
      // 请求成功
      this.editCateList = res.data
      this.editCateDialogVisible = true
    },

    // 监听编辑对话框的关闭
    editCateClose() {
      // 重置表单
      this.$refs.editCateRef.resetFields()
    },

    // 确认编辑
    editCateBtn() {
      // 预验证
      this.$refs.editCateRef.validate(async (valida) => {
        if (!valida) return
        // 预验证通过
        // 发送请求
        const { data: res } = await this.$http.put(
          '/categories/' + this.editCateList.cat_id,
          {
            cat_name: this.editCateList.cat_name,
          }
        )
        // console.log(res)
        if (res.meta.status != 200) return this.$message.error('编辑失败')
        // 请求成功
        this.getGoodList()
        this.$message.success('编辑成功')
        this.editCateDialogVisible = false
      })
    },

    // 删除按钮
    async deleteCateBtn(id) {
      // 是否确认删除
      const deleteResult = await this.$confirm(
        '此操作将永久删除该分类, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      // console.log(deleteResult)
      // 取消删除
      if(deleteResult!='confirm') return this.info('已取消删除')
      // 确认删除
      // 发送请求
      const {data:res}=await this.$http.delete('/categories/'+id)
      // console.log(res)
      if(res.meta.status!=200) return this.$http.error('删除失败')
      // 请求成功
       this.getGoodList()
        this.$message.success('编辑成功')
    },
  },
}
</script>

<style lang="less" scope>
.treeTable {
  margin-top: 15px;
}
.parentSelect {
  width: 100%;
}
</style>
