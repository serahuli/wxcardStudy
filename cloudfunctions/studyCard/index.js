// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  // 取出参数url
  const fileURL = event.fileURL;
  const type = event.type;
  // 使用腾讯云ai
  const { ImageClient } = require('image-node-sdk');

  let AppId = '1259026869'; // 腾讯云 AppId
  let SecretId = 'AKID70auznXeni2HL9n6sJVVFkTv728yfkjR'; // 腾讯云 SecretId
  let SecretKey = 'cyBPNODm6AyVllfIeKlwiDXaMrKXliOp'; // 腾讯云 SecretKey

  let imgClient = new ImageClient({ AppId, SecretId, SecretKey });
  let info;  // 返回的信息

  if(type == 0) {
    const result = await imgClient.ocrIdCard({
      data: {
        url_list: [fileURL]
      }
    })
    const idInfo = JSON.parse(result.body).result_list[0];
    let { code, data } = idInfo;
    switch(code) {
      case 0: info = data;
      break;
      case 15: info = "操作太频繁，请稍后再试";
      break;
      case 17: info = "没有图片或 url";
      break;
      case 203: info = "内部处理超时";
      break;
      case -1102: info = "图片解码失败";
      break;
      case -1308: info = "图片下载失败";
      break;
      case -5101: info = "照片为空";
      break;
      case -5103: info = "识别失败";
      break;
      case -5106: info = "身份证边框不完整";
      break;
      case -5107: info = "输入图片不是身份证";
      break;
      case -5108: info = "身份证信息不合规范";
      break;
      case -5109: info = "照片模糊";
      break;
      case -5806: info = "身份证号码或姓名格式错误";
      break;
      case -7001: info = "未检测到身份证，请对准边框(请避免拍摄时倾角和旋转角过大、摄像头)";
      break;
      case -7002: info = "请使用第二代身份证件进行扫描";
      break;
      case -7003: info = "不是身份证正面照片(请使用带证件照的一面进行扫描)";
      break;
      case -7005: info = "确保扫描证件图像清晰";
      break;
      case -7006: info = "请避开灯光直射在证件表面";
      break;
      case -9101: info = "身份证边框不完整";
      break;
      case -9100: info = "身份证日期不合法";
      break;
      default: info = "服务器繁忙，请稍后再试";
    }
  } else {
    const result = await imgClient.ocrBankCard({
      data: {
        appid: AppId,
        url: fileURL
      }
    })
    const bankCardInfo = JSON.parse(result.body);
    let { code, data } = bankCardInfo;
    switch(code) {
      case 0: info = data;
      break;
      case 15: info = "操作太频繁，请稍后再试";
      break;
      case 17: info = "没有图片";
      break;
      case 20: info = "图片过大，单个文件最大支持1MB";
      break;
      case 203: info = "内部处理超时";
      break;
      default: info = "解析失败，请重试";
      break;
    }
  }
  return info;
}