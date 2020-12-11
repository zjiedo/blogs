---
title: 一起来写写Promise
date: 2020-12-8
categories: 
 - frontend
tags:
- es6
- promise
---
## 前言
  在最早之前写node的时候，异步都是采用回调，虽然尽可能避免，但是功能复杂的时候，回调地狱还是不免出现。

  幸好后来有promise了，omise了。最近得空，研究了一下promise的实现。所以想尝试手动实现一下，顺便做个记录。
## promise的功能
### 构造函数的实现

首先写一段promise的代码来分析一下构造函数的实现：

```javascript
let pro = new Promise((resolve, reject) => {
  if (true) {
    resolve('the value')
  } else {
    reject('the reason')
  }
})
```

- promise一共有pending(进行中)、fulfilled(已成功)、rejected(已失败)三种状态，一旦状态确定就不可更改。初始状态为pending，而且状态变更只有两种：
  - pending --> fulfilled
  - pending --> rejected
- promise的构造函数，传了一个函数作为参数，这个函数接受promise返回的两个函数：resolve、reject，在构造函数中调用，调用后改变状态。

便可以写出如下构造函数：

```javascript
const PENDING = 'pending' // 进行中
const FULFILLED = 'fulfilled' // 已成功
const REJECTED = 'rejected' // 已失败

class MyPromise {
  constructor(executor) {
    executor(this.resolve, this.reject)
  }
  // 初始状态PENDING
  status = PENDING

  resolve() {
    // 只有PENDING状态能变成FULFILLED状态
    if (this.status !== PENDING) return
    // 状态改变为成功
    this.status = FULFILLED
  }
  reject() {
    // 只有PENDING状态能变成REJECTED状态
    if (this.status !== PENDING) 
    // 状态变为失败
    this.status = REJECTED
  }
}
```

### then方法的实现

调用一下上述写的promise

```javascript
pro.then(res => {
    console.log(res)
}, (reason) => {
    console.log(reason)
})
```

- promise原型上有一个then方法。then方法接受成功回调和失败回调两个参数。then方法内部判断状态， 如果是成功就调用成功回调函数，如果是失败就调用失败回调函数。
- 构造函数如果调用resolve会传递一个值，作为then方法中成功回调的参数；如果调用reject会传递一个值，作为then方法失败回调的参数。

便可以写出如下代码：

```javascript
const PENDING = 'pending' // 进行中
const FULFILLED = 'fulfilled' // 已成功
const REJECTED = 'rejected' // 已失败

class MyPromise {
  constructor(executor) {
    executor(this.resolve, this.reject)
  }
  // 初始状态PENDING
  status = PENDING
  // 成功之后的值
  value = undefined
  // 失败之后的原因
  reason = undefined

  resolve = (value) => {
    // 只有PENDING状态能变成FULFILLED状态
    if (this.status !== PENDING) return
    // 状态改变为成功
    this.status = FULFILLED

    this.value = value
  }
  reject = (reason) => {
    // 只有PENDING状态能变成REJECTED状态
    if (this.status !== PENDING) 
    // 状态变为失败
    this.status = REJECTED

    this.reason = reason
  }
  then = (successCallback, failCallback) => {
    if (this.status === FULFILLED) {
      successCallback(this.value)
    } else {
      failCallback(this.reason)
    }
  }
}
```

 tips: 每一步可以自行调用，验证是否已实现相关功能。

### 完善then支持异步

很明显我们的方法是不支持异步的，接下来实现异步功能：

```javascript
let pro = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(100)
  }, 1000)
})

pro.then((res) => {
  console.log(res)
})
```

- 很明显，我们需要在上述setTimeout内部执行的时候调用resolve，去改变状态。那then方法就会先调用，所以这时候我们应该在then的时候增加一种pending状态判断，这时候要把then传入的函数缓存起来。等到resolve调用的时候再去执行。实现如下：

```javascript
 // 缓存成功回调函数
  successCallback = null
  // 缓存失败回调函数
  failCallback = null

  resolve = (value) => {
    // 只有PENDING状态能变成FULFILLED状态
    if (this.status !== PENDING) return
    // 状态改变为成功
    this.status = FULFILLED

    this.value = value
    // 执行成功回调
    if (this.successCallback) this.successCallback(this.value)
  }
  reject = (reason) => {
    // 只有PENDING状态能变成REJECTED状态
    if (this.status !== PENDING) 
    // 状态变为失败
    this.status = REJECTED

    this.reason = reason
    // 执行失败回调
    if (this.failCallback) this.failCallback(this.reason)
  }
  then = (successCallback, failCallback) => {
    if (this.status === FULFILLED) {
      successCallback(this.value)
    } else if (this.status === REJECTED) {
      failCallback(this.reason)
    } else {
       /**
       * pending状态 暂存成功回调和失败回调
       * 异步情况处理
       * **/
      this.successCallback = successCallback
      this.failCallback = failCallback
    }
  }
```

### 链式调用

promise是支持链式调用的，并且上一步的返回值会作为下一步的参数传入：

```javascript
pro.then((res) => {
  console.log(res) // 100
  return 1000
}).then(res => {
  console.log(res) // 1000
  return 10000
}).then(res => {
  console.log(res) // 10000
}) 
//
pro.then().then((res) => console.log(res)) // 100
```

- 要实现链式调用，那then调用的时候还是要返回promise对象，因为then方法在promise上， 暂且将返回的promise对象叫做promise2，then方法就叫做then2。

  ```javascript
  let promise2 = new MyPromise((resolve, reject) => {})
  ```

- 这个返回的promise2调用resolve、reject的时机应该根据then2传入的successCallback、failCallback来决定。

- 这里要分为成功、失败和异步两种情况

  - 成功、失败状态：
    - 判断result的值是普通值还是promise对象：
      - 如果是普通值 直接调用resolve
      - 如果是promise对象 查看promise对象返回的结果，再根据promise对象返回的结果 决定调用resolve还是调用reject
  - 异步：
    -  暂存成功回调和失败回调
    - 这时候我们要把多次调用的回调函数缓存起来，缓存到数组，resolve调用时，再逐一调用缓存的回调

- 当链式调用没有传递任何参数时，要向下传递值，所以我们在then内部，开始的时候判断， 如果没有成功或者失败回调，要直接返回值、或者失败原因：

  ```javascript
  /**
   * then不传递参数的时候不参数
   * 逐级传递参数
   ***/ 
   successCallback = successCallback ? successCallback:value => value
   failCallback = failCallback ? failCallback:reason => { throw reason }
  ```

  具体实现如下：

  ```javascript
    // 缓存成功回调函数
    successCallback = []
    // 缓存失败回调函数
    failCallback = []
  
    resolve = (value) => {
      // 只有PENDING状态能变成FULFILLED状态
      if (this.status !== PENDING) return
      // 状态改变为成功
      this.status = FULFILLED
  
      this.value = value
      if (this.successCallback.length) this.successCallback.shift()(this.value)
    }
    reject = (reason) => {
      // 只有PENDING状态能变成REJECTED状态
      if (this.status !== PENDING) 
      // 状态变为失败
      this.status = REJECTED
  
      this.reason = reason
  
      if (this.failCallback.length) this.failCallback.shift()(this.reason)
    }
    then = (successCallback, failCallback) => {
      /**
       * then不传递参数的时候不参数
       * 逐级传递参数
       * **/ 
      successCallback = successCallback ? successCallback:value => value
      failCallback = failCallback ? failCallback:reason => { throw reason }
      const promise2 = new MyPromise((resolve, reject) => {
        if (this.status === FULFILLED) {
          /**
           * 判断result的值是普通值还是promise对象：
           * 如果是普通值 直接调用resolve
           * 如果是promise对象 查看promise对象返回的结果
           * 再根据promise对象返回的结果 决定调用resolve还是调用reject
           * **/
          let result = successCallback(this.value)
          checkPromise(result, resolve, reject)
        } else if (this.status === REJECTED) {
          let result = failCallback(this.reason)
          checkPromise(result, resolve, reject)
        } else {
          /**
           * pending状态 暂存成功回调和失败回调
           * 异步情况处理
           * **/
          this.successCallback.push(() => {
            /**
             * 判断result的值是普通值还是promise对象：
             * 如果是普通值 直接调用resolve
             * 如果是promise对象 查看promise对象返回的结果
             * 再根据promise对象返回的结果 决定调用resolve还是调用reject
             * **/
            let result = successCallback(this.value)
            checkPromise(result, resolve, reject)
          })
          this.failCallback.push(() => {
            /**
             * 判断result的值是普通值还是promise对象：
             * 如果是普通值 直接调用resolve
             * 如果是promise对象 查看promise对象返回的结果
             * 再根据promise对象返回的结果 决定调用resolve还是调用reject
             * **/
            let result = failCallback(this.value)
            checkPromise(result, resolve, reject)
          })
        }
      })
      return promise2
    }
  ```

  到这里 我们已经实现了promise的核心方法，下面再来补充promise 的一些调用方法。

  ### catch实现

  首先，为了代码的健壮性，我们要try-catch异常捕获。

- 在构造函数的时候，当捕获到异常要直接调用reject方法。

  ```javascript
  try {
     executor(this.resolve, this.reject)
  } catch (error) {
     this.reject(error)
  }
  ```

- 在then方法中， 调用成功或失败回调的时候，如果捕获到异常，就直接走reject方法了。

  ```javascript
  try {
  	let result = successCallback(this.value)
  	checkPromise(result, resolve, reject)
  } catch(error) {
  	reject(error)
  }
  ```

  观察一下：

  ```javascript
    pro.then()
       .catch(e => {
           
       })
  ```

- catch 是promise原型上的，方法接收一个失败回调，实现如下：

  ```javascript
   catch = (failCallback) => {
      this.then(null, failCallback)
    }
  ```