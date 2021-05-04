<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 搜索框 -->
      <el-row>
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getOrderList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getOrderList"
            ></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单列表表格 -->
      <el-table :data="orderList" style="width: 100%" stripe border>
        <el-table-column type="index"> </el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column
          prop="order_price"
          label="订单价格"
          width="100"
        ></el-table-column>
        <el-table-column prop="order_pay" label="是否付款" width="100">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.order_pay === '1'"
              >已付款</el-tag
            >
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="is_send"
          label="是否发货"
          width="100"
        ></el-table-column>
        <el-table-column label="下单时间">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="{}">
            <!-- 修改订单地址按钮 -->
            <el-tooltip
              class="item"
              effect="dark"
              content="修改订单地址"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="editDialogVisible = true"
              ></el-button>
            </el-tooltip>

            <el-tooltip
              class="item"
              effect="dark"
              content="物流进度"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="success"
                icon="el-icon-location"
                size="mini"
                @click="showProgress"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 编辑地址对话框 -->
    <el-dialog
      title="编辑收货地址"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editClose"
    >
      <el-form
        :model="addressForm"
        :rules="addressFormRules"
        ref="addressFormRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            v-model="addressForm.address1"
            :options="citydata"
            :props="{ expandTrigger: 'hover' }"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!--物流进度对话框 -->
    <el-dialog
      title="物流进度"
      :visible.sync="progressDialogVisible"
      width="50%"
    >
      <span>这是一段物流信息</span>
    </el-dialog>
  </div>
</template>

<script>
import citydata from './citydata'
export default {
  created() {
    this.getOrderList()
  },
  data() {
    return {
      // 查询订单参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10,
      },
      //   订单列表
      orderList: [],
      // 订单总书
      total: 0,
      //   编辑对话框的显示和隐藏
      editDialogVisible: false,
      // 地址表单
      addressForm: {
        address1: [],
        address2: '',
      },
      // 地址验证规则
      addressFormRules: {
        address1: [
          { required: true, message: '请选择省式区/县', trigger: 'blur' },
        ],
        address2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' },
        ],
      },
      // 省市区数据
      citydata,
      // 物流进度对话框的显示和隐藏
      progressDialogVisible: false,
      //   物流信息
      progressInfo: [],
    }
  },

  methods: {
    // 获取订单列表
    async getOrderList() {
      const { data: res } = await this.$http.get('/orders', {
        params: this.queryInfo,
      })
      if (res.meta.status != 200) return this.$message.error('获取订单列表失败')
      //    请求成功
      console.log(res)
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    // 分页监听每页放多少数据的变化
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize
      this.getOrderList()
    },
    // 分页监听当前页面的变化
    handleCurrentChange(newpage) {
      this.queryInfo.pagenum = newpage
      this.getOrderList()
    },
    // 编辑对话框的关闭
    editClose() {
      this.$refs.addressFormRef.resetFields()
    },
    // 物流进度按钮
    async showProgress() {
      //   // 获取物流信息
      //   const { data: res } = await this.$http.get('/kuaidi/YT5427678703676')
      //   if (res.meta.status !== 200) {
      //     return this.$message.error('获取物流进度失败！')
      //   }
      //   this.progressInfo = res.data
      this.progressDialogVisible = true
    },
  },
}
</script>

<style lang="less" scope>
.el-cascader {
  width: 100%;
}
</style>
