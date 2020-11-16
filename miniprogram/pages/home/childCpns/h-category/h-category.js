// pages/home/childCpns/w-category/w-category.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    categories: {
      type: Array
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
  },

  /**
   * 组件的方法列表
   */
  methods: {
    itemClick(event) {
      // 获取index
      const index = event.target.dataset.index;

      // 界面跳转
      wx.navigateTo({
        url: '/pages/cardLists/cardLists?type=' + index
      })
    }
  }
})
