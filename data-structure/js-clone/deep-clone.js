/* -----------------------------------------------------------------------------
  js浅复制: 应用类型只复制第一层有信用，常规类型直接复制值
  数据类型：object - array - boolean - number - date - function - string - null/undefined
----------------------------------------------------------------------------- */

/* ------------------- 深复制 ------------------- */
function deepClone(tData) {

  var cloneData;

  // step
  var step = function (data) {
    console.log('step:', data);
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
    return target;
  };

  cloneData = step(tData);

  return cloneData;
}

/* ------------------- TEST ------------------- */
var a = [1, 2, {}];
var b = deepClone(a);
console.log('deepClone test: ', b[2] !== a[2]);
