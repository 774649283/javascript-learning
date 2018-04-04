/* ************************* 页面初始化 ************************* */
var matrixFather = document.querySelector('.matrix-border');
var matrixLength = 50;
// clear child
var childNodes = matrixFather.childNodes;
var length = childNodes.length;
for (var i = 0; i < length; i++) {
  matrixFather.removeChild(childNodes[0]);
}
/* ************************* 享元模式管理矩阵 ************************* */

// matrix constructor
var Matrix = function (type) {
  // 内部元属性
  this.matrixType = type;
};
Matrix.prototype.change = function (id) {
  matrixManager.setExternalState(this, id);
  // 更换透明度
  if (this.dom.style.color == 'rgba(1, 1, 1, 0)') {
    this.dom.style.color = '#14bf49';
  }else {
    this.dom.style.color = 'rgba(1, 1, 1, 0)';
  }
};

// matrix factory
var matrixFactory = (function () {
  // matrix
  var matrixOrigin = {};

  return {
    get: function (type) {
      if(matrixOrigin[type])
        return matrixOrigin[type];
      else
        return matrixOrigin[type] = new Matrix(type);
    }
  }
})();

// matrixManager
var matrixManager = (function () {
  // 存储所有martix数据的二维数组
  var matrixDatabase = [];
  var matrixLength = 50;

  // 添加matrix数据
  var matrixAdd = function (id, type, text) {

    var dom = document.createElement('div');
    dom.setAttribute('class', 'matrix');
    dom.innerHTML = text;
    dom.onclick = function () {
      matrixFactory.get(type).change(id);
    };
    document.querySelector('.matrix-border').appendChild(dom);

    var len = matrixDatabase.length;
    if (matrixDatabase[len - 1] && matrixDatabase[len - 1].length < matrixLength) {
      matrixDatabase[len - 1].push({
        id: id,
        type: type,
        text: text,
        opacity: 1,
        dom: dom
      })
    }else {
      matrixDatabase.push( [{
        id: id,
        type: type,
        text: text,
        opacity: 1,
        dom: dom
      }] );
    }
  };

  // 组装外部状态
  var setExternalState = function (obj, id) {
    // 二维数组的子数组的length
    var dbLength = matrixLength;
    var rangerIndex = 0;

    // 存储查找到的区间
    for(var i = 0; i < matrixDatabase.length; i++){
      if (id <= (i + 1) * dbLength) {
        rangerIndex = i;
        break;
      }
    }

    // 查找具体的一个id的数据
    for(var j = 0; j < matrixDatabase[rangerIndex].length; j++){
      if (matrixDatabase[rangerIndex][j].id == id) {
        Object.keys(matrixDatabase[rangerIndex][j]).map(function (attr) {
          obj[attr] = ( matrixDatabase[i][j] )[attr];
        });
        break;
      }
    }

    return obj;
  };

  // 定时更改组件状态
  function matrixAutoChange() {
    for(var i = 0; i < matrixLength; i++){
      for(var j = 0; j < matrixDatabase.length; j++){
        matrixFactory.get(matrixDatabase[j][i].type).change(matrixDatabase[j][i].id);
      }
    }
  }

  // 外部调用
  return {
    add: matrixAdd,
    setExternalState: setExternalState,
    autoChange: matrixAutoChange
  }
})();

/* ************************* 创建页面结构 ************************* */
for(var i = 0; i < 2500; i++){
  matrixManager.add(i, 'visible', '+');
}

/* ************************* 让矩阵元素流动起来 ************************* */
matrixManager.autoChange();
