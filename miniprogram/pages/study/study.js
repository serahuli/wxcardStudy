const collection = wx.cloud.database().collection('idcards');
const _collection = wx.cloud.database().collection('bankCards');
// pages/study/study.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: 0,
    categories: ['身份证', '银行卡'],
    idInfo: null,
    bankCardInfo: null,
    filePath: ''
  },

  selectClick() {
    // 用户选择
    wx.chooseImage({
      count: 1,
      success: res => {
        const filePath = res.tempFilePaths[0];
        wx.showLoading({
          title: this.data.categories[this.data.type] + '识别中'
        })
        // 上传云存储
        this.setData({ filePath })
        this.uploadFileToCloud(filePath)

      },
      complete: (res) => {},
    })
  },

  // ========== 上传到云存储 ==========
  uploadFileToCloud(filePath) {
    const timestamp = new Date().getTime();
    wx.cloud.uploadFile({
      filePath,
      cloudPath: `images/${timestamp}.jpg`
    })
      .then(res => {
        const fileID = res.fileID;
        // 根据 fileID 换取临时 url
        this.getTempURL(fileID)
      })
  },

  // ========== 换取临时URL ==========
  getTempURL(fileID) {
    wx.cloud.getTempFileURL({
      fileList: [fileID]
    }).then(res => {
      console.log(res);
      const fileURL = res.fileList[0].tempFileURL;
      // 识别URL
      this.studyImageURL(fileURL, fileID)
    }).catch(() => {
      wx.showToast({
        title: '换取URL失败',
        icon: 'none'
      })
    })
  },

  // ========== 识别URL =============
  studyImageURL(fileURL, fileID) {
    wx.cloud.callFunction({
      name: 'studyCard',
      data: {
        fileURL,
        type: this.data.type
      }
    }).then(res => {
      res = res.result;
      // if(this.data.type == 0) {
      //   this.handleIDInfo(res)
      // } else {
      //   this.handleBankInfo(res)
      // }
      this.data.type == 0 ? this.handleIDInfo(res, fileID) : this.handleBankInfo(res, fileID)
    })
  },

  saveClick() {
    wx.showLoading({
      title: '保存信息中'
    })

    if(this.data.type == 0) {
      // 查询是否包含了该信息
      collection.where({
        id: this.data.idInfo.id
      })
        .get()
        .then(res => {
          if(res.data.length > 0) {
            const _id = res.data[0]._id
            const fileID = res.data[0].fileID
            this.deleteImage(fileID)
            this.updateInfo(_id)
          } else {
            this.saveInfo()
          }
      })
    } else {
      _collection.where({
        cardID: this.data.bankCardInfo.cardID
      })
        .get()
        .then(res => {
          if(res.data.length > 0) {
            const _id = res.data[0]._id
            const fileID = res.data[0].fileID
            this.deleteImage(fileID)
            this.updateInfo(_id)
          } else {
            this.saveInfo()
          }
      })
    }

  },

  deleteImage(fileID) {
    wx.cloud.deleteFile({
      fileList: [fileID]
    })
  },

  updateInfo(_id) {
    this.uploadFileToCloud(this.data.filePath)
    collection.doc(_id).set({
      data: this.data.idInfo
    }).then(() => {
      wx.showToast({
        title: '信息更新成功'
      })
    })
  },

  // ========= 保存信息 =======
  saveInfo() {
    if(this.data.type == 0) {
      collection.add({
        data: this.data.idInfo
      }).then(() => {
        wx.showToast({
          title: '信息保存成功'
        })
      })
    } else {
      _collection.add({
        data: this.data.bankCardInfo
      }).then( () => {
        wx.showToast({
          title: '信息保存成功'
        })
      })
    }
  },

  copyClick() {
    if(this.data.type == 0) {
      wx.setClipboardData({
        data: this.data.idInfo.id
      })
    } else {
      wx.setClipboardData({
        data: this.data.bankCardInfo.cardID
      })
    }
  },

  // ========= 有则删除保存，无则保存 ========
  deleteOrSave () {

  },

  // ======== 身份证 ========
  handleIDInfo(res, fileID) {
    if(typeof res === 'object') {
      // 拿到正常信息
      const idInfo = {
        id: res.id,
        address: res.address,
        birth: res.birth,
        name: res.name,
        nation: res.nation,
        sex: res.sex,
        fileID: fileID
      }
      // 放置到小程序
      this.setData({
        idInfo
      })
      wx.hideLoading();
    } else {
      wx.showToast({
        title: res,
        icon: 'none'
      })
      wx.hideLoading();
    }
  },

  // ======== 银行卡 =======
  handleBankInfo(res, fileID) {
    res = res.items;
    if(res.length) {
      let bankCardInfo = [];
      // 拿到正常信息
      for(let item of res) {
        // bankCardInfo.push(`${item.item}: ${item.itemstring}`);
        bankCardInfo.push({
          item: `${item.item}`,
          itemstring: `${item.itemstring}`
        })
      }
      let _bankCardInfo = {}
      bankCardInfo.forEach(v => {
        switch (v.item) {
          case '卡号': v.name = 'cardID';
          break;
          case '卡类型': v.name = 'cardType';
          break;
          case '卡名字': v.name = 'cardName';
          break;
          case '银行信息': v.name = 'cardInfo';
          break;
          case '有效期': v.name = 'cardDate';
          break;
        }
      })
      bankCardInfo.map( item => {
        _bankCardInfo[item.name] = item.itemstring
        _bankCardInfo.fileID = fileID
      })
      // 放置到小程序
      this.setData({
        bankCardInfo: _bankCardInfo
      })
      wx.hideLoading();
    } else {
      wx.showToast({
        title: res,
        icon: 'none'
      })
      wx.hideLoading();
    }
  },

  onLoad: function (options) {
    this.setData({ type: options.type })
  }
})