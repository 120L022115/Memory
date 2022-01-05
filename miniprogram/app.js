var tmp_PullDownLimitTime = {}
var app
var g
var f
import {
  examarr
} from './data/exampleclass.js'
var DEFAULTCLASSNAME = "管理分类"
var DELETECLASSNAME = "已删除"
var DEFAULTSPLIT = {
  l: "[",
  r: "]",
  m: '_'
}
var DEFAULTCOLORS = ['#dc3023', '#e29c45', '#0c8918', '#808080', '#8d4bbb', '#44cef6'] //false表示无颜色
var DEFAULTICONS = ['icon-jianqie', 'icon-fuzhiwenjian', 'icon-ziliaoku', 'icon-tishi', 'icon-shijian', 'icon-xiala', 'icon-fenlei', 'icon-nishizhencounterclockwise6', 'icon-jinzhi', 'icon-tianjia', 'icon-baocun', 'icon-xiayiyeqianjinchakangengduo', 'icon-zhiding', 'icon-wodedamaijihuo', 'icon-icon-', 'icon-chakan', 'icon-duihao', 'icon-yunduanshuaxin', 'icon-paixu', 'icon-xiayi', 'icon-shangyi', 'icon-biaoji', 'icon-shanchu', 'icon-bianji', 'icon-shuaxin', 'icon-quxiaobiaoji', 'icon-star-full', 'icon-star', 'icon-cuo', 'icon-shijianpaixu', 'icon-zhidi']
App({
  globalData: {
    tmp_editNoteData: undefined,
    colors: DEFAULTCOLORS,
    DEFAULTICONS: DEFAULTICONS,
    DEFAULTCLASSNAME: DEFAULTCLASSNAME,
    DELETECLASSNAME: DELETECLASSNAME,
    openid: undefined,
    class: {},
    set: {
      PutBottom: false,
      split: DEFAULTSPLIT
    }
  },
  importFromArr(classname, arr) {
    var arr = arr,succ = 0;
    wx.showLoading({
      title: '加载中',
    })
    if(classname == g.DEFAULTCLASSNAME) return false
    for (var i in arr) {
      if(app.addNote({
        classname: classname,
        title: arr[i].title,
        tip: arr[i].tip,
        time: arr[i].time
      })) succ++
    }
    wx.hideLoading({
      success: (res) => {},
    })
    return succ
  },
  transFromApp(str) {
    var succ = 0,
      fail = 0;
    var lc = str.indexOf("/c<"),
      rc, li, ri, lt, rt, arr = []
    while (lc != -1) {
      rc = str.indexOf(">c/", lc + 3)
      if (rc == -1) {
        fail++;
        continue
      }
      li = str.indexOf("/i<", rc)
      if (li == -1) {
        fail++;
        continue
      }
      ri = str.indexOf(">i/", li)
      if (ri == -1) {
        fail++;
        continue
      }
      lt = str.indexOf("/t<", ri)
      if (lt == -1) {
        fail++;
        continue
      }
      rt = str.indexOf(">t/", lt)
      if (rt == -1) {
        fail++;
        continue
      }
      succ++
      arr.push({
        title: str.substring(lc + 3, rc),
        tip: str.substring(li + 3, ri),
        time: str.substring(lt + 3, rt).replace("   ", " "),
      })
      lc = str.indexOf("/c<", lc + 3)
      //console.log((arr))
    }
    return {
      success: succ,
      fail: fail,
      arr: arr
    }
  },
  async onLaunch() {
    app = this
    g = app.globalData
    f = app.f
    this.InitCloud()
    this.getOpenid(console.log)
  },
  /**
   * 初始化云开发环境（支持环境共享和正常两种模式）
   */
  CloudInit: false,
  cloud: undefined,
  async InitCloud() {
    const shareinfo = wx.getExtConfigSync() // 检查 ext 配置文件
    const normalinfo = require('./envList.js').envList || [] // 读取 envlist 文件
    if (shareinfo.envid != null) { // 如果 ext 配置文件存在，环境共享模式
      this.c1 = new wx.cloud.Cloud({ // 声明 cloud 实例
        resourceAppid: shareinfo.appid,
        resourceEnv: shareinfo.envid,
      })
      // 装载云函数操作对象返回方法
      this.cloud = async function () {
        if (this.CloudInit != true) { // 如果第一次使用返回方法，还没初始化
          await this.c1.init() // 初始化一下
          this.CloudInit = true // 设置为已经初始化
        }
        return this.c1 // 返回 cloud 对象
      }
    } else { // 如果 ext 配置文件存在，正常云开发模式
      if (normalinfo.length != 0 && normalinfo[0].envId != null) { // 如果文件中 envlist 存在
        wx.cloud.init({ // 初始化云开发环境
          traceUser: true,
          env: normalinfo[0].envId
        })
        // 装载云函数操作对象返回方法
        this.cloud = () => {
          return wx.cloud // 直接返回 wx.cloud
        }
      } else { // 如果文件中 envlist 不存在，提示要配置环境
        this.cloud = () => {
          wx.showModal({
            content: '当前小程序没有配置云开发环境，请在 envList.js 中配置你的云开发环境',
            showCancel: false
          })
          throw new Error('当前小程序没有配置云开发环境，请在 envList.js 中配置你的云开发环境')
        }
      }
    }
  },
  /*
  async dbc(name){
    return (await this.cloud()).database().collection(name)
  },
  // 获取云数据库实例
  async db() {
    return (await this.cloud()).database()
  },*/
  /*
  // 上传文件操作封装
  async uploadFile(cloudPath, filePath) {
    return (await this.cloud()).uploadFile({
      cloudPath,
      filePath
    })
  },

  // 下载文件操作封装
  async downloadFile(fileID) {
    return (await this.cloud()).downloadFile({
      fileID
    })
  },*/

  // 获取用户唯一标识，兼容不同环境模式
  async CloudGetOpenId() {

    const {
      result: {
        openid,
        fromopenid
      }
    } = await (await this.cloud()).callFunction({
      name: 'getOpenId'
    }).catch(e => {
      //let flag = e.toString()
      //flag = flag.indexOf('FunctionName') == -1 ? flag : '请在cloudfunctions文件夹中getOpenId上右键，创建部署云端安装依赖，然后再次体验'
      wx.hideLoading()
      wx.showModal({
        content: "出错了", //flag, // 此提示可以在正式时改为 "网络服务异常，请确认网络重新尝试！"
        showCancel: false
      })
      //throw new Error(flag)
    })
    if (openid !== "") return openid
    return fromopenid
  },

  isReady(until, success) {
    if (CloudInit)
      if (typeof this.globalData.openid == "string" && this.globalData.openid != "") {
        success()
        return true
      }

    if (!until) {
      setTimeout(() => {
        isReady(until, success)
      }, 500);
    }
  },
  getOpenid(success) {
    var that = this;
    var save = (id) => {
      wx.setStorage({
        key: "OPENID",
        data: id
      })
    }
    var getfun = () => {
      that.CloudGetOpenId().then(async openid => {
        that.globalData.openid = openid
        save(openid)
        success(openid)
      }).catch(that.f.showFail)
    }
    console.log("GET OPENID")
    wx.getStorage({
      key: "OPENID",
      success(res) {
        //console.log(res)
        if (typeof res.data == "string" && res.data != "") {
          that.globalData.openid = res.data
          success(res.data)
        } else getfun()
      },
      fail: getfun
    })
  },
  /*
  saveClassList({list,success,fail}){
    wx.setStorage({
      key: "CLASSLIST",
      data: list,
      success: success,
      fail: fail
    })
  },
  getClassList({success,fail}){
    wx.getStorage({
      key: "CLASSLIST",
      success: (res)=>{
        success(res.data)
      },
      fail: fail
    })
  },*/

  getSplit(classname) {
    for (var i in g.class[DEFAULTCLASSNAME]) {
      if (g.class[DEFAULTCLASSNAME][i].title == classname) {
        var split = g.class[DEFAULTCLASSNAME][i].split
        console.log("SPLIT", classname, split)
        if (typeof split == 'object')
          if (typeof split.l == 'string')
            if (typeof split.r == 'string')
              if (typeof split.m == 'string') return split
        return g.set.split
      }
    }
    return g.set.split
  },
  LoadClass(succ) {
    wx.showLoading({
      title: '加载分类',
      mask: true
    })
    var that = this
    that.getClass({
      name: DEFAULTCLASSNAME,
      success(res) {
        //console.log(DEFAULTCLASSNAME,res)
        var t = that.ArrayTransToNameList(res)
        var len = t.length
        var currentlen = 0;
        for (var i = 0; i < len; i++) {
          var cn = t[i]
          //if(cn!=DEFAULTCLASSNAME)
          that.getClass({
            name: cn,
            success(res) {
              currentlen++;
              wx.showLoading({
                title: currentlen + '/' + len,
              })
              if (len <= currentlen) {
                wx.hideLoading({
                  success: (res) => {},
                })
                succ()
              }
            },
            fail: f.showFail
          })
        }
        if (len <= 1) {
          wx.hideLoading({
            success: (res) => {},
          })
          succ()
        }
      },
      fail(res) { //第一次进入，无数据

        console.log("第一次进入", res)
        app.addNote({
          classname: DEFAULTCLASSNAME,
          title: DEFAULTCLASSNAME,
          tip: "系统分类，用于管理分类，不可删除",
          color: '#44cef6',
          extStyleClass: 'icon-fenlei'
        })
        app.addNote({
          classname: DEFAULTCLASSNAME,
          title: DELETECLASSNAME,
          tip: "系统分类，用于保存已删除的记忆项，不可删除",
          bottom: true,
          color: '#dc3023',
          extStyleClass: 'icon-shanchu'
        })
        app.addNote({
          classname: DEFAULTCLASSNAME,
          title: '帮助',
          tip: "点击这里，帮助您快速上手本应用",
          color: '#0c8918',
          extStyleClass: 'icon-tishi'
        })
        app.addNote({
          classname: DEFAULTCLASSNAME,
          title: '示例',
          tip: "示例，试试看？",
          color: false
        })
        app.addNote({
          classname: DEFAULTCLASSNAME,
          title: '默认分类',
          tip: "记录下我的第一条记忆",
          color: '#e29c45'
        })
        app.importHelp('帮助')
        app.importFromArr('示例', examarr)
        wx.hideLoading({
          success: (res) => {},
        })
        succ()
      }
    })
  },
  getClassColor(name) {
    var t = g.class[DEFAULTCLASSNAME]
    for (var i in t) {
      if (t[i].title == name) {
        return t[i].color
      }
    }
    return false
  },
  getClass({
    name,
    success,
    fail
  }) {
    console.log("GET CLASS :", name)
    wx.getStorage({
      key: "CLASS-" + name,
      success: (res) => {
        g.class[name] = res.data
        success(res.data)
      },
      fail: fail
    })
  },
  updownEndNote({
    classname,
    id,
    up
  }) { //默认下移，up为真上移 
    console.log("updown Note", classname, id, up)
    var t = g.class[classname]
    if (typeof t != 'object') return
    //var targetid = id+(up?1:-1);
    //if(id>=t.length || id<0) return
    var ttt = t.splice(id, 1)[0]
    if (up) {
      t.unshift(ttt)
    } else t.push(ttt)
  },
  updownNote({
    classname,
    id,
    up
  }) { //默认下移，up为真上移 
    console.log("updown Note", classname, id, up)
    var t = g.class[classname]
    if (typeof t != 'object') return
    var targetid = id + (up ? -1 : 1);
    if (targetid >= t.length || targetid < 0) return
    var ttt = t.splice(id, 1)[0]
    t.splice(targetid, 0, ttt)
  },
  changeIdNote({
    classname,
    id,
    target,
    data
  }) {
    console.log("change Note", classname, id, target, data)
    var t = g.class[classname]
    if (typeof t != 'object') t = []
    t[id][target] = data
  },
  changeNote({
    classname,
    title,
    target,
    data
  }) {
    console.log("change Note", classname, title, target, data)
    var t = g.class[classname]
    if (typeof t != 'object') t = []
    for (var i = 0; i < t.length; i++) {
      if (t[i].title == title) t[i][target] = data
    }
  },
  saveClass({
    name,
    data,
    success,
    fail
  }) {
    //if(name != DEFAULTCLASSNAME){
    this.changeNote({
      classname: DEFAULTCLASSNAME,
      title: name,
      target: "time",
      data: f.getTime()
    })
    //}
    console.log("saveClass", name, data)
    wx.setStorage({
      key: "CLASS-" + name,
      data: data,
      success: success,
      fail: fail
    })
    if (name != DEFAULTCLASSNAME) {
      this.saveClass({
        name: DEFAULTCLASSNAME,
        data: g.class[DEFAULTCLASSNAME]
      })
    }
  },
  cutcopyNote({
    classname,
    arrayid,
    targetclass,
    copy
  }) { //自动保存
    console.log("CUTCOPY", classname, arrayid, targetclass, copy)
    var t = g.class[classname]
    if (typeof t != 'object') return '系统错误，操作失败'
    if (t.length >= arrayid);
    else return '系统错误，操作失败'
    if (classname == DEFAULTCLASSNAME) { //移动或复制分类
      return '不能复制或移动分类'
      var title = t[arrayid].title
      if (title == DEFAULTCLASSNAME) return '不能删除用于管理分类的分类'
      if (title == DELETECLASSNAME) return '不能删除用于保存已删除的分类'
    }
    if (targetclass == DEFAULTCLASSNAME) {
      return '不能复制或移动到此目标分类'
    }
    var data
    if (copy) data = JSON.parse(JSON.stringify(t[arrayid]))
    else data = t.splice(arrayid, 1)[0]

    this.saveClass({
      name: classname,
      data: t,
    })
    this.addNote({
      classname: targetclass,
      ORALDATA: data
    })
    return true
  },
  delNote({
    classname,
    arrayid
  }) { //自动保存
    console.log("DELETE", classname, arrayid, data)
    var t = g.class[classname]
    if (typeof t != 'object') return '系统错误，删除失败'
    if (t.length >= arrayid);
    else return '系统错误，删除失败'
    if (classname == DEFAULTCLASSNAME) { //删除分类
      var title = t[arrayid].title
      if (title == DEFAULTCLASSNAME) return '不能删除用于管理分类的分类'
      if (title == DELETECLASSNAME) return '不能删除用于保存已删除的分类'
    }
    var data = t.splice(arrayid, 1)[0]


    this.saveClass({
      name: classname,
      data: t,
    })


    if (classname != DELETECLASSNAME) { //非永久删除，移动到已删除
      this.addNote({
        classname: DELETECLASSNAME,
        ORALDATA: data
      })
    }
    return true
  },
  addNote({
    classname,
    ORALDATA,
    title,
    tip,
    bottom,
    color,
    extStyleClass,
    time
  }) { //自动保存，默认加在顶部
    //if(classname != DEFAULTCLASSNAME){
    //  this.changeNote(DEFAULTCLASSNAME,name,"time",f.getTime())
    //}
    if (!ORALDATA)
      if (typeof title != 'string' || title.replace(/ /g, '') == '') {
        wx.showModal({
          showCancel: false,
          title: '提示',
          content: '标题不能为空'
        })
        return false
      }
    if (classname == DEFAULTCLASSNAME) {
      if (ORALDATA) title = ORALDATA.title
      if (!this.listNameVaild(this.ObjTransToNameList(g.class), title)) {
        wx.showModal({
          showCancel: false,
          title: '提示',
          content: '分类名称重复，请更换分类名称'
        })
        return false
      }
    }
    if (typeof g.class[classname] != "object") g.class[classname] = []
    var tar = g.class[classname]

    var t;
    if (ORALDATA) {
      t = ORALDATA
    } else {
      var t = {
        title: title,
        tip: tip,
        time: time ? time : f.getTime(),
        showtitle: title,
        showcount: -1,
        extStyleClass: extStyleClass ? 'slideIcon iconfont ' + extStyleClass : undefined
      }
      t.realtime = f.transTimes(t.time, true)
      if (classname == DEFAULTCLASSNAME) {
        t.split = g.set.split
      }
      if (typeof color != 'string') color = false
      t.color = color
    }
    if (bottom) tar.push(t)
    else tar.unshift(t)
    console.log("add note:", classname, t, g.class)
    this.saveClass({
      name: classname,
      data: tar,
    })
    if (classname == DEFAULTCLASSNAME && title != DEFAULTCLASSNAME) { //新建分类
      g.class[title] = []
      this.saveClass({
        name: title,
        data: [],
      })
    } else if (classname == DEFAULTCLASSNAME && title == DEFAULTCLASSNAME) { //第一次进入
      g.class[title] = tar
    }
    return true
  },
  ArrayTransToNameList(classlist) {
    if (typeof classlist != 'object') return []
    var t = []
    for (var i in classlist) {
      t.push(classlist[i].title)
      //console.log(i)
    }
    //console.log(classlist,t)
    //console.log(Object.keys(classlist))

    return t;
  },
  ObjTransToNameList(classlist) {
    if (typeof classlist != 'object') return []
    /*var t = []
    for(var i in classlist){
      t.push(i)
      //console.log(i)
    }
    console.log(classlist,t)*/
    console.log(classlist, Object.keys(classlist))
    return Object.keys(classlist);
  },
  importHelp(classname) {
    if(classname == g.DEFAULTCLASSNAME) return
    app.addNote({
      classname: classname,
      title: '欢迎使用《Memory》',
      tip: '本小程序复刻自Android版Memory应用，在此，您可以记录下您需要记忆的项目，使用本应用辅助记忆',
      bottom: true,
      //extStyleClass: 'iconfont icon-biaoji'
    })
    app.addNote({
      classname: classname,
      title: '我们将用一个例子展现本应用的功能，你还记得这个单词是什么意思吗?\naddress v.[致函] n.[地址]\n',
      tip: '现在，尝试点击一下本项，然后再点击一次。\n将"["和"]"加入到项目中可以使用此效果',
      bottom: true,
      //extStyleClass: 'iconfont icon-biaoji'
    })
    app.addNote({
      classname: classname,
      title: '再试试?\nqualification n.[资格，条件]',
      tip: '',
      bottom: true,
      //extStyleClass: 'iconfont icon-biaoji'
    })
    app.addNote({
      classname: classname,
      title: '查看所有 [view]',
      tip: '点击左上方这个图标可以将您需要遮盖的文本全部展现出来',
      bottom: true,
      extStyleClass: 'icon-chakan'
    })
    app.addNote({
      classname: classname,
      title: '刷新 [refresh]',
      tip: '点击左上方这个图标可以将您需要遮盖的文本重置，交替使用以上两个按钮可以看到显著效果',
      bottom: true,
      extStyleClass: 'icon-shuaxin'
    })

    app.addNote({
      classname: classname,
      title: '删除项目',
      tip: '左滑本项目，轻触该图标，即可本项即移动到“已删除”分类',
      bottom: true,
      extStyleClass: 'icon-shanchu'
    })
    app.addNote({
      classname: classname,
      title: '彻底删除项目',
      tip: '在“已删除”分类中左滑项目，轻触该图标，即可永久删除项目',
      bottom: true,
      extStyleClass: 'icon-shanchu'
    })
    app.addNote({
      classname: classname,
      tip: '该按钮在右上角工具栏中，点击可以显示或隐藏列表中的提示',
      title: '显示/隐藏提示',
      bottom: true,
      color: '#44cef6',
      extStyleClass: 'icon-tishi'
    })
    app.addNote({
      classname: classname,
      tip: '该按钮在右上角工具栏中，点击可以显示或隐藏列表中的时间',
      title: '显示/隐藏时间',
      bottom: true,
      color: '#44cef6',
      extStyleClass: 'icon-shijian'
    })
    app.addNote({
      classname: classname,
      title: '为了方便后续的讲解，还请您打开提示',
      tip: '',
      bottom: true,
      color: '#0c8918',
      extStyleClass: 'icon-tishi'
    })
    app.addNote({
      classname: classname,
      tip: '该按钮在右上角工具栏中，点击可以进入标记模式，现在点击试试',
      title: '标记项目',
      bottom: true,
      color: '#dc3023',
      extStyleClass: 'icon-biaoji'
    })
    app.addNote({
      classname: classname,
      tip: '在标记模式中，点击右侧按钮可以标记项目，上方可以选择标记颜色，再次点击标记按钮可以取消标记',
      title: '试试标记此项目',
      bottom: true,
      extStyleClass: 'icon-biaoji'
    })
    app.addNote({
      classname: classname,
      tip: '点击保存按钮可以退出标记模式，并保存列表',
      title: '保存标记',
      bottom: true,
      extStyleClass: 'icon-baocun'
    })
    app.addNote({
      classname: classname,
      tip: '',
      title: '请点击保存退出标记模式',
      bottom: true,
      color: '#0c8918',
      extStyleClass: 'icon-baocun'
    })
    app.addNote({
      classname: classname,
      tip: '该按钮在右上角工具栏中，点击可以进入编辑模式，现在点击试试',
      title: '编辑列表',
      bottom: true,
      color: '#dc3023',
      extStyleClass: 'icon-icon-'
    })
    app.addNote({
      classname: classname,
      tip: '进入编辑模式后，右上角工具栏将显示可用工具，您可以点击对应工具，左侧将显示它的功用，然后点击每条项目旁边的按钮，可以执行对应的操作',
      title: '编辑模式指引',
      bottom: true,
      extStyleClass: 'icon-icon-'
    })
    app.addNote({
      classname: classname,
      tip: '',
      title: '请点击保存退出编辑模式',
      bottom: true,
      color: '#0c8918',
      extStyleClass: 'icon-baocun'
    })
    app.addNote({
      classname: classname,
      tip: '左滑本项目，可以看到该图标，点击即可编辑项目内容',
      title: '编辑项目',
      color: '#dc3023',
      bottom: true,
      extStyleClass: 'icon-bianji'
    })
    app.addNote({
      classname: classname,
      tip: '点击下方正中心的添加图标，可以添加项目',
      title: '添加项目',
      bottom: true,
      extStyleClass: 'icon-tianjia'
    })
    app.addNote({
      classname: classname,
      tip: '长按下方正中心的添加图标，可以从词典快速添加项目',
      title: '从词典快速添加项目',
      bottom: true,
      extStyleClass: 'icon-tianjia'
    })
    app.addNote({
      classname: classname,
      tip: '分类可以帮助您对项目进行分类别管理，如您当前所在的帮助分类，如需要切换分类，请点击左上角的该图标即可进入“管理分类”，“管理分类”也是一个分类，在该分类您可以对分类进行管理，点击对应的项目可以进入对应分类，同时，您也可以点击最上方您的分类名来切换分类。',
      title: '管理分类',
      color: '#dc3023',
      bottom: true,
      extStyleClass: 'icon-fenlei'
    })
    app.addNote({
      classname: classname,
      tip: '在“管理分类”中点击或长按下方正中心的添加图标，可以(快速)添加分类',
      title: '添加分类',
      bottom: true,
      extStyleClass: 'icon-tianjia'
    })
    app.addNote({
      classname: classname,
      tip: '点击该图标可以导入所有帮助条目至当前所在分类',
      title: '随时查看帮助',
      bottom: true,
      extStyleClass: 'icon-bangzhu'
    })
    app.addNote({
      classname: classname,
      tip: '长按该图标可以导入示例至当前所在分类',
      title: '导入示例',
      bottom: true,
      extStyleClass: 'icon-bangzhu'
    })
  },
  listNameVaild(list, newname) {
    if (newname == '' || newname == undefined) return false
    var t = list
    for (var i = 0; i < t.length; i++)
      if (t[i] == newname) return false
    return true
  },
  f: {
    sort: function (a, tar, hightolow, usinglen, tar2) { //排序大小,tar相同时再按tar2排序
      var i = 0,
        j = 0,
        t = 0;
      if (typeof a != 'object') return a;
      if (a.length == 0) return a;
      if (typeof hightolow !== 'boolean') hightolow = true
      for (i = 0; i < a.length; i++) {
        for (j = 0; j < a.length; j++) {
          if (usinglen) {
            if (hightolow ? (a[i][tar].length > a[j][tar].length) : (a[i][tar].length < a[j][tar].length)) { // 相邻元素两两对比
              t = a[i];
              a[i] = a[j];
              a[j] = t;
            }
          } else if (hightolow ? (a[i][tar] > a[j][tar]) : (a[i][tar] < a[j][tar])) { // 相邻元素两两对比
            t = a[i];
            a[i] = a[j];
            a[j] = t;
          } else if ((a[i][tar] == a[j][tar]) && tar2) {
            if (hightolow ? (a[i][tar2] > a[j][tar2]) : (a[i][tar2] < a[j][tar2])) {
              t = a[i];
              a[i] = a[j];
              a[j] = t;
            }
          }
          ////console.log('i:' + i + ' j:' + j + '  当前数组为：' + a);
        }
      }
      return a;
    },
    showFail(res) {
      wx.hideLoading({
        success: (res) => {},
      })
      wx.showModal({
        title: '错误',
        content: res.errMsg,
        showCancel: false
      })
    },
    formatTime(time) {
      var util = require('./utils/util.js')
      const tmp_dayTime = util.formatTime(new Date(time)).split("/").split("-")
      return tmp_dayTime
    },
    getTime(date, time, src) { //src是是否返回地址格式（没有:）
      if (typeof date == 'undefined') date = true
      if (typeof time == 'undefined') time = true
      if (typeof src == 'undefined') src = false

      var util = require('./utils/util.js')
      const tmp_dayTime = util.formatTime(new Date());
      if (date && !time) return tmp_dayTime.split(" ")[0].split("/").join("-")
      if (!date && time)
        if (!src) return tmp_dayTime.split(" ")[1]
      else return tmp_dayTime.split(" ")[1].split(":").join("-")
      if (date && time)
        if (!src) return tmp_dayTime.split(" ")[0].split("/").join("-") + " " + tmp_dayTime.split(" ")[1]
      else return tmp_dayTime.split(" ")[0].split("/").join("-") + "-" + tmp_dayTime.split(" ")[1].split(":").join("-")
    },
    isTimeLimit(taskid, timelimit, showTip) {
      if (typeof timelimit != 'number') timelimit = 10
      if (typeof tmp_PullDownLimitTime[taskid] != 'number') tmp_PullDownLimitTime[taskid] = 0
      var time = (new Date()).getTime()
      if (time - tmp_PullDownLimitTime[taskid] < timelimit * 1000) {
        wx.stopPullDownRefresh({
          success: (res) => {},
        })
        if (showTip)
          wx.showModal({
            showCancel: false,
            title: '时间限制',
            content: showTip + '，请' + (timelimit - (time - tmp_PullDownLimitTime[taskid]) / 1000 + 1).toFixed(0) + '秒后再试。'
          })
        return false
      } else {
        tmp_PullDownLimitTime[taskid] = time
        return true
      }
    },
    tmp_showRealtime(show, real, trans, dividechar) {
      if (typeof dividechar != 'string') dividechar = ' '
      if (show) return trans + dividechar + real
      else return trans
    },
    transTimes(realtime, showRealtime, vaguetype, dividechar) { //转换realtime至相对时间，realtime的格式是2021-02-05 19:00
      if (typeof realtime != 'string') return ''
      if (realtime == '') return ''
      if (typeof showRealtime != 'boolean') showRealtime = false
      if (typeof vaguetype != 'boolean') vaguetype = true
      if (typeof dividechar != 'string') dividechar = ' '
      //var date = realtime.split(" ")[0]
      if (realtime.substr(0, 1) == 'D') realtime = realtime.substr(1)
      var time = realtime.split(" ")[1]
      var timemin = time.split(":")[0] + ":" + time.split(":")[1]
      //if (updatetime || nowtime == null) {
      //Time = this.getTime(true, true, false)
      //}
      //var nowdate = Time.split(" ")[1]
      //var nowtime = Time.split(" ")[0]

      var dateBegin = new Date(realtime.replace(/-/g, "/")); //将-转化为/，使用new Date
      var dateEnd = new Date(); //获取当前时间
      var dateDiff = dateEnd.getTime() - dateBegin.getTime(); //时间差的毫秒数
      var dayDiff = Math.floor(dateDiff / (24 * 3600 * 1000)); //计算出相差天数
      var leave1 = dateDiff % (24 * 3600 * 1000) //计算天数后剩余的毫秒数
      var hours = Math.floor(leave1 / (3600 * 1000)) //计算出小时数
      //计算相差分钟数
      var leave2 = leave1 % (3600 * 1000) //计算小时数后剩余的毫秒数
      var minutes = Math.floor(leave2 / (60 * 1000)) //计算相差分钟数
      //计算相差秒数
      var leave3 = leave2 % (60 * 1000) //计算分钟数后剩余的毫秒数
      var seconds = Math.round(leave3 / 1000)
      ////console.log(" 相差 " + dayDiff + "天 " + hours + "小时 " + minutes + " 分钟" + seconds + " 秒")
      ////console.log(dateDiff + "时间差的毫秒数", dayDiff + "计算出相差天数", leave1 + "计算天数后剩余的毫秒数", hours + "计算出小时数", minutes + "计算相差分钟数", seconds + "计算相差秒数");

      //return
      //旧算法
      //var nt = nowtime.split(":")
      var t = time.split(":")
      //var h0 = Number(nt[0]),
      var h = Number(t[0])
      /*var m0 = Number(nt[1]),
        m = Number(t[1])
  
      var dt = date.split("-")
      var dt0 = nowdate.split("-")
      var y = Number(dt[0]),
        y0 = Number(dt0[0])
      var mn = Number(dt[1]),
        mn0 = Number(dt0[1])
      var d = Number(dt[2]),
        d0 = Number(dt0[2])*/
      var today = new Date()
      today.setHours(0);
      today.setMinutes(0);
      today.setSeconds(0);
      today.setMilliseconds(0);
      var dmilisec = today.getTime() - dateBegin.getTime(); //时间差的毫秒数
      var dday = Math.floor(dmilisec / (24 * 3600 * 1000)); //计算出相差天数

      //非模糊模式（聊天
      if (!vaguetype) {
        if (dateDiff < 0) return f.tmp_showRealtime(showRealtime, realtime, '未来', dividechar)
        else if (dateDiff < 3600 * 1000) {
          //一小时以内
          if (dateDiff < 120 * 1000) return f.tmp_showRealtime(showRealtime, realtime, '刚刚', dividechar)
          else return f.tmp_showRealtime(showRealtime, realtime, minutes + "分钟前", dividechar)
        } else if (dateDiff < 3600 * 1000 * 5) {
          return f.tmp_showRealtime(showRealtime, realtime, hours + "小时" + minutes + "分钟前", dividechar) //5小时内
        } else if (dday < 2) { //48小时内
          var text = ''
          switch (dday) {
            case -1:
              text = '今天';
              break
            case 0:
              text = '昨天';
              break
            case 1:
              text = '前天';
              break
          }
          return f.tmp_showRealtime(showRealtime, realtime, text + ' ' + timemin, dividechar)
        } else {
          var wday = dateEnd.getDay() || 7; // 周日是0 改成7
          var Mon = new Date(dateEnd.getFullYear(), dateEnd.getMonth(), dateEnd.getDate() + 1 - wday).getTime();
          var lastMon = new Date(dateEnd.getFullYear(), dateEnd.getMonth(), dateEnd.getDate() + 1 - wday - 7).getTime();
          var mitime = dateBegin.getTime()
          if (mitime >= Mon) { //这周但超过了2天
            return f.tmp_showRealtime(showRealtime, realtime, f.getWeekDay(dateBegin.getDay()) + ' ' + timemin, dividechar)
          } else if (mitime >= lastMon) {
            return f.tmp_showRealtime(showRealtime, realtime, '上' + f.getWeekDay(dateBegin.getDay()) + ' ' + timemin, dividechar)
          } else return realtime
        }
        return '错误'
      }

      //模糊模式
      if (dateDiff < 0) return f.tmp_showRealtime(showRealtime, realtime, '未来', dividechar)
      else if (dateDiff < 3600 * 1000) {
        //一小时以内
        if (dateDiff < 120 * 1000) return f.tmp_showRealtime(showRealtime, realtime, '刚刚', dividechar)
        else return f.tmp_showRealtime(showRealtime, realtime, minutes + "分钟前", dividechar)
      } else if (dateDiff < 3600 * 1000 * 5) return f.tmp_showRealtime(showRealtime, realtime, hours + "小时" + minutes + "分钟前", dividechar) //5小时内
      else if (dday < 2) { //48小时内
        var text = ''
        /*var yesterday = (new Date()).setTime(dateEnd.getTime() - 24 * 60 * 60 * 1000);
        var yesterdaytext = this.formatTime(yesterday).split(" ")[0]
        yesterday.setHours(0);
        yesterday.setMinutes(0);
        yesterday.setSeconds(0);
        yesterday.setMilliseconds(0);*/
        switch (dday) {
          case -1:
            text = '今天';
            break
          case 0:
            text = '昨天';
            break
          case 1:
            text = '前天';
            break
        }
        return f.tmp_showRealtime(showRealtime, realtime, text + f.getTimeText(h), dividechar)
      } else {
        var wday = dateEnd.getDay() || 7; // 周日是0 改成7
        var Mon = new Date(dateEnd.getFullYear(), dateEnd.getMonth(), dateEnd.getDate() + 1 - wday).getTime();
        var lastMon = new Date(dateEnd.getFullYear(), dateEnd.getMonth(), dateEnd.getDate() + 1 - wday - 7).getTime();
        var mitime = dateBegin.getTime()
        if (mitime >= Mon) { //这周但超过了2天
          return f.tmp_showRealtime(showRealtime, realtime, f.getWeekDay(dateBegin.getDay()) + f.getTimeText(h), dividechar)
        } else if (mitime >= lastMon) {
          return f.tmp_showRealtime(showRealtime, realtime, '上' + f.getWeekDay(dateBegin.getDay()), dividechar)
        } else return realtime
      }
    },
    getTimeText(h) {
      var text = ''
      if (h >= 0 && h < 2) text = text + '午夜'
      else if (h >= 2 && h < 4) text = text + '凌晨'
      else if (h >= 4 && h < 6) text = text + '黎明'
      else if (h >= 6 && h < 8) text = text + '清晨'
      else if (h >= 8 && h < 11) text = text + '上午'
      else if (h >= 11 && h < 13) text = text + '中午'
      else if (h >= 13 && h < 16) text = text + '下午'
      else if (h >= 16 && h < 19) text = text + '傍晚'
      else if (h >= 19 && h < 22) text = text + '晚上'
      else if (h >= 22 && h < 24) text = text + '深夜'
      return text
    },
    getWeekDay(a) {
      switch (a) {
        case 0:
          return '周日'
        case 1:
          return '周一'
        case 2:
          return '周二'
        case 3:
          return '周三'
        case 4:
          return '周四'
        case 5:
          return '周五'
        case 6:
          return '周六'
        case 7:
          return '周日'
        default:
          return ''
      }
    },

  }





})