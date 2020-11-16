// miniprogram/pages/home/home.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    categories: [
      { title: '身份证', iconPath: '/assets/zhengjian.png' },
      { title: '银行卡', iconPath: '/assets/yhk.png' }
    ]
    // categoriyNames: []
  },

  pickValueChange(event) {
    const type = event.detail.value;
    wx.navigateTo({
      url: `/pages/study/study?type=${type}`,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.data.categoriyNames = this.data.categories.map(item => {
    //   return item.title
    // })
    // this.setData({
    //   categoriyNames: this.data.categoriyNames
    // })
  }
})