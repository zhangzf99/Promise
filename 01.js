class HD {
  constructor(implement){
    this.status = 'pending';
    this.value = null;
    this.callbacks = [];
    try {
      implement(this.resolve.bind(this),this.reject.bind(this));
    } catch (error) {
      this.reject(error)
    }
  }

  resolve(value){
    if(this.status === 'pending'){
      this.status = 'fulfilled';
      this.value = value;
      setTimeout(()=>{
        this.callbacks.map((callback)=>{
          callback.onFulfilled(value);
        })
      })
    }
  }

  reject(error){
    if(this.status === 'pending'){
      this.status = 'rejected';
      this.value = error;
      setTimeout(()=>{
        this.callbacks.map((callback)=>{
          callback.onRejected(error);
        })
      })
    }
  }

  then(onFulfilled,onRejected){
    if(!(onFulfilled instanceof Function)){
      onFulfilled = ()=>{return this.value}
    }
    if(!(onRejected instanceof Function)){
      onRejected = ()=>{return this.value}
    }


    return new HD((resolve,reject)=>{
      // console.log(this)
      // 当使用了定时器时，此时状态为pending，需要将then中的两个参数放入数组中，后边再调用
      if(this.status === 'pending'){
        // this.callbacks.push({onFulfilled,onRejected});
        this.callbacks.push({
          onFulfilled : (value)=>{
            try {
              let result = onFulfilled(value)
              if(result instanceof HD){
                result.then((value)=>{
                  resolve(value)
                },(error)=>{
                  reject(error)
                })
              }else{
                resolve(result)
              }
            } catch (error) {
              let result = onRejected(error)
              reject(result)
            }
          },
          onRejected: (value)=>{
            try {
              let result = onRejected(value)
              if(result instanceof HD){
                result.then((value)=>{
                  resolve(value)
                },(error)=>{
                  reject(error)
                })
              }else{
                resolve(result)
              }

            } catch (error) {
              let result = onRejected(error)
              reject(result)
            }
          }
        })
      }


      if(this.status === 'fulfilled'){
        setTimeout(()=>{
          try {
            let result = onFulfilled(this.value);
            // console.log(result)
            if(result instanceof HD){
              result.then((value)=>{
                resolve(value)
              },(error)=>{
                reject(error)
              })
            }else{
              resolve(result)
            }
          } catch (error) {
            let result = onRejected(error)
              reject(result)
          }
        })
      }


      if(this.status === 'rejected'){
        setTimeout(()=>{
          try {
            let result = onRejected(this.value);
            if(result instanceof HD){
              result.then((value)=>{
                resolve(value)
              },(error)=>{
                reject(error)
              })
            }else{
              resolve(result)
            }
          } catch (error) {
            let result = onRejected(error)
              reject(result)
          }
        })
      }
    })
  }
}