/* -----------------------------------------------------------------------------
Promise是一个事件
示例4模拟了事件:
调用asyncFunc()之后，sucesss数组其实是空的，将回调函数push进数组，相当于绑定了事件的回调函数。
1秒之后，setTimeout定时结束，则相当于事件触发了，这时sucess数组中已经注册了回调函数，于是打印
”Hello, Fundebug!”。
当Promise成功resolve时，会触发then所绑定的回调函数，这其实就是事件。
----------------------------------------------------------------------------- */

// 示例4
function asyncFunc()
{
    const eventEmitter = {
        success: []
    };
    setTimeout(function()
    {
        for (const handler of eventEmitter.success)
        {
            handler('Hello, Fundebug!');
        }
    }, 1000);
    return eventEmitter;
}

asyncFunc()
    .success.push(function(x)
    {
        console.log(x); // 1秒之后打印"Hello, Fundebug!"
    });
