<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索框和添加商品区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 搜索框 -->
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getGoodList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addGoods">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 商品表格 -->
      <el-table :data="goodList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column
          label="商品价格"
          prop="goods_price"
          width="85px"
        ></el-table-column>
        <el-table-column
          label="商品重量"
          prop="goods_weight"
          width="85px"
        ></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="190px">
          <template slot-scope="scope">
            <!-- 引入全局过滤器处理时间 -->
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-button type="primary" size="mini">编辑</el-button>
            <el-button
              type="warning"
              size="mini"
              @click="deleteGoodsBtn(scope.row.goods_id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <!-- 底部分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :background="true"
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  created() {
    this.getGoodList()
  },

  data() {
    return {
      // 查询商品列表参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10,
      },
      // 商品列表数据
      goodList: [],
      // 商品列表总数
      total: 0,
    }
  },

  methods: {
    // 获取商品列表数据
    async getGoodList() {
      const { data: res } = await this.$http.get('/goods', {
        params: this.queryInfo,
      })
      if (res.meta.status != 200)
        return this.$message.error('获取商品列表失败')
      // 请求成功
      this.goodList = res.data.goods
      this.total = res.data.total
      // this.$message.success('获取商品列表成功')
    },

    // 监听每页显示多少条数据的变化
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodList()
    },
    // 监听当前页码的变化
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodList()
    },

    // 删除商品变化
    async deleteGoodsBtn(gid) {
      // 确认是否删除
      const deleteResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      // 取消了删除
      if (deleteResult != 'confirm') return this.$message.info('取消了删除')
      // 确认了删除
      const { data: res } = await this.$http.delete('/goods/' + gid)
      if (res.meta.status != 200) this.$message.error('删除失败')
      // 成功删除
      this.getGoodList()
      this.$message.success('删除成功')
    },

    // 添加商品按钮
    addGoods(){
        this.$router.push('/goods/add')
    }
  },
}
</script>

<style lang="less" scope></style>
