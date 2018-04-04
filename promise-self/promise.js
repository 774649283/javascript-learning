/* ************************* Promise构造函数 ************************* */
function Promise(processor) {
  var self = this;
  self.status = 'pending';  // status
  self.value = null;  // resolve value
  self.reason = null;  // reject reason
  self.onRejectedCallbacks = [];  // reject callback
  self.onFulfilledCallbacks = [];  // resolve callback

  // resolve
  function resolve(value) {
    if (self.status === 'pending') {
      self.status = 'fulfilled';
      self.value = value;
      self.onFulfilledCallbacks.map(function (callback) {
        callback();
      });
    }
  }

  // reject
  function reject(reason) {
    if (self.status === 'pending') {
      self.status = 'rejected';
      self.reason = reason;
      self.onRejectedCallbacks.map(function (callback) {
        callback(reason);
      });
    }
  }

  // 延迟到下一次事件循环
  try {
    processor(resolve, reject);
  } catch (e) {
    setTimeout(function () {
      reject(e);
    });
  }
}

/* ------------------- 分析promise.then中返回的值类型 promise/value ------------------- */

// 注意父子promise状态是怎样控制的，父promise需要将控制权(resovle, reject)转发给子promise
var analysisPromise = function (x, resolve, reject) {

  var then, y;

  // 可能为promise
  if (x !== undefined && (typeof x === 'object' || typeof x === 'function')) {
    then = x.then;

    // 为promise
    if (then && typeof then === 'function') {

      then.call(x, function (value) {
        analysisPromise(value, resolve, reject);

      }, function (error) {
        reject(error);
      });

    // 为普通值
    }else {
      resolve(x);
    }

  // 普通值
  }else {
    resolve(x);
  }
};


/* ------------------- then-返回新的promise ------------------- */


/**
 * [then 应该返回一个全新的Promise对象，不应该与当前Promise存在功能耦合]
 * @param  {[type]} successFn [description]
 * @param  {[type]} errorFn   [description]
 */
Promise.prototype.then = function (successCallback, errorCallback) {

  var promise, x;
  var self = this;

  // 判断当前promise状态
  if (self.status === 'fulfilled') {
    promise = new Promise(function (resolve, reject) {

      // 延迟到下一个事件循环
      setTimeout(function () {
        try {
          x = successCallback(self.value);
          // 分析返回值 然后更改 当前promise状态
          analysisPromise(x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      });

    });
  }else if (self.status === 'rejected') {
    promise = new Promise(function (resolve, reject) {

      // 延迟到下一个事件循环
      setTimeout(function () {
        try {
          x = errorCallback(self.reason);
          // 分析返回值 然后更改 当前promise状态
          analysisPromise(x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      });

    });
  }else if (self.status === 'pending') {
    promise = new Promise(function (resolve, reject) {

      // 延迟到下一个事件循环
      setTimeout(function () {
        self.onFulfilledCallbacks.push(function () {
          try {
            x = successCallback(self.value);
            // 分析返回值 然后更改 当前promise状态
            analysisPromise(x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });

        self.onRejectedCallbacks.push(function () {
          try {
            x = errorCallback ? errorCallback(self.reason) : undefined;
            // 分析返回值 然后更改 当前promise状态
            analysisPromise(x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      })

    });

  }

  return promise;
};


/* ------------------- 错误捕获 ------------------- */
Promise.prototype.catch = function (handleError) {
  if (this.status === 'pending') {
    this.onRejectedCallbacks.push(handleError);
  }else {
    this.reason && handleError(this.reason);
  }
};


/* ------------------- all-所有promise成功后即成功,一个失败即失败 ------------------- */

Promise.all = function (pArray) {
  var rArray = [];
  var promise = new Promise(function (resolve, reject) {

    pArray.forEach(function (pr, i) {

        if (pr instanceof Promise) {
          pr.then(function (value1) {
            analysisPromise(value1, function (value2) {
              rArray[i] = value2;
              if (rArray.length === pArray.length) {
                resolve(rArray);
              }
            }, reject);

          }, function (error) {
            reject(error);
          });

        }else {
          rArray[i] = pr;
          if (rArray.length === pArray.length) {
            resolve(rArray);
          }
        }

    });

  });

  return promise;
};

/* ------------------- race - 最终状态取决于第一个完成的promise状态 ------------------- */
Promise.race = function (pArray) {
  var rArray = [];
  var promise = new Promise(function (resolve, reject) {

    pArray.forEach(function (pr, i) {

        if (pr instanceof Promise) {
          pr.then(function (value) {
            analysisPromise(value, resolve, reject);
          }, function (error) {
            reject(error);
          });
        }else {
          rArray[i] = pr;
        }

    });

  });

  return promise;
};

/* ------------------- 返回成功态的promise ------------------- */
Promise.resolve = function (value) {
  return new Promise(function (resolve, reject) {
      resolve(value);
  });
};

/* ------------------- 返回失败态的promise ------------------- */
Promise.reject = function (reason) {
  return new Promise(function (resolve, reject) {
      reject(reason);
  });
};
