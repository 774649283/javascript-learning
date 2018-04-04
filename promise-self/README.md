### 使用es5 手动实现Promise
>Promise 对象是一个代理对象（代理一个值），被代理的值在Promise对象创建时可能是未知的。
它允许你为异步操作的成功和失败分别绑定相应的处理方法（handlers）。 这让异步方法可以像
同步方法那样返回值，但并不是立即返回最终执行结果，而是一个能代表未来出现的结果的promise对象。  

>pending 状态的 Promise 对象可能触发fulfilled 状态并传递一个值给相应的状态处理方法，
也可能触发失败状态（rejected）并传递失败信息。当其中任一种情况出现时，Promise 对象的
then 方法绑定的处理方法（handlers ）就会被调用（then方法包含两个参数：onfulfilled
和 onrejected，它们都是 Function 类型。当Promise状态为fulfilled时，调用 then 的
onfulfilled 方法，当Promise状态为rejected时，调用 then 的 onrejected 方法，
所以在异步操作的完成和绑定处理方法之间不存在竞争）。  


#### 1. 一个 Promise有以下几种状态
 * pending: 初始状态，不是成功或失败状态。  
 * fulfilled: 意味着操作成功完成。  
 * rejected: 意味着操作失败。  

#### 2. promise.then 中的操作应该延迟到下一次事件循环

#### 3. Promise.all(iterable)
>这个方法返回一个新的promise对象，该promise对象在iterable参数对象里所有的promise对象
都成功的时候才会触发成功，一旦有任何一个iterable里面的promise对象失败则立即触发该promise
对象的失败。这个新的promise对象在触发成功状态以后，会把一个包含iterable里所有promise返回值
的数组作为成功回调的返回值，顺序跟iterable的顺序保持一致；如果这个新的promise对象触发了失败
状态，它会把iterable里第一个触发失败的promise对象的错误信息作为它的失败错误信息。Promise.all方法常被用于处理多个promise对象的状态集合。

#### 4. Promise.race(iterable)
>当iterable参数里的任意一个子promise被成功或失败后，父promise马上也会用子promise的成功返回
值或失败详情作为参数调用父promise绑定的相应句柄，并返回该promise对象。  

#### 5. Promise.reject(reason)
>返回一个状态为失败的Promise对象，并将给定的失败信息传递给对应的处理方法

#### 6. Promise.resolve(value)
>返回一个状态由给定value决定的Promise对象。如果该值是一个Promise对象，则直接返回该对象；
如果该值是thenable(即，带有then方法的对象)，返回的Promise对象的最终状态由then方法执行决定；
否则的话(该value为空，基本类型或者不带then方法的对象),返回的Promise对象状态为fulfilled，
并且将该value传递给对应的then方法。通常而言，如果你不知道一个值是否是Promise对象，
使用Promise.resolve(value) 来返回一个Promise对象,这样就能将该value以Promise对象形式使用。
