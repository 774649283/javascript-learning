/*
  洁净的继承者 -- 原型式继承
  其实是对类式继承的一个封装，类式继承的缺点同样存在
  为寄生组合式继承做铺垫
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

var bookBase = {
    name: 'book',
    contentArray: ['js', 'php']
};

var newBook1 = inheritObject(bookBase);
newBook1.name = 'newBook1';
newBook1.contentArray.push('newBook1');
console.log(newBook1.name, newBook1.contentArray);

var newBook2 = inheritObject(bookBase);
newBook2.name = 'newBook2';
newBook2.contentArray.push('newBook2');
console.log(newBook2.name, newBook2.contentArray);

console.log(bookBase.name, bookBase.contentArray);
