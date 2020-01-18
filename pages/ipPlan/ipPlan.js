var util = require('../../utils/util.js');

function hbs(n) { // 已知IP地址数求主机号位数
  var i = 0;
  while (n > Math.pow(2, i) - 2) {
    i = i + 1;
  }
  return i;
}

function hostBitsToMask(hbs) { // 已知主机号位数求子网掩码
  if (hbs > 31) return null;
  var mask = [0, 0, 0, 0];
  var j = 4;
  var weight = 1;
  for (var i = 1; i <= hbs; i++) {
    if (i % 8 == 1) {
      j--;
      weight = 1;
    }
    mask[j] = mask[j] + weight;
    weight = weight * 2;
  }
  for (var i = 0; i < 4; i++) {
    mask[i] = 255 - mask[i];
  }
  return mask;
}

Page({

  data: {
    netID: '',
    subnetMask: '',
    newDepartment: '',
    departments: [],
    isFocus: {
      netID: false,
      subnetMask: false,
      department: false
    }
  },

  ips_in_dpts: function(dpts) {
    var ips = 0;
    for (var i = 0; i < dpts.length; i++) {
      ips = ips + Math.pow(2, dpts[i].hostBits);
    }
    return ips;
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

  onShareAppMessage: function() {

  },

  addDepartment: function(e) {

    var dpts = this.data.departments;
    var newDepartment = this.data.newDepartment;

    var ip = new util.IP(this.data.netID, this.data.subnetMask);
    ip.ip = ip.networkID();


    if (ip.errID == 0) { // check input
      this.setData({
        msg: "网络地址错误",
        isFocus: {
          netID: true,
          subnetMask: false,
          department: false
        }
      });
      return;
    }
    if (ip.errID == 1) {
      this.setData({
        msg: "子网掩码错误",
        isFocus: {
          netID: false,
          subnetMask: true,
          department: false
        }
      });
      return;
    }

    var temp = newDepartment.split("/"); // add department and the number of ip
    var regInteger = /^[1-9]\d*$/;
    if (!(regInteger.test(temp[1]))) {
      this.setData({
        msg: "请输入部门名和IP地址数并用 / 分开",
        isFocus: {
          netID: false,
          subnetMask: false,
          department: true
        }
      });
      return;
    }

    var obj = {
      departmentName: temp[0],
      numOfHosts: temp[1],
      netID: '',
      hostBits: hbs(temp[1]),
    }


    if (ip.numOfIP() < Math.pow(2, obj.hostBits) + this.ips_in_dpts(dpts)) {
      this.setData({
        msg: "IP地址数太大",
        isFocus: {
          netID: false,
          subnetMask: false,
          department: true
        }
      })
      return;
    }

    dpts.push(obj);
    this.setData({
      departments: dpts,
      newDepartment: '', // clear newDepartment
      msg: ''
    });
  },

  removeDepartment: function(e) {
    var index = e.currentTarget.dataset.index;
    var temp = this.data.departments;
    temp.splice(index, 1);
    for (var i = 0; i < temp.length; i++) {
      temp[i].netID = '';
    }
    this.setData({
      departments: temp
    });
  },

  ipPlanning: function(e) {

    var dpts = this.data.departments;
    var compare = function(dpt1, dpt2) {
      var hostBits1 = dpt1.hostBits;
      var hostBits2 = dpt2.hostBits;
      if (hostBits1 < hostBits2) {
        return 1;
      } else if (hostBits1 > hostBits2) {
        return -1;
      } else {
        return 0;
      }
    }
    dpts.sort(compare);

    var netID = new util.IP(this.data.netID, this.data.subnetMask);
    var sum = 0;

    netID.ip = netID.networkID();

    for (var i = 0; i < dpts.length; i++) {
      dpts[i].netID = netID.ip.join('.') + '/' + (32-dpts[i].hostBits);
      netID.mask = hostBitsToMask(dpts[i].hostBits);
      netID.ip = netID.theNextNetID();
    }

    this.setData({
      departments: dpts
    });
  }
});