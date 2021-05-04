<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 提示警示框 -->
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      >
      </el-alert>

      <!-- 步骤条 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <el-form
        :model="addGoodList"
        :rules="addGoodRules"
        ref="addGoodRef"
        label-width="100px"
        label-position="top"
      >
        <!-- tab栏切换 -->
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          :before-leave="tabChange"
          @tab-click="tabClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodList.goods_name"></el-input>
            </el-form-item>

            <el-form-item label="商品价格" prop="goods_price">
              <el-input
                v-model="addGoodList.goods_price"
                type="number"
              ></el-input>
            </el-form-item>

            <el-form-item label="商品数量" prop="goods_number">
              <el-input
                v-model="addGoodList.goods_number"
                type="number"
              ></el-input>
            </el-form-item>

            <el-form-item label="商品重量" prop="goods_weight">
              <el-input
                v-model="addGoodList.goods_weight"
                type="number"
              ></el-input>
            </el-form-item>

            <el-form-item label="分类" prop="goods_cat">
              <el-cascader
                v-model="addGoodList.goods_cat"
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
            <!-- 上传图片 -->
            <!-- action 是图片上传的请求地址-->
            <!-- on-preview 点击预览 -->
            <!-- on-remove  点击删除 -->
            <el-upload
              :action="imgUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleUpload"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">
                只能上传jpg/png文件，且不超过500kb
              </div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addGoodList.goods_introduce"></quill-editor>
            <!-- 添加商品按钮 -->
            <el-button type="primary" class="addbtn" @click="add">添加商品</el-button>
          </el-tab-pane>
          <el-tab-pane label="完成" name="5">完成</el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewUrl" alt="" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
// 引入lodash组件 用里面的cloneDeep深拷贝方法
var _ = require('lodash')

export default {
  created() {
    this.getGoodCate()
  },
  data() {
    return {
      // 步骤条中被激活的步骤
      activeIndex: '0',
      // 添加商品的基本信息
      addGoodList: {
        goods_name: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs:[]
      },
      // 添加商品验证规则
      addGoodRules: {
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
      // 商品分类
      cateList: [],
      // 级联选择框的配置
      selectProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      // 商品参数列表
      manyParamList: [],
      // 商品静态属性
      onlyParamList: [],
      // 上传的图片的请求地址
      imgUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 为图片上传添加token请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token'),
      },
      //图片上传成功后的url地址
      previewUrl: '',
      // 预览对话框的显示和隐藏
      previewVisible: false,
    }
  },

  methods: {
    // 获取商品分类
    async getGoodCate() {
      const { data: res } = await this.$http.get('/categories')
      if (res.meta.status != 200) return
      //  请求成功
      this.cateList = res.data
      console.log(this.cateList)
    },

    // 级联选择框变化的时候触发的函数
    handleChange() {
      // 当选中的不是三级分类 则把选中的id数组请空
      if (this.addGoodList.goods_cat.length != 3) {
        this.addGoodList.goods_cat = []
      }
    },

    // 是否阻止tab栏切换
    tabChange(activename, oldActivename) {
      // 如果tab栏为基本信息页面,且没有选择分类，阻止切换
      if (oldActivename === '0' && this.addGoodList.goods_cat.length != 3) {
        this.$message.error('请选择分类')
        return false
      }
    },

    // tab栏被点击选中时触发  获取对应参数列表
    async tabClick() {
      //  点击商品参数
      if (this.activeIndex === '1') {
        // 获取参数列表
        const { data: res } = await this.$http.get(
          `/categories/${this.cid}/attributes`,
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
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        })
        this.manyParamList = res.data
        console.log(res)
      } else if (this.activeIndex === '2') {
        // 点击商品静态属性
        const { data: res } = await this.$http.get(
          `/categories/${this.cid}/attributes`,
          {
            params: {
              sel: 'only',
            },
          }
        )
        if (res.meta.status != 200) return this.$message.error('获取参数失败')
        // 请求成功
        this.onlyParamList = res.data
        console.log(res)
      }
    },

    // 图片上传点击预览
    handlePreview(file) {
      console.log(file)
      this.previewUrl = file.response.data.url
      this.previewVisible = true
      console.log(this.previewUrl)
    },

    // 图片上传  点击移除的操作
    handleRemove(file) {
      // 获取将要被移除的图片的零时保存地址
      const picPath = file.response.data.tmp_path

      // 找到零时地址在pics中的索引
      const i = this.addGoodList.pics.findIndex((x) => {
        x.pic === picPath
      })

      
      // 根据索引删除在pics数组中删除改零时地址
      this.addGoodList.pics.splice(i, 1)
      console.log(typeof(this.addGoodList.pics))
    },

    //监听图片上传成功
    handleUpload(response) {
      // 拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path }
      // 将图片信息对象push到addGoodList的pics数组中
      this.addGoodList.pics.push(picInfo)
      console.log(this.addGoodList)
      console.log(this.addGoodList.pics)
    },
    
    // 添加商品按钮
    add(){
     
      // 预验证
      this.$refs.addGoodRef.validate(async valida=>{
        if(!valida) return this.$message.error('请数入必要的表单项')
        // 预验证通过
        // 处理发送添加商品表单的参数
        // 将添加商品的数据深拷贝一份  因为表单项的数据格式和请求参数的格式不一样
        // lodash里面的cloneDeep深拷贝方法
        const form =_.cloneDeep(this.addGoodList)
        // 处理goods_cat项
          form.goods_cat=form.goods_cat.join(',')
          // 处理动态参数
          this.manyParamList.forEach(item=>{
            const  newQuery={
              attr_id: item.attr_id,
              attr_value:item.attr_vals.join(' ')
            }
          this.addGoodList.attrs.push(newQuery)
          })
          // 处理静态参数
          this.onlyParamList.forEach(item=>{
            const newQuery={
              attr_id:item.attr_id,
              attr_value:item.attr_vals
            }
            this.addGoodList.attrs.push(newQuery)
          }) 
          form.attrs=this.addGoodList.attrs
        //  console.log(form)
        // 发送添加商品亲求
       const{data:res}=await this.$http.post('/goods',form)
       console.log(res)
      if(res.meta.status!=201) return this.$message.error('添加商品失败')
      // 请求成功
      this.$message.success('添加商品成功')
      this.$router.push('/goods')
      console.log(this.addGoodList.goods_cat)



      })

     
    }
  },

  computed: {
    // 获取分类id
    cid() {
      if (this.addGoodList.goods_cat.length === 3) {
        return this.addGoodList.goods_cat[this.addGoodList.goods_cat.length - 1]
      } else {
        return null
      }
    },
  },
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 5px !important;
}
.previewImg {
  width: 100%;
}
.addbtn {
  margin-top:15px;
}
</style>
