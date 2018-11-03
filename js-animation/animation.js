window.requestAnimationFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          function( callback ){
            return window.setTimeout(callback, 1000 / 60);
          };
})();


var Animation = function () {
  this.queue = []; // animation queue
  /**
    * status
    -- pending => animation ready
    -- running => animation running
    -- pause   => animation pause
    -- stop    => animation stop
  */
  this.store = { // status store
    /*
      [element-selector]: {
        selector: [element-selector],
        element: document.querySelector(this.select),
        status: 'pending' || 'running' || 'pause' || 'stop',
        func: 'linear' || 'easeIn' || 'easeOut',
        positionX: 'xxx',
        positionY: 'xxx',
      }
    */
  };
};

/* ------------------- 设置目标 ------------------- */
Animation.prototype.setTarget = function (selector, func) {
  var element = document.querySelector(selector);
  if (element && !this.store[selector]) {
    element.style.left = element.style.left || 0;
    element.style.top = element.style.top || 0;
    element.style.position = 'relative';
    this.store[selector] = {
      selector: selector,
      element: document.querySelector(selector),
      status: 'pending',
      queue: [
        /*
        {
          x: 'xxx', // 相对位置
          y: 'xxx', // 相对位置
          duration: 'xxx', // 毫秒
        }
        */
      ],
      func: func || 'linear',
      positionX: 0, // 一个阶段动画的相对位置X
      positionY: 0, // 一个阶段动画的相对位置Y
    };
  }
};

/* ------------------- 开始动画 ------------------- */
Animation.prototype.start = function (selector) {
  var target = this.store[selector],
    that = this,
    height, width
    abs = target.queue[0]['x'] / Math.abs(target.queue[0]['x']),
    timeStart = new Date().getTime(),
    timeNow = timeStart;

  if (!target) return;

  target.status = 'running';
  var callback = function () {
    if (target.status === 'pause' || target.status === 'stop') {
      return;
    }

    // timeNow = new Date().getTime();
    height = (target.queue[0]['y'] - that.store[selector].positionY);
    width = (target.queue[0]['x'] - that.store[selector].positionX);
    that.step( selector, 2 * abs, 2 * (height / width) * abs );

    if (Math.abs(target.positionX) >= Math.abs(target.queue[0]['x'])) {
      target.element.style.left = (target.queue[0]['x'] - target.positionX) + parseInt(target.element.style.left)  + 'px'; // restore
      target.element.style.top = (target.queue[0]['y'] - target.positionY) + parseInt(target.element.style.top)  + 'px'; // restore
      target.queue.shift();
      target.positionX = 0;
      target.positionY = 0;
      // timeNow = new Date().getTime();
      if (!target.queue[0]) {
        target.status = 'pending';
      } else {
        target.status = 'running';
        abs = target.queue[0]['x'] / Math.abs(target.queue[0]['x']);
        requestAnimationFrame(callback);
      }
    } else {
      requestAnimationFrame(callback);
    }
  };

  requestAnimationFrame(callback);
};

/* ------------------- 暂停动画 ------------------- */
Animation.prototype.pause = function (selector) {
  if (this.store[selector]) {
    this.store[selector].status = 'pause';
  }
};

/* ------------------- 结束动画 ------------------- */
Animation.prototype.stop = function (selector) {
  if (this.store[selector]) {
    this.store[selector].status = 'stop';
    this.store[selector].positionX = 0;
    this.store[selector].positionY = 0;
    this.clear(selector);
  }
};

/* ------------------- 添加动画队列 ------------------- */
Animation.prototype.push = function (selector, conf) {
  if (this.store[selector]) {
    this.store[selector].queue.push({
      x: conf.x,
      y: conf.y,
      duration: conf.duration || 1000,
    });
  }
};

/* ------------------- 动画出队列 ------------------- */
Animation.prototype.pop = function (selector) {
  if (this.store[selector]) {
    this.store[selector].queue.pop();
  }
};

/* ------------------- 清空动画队列 ------------------- */
Animation.prototype.clear = function (selector) {
  if (this.store[selector]) {
    this.store[selector].queue.length = 0;
  }
};

/* ------------------- 动画步进 ------------------- */
Animation.prototype.step = function (selector, x, y) {
  var target = this.store[selector];
  console.log(target.element.offsetLeft, target.element.style.left);
  target.element.style.left = x + parseInt(target.element.style.left) + 'px';
  target.element.style.top = y + parseInt(target.element.style.top) + 'px';
  target.positionX = target.positionX + x;
  target.positionY = target.positionY + y;
};
