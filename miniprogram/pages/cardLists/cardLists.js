// pages/cardLists/cardLists.js
const LIMIT = 10;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: 0,
    page: 0,
    lists: []
  },

  queryDataFromDB() {
    const collectionName = this.data.type == 0 ? 'idcards' : 'bankCards';
    wx.cloud
    .database()
    .collection(collectionName)
    .skip(this.data.page * LIMIT)
    .limit(LIMIT)
    .get()
    .then(res => {
      // 页码 + 1
      this.setData({
        page: this.data.page + 1
      })
      console.log(res)
      // 将最新的数据追加到页面最后
      let oldList = this.data.lists;
      oldList.push(...res.data)
      this.setData({ lists: oldList })
    })
  },

  copyClick(event) {
    const index = event.currentTarget.dataset.index;
    wx.setClipboardData({
      data: this.data.lists[index].id,
      success: () => {
        wx.showToast({
          title: '复制成功'
        })
      }
    })
  },

  deleteClick(event) {
    const index = event.currentTarget.dataset.index;
    const _id = this.data.lists[index]._id
    wx
      .cloud
      .database()
      .collection('idcards')
      .doc(_id)
      .remove()
      .then(() => {
        wx.showToast({
          title: '删除成功'
        })
        this.setData({
          lists: []
        })
        this.queryDataFromDB()
      })
  },

  onLoad: function (options) {
    // 获取参数
    this.setData({
      type: options.type
    })
    // 查询数据
    this.queryDataFromDB()
  }
})