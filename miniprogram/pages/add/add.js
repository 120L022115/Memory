/* 新增待办页面 */
var app = getApp()
var g = app.globalData
var f = app.f
import {
  dict
} from "../../data/dict";
import {
  searchWord
} from "../../data/query";
Page({
  // 保存编辑中待办的信息
  data: {
    Edit: false,
    //EditTargetClass: false,
    DEFAULTCLASSNAME: g.DEFAULTCLASSNAME,
    icons: [false].concat(g.DEFAULTICONS),
    colors: g.colors,
    split: g.set.split,
    classNameList: [],
    classname: '',
    index: 0,
    targetClassSelected: 0,
    colorChoosedId: 0,
    iconChoosedId: 0,
    NoteData: {}, 
    divcount: false,
    wordlist: [],
    wordChoose: 0,
    showAddModel: false,
    PutBottom: false
  },
  showNext() {
    var todo = this.data.NoteData
    var that = this
    var split = that.data.split
    var exp = new RegExp("\\" + split.l + ".*?\\" + split.r, 'g')
    todo.showcount++
    if (todo.showcount > todo.countmax) todo.showcount = 0
    todo.showtitle = todo.title
    var cm = 0;
    todo.showtitle = todo.title.replace(exp, (str) => {
      cm++;
      if (cm <= todo.showcount) return str;
      return str.replace(/.?/g, split.m);
    })
    todo.countmax = cm
    this.setData({
      NoteData: this.data.NoteData
    })
  },
  wordQuery(e){
    var id = e.currentTarget.id
    var that = this
    var thisclass = that.data.classNameList[that.data.classIdSelected]
    if(id == 'open'){
      var fun = ()=>{
        that.setData({
          showAddModel: true,
          wordlist: [],
          wordChoose: -1
        })
      }
      if(that.data.NoteData.title!=''){
        wx.showModal({
          title:'提示',
          content: '当前项目标题有内容，如果继续可能将覆盖，是否继续？',
          success(res){
            if(res.confirm)fun()
          }
        })
        return
      }
      fun()
      return
    }else if (id == 'cancel') {
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
      for(var i in data.tran){
        str += data.type[i].join(".,")+"." + that.data.split.l + data.tran[i] + that.data.split.r+" "
      }
      that.setData({
        'NoteData.title': str
      })
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
  updatePreView() {
    var arr = this.data.NoteData
    var split = this.data.split
    var exp = new RegExp("\\" + split.l + ".*?\\" + split.r, 'g')
    arr.showtitle = arr.title.replace(exp, (str) => {
      return str.replace(/.?/g, split.m)
    })
    arr.showcount = 0
    arr.realtime = f.transTimes(f.getTime(), true)
    this.setData({
      NoteData: this.data.NoteData
    })
    console.log(this.data.NoteData)
  },
  putInDiv(e){
    this.data.divcount = !this.data.divcount
    this.setData({
      'NoteData.title': this.data.NoteData.title+ (this.data.divcount?this.data.split.l:this.data.split.r)
    })
  },
  NoteInput(e) {
    var id = e.currentTarget.id
    this.setData({
      ['NoteData.' + id]: e.detail.value
    })

    this.updatePreView()
  },
  changeColor(e) {
    var id = e.currentTarget.id
    var index = e.currentTarget.dataset.index
    if (id == 'color')
      this.setData({
        colorChoosedId: index,
        'NoteData.color': this.data.colors[index]
      })
    else if (id == 'icon') this.setData({
      iconChoosedId: index,
      'NoteData.extStyleClass': this.data.icons[index]
    })
    this.updatePreView()
  },
  selectTargetClassBtn(e) {
    var d = e.detail.value
    this.setData({
      targetClassSelected: d,
      split: app.getSplit(this.data.classNameList[d])
    })
    this.updatePreView()
  },
  onLoad(options) {
    app = getApp()
    g = app.globalData
    f = app.f
    console.log(options)
    var that = this
    this.setData({
      Edit: options.edit == 'true',
      PutBottom: g.set.PutBottom,
      classname: options.classname,
      colors: [false].concat(g.colors),
      classNameList: app.ArrayTransToNameList(g.class[g.DEFAULTCLASSNAME])
    })
    if (this.data.Edit) {
      if (typeof g.tmp_editNoteData != 'object') {
        wx.showModal({
          showCancel: false,
          title: '错误',
          content: '内部错误',
          success(res) {
            wx.navigateBack({
              delta: 0,
            })
          }
        })
        return
      }
      wx.setNavigationBarTitle({
        title: '编辑项目',
      })
      this.setData({
        NoteData: g.tmp_editNoteData,
        index: Number(options.index),
      })
      var arr = that.data.colors
      var data = that.data.NoteData
      for(var i in arr){
        if(arr[i]==data.color){
          that.setData({
            colorChoosedId: i
          })
          break
        }
      }
      arr = that.data.icons
      for(var i in arr){
        if(data.extStyleClass)
        if(arr[i]==data.extStyleClass.replace(/slideIcon/g,'').replace(/iconfont/g,'').replace(/ /g,'')){
          that.setData({
            iconChoosedId: i
          })
          break
        }
      }
    } else {
      this.setData({
        NoteData: {
          title: '',
          tip: '',
          color: false,
          split: {}
        }
      })
      if (options.classname == g.DEFAULTCLASSNAME) {
        this.setData({
          'NoteData.split': JSON.parse(JSON.stringify(g.set.split))
        })
      }
    }
    this.setData({
      split: app.getSplit(options.classname)
    })
    for (var i in this.data.classNameList) {
      if (this.data.classNameList[i] == options.classname) {
        this.setData({
          targetClassSelected: i
        })
      }
    }

  },
  changeBottom(e){
    this.setData({
      PutBottom: !this.data.PutBottom
    })
  },
  showTip(e) {
    var that = this
    var id = e.currentTarget.id
    if (id == '分割标记') {
      wx.showModal({
        cancelText: '关闭',
        confirmText: '使用默认',
        title: '遮盖标记',
        content: '每个分类可以单独设置遮盖标记，用于像帮助中示例那样对文本进行遮盖，方便记忆。\n左：文本遮盖的起点\n中：文本遮盖被替换的字符\n右：文本遮盖的终点\n是否使用默认遮盖标记？',
        success(res){
          if(res.confirm){
            that.setData({
              'NoteData.split': JSON.parse(JSON.stringify(g.set.split))
            })
          }
        }
      })
    }else if(id=='顶部'){
      wx.showModal({
        showCancel:false,
        title: '提示',
        content: '默认添加到顶部'
      })
    }
  },
  /*
    // 上传新附件
    async addFile() {
      // 限制附件个数
      if (this.data.files.length + 1 > getApp().globalData.fileLimit) {
        wx.showToast({
          title: '数量达到上限',
          icon: 'error',
          duration: 2000
        })
        return
      }
      // 从会话选择文件
      wx.chooseMessageFile({
        count: 1
      }).then(res => {
        const file = res.tempFiles[0]
        // 上传文件至云存储
        getApp().uploadFile(file.name,file.path).then(res => {
          // 追加文件记录，保存其文件名、大小和文件 id
          this.data.files.push({
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2),
            id: res.fileID
          })
          // 更新文件显示
          this.setData({
            files: this.data.files,
            fileName: this.data.fileName + file.name + ' '
          })
        })
      })
    },
  */


  // 保存待办
  async saveTodo() {
    var that = this
    var thisclass = that.data.classNameList[that.data.targetClassSelected]
    // 对输入框内容进行校验
    if (this.data.NoteData.title === '') {
      wx.showToast({
        title: '项目标题未填写',
        icon: 'error',
        duration: 2000
      })
      return
    }
    var data = this.data.NoteData
    console.log(data)
    data.time = f.getTime()
    delete data.realtime
    delete data.showtitle
    delete data.showcount
    delete data.countmax
    if(thisclass!=g.DEFAULTCLASSNAME){
      delete data.split
    }else{
      if(data.split){
        if(data.split.l===''){
          wx.showToast({
            title: '遮盖标记未填写',
            icon: 'error',
            duration: 2000
          })
          return
        }else if(data.split.m===''){
          wx.showToast({
            title: '遮盖标记未填写',
            icon: 'error',
            duration: 2000
          })
          return
        }else if(data.split.r===''){
          wx.showToast({
            title: '遮盖标记未填写',
            icon: 'error',
            duration: 2000
          })
          return
        }
      }else{
        wx.showToast({
          title: '遮盖标记未填写',
          icon: 'error',
          duration: 2000
        })
        return
      }
    }
    if(data.extStyleClass) data.extStyleClass = 'slideIcon iconfont '+data.extStyleClass.replace(/slideIcon/g,'').replace(/iconfont/g,'').replace(/ /g,'')
    data.showtitle = data.title
    data.showcount = -1
    var suc
    if(that.data.Edit){
      g.class[that.data.classname][that.data.index] = data
      app.saveClass({
        name: that.data.classname,
        data: g.class[that.data.classname]
      })
      suc = true
    }else{
      suc = app.addNote({
        classname: thisclass,
        ORALDATA: data,
        bottom: that.data.PutBottom
      })
    }
    if(suc) wx.navigateBack({
      delta: 0,
    })
  },

})