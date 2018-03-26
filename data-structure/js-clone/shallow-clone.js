/* -----------------------------------------------------------------------------
  js浅复制: 应用类型只复制第一层有信用，常规类型直接复制值
  数据类型：object - array - boolean - number - date - function - string - null/undefined
----------------------------------------------------------------------------- */

function shallowClone(data) {

  var cloneData, i;

  var arrayClone = function (base, target) {
    for (i = 0; i < target.length; i++) {
      base[i] =  target[i];
    }
  };

  var objectClone = function (base, target) {
    var keys = Object.keys(target);
    for (i = 0; i < keys.length; i++) {
      base[ keys[i] ] = target[ keys[i] ];
    }
  };

  var normalClone = function (base, target) {
    base = target;
  };

  if ( Object.prototype.toString.call(data) === '[object Array]') {
    arrayClone(cloneData = [], data);
  } else if (Object.prototype.toString.call(data) === '[object Object]') {
    objectClone(cloneData = {}, data);
  } else {
    normalClone(cloneData, data);
  }

  return cloneData;
}

/* ------------------- TEST ------------------- */
var a = [1, 2, {}];
var b = shallowClone(a);
console.log('shallowClone test: ', b[2] == a[2]);
