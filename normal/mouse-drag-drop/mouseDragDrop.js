// 拖动
var DragDrop = (function () {
  var dragging = null;
  var _event = null;
  // elementoffset 和 eventClient 之间的距离
  var diffX = 0;
  var diffY = 0;

  // 拖动事件处理函数
  function dragHandler(event) {

    _event = EventUtil.getEvent(event);
    switch (_event.type) {
      case "mousedown":
        dragging = EventUtil.getTarget(_event);
        diffX = _event.clientX - dragging.offsetLeft;
        diffY = _event.clientY - dragging.offsetTop;
        break;
      case "mousemove":
        if (dragging != null) {
          dragging.style.left = _event.clientX - diffX + "px";
          dragging.style.top = _event.clientY - diffY + "px";
        }
        break;
      case "mouseup":
        dragging = null;
        _event = null;
        diffX = 0;
        diffY = 0;
        break;
      default:
        return;
    }
  }

  // 返回调用接口
  return {
    enable: function () {
      EventUtil.addHandler(document, "mousedown", dragHandler);
      EventUtil.addHandler(document, "mousemove", dragHandler);
      EventUtil.addHandler(document, "mouseup", dragHandler);
    },
    disable: function () {
      EventUtil.removeHandler(document, "mousedown", dragHandler);
      EventUtil.removeHandler(document, "mousemove", dragHandler);
      EventUtil.removeHandler(document, "mouseup", dragHandler);
    }
  }
})();

// 注册事件
DragDrop.enable();
