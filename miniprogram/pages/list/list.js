/* 首页 */
var app = getApp()
var g = app.globalData
var f = app.f
import {
  examarr
} from '../../data/exampleclass.js'
var normalSlideButton = [{
  //type: 'warn',
  extClass: 'slidebtn iconfont icon-bianji starBtn',
  text: '',
  //src: '../../images/list/star.png'
}, {
  type: 'warn',
  extClass: 'slidebtn iconfont icon-shanchu delbtn',
  text: "",
  //src: '../../images/list/trash.png'
}]
var editSlideButton = []
import {
  dict
} from "../../data/dict";
import {
  searchWord
} from "../../data/query";
Page({
  // 存储请求结果
  data: {
    goExAdd: false,
    onEdit: false,
    onEditColor: false,
    onEditMove: false,
    MoveOption: 0,
    MoveOptionText: ['调整顺序', '置顶置底', '删除', '移动到分类', '复制到分类', '', '', '更新时间戳'],
    wordlist: [],
    wordChoose: 0,
    showTime: true,
    showTip: true,
    showAddModel: false,
    colors: g.colors,
    colorChoosedId: 0,
    targetClassSelected: 0,
    classIdSelected: 0,
    classColor: false,
    classNameList: ["管理分类"],
    class: {},
    split: g.set.split,
    slideButtons: normalSlideButton
  },
  showHelp(e) {
    var id = e.currentTarget.id
    var that = this
    var thisclass = that.data.classNameList[that.data.classIdSelected]
    if (id == 'help') {
      if(thisclass == g.DEFAULTCLASSNAME){
        wx.showModal({
          title: '导入失败',
          content: '不能在当前分类导入',
          showCancel:false
        })
        return
      }
      if (e.type == 'tap') {
        wx.showModal({
          title: '导入帮助',
          content: '帮助需要一个分类进行展示，是否要导入帮助至此分类？',
          success(res) {
            if (res.confirm) {
              app.importHelp(thisclass)
              that.updateNoteArea(false)
            }
          }
        })
      } else {
        wx.showModal({
          title: '导入示例',
          content: '示例需要一个分类进行展示，是否要导入示例至此分类？',
          success(res) {
            if (res.confirm) {
              wx.showToast({
                title: '导入' + app.importFromArr(thisclass, examarr) + "条",
                success(Res){
                  that.updateNoteArea(false)
                }
              })
            }
          }
        })
      }
    }else if(id=='import'){
      if(thisclass == g.DEFAULTCLASSNAME){
        wx.showModal({
          title: '导入失败',
          content: '不能在当前分类导入',
          showCancel:false
        })
        return
      }
      wx.showModal({
        title: '导入数据',
        content: '是否要导入至此分类？',
        confirmText: '输入数据',
        success(res) {
          if (res.confirm) {
            wx.showModal({
              title: '导入数据',
              editable: true,
              placeholderText:'输入需要导入的数据',
              confirmText: '开始导入',
              success(r){
                if(r.confirm){
                  wx.showLoading({
                    title: '正在导入',
                    success(res){
                      var su = app.transFromApp(r.content)
                      su = app.importFromArr(thisclass, su.arr)
                      wx.showToast({
                        title: '导入'+su+'条',
                      })
                      that.updateNoteArea(false)
                    }
                  })
                  
                }
              }
            })
          }
        }
      })
    }else if(id=='export'){
      if(thisclass == g.DEFAULTCLASSNAME){
        wx.showModal({
          title: '导出失败',
          content: '不能导出当前分类',
          showCancel:false
        })
        return
      }
      wx.showModal({
        title: '导出数据',
        content: '是否要导出此分类？\n导出只能导出标题、提示和时间\n导出后需要复制导出的文本',
        confirmText: '导出本类',
        success(res) {
          if (res.confirm) {
            wx.showLoading({
              title: '正在导出',
              success(res){
                var su = app.exportClass(thisclass)
                wx.hideLoading({
                  success: (res) => {},
                })
                wx.showModal({
                  title: '导出数据',
                  content: '导出完成，您可以点击复制',
                  confirmText: '复制',
                  success(r){
                    if(r.confirm){
                      wx.setClipboardData({
                        data: su,
                        tip: '数据已复制'
                      })
                      
                    }
                  }
                })
              }
            })

            
          }
        }
      })
    }
  },
  wordQuery(e) {
    var id = e.currentTarget.id
    var that = this
    var thisclass = that.data.classNameList[that.data.classIdSelected]
    if (id == 'cancel') {
      this.setData({
        showAddModel: false
      })
    } else if (id == 'apply') {
      if (that.data.wordChoose == -1) {
        wx.showModal({
          title: '提示',
          content: '请选择一个单词',
          showCancel: false
        })
        return
      }
      var data = that.data.wordlist[that.data.wordChoose]
      console.log('DATA', data)
      //if (data.length == 0) data = ''
      var str = data.word + ' '
      for (var i in data.tran) {
        str += data.type[i].join(".,") + "." + that.data.split.l + data.tran[i] + that.data.split.r + " "
      }
      app.addNote({
        classname: thisclass,
        title: str,
        tip: ""
      })
      that.updateNoteArea(false)
      that.setData({
        showAddModel: false,
        wordlist: [],
        wordChoose: -1
      })
    } else if (id == 'input') {
      var wd = e.detail.value
      var arr = searchWord(dict, wd)
      that.setData({
        wordlist: arr,
        wordChoose: -1
      })
    } else if (id == 'choose') {
      that.setData({
        wordChoose: e.currentTarget.dataset.index
      })
    }
  },
  changeShowTip(e) {
    this.setData({
      showTip: !this.data.showTip
    })
    wx.setStorage({
      key: 'SETTIP',
      data: this.data.showTip
    })
  },
  changeShowTime(e) {
    this.setData({
      showTime: !this.data.showTime
    })
    wx.setStorage({
      key: 'SETTIME',
      data: this.data.showTime
    })
  },
  changeColor(e) {
    this.setData({
      colorChoosedId: e.currentTarget.dataset.index
    })
  },
  changeMoveOption(e) {
    var index = Number(e.currentTarget.dataset.index)
    var thisclass = this.data.classNameList[this.data.classIdSelected]
    var that = this
    if (index == 5 || index == 6) {

      wx.showModal({
        title: '对列表排序',
        content: index == 5 ? '是否按字母顺序排序？' : '是否按时间顺序排序？',
        confirmText: '排序',
        success(res) {
          if (res.confirm) {
            if (index == 5) {
              f.sort(g.class[thisclass], 'title', false, false, 'time')
            } else f.sort(g.class[thisclass], 'time', false, false, 'title')
            that.updateNoteArea(false)
          }
        }
      })
    } else {
      this.setData({
        MoveOption: index,
        showTime: index == 7 ? true : that.data.showTime,
      })
    }
  },
  onLoad(e) {
    app = getApp()
    g = app.globalData
    f = app.f
    var that = this
    
    wx.getStorage({
      key: 'SETTIME',
      success(res) {
        that.setData({
          showTime: res.data
        })
      }
    })
    wx.getStorage({
      key: 'SETTIP',
      success(res) {
        that.setData({
          showTip: res.data
        })
      }
    })

    app.LoadClass(() => {
      console.log(g.class)
      /*this.setData({
        classNameList: app.ArrayTransToNameList(g.class[g.DEFAULTCLASSNAME]),
      })
      for (var i in that.data.classNameList) {
        if (that.data.classNameList[i] == g.DEFAULTCLASSNAME) {
          that.setData({
            classIdSelected: i
          })
        }
      }*/
      that.updateNoteArea()

    })
  },
  onShow() {
    var that = this
    if (that.data.goExAdd) {
      that.data.goExAdd = false
      this.updateNoteArea(that.data.classNameList[that.data.classIdSelected] == g.DEFAULTCLASSNAME)
    }
    /*setTimeout(() => {
      wx.navigateTo({
        url: '../mine/mine',
      })  
    }, 500);
    */

    /*
    // 通过云函数调用获取用户 _openId
    //getApp().getOpenId()
    // 根据 _openId 数据，查询并展示待办列表
    const db = getApp().db()
    db.collection(getApp().globalData.collection).where({
      _openid: openid
    }).get().then(res => {
      const {
        data
      } = res
      // 存储查询到的数据
      this.setData({
        // data 为查询到的所有待办事项列表
        todos: data,
        // 通过 filter 函数，将待办事项分为未完成和已完成两部分
        pending: data.filter(todo => todo.freq === 0),
        finished: data.filter(todo => todo.freq === 1)
      })
    })
    */
  },
  goEditClass(e) { //去管理分类
    if (this.data.onEdit) return
    wx.showLoading({
      title: '加载中',
    })
    for (var i in this.data.classNameList) {
      if (this.data.classNameList[i] == g.DEFAULTCLASSNAME) {
        this.setData({
          classIdSelected: i
        })
      }
    }
    this.updateNoteArea()
  },
  updateNoteArea(refresh, showall, time) {
    var that = this
    var thisclass = this.data.classNameList[this.data.classIdSelected]
    if (typeof refresh != 'boolean') refresh = true
    if (typeof showall != 'boolean') showall = false
    if (typeof time != 'boolean') time = true
    console.log('UPDATE', refresh)
    if (refresh) {
      //重置显示文本
      wx.showLoading({
        title: '加载中',
      })
      if (thisclass == g.DEFAULTCLASSNAME) {
        that.data.classNameList = app.ArrayTransToNameList(g.class[g.DEFAULTCLASSNAME])

        for (var i in that.data.classNameList)
          if (that.data.classNameList[i] == g.DEFAULTCLASSNAME) this.setData({
            classIdSelected: i,
            classNameList: that.data.classNameList
          })
      }
      this.setData({
        DEFAULTCLASSNAME: g.DEFAULTCLASSNAME,
        DELETECLASSNAME: g.DELETECLASSNAME,
        split: app.getSplit(thisclass),
        classColor: app.getClassColor(thisclass)
      })

      var arr = g.class[thisclass]
      var split = that.data.split
      var exp = new RegExp("\\" + split.l + ".*?\\" + split.r, 'g')
      for (var i in arr) {
        if (thisclass == g.DEFAULTCLASSNAME || showall) {
          arr[i].showtitle = arr[i].title
          arr[i].showcount = -1
        } else {
          arr[i].showtitle = arr[i].title.replace(exp, (str) => {
            return str.replace(/.?/g, split.m)
          })
          arr[i].showcount = 0
        }
      }
      wx.hideLoading({
        success: (res) => {},
      })
    }

    if (time) {
      var arr = g.class[thisclass]
      for (var i in arr) {
        arr[i].realtime = f.transTimes(arr[i].time, true)
      }
    }
    this.setData({
      colors: g.colors,
      class: g.class,
    })
    
  },
  selectTargetClassBtn(e) {
    var d = e.detail.value
    this.setData({
      targetClassSelected: d
    })
  },
  selectClassBtn(e) {
    console.log(e)
    var d = e.detail.value
    wx.showLoading({
      title: '加载中',
    })
    this.setData({
      classIdSelected: d
    })
    this.updateNoteArea()
  },
  goAddEdit(edit, classname, index) {
    var that = this
    that.data.goExAdd = true
    if (edit) {
      g.tmp_editNoteData = g.class[classname][index]
      wx.navigateTo({
        url: '../add/add?edit=' + edit + '&classname=' + classname + "&index=" + index,
      })
    } else {
      wx.navigateTo({
        url: '../add/add?edit=' + edit + '&classname=' + classname,
      })
    }

  },
  addNoteBtn(e) {
    var that = this
    var thisClassName = that.data.classNameList[that.data.classIdSelected];
    if (that.data.onEdit) {
      app.saveClass({
        name: thisClassName,
        data: g.class[thisClassName]
      })
      that.setData({
        onEdit: false,
        onEditColor: false,
        onEditMove: false,
        slideButtons: normalSlideButton
      })
    } else {
      this.goAddEdit(false, thisClassName)
    }
  },
  addNoteBtnQuick(e) { //无输入解释快速添加
    var that = this
    var thisClassName = that.data.classNameList[that.data.classIdSelected];
    if (that.data.onEdit) {

    } else {
      if (thisClassName == g.DEFAULTCLASSNAME) {
        wx.showModal({
          editable: true,
          title: '快速添加分类',
          content: '',
          placeholderText: '输入分类名称',
          success(res) {
            /**/
            if (res.confirm) {
              app.addNote({
                classname: thisClassName,
                title: res.content,
                tip: "用户快速添加的分类"
              })
              that.updateNoteArea(true)
            }
          }
        })

      } else {
        this.setData({
          showAddModel: true,
          wordlist: [],
          wordChoose: -1
        })
        /*
        wx.showModal({
          editable: true,
          title: '从词典快速添加',
          content: '',
          placeholderText: '输入',
          success(res) {
            if (res.confirm) {
              var data = searchWord(dict, res.content, 1)
              console.log('DATA', data)
              if (data.length == 0) data = ''
              else data = data[0].word + ' ' + data[0].type[0] + "." + that.data.split.l + data[0].tran + that.data.split.r
              app.addNote({
                classname: thisClassName,
                title: data,
                tip: ""
              })
              that.updateNoteArea(false)
            }
          }
        })*/
      }

    }

  },
  goMoveMode(e) {
    this.setData({
      onEdit: true,
      onEditMove: true,
      //slideButtons: editSlideButton
    })
  },
  goStarMode(e) {
    this.setData({
      onEdit: true,
      onEditColor: true,
      // slideButtons: editSlideButton
    })
  },
  updownNoteBtn(end, classname, id, up) {
    if (end) {
      app.updownEndNote({
        classname: classname,
        id: id,
        up: up
      })
    } else {
      app.updownNote({
        classname: classname,
        id: id,
        up: up
      })
    }
    this.updateNoteArea(false)
  },
  dealMoveOption(e) {
    var thisclass = this.data.classNameList[this.data.classIdSelected]
    var index = e.currentTarget.dataset.index
    var that = this
    console.log(e, this.data)
    if (!this.data.onEditMove) return
    var opt = this.data.MoveOption
    if (opt == 2) { //删除
      this.delNote(thisclass, index)
    } else if (opt == 0) {
      //上下移动
      this.updownNoteBtn(false, thisclass, index, e.currentTarget.dataset.up)
    } else if (opt == 1) {
      //上下移动到顶
      this.updownNoteBtn(true, thisclass, index, e.currentTarget.dataset.up)
    } else if (opt == 3) {
      //剪切
      var tar = that.data.classNameList[that.data.targetClassSelected]
      var t = app.cutcopyNote({
        classname: thisclass,
        arrayid: index,
        targetclass: tar,
        copy: false
      })
      if (t != true) {
        wx.showModal({
          title: '移动失败',
          content: t,
          showCancel: false
        })
      } else {
        wx.showToast({
          title: '移动成功',
        })
      }
      this.updateNoteArea(false)

    } else if (opt == 4) {
      //复制
      var tar = that.data.classNameList[that.data.targetClassSelected]
      var t = app.cutcopyNote({
        classname: thisclass,
        arrayid: index,
        targetclass: tar,
        copy: true
      })
      if (t != true) {
        wx.showModal({
          title: '复制失败',
          content: t,
          showCancel: false
        })
      } else {
        wx.showToast({
          title: '复制成功',
        })
      }
      this.updateNoteArea(false)

    } else if (opt == 7) {
      app.changeIdNote({
        classname: thisclass,
        id: index,
        target: 'time',
        data: f.getTime()
      })
      this.updateNoteArea(false)
    }
  },
  delNote(classname, id) {
    var delfun = () => {
      var t = app.delNote({
        classname: classname,
        arrayid: id
      })
      if (t != true) {
        wx.showModal({
          title: '删除失败',
          content: t,
          showCancel: false
        })
      } else {
        if (classname == g.DELETECLASSNAME) wx.showToast({
          title: '已彻底删除',
        })
        else wx.showToast({
          title: '移动到已删除',
        })
      }
      this.updateNoteArea(classname == g.DEFAULTCLASSNAME)
    }
    var thisclass = classname
    if (thisclass == g.DEFAULTCLASSNAME) {
      wx.showModal({
        title: '删除分类',
        content: '确实要删除分类"' + g.class[thisclass][id].title + '"吗？\n删除分类后里面的内容将会被彻底删除',
        success(res) {
          if (res.confirm) {
            delfun()
          }
        }
      })
    } else delfun()
  },
  goRefresh(e) {
    this.updateNoteArea(true, e.currentTarget.dataset.show)
  },
  // 响应左划按钮事件
  async slideButtonTap(e) {
    // 得到触发事件的待办序号
    if (this.data.onEdit) {
      wx.showModal({
        title: '操作不可用',
        content: '当前正在进行编辑，暂不可操作。请退出编辑后再试。',
        showCancel: false
      })
      return
    }
    console.log(e)
    const {
      index
    } = e.detail
    // 根据序号获得待办对象
    var that = this
    var thisclass = this.data.classNameList[this.data.classIdSelected]
    const todoIndex = e.currentTarget.dataset.index
    const todo = this.data.class[thisclass][todoIndex]
    console.log(index, todo)
    if (index == 0) { //编辑

      this.goAddEdit(true, thisclass, todoIndex)
    } else if (index == 1) { //删除
      this.delNote(thisclass, todoIndex)
    }


    return
    //const db = await getApp().database()
    // 处理星标按钮点击事件
    if (index === 0) {
      // 根据待办的 _id 找到并反转星标标识
      /*db.collection(getApp().globalData.collection).where({
        _id: todo._id
      }).update({
        data: {
          star: !todo.star
        }
      })*/
      // 更新本地数据，触发显示更新
      todo.star = !todo.star
      this.setData({
        pending: this.data.pending
      })
    }
    // 处理删除按钮点击事件
    if (index === 1) {
      // 根据待办的 _id 找到并删除待办记录
      /*db.collection(getApp().globalData.collection).where({
        _id: todo._id
      }).remove()*/
      // 更新本地数据，快速更新显示
      this.data.pending.splice(todoIndex, 1)
      this.setData({
        pending: this.data.pending
      })
      // 如果删除完所有事项，刷新数据，让页面显示无事项图片
      if (this.data.pending.length === 0 && this.data.finished.length === 0) {
        this.setData({
          todos: [],
          pending: [],
          finished: []
        })
      }
    }
  },

  // 点击左侧单选框时，切换待办状态
  colorNote(e) {
    const thisclass = this.data.classNameList[this.data.classIdSelected]
    const todoIndex = e.currentTarget.dataset.index
    const todo = this.data.class[thisclass][todoIndex]
    console.log("TAP", e, todo, todoIndex)
    var that = this
    if (that.data.onEdit && that.data.onEditColor) {
      var targetcolor = that.data.colors[that.data.colorChoosedId]
      if (g.class[thisclass][todoIndex].color == targetcolor) targetcolor = false
      app.changeIdNote({
        classname: thisclass,
        id: todoIndex,
        target: 'color',
        data: targetcolor
      })
      this.updateNoteArea(thisclass == g.DEFAULTCLASSNAME) //如果是管理分类就强制刷新颜色，如果不是则用简单刷新
    }
  },


  /*
  // 跳转响应函数
  toFileList(e) {
    const todoIndex = e.currentTarget.dataset.index
    const todo = this.data.pending[todoIndex]
    wx.navigateTo({
      url: '../file/index?id=' + todo._id,
    })
  },
*/
  toDetailPage(e) {
    const thisclass = this.data.classNameList[this.data.classIdSelected]
    const todoIndex = e.currentTarget.dataset.index
    var todo = g.class[thisclass][todoIndex]
    console.log("TAP", e, todo, todoIndex)
    var that = this
    /*if(that.data.onEdit){
      app.changeIdNote({
        classname: thisclass,
        id: todoIndex,
        target: 'color',
        data: that.data.colors[that.data.colorChoosedId]
      })
    }else*/
    {
      if (thisclass == g.DEFAULTCLASSNAME) {
        if (that.data.onEdit) return
        //进入分类
        wx.showLoading({
          title: '加载中',
        })
        for (var i in this.data.classNameList) {
          if (this.data.classNameList[i] == todo.title) {
            this.setData({
              classIdSelected: i
            })
            this.updateNoteArea()
          }
        }
        return
      } else {
        //下一个显示
        var split = that.data.split
        var exp = new RegExp("\\" + split.l + ".*?\\" + split.r, 'g')
        todo.showcount++
        if (todo.showcount > todo.countmax) todo.showcount = 0
        //console.log('MATCH',m,todo.showcount)
        todo.showtitle = todo.title
        //console.log(todo.showtitle)
        var cm = 0;
        todo.showtitle = todo.title.replace(exp, (str) => {
          cm++;
          if (cm <= todo.showcount) return str;
          return str.replace(/.?/g, split.m);
        })
        todo.countmax = cm

        console.log(todo.showcount, todo.showtitle)
        this.updateNoteArea(false)
      }
    }
  },
  goPage(e) {
    var id = e.currentTarget.id
    if (id == 'ziliaoku') {
      wx.showModal({
        title: '资料库',
        content: '资料库正在建设中',
        showCancel: false
      })
    } else if (id == 'wode') {
      wx.navigateTo({
        url: '../mine/mine',
      })  
      /*
      wx.showModal({
        title: '我的',
        content: '我的正在建设中',
        showCancel: false
      })*/
    }
  },
  toAddPage() {
    wx.navigateTo({
      url: '../../pages/add/index',
    })
  }
})