const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/*****************************************************************************************************************************************************/

function IP(ip, mask) {
  this.ip = [];
  this.mask = [];
  this.errMsg = '';

  if (!(this.reIP.test(ip))) {
    this.errID = 0;
    this.errMsg = "IP 地址错误";
  } else if (this.reMask.test(mask)) {
    this.errID = 2;
    this.ip = ip.split('.');
    this.mask = mask.split('.');
  } else if (this.isSuffix(mask)) {
    this.errID = 2;
    this.ip = ip.split('.');
    this.mask = this.suffixToMask(mask);
  } else {
    this.errID = 1;
    this.errMsg = '子网掩码或网络后缀错误';
  }

  /*
  if (!(this.reIP.test(ip))) {
    this.errID = 0;
    this.errMsg = "IP 地址错误";
  } else if (!(this.reMask.test(mask))) {
    this.errID = 1;
    this.errMsg = "子网掩码错误";
  } else {
    this.errID = 2;
    this.ip = ip.split('.');
    this.mask = mask.split('.');
  }
  */
}

IP.prototype = {
  constructor: IP,
  reIP: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/,
  reMask: /^(254|252|248|240|224|192|128|0)\.0\.0\.0|255\.(254|252|248|240|224|192|128|0)\.0\.0|255\.255\.(254|252|248|240|224|192|128|0)\.0|255\.255\.255\.(254|252|248|240|224|192|128|0)$/,
  reInteger: /^[1-9]\d*$/,
  isSuffix: function(n) {
    if (this.reInteger.test(n)) {
      if (n <= 30) {
        return true;
      }
    }
    return false;
  },
  wildcardMask: function() {
    if (this.errID != 2) return null;
    var wm = [255, 255, 255, 255];
    for (var i = 0; i < 4; i++) {
      wm[i] = wm[i] - this.mask[i];
    }
    return wm;
  },

  networkID: function() {
    if (this.errID != 2) return null;
    var netID = [0, 0, 0, 0];
    for (var i = 3; i >= 0; i--) {
      netID[i] = this.bToD(this.andBitByBit(this.dToB(this.ip[i]), this.dToB(this.mask[i])))
    }
    return netID;
  },

  hostID: function() {
    if (this.errID != 2) return null;
    var netID = this.networkID();
    var htID = [0, 0, 0, 0];
    for (var i = 3; i >= 0; i--) {
      htID[i] = this.ip[i] - netID[i];
    }
    return htID;
  },

  theFirstIP: function() {
    if (this.errID != 2) return null;
    var fIP = this.networkID();
    fIP[3] = fIP[3] + 1;
    return fIP;
  },

  theLastIP: function() {
    if (this.errID != 2) return null;
    var netID = this.networkID();
    var wm = this.wildcardMask();
    var lIP = [0, 0, 0, 0];
    for (var i = 3; i >= 0; i--) {
      lIP[i] = netID[i] + wm[i];
    }
    lIP[3] = lIP[3] - 1;
    return lIP;
  },

  theBoardcastAddress: function() {
    if (this.errID != 2) return null;
    var netID = this.networkID();
    var wm = this.wildcardMask();
    var ba = [0, 0, 0, 0];
    for (var i = 3; i >= 0; i--) {
      ba[i] = netID[i] + wm[i];
    }
    ba[3] = ba[3];
    return ba;
  },

  theNextNetID: function() {
    if (this.errID != 2) return null;
    var ba = this.theBoardcastAddress();
    var nextNetID = [0, 0, 0, 0];
    var k = 1
    for (var i = 3; i >= 0; i--) {
      nextNetID[i] = (ba[i] + k) % 256;
      k = Math.floor((ba[i] + k) / 256);
    }
    return nextNetID;
  },

  numOfIP: function() {
    if (this.errID != 2) return null;
    var wm = this.wildcardMask();
    var weight = 1;
    var n = 0;
    for (var i = 3; i >= 0; i--) {
      n = n + wm[i] * weight;
      weight = weight * 256;
    }
    return n + 1;
  },

  hostBits: function() {
    var n = this.numOfIP();
    var i = 0;
    while (Math(2, i) < n) {
      i++;
    }
    return i;
  },

  netBits: function() {
    return 32 - this.hostBits;
  },

  dToB: function(d) {
    var b = [0, 0, 0, 0, 0, 0, 0, 0]
    for (var i = 7; i >= 0; i--) {
      b[i] = d % 2;
      d = Math.floor(d / 2);
    }
    return b;
  },

  bToD: function(b) {
    var d = 0;
    var weight = 1;
    for (var i = 7; i >= 0; i--) {
      d = d + b[i] * weight;
      weight = weight * 2;
    }
    return d;
  },

  andBitByBit: function(a, b) {
    var r = [0, 0, 0, 0, 0, 0, 0, 0];
    for (var i = 7; i >= 0; i--) {
      r[i] = a[i] * b[i];
    }
    return r;
  },
  suffixToMask: function(n) {
    if (n > 30) return null;
    var hbs = 32 - n;
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
}

module.exports = {
  formatTime: formatTime,
  IP: IP
}