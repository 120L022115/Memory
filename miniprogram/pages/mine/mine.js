// pages/mine.js
var app = getApp()
var g = app.globalData
var f = app.f
Page({

  /**
   * 页面的初始数据
   */
  data: {
    VERSION: g.VERSION,
    funsLiked: {}
  },
  likeFun(e) {
    var id = e.currentTarget.dataset.id
    var that = this
    if (that.data.funsLiked[id]) {
      return
    }
    var c = wx.cloud.database().command
    wx.showLoading({
      title: '点赞',
    })
    wx.cloud.database().collection("AppSet").doc('default').update({
      data: {
        ['likefun.' + id]: c.addToSet(g.openid)
      },
      success(res) {
        wx.hideLoading({
          success: (res) => {},
        })
        console.log(res)
        g.appset.likefun[id].push(g.openid)
        that.setData({
          appset: g.appset,
          ['funsLiked.' + id]: true
        })

      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app = getApp()
    g = app.globalData
    f = app.f
    this.setData({
      OPENID: g.openid
    })
    this.getCloudSet()
  },
  UpdateLiked(){
    var that = this
    g.appset.funs = Object.keys(g.appset.likefun)
    var obj = {},arr = g.appset.funs,data = g.appset.likefun
    for(var i in arr){
      for(var j in data[arr[i]]){
        if(data[arr[i]][j]==g.openid){
          obj[arr[i]] = true
          break
        }
      }
    }
    that.setData({
      appset: g.appset,
      funsLiked: obj
    })
  },
  getCloudSet(e) {
    var that = this
    if (!g.appset) {
      wx.showLoading({
        title: '加载中...',
      })
      wx.cloud.database().collection("AppSet").doc('default').get({
        success(res) {
          wx.hideLoading({
            success: (res) => {},
          })
          console.log(res)
          g.appset = res.data
          that.UpdateLiked()
        }
      })
    } else {
      that.UpdateLiked()
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})