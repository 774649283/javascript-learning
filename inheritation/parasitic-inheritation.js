/*
  寄生式继承 -- 基于原型式继承
*/

// 通过过度函数创建实例对象的方法
function inheritObject (obj){

    // 声明干净的过度函数
    function F(){

    }

    // 直接将基类的属性给过度类，没有原型链的共享
    F.prototype = obj;

    // 继承属性的过度类实例对象
    return new F();
}

// 基类
var bookBase = {
    name: 'book',
    contentArray: ['js', 'php']
};

function createBook(obj){

    var o = inheritObject(obj);

    // 进行属性扩展
    o.getName = function() {

        console.log(name);
    };

    return o;
}
