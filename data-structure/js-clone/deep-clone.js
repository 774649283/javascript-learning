/* -----------------------------------------------------------------------------
  js浅复制: 应用类型只复制第一层有信用，常规类型直接复制值
  数据类型：object - array - boolean - number - date - function - string - null/undefined
----------------------------------------------------------------------------- */

/* ------------------- 深复制 ------------------- */
var deepClone =  (function () {

  // key step
  var step = function (data) {
    var nData;

    if ( Object.prototype.toString.call(data) === '[object Array]') {
      arrayClone(nData = [], data);
    } else if (Object.prototype.toString.call(data) === '[object Object]') {
      objectClone(nData = {}, data);
    } else {
      nData = normalClone(data);
    }

    return nData;
  }

  // get reg condition
  var getRegExp = function(re) {
    var flags = '';
    if (re.global) flags += 'g';
    if (re.ignoreCase) flags += 'i';
    if (re.multiline) flags += 'm';
    return flags;
  };

  // array clone
  var arrayClone = function (base, target) {
    for (var i = 0; i < target.length; i++) {
      base[i] = step(target[i]);
    }
  };

  // object clone
  var objectClone = function (base, target) {
    var keys = Object.keys(target);
    for (var i = 0; i < keys.length; i++) {
      base[ keys[i] ] = step(target[ keys[i] ]);
    }
  };

  // simple clone
  var normalClone = function (target) {
    if ( Object.prototype.toString.call(target) === '[object RegExp]' ) {
      var reg = new RegExp(target.source, getRegExp(target));
      target.lastIndex && (reg.lastIndex = target.lastIndex);

    }else if( Object.prototype.toString.call(target) === '[object Date]' ) {
      target = new Date(target.getTime());
    }

    return target;
  };

  return function (origin) {
    return step(origin);
  }

})();

/* ------------------- TEST ------------------- */
var a = [1, 2, {}, /(1|2)/gi];
var b = deepClone(a);
b.map(function (item) {
  console.log(item);
});
