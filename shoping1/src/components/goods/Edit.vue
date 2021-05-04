<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>编辑商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 提示警示框 -->
      <el-alert
        title="编辑商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      >
      </el-alert>
      <!-- 步骤条 -->

      <!-- 步骤条 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"> </el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <el-form
        :model="editGood"
        :rules="editGoodRules"
        ref="editGoodRef"
        label-width="100px"
        label-position="top"
      >
        <!-- tab标签页 -->
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          @tab-click="tabClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="editGood.goods_name"></el-input>
            </el-form-item>

            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="editGood.goods_price" type="number"></el-input>
            </el-form-item>

            <el-form-item label="商品数量" prop="goods_number">
              <el-input
                v-model="editGood.goods_number"
                type="number"
              ></el-input>
            </el-form-item>

            <el-form-item label="商品重量" prop="goods_weight">
              <el-input
                v-model="editGood.goods_weight"
                type="number"
              ></el-input>
            </el-form-item>

              <el-form-item label="商品分类">
          <el-cascader
            v-model="Ids"
            :options="cateList"
            :props="selectProps"
            @change="handleChange"
          ></el-cascader>
        </el-form-item>

          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item v-for="(item, i) in manyParamList" :key="i"
              >{{ item.attr_name }}
              <!-- 多选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  v-for="(cb, i) in item.attr_vals"
                  :label="cb"
                  :key="i"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="(item, i) in onlyParamList"
              :key="i"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-row :gutter="20">
              <el-col
                :span="6"
                v-for="(item, i) in this.editGood.pics"
                :key="i"
              >
                <div class="grid-content bg-purple">
                  <img :src="item.pic" alt="" />
                  <el-button type="primary" size="mini" @click="removeImg(item)"
                    >移除该图片</el-button
                  >
                </div>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4"
            >
            <!-- 富文本编辑器 -->
            <quill-editor v-model="editGood.goods_introduce"></quill-editor>
          </el-tab-pane>
          <el-tab-pane label="完成" name="5">完成</el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  created() {
    this.getEditGood()
    this.getGoodCate()
  },
  data() {
    return {
      //将要编辑的商品信息
      editGood: {},
      //   将要编辑的商品的分类id
      cat_id: 0,
      // 分类id数组
      catIds: [],
      Ids:[70,75,99],
      //   将要编辑的商品的id
      good_id: 0,
      // 步骤条中被激活的步骤
      activeIndex: '0',
      //  编辑商品表单验证规则
      editGoodRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
        ],
        goods_cat: [
          { required: true, message: '请输入商品分类', trigger: 'blur' },
        ],
      },
      //静态参数列表
      onlyParamList: [],
      // 动态参数列表
      manyParamList: [],
      cateList:[],
       selectProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
    }
  },

  methods: {
    // 根据id查找将要编辑的商品的信息
    async getEditGood() {
      const { data: res } = await this.$http.get(
        '/goods/' + this.$route.query.id
      )

      if (res.meta.status != 200) return
      //   请求成功
      const edit = {
        goods_name: res.data.goods_name,
        goods_price: res.data.goods_price,
        goods_number: res.data.goods_number,
        goods_weight: res.data.goods_weight,
        goods_introduce: res.data.goods_introduce,
        
        pics: [],
        attrs: res.data.attrs,
      }
      this.editGood = edit
      // 处理pics的格式
      for (let i in res.data.pics) {
        let item = res.data.pics[i]
        const picsInfo = {
          pic: item.pics_sma_url,
        }
        this.editGood.pics.push(picsInfo)
      }
      console.log(this.editGood)
      // 分类id
      this.cat_id = res.data.cat_id
      //   分类id数组
      this.catIds=res.data.goods_cat.split(',')
       
      // 商品id
      this.good_id = res.data.goods_id
      console.log(this.catIds)
    },

    // tab栏被点击选中时触发  获取对应参数列表
    async tabClick() {
      //  点击商品参数
      if (this.activeIndex === '1') {
        // 获取参数列表
        const { data: res } = await this.$http.get(
          `/categories/${this.cat_id}/attributes`,
          {
            params: {
              sel: 'many',
            },
          }
        )
        if (res.meta.status != 200) return this.$message.error('获取参数失败')
        // 请求成功
        // 将data里面的attr_vals转换为数组形式
        res.data.forEach((item) => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        })
        this.manyParamList = res.data
        console.log(this.manyParamList)
      } else if (this.activeIndex === '2') {
        // 点击商品静态属性
        const { data: res } = await this.$http.get(
          `/categories/${this.cat_id}/attributes`,
          {
            params: {
              sel: 'only',
            },
          }
        )
        if (res.meta.status != 200) return this.$message.error('获取参数失败')
        // 请求成功
        this.onlyParamList = res.data
        console.log(this.onlyParamList)
      }
    },

    // 删除图片
    removeImg(item) {
      // console.log(item)
      // 获取将要被移除的图片的地址
      const picPath = item.pic

      // //   找到零时地址在pics中的索引
      //   const i = this.editGood.pics.findIndex((x) => {
      //     x.pic === picPath
      //   })
      let i = 0
      for (let index in this.editGood.pics) {
        if (this.editGood.pics[index].pic === picPath) {
          i = index
          break
        }
      }

      // 根据索引删除在pics数组中删除改零时地址
      this.editGood.pics.splice(i, 1)
      //   console.log(this.editGood.pics)
      //   数据库中保存这次对图片的操作

      console.log(this.editGood.pics)
      this.saveOperation()
    },

    // 保存操作
    async saveOperation() {
      const { data: res } = await this.$http.put(
        '/goods/' + this.good_id,
        this.editGood
      )
      console.log(res)
    },
     // 获取商品分类
    async getGoodCate() {
      const { data: res } = await this.$http.get('/categories')
      if (res.meta.status != 200) return
      //  请求成功
      this.cateList = res.data
      console.log(this.cateList)
    },

   
  },
}
</script>

<style lang="less" scoped></style>
