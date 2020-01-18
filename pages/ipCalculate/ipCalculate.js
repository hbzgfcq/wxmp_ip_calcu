var util = require('../../utils/util.js');

Page({

  data: {
    ipAddress: '',
    subnetMask: '',
    wildcastMask: '',
    networkID: '',
    hostID: '',
    theFirstIP: '',
    theLastIP: '',
    theBoardcastAddress: '',
    numOfIP: '',
    msg: '',
    isFocus: {
      inputIP: false,
      inputMask: false
    }
  },

  saveField: function(e) {
    var fn = e.currentTarget.dataset.fn;
    var fv = e.detail.value.replace(/\s*/g, "");
    this.data[fn] = fv;
  },

  onLoad: function(options) {

  },

  onReady: function() {

  },

  onShow: function() {

  },

  onHide: function() {

  },


  onUnload: function() {

  },

  onPullDownRefresh: function() {

  },

  onReachBottom: function() {

  },

  onShareAppMessage: function() { // 用户点击右上角分享

  },

  ipCalculate: function() {
    this.setData({
      wildcastMask: '',
      networkID: '',
      hostID: '',
      theFirstIP: '',
      theLastIP: '',
      theBoardcastAddress: '',
      numOfIP: '',
      msg: ''
    });
    var ip = new util.IP(this.data.ipAddress, this.data.subnetMask);
    if (ip.errID == 0) {
      this.setData({
        msg: "IP 地址错误",
        isFocus: {
          ipAddress: true,
          subnetMask: false
        }
      });
      return;
    }
    if (ip.errID == 1) {

      this.setData({
        msg: "子网掩码错误",
        isFocus: {
          ipAddress: false,
          subnetMask: true
        }
      });
      return;
    }
    this.setData({
      wildcastMask: ip.wildcardMask().join('.'),
      networkID: ip.networkID().join('.'),
      hostID: ip.hostID().join('.'),
      theFirstIP: ip.theFirstIP().join('.'),
      theLastIP: ip.theLastIP().join('.'),
      theBoardcastAddress: ip.theBoardcastAddress().join('.'),
      numOfIP: ip.numOfIP(),
      msg: ''
    });
  }
})