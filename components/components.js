// 弹出警告框组件
function openAlert(message, mode="modal", callback=(payload)=>{}) {
  if(mode === "modal") {
    return openModal("alert.html", "Alert", message, 380, 185);
  }
  openDialog("alert.html", "Alert", message, callback, 380, 185)

  // const currentId = await Niva.api.window.current()
  // let params = {id: currentId, message: message}
  // params = encodeURIComponent(JSON.stringify(params))
  // Niva.api.window.open({
  //     "title":"Alert",
  //     "icon": "assets/icon.png",
  //     "entry": "./components/alert.html?" + params,
  //     "alwaysOnTop": true,
  //     "devtools": true,
  //     "minimizable": false,
  //     "maximizable": false,
  //     "size": {
  //       "height": 185,
  //       "width": 380
  //     }
  // })
  // // { from: number; message: string }
  // const messageCallback = async (eventName, payload) => {
  //   //来自设置的消息
  //   const title = await Niva.api.window.title(payload.from)
  //   if(title === 'Alert') {
  //     callback(payload);
  //     setTimeout(() => {
  //       Niva.removeEventListener("window.message", messageCallback);
  //     }, 100);
  //   }
  // }
  // Niva.addEventListener("window.message", messageCallback);
}

// 弹出对话框组件
function openPrompt(message, mode="modal", callback=(payload)=>{}) {
  if(mode === "modal") {
    return openModal("prompt.html", "Ask", message, 450, 150);
  }
  openDialog("prompt.html", "Ask", message, callback, 450, 150);

    // const currentId = await Niva.api.window.current()
    // let params = {id: currentId, message: message}
    // params = encodeURIComponent(JSON.stringify(params))
    // Niva.api.window.open({
    //     "title":"Ask",
    //     "icon": "assets/icon.png",
    //     "entry": "./components/prompt.html?" + params,
    //     "alwaysOnTop": true,
    //     "devtools": true,
    //     "minimizable": false,
    //     "maximizable": false,
    //     "size": {
    //       "height": 150,
    //       "width": 450
    //     }
    // })
    // // { from: number; message: string }
    // const messageCallback = async (eventName, payload) => {
    //   //来自设置的消息
    //   const title = await Niva.api.window.title(payload.from)
    //   if(title === 'Ask') {
    //     callback(payload);
    //     console.log(payload, 1111)
    //     setTimeout(() => {
    //       Niva.removeEventListener("window.message", messageCallback);
    //     }, 100);
    //   }
    // }
    // Niva.addEventListener("window.message", messageCallback);
}

async function openDialog(entry, name, message, callback=(payload)=>{}, width=450, height=150, winOptions={}) {
  try{
    const currentId = await Niva.api.window.current()
    let params = {id: currentId, message: message}
    params = encodeURIComponent(JSON.stringify(params))
    Niva.api.window.open({...{
        "title":name,
        "icon": "assets/icon.png",
        "entry": "./components/"+entry+"?" + params,
        "alwaysOnTop": true,
        "devtools": true,
        "minimizable": false,
        "maximizable": false,
        "size": {
          "width": width || 450,
          "height": height || 150
        }
    }, ...winOptions})
    // { from: number; message: string }
    const messageCallback = async (eventName, payload) => {
      //来自设置的消息
      const title = await Niva.api.window.title(payload.from)
      if(title === name) {
        callback(payload);
        setTimeout(() => {
          Niva.removeEventListener("window.message", messageCallback);
        }, 100);
      }
    }
    Niva.addEventListener("window.message", messageCallback);
  }catch(e){
    console.log(e)
  }
}


function openModal(entry, name, message, width=450, height=150, winOptions={}) {
  return new Promise(async (resolve, reject) => {
    try{
      const currentId = await Niva.api.window.current()
      let params = {id: currentId, message: message}
      params = encodeURIComponent(JSON.stringify(params))
      Niva.api.window.open({...{
          "title":name,
          "icon": "assets/icon.png",
          "entry": "./components/"+entry+"?" + params,
          "alwaysOnTop": true,
          "devtools": true,
          "minimizable": false,
          "maximizable": false,
          "size": {
            "width": width || 450,
            "height": height || 150
          }
      }, ...winOptions})
      // { from: number; message: string }
      const messageCallback = async (eventName, payload) => {
        //来自设置的消息
        const title = await Niva.api.window.title(payload.from)
        if(title === name) {
          resolve(payload)
          setTimeout(() => {
            Niva.removeEventListener("window.message", messageCallback);
          }, 100);
        }
      }
      Niva.addEventListener("window.message", messageCallback);
    }catch(e){
      console.log(e)
      reject(e.message);
    }
  });
}
