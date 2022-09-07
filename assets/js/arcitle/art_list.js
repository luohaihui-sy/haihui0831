$(function() {
  let layer = layui.layer
  let form = layui.form
  let laypage = layui.laypage

  //定义美化时间的过滤器
  template.defaults.imports.dataFormat = function(date) {
    const dt = new Date(date)

    //获取年月日
    let y = dt.getFullYear()
    let m = padZero(dt.getMonth() + 1)
    let d = padZero(dt.getDate())

    //获取时分秒
    let hh = padZero(dt.getHours())
    let mm = padZero(dt.getMinutes())
    let dd = padZero(dt.getSeconds())

    return y + '-' + m +'-' + d + '' + hh + ':' + mm + ':' + dd
  }

  //定义补零函数
  function padZero(n) {
    return n > 9 ? n : '0' + n
  }

  //定义一个查询的参数对象，将来请求数据的时候，需要将请求参数对象提交到服务器
  let q = {
    pagenum: 1, //页码值，默认请求第一页的数据
    pagesize: 2, //每页显示几条数据，默认每页显示两条数据
    cate_id: '', //文章分类的 Id
    state: '', //文章的发布状态
  }

  initTable()
  initCate()


  //获取文章列表数据的方法
  function initTable() {
    $.ajax({
      method: 'GET',
      url: '/my/article/list',
      data: q,
      success: function(res) {
        if(res.status !== 0) {
          return layer.msg('获取文章列表失败!')
        }
        //使用模板引擎渲染文章数据
        let htmlStr = template('tpl-table', res)
        $('tbody').html(htmlStr)
        //调用渲染分页的方法
        renderPage(res.total)
      }
    })
  }

  //初始化文章分类的方法
  function initCate() {
    $.ajax({
      method: 'GET',
      url: '/my/article/cates',
      success: function(res) {
        if(res.status !== 0) {
          return layer.msg('获取文章分类数据失败！')
        }
        //调用模板引擎渲染文章分类的可选项
        let htmlStr = template('tpl-cate', res)
        $('[name=cate_id]').html(htmlStr)
        form.render()
      }
    })
  }

  //为筛选表单绑定 submit 事件
  $('#form-search').on('submit', function(e) {
    e.preventDefault()
    //获取表单中选中项的值
    let cate_id = $('[name=cate_id]').val()
    let state = $('[name=state]').val()
    //为查询参数对象 q 中对应的属性赋值
    q.cate_id = cate_id
    q.state = state
    //根据最新的筛选条件，重新渲染表格数据
    initTable()
  })

  //定义渲染分页的方法
  function renderPage(total) {
    //调用 laypage.render 方法来渲染页面结构
    laypage.render({
      elem: 'pageBox',  //分页容器的Id
      count: total,  //总数据条数
      limit: q.pagesize,  //每页显示几条数据
      curr: q.pagenum,    //设置默认被选中的分页
      layout: ['count','limit','prev', 'page', 'next','skip'],
      limits: [2,3,5,10],
      //分页发生切换的时候，触发 jump 回调
      jump: function(obj, first) {
        console.log(obj,curr)
        //把最新的页码值，赋值到 q 这个查询参数对象中
        q.pagenum = obj.curr
        //把最新的条目数，赋值到 q 这个查询参数对象的 pagesize 属性中
        q.pagesize = obj.limit
        if (!first) {
        //这是根据最新的 q 获取相应的数据列表，并渲染表格
        initTable()
        }
      }
    })
  }

  //通过代理的方式为删除按钮绑定点击事件
  $('tbody').on('click', '.btn-delete', function(){
    //获取到文章的id
    let id = $(this).attr('data-id')
    //获取删除按钮的个数
    let len = $('.btn-delete').length
    // console.log(len)
    //询问用户是否要删除
    layer.confirm('确定删除？', {icon: 3, title:'提示'}, 
    function(index){
      $.ajax({
        method: 'GET',
        url: '/my/article/deletecate/' + id,
        success: function(res) {
          if(res.status !== 0) {
            return layer.msg('删除失败')
          }
          layer.msg('删除成功')
          //当数据删除完成后，需要判断当前这一页中是否还有剩余的数据，如果没有剩余的数据了，则让页码值 -1 之后，再调用 initTable 方法
          if(len === 1) {
            //如果 len 的值等于1，证明删除了数据之后，页面上已经没有任何数据了
            //页码值最小必须是1
            q.pagenum = q.pagenum === 1 ? 1 : q.pagenum - 1
          }
          initTable()
        }
      })
      
      layer.close(index);
    })
  })
})