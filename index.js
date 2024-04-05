(async function () {

  // 应用程序名
  const appName = 'DocOnTop'
  // 默认窗口宽高
  const defWidth = 315
  const defHeight = 415
  // 监控文件修改间隔，单位：毫秒
  const watchFSInterval = 1000
  // 使用编辑器
  const useEditor = true
  // 监控文件变化
  const useWatch = false

  const { window, monitor, webview, extra, tray, fs, dialog, shortcut, os, process } = Niva.api;


  ////////////////////////////////////// 初始化，加载文件 //////////////////////////////////

  let lastModified = 0
  let lastSize = 0
  let file = localStorage.getItem('file') || ''
 // 读取文件
 async function loadFile(the_file) {
  if(the_file) {
    const isExist = await fs.exists(the_file)
    if(isExist) {
      file = the_file
      const sep = await os.sep()
      const fileNameWithExt = the_file.substring(the_file.lastIndexOf(sep) + 1);
      const fileNameWithoutExt = fileNameWithExt.split('.')[0]
      window.setTitle(fileNameWithoutExt || appName);
      try {
        const data = await fs.read(the_file, 'utf8')
        if(useEditor) {
          easyMDE.value(data);
        } else {
          document.querySelector('#content').value = data
        }
        const fsStat = await fs.stat(the_file)
        lastModified = fsStat.modified ? fsStat.modified : 0
        lastSize = fsStat.size ? fsStat.size : 0
      } catch(e) {
        console.log(e)
      }
    }
   } else {
     file = ""
     window.setTitle(appName);
     const data = localStorage.getItem('content') || ''
     if(data) easyMDE.value(data);
   }
 }
 loadFile(file);

 // 显示窗口
 const width = localStorage.getItem('width')-0 || defWidth
 const height = localStorage.getItem('height')-0 || defHeight
 window.setInnerSize({ width: width, height: height })
 showWindow()

 // 初始化文件被外部修改时，加载类型
 let reloadOnExternalChange = localStorage.getItem('externalChange') ? true : false

 // 初始化文件被外部修改时，默认自动加载
//  let reloadOnExternalChange = true
//  const externalChange = localStorage.getItem('externalChange')
//  if(externalChange === null) {
//   localStorage.setItem('externalChange', '1')
//  } else if(!externalChange) {
//   reloadOnExternalChange = false
//  }

 ////////////////////////////////////// 监控文件变化 //////////////////////////////////
function getCurrLine() {
  const cm = easyMDE.codemirror;
  // 获取光标所在行
  const cursorPos = cm.getCursor();
  if(cursorPos && cursorPos.line) {
    return cursorPos.line - 0 + 1;
  }

  // 获取可视区域中间行
  const from = cm.getViewport().from;
  const to = cm.getViewport().to;
  return from + Math.floor((to-from) / 2) + 1;
}
function scrollToLine(line) {
  try {
    const cm = easyMDE.codemirror;
    cm.scrollIntoView({ line: line, ch: 0 });
  } catch(e) {
    console.log(e)
  }
}
let lastLine = 0;
const checkFileChange = async () => {
  if(!file) return;
  try {
    const fsStat = await fs.stat(file)
    if (fsStat.modified > lastModified || fsStat.size !== lastSize) {
      lastModified = fsStat.modified
      lastSize = fsStat.size
      // 自动加载
      if (reloadOnExternalChange) {
        setTimeout(() => {
          loadFile(file)
          setTimeout(() => {
            scrollToLine(lastLine);
            showTooltip("文件从外部更改，已重新加载！")
          }, 50);
        });
      }
      // 手动确认
      else {
        enableOverlay();
        const payload = await openPrompt("文件从外部被更改，需要重新加载吗？")
        if(payload.message === 'ok') {
          loadFile(file)
          setTimeout(() => {
            scrollToLine(lastLine);
          }, 50);
        }
        disableOverlay();
      }
    }
  } catch(e) {
    console.log(e)
  }
 }

 // 窗口获取焦点
 let isLoading = true
 Niva.addEventListener(
  "window.focused",
  (eventName, focused) => {
    if(isLoading) {
      isLoading = false
      return
    }
    //console.log(focused, eventName)
    if(focused) {
      lastLine = getCurrLine();
      setTimeout(() => {
        checkFileChange();
      });
    }
  }
);

// 鼠标按下事件
document.addEventListener("click", (e) => {
  lastLine = getCurrLine();
  setTimeout(() => {
    checkFileChange();
  });
});

// 键盘按下事件
// let firstKeydown = true;
// document.addEventListener("keydown", (e) => {
//   if(firstKeydown) {
//     firstKeydown = false;

//     // do something
//     console.log('keydown')

//     setTimeout(() => {
//       firstKeydown = true
//     }, 500);
//   }
// });

 // 监控文件变化(目前定时器niva有bug，导致界面卡顿或卡死，越到后面间隔越久，大概200-300次后会停止定时)
//  let fsStat = {}
//  try {
//   fsStat = await fs.stat(file)
//  }catch(e){
//    console.log(e)
//  }
//  let lastModified = fsStat.modified ? fsStat.modified : 0
//  let lastSize = fsStat.size ? fsStat.size : 0
//  let watchTimer = null
//  if(useWatch) watchFS();
//  //await Niva.api.fs.stat(localStorage.getItem("file"))

//  //let count = 1;
// function watchFS() {
//   //if(watchTimer) clearTimeout(watchTimer)
//   watchTimer = setInterval(async () => {
//     //console.log(count++)
//     if(isSaving || !file) {
//       // setTimeout(() => {
//       //   watchFS();
//       // }, watchFSInterval);
//       return;
//     }
//     checkFileChange();
//     //watchFS()
//    }, watchFSInterval);
//  }

 ////////////////////////////////////// 自动保存文件 //////////////////////////////////
 //保存文件
 let timer = null;
 let isSaving = false;

 //使用编辑器
 if(useEditor){
  easyMDE.codemirror.on("change", async () => {
    if(!file) {
      localStorage.setItem("content", easyMDE.value())
      return
    }
    if(timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(async () => {
      // 保存文件
      try {
        isSaving = true;
        const value = easyMDE.value()
        await fs.write(`${file}`, value, 'utf8')
        const fsStat = await fs.stat(file)
        lastModified = fsStat.modified
        lastSize = fsStat.size
        isSaving = false;
      } catch(e) {
        console.log(e)
      }
    }, 600);

  });
} else {
  //不使用编辑器(已弃用)
  document.querySelector("#content").addEventListener("input", (e) => {
    if(!file) {localStorage.setItem("content", e.target.value);return}
    if(timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(async () => {
      try {
        isSaving = true;
        const { value } = e.target
        await fs.write(`${file}`, value, 'utf8')
        const fsStat = await fs.stat(file)
        lastModified = fsStat.modified
        lastSize = fsStat.size
        isSaving = false;
      } catch(e) {
        console.log(e)
      }
    }, 500);
  })
}

////////////////////////////////////// 监控tasklist按钮样式 //////////////////////////////////
// 更新tasklist按钮样式
const updateTaskListBtnStyle = () => {
  // task-list 更新class
  const cm = easyMDE.codemirror;
  const startPoint = cm.getCursor('start');
  const text = cm.getLine(startPoint.line);
  if (/^- \[.\]\s/.test(text)) {
    setTimeout(()=>{
      const toolbarUnOrderListBtn = document.querySelector('.editor-toolbar .unordered-list');
      toolbarUnOrderListBtn.classList.remove('active');

      const toolbarTaskListBtn = document.querySelector('.editor-toolbar .task-list');
      toolbarTaskListBtn.classList.add('active');
    })
  }
}
if(useEditor) {
  document.querySelector(".CodeMirror-sizer").addEventListener("click", updateTaskListBtnStyle);
  easyMDE.codemirror.on("keydown", updateTaskListBtnStyle);
}

 ////////////////////////////////////// 设置保存消息 //////////////////////////////////
 // 监听消息
 Niva.addEventListener(
  "window.message",
  // { from: number; message: string }
  async (eventName, payload) => {
    //来自设置的消息
    const title = await window.title(payload.from)
    if(title === 'Settings') {
      let settings = payload.message
      settings = JSON.parse(settings)
      if(file !== settings.file){
        loadFile(settings.file);
      }
      if(settings.width || settings.height) {
        if(settings.width!==width || settings.height!==height) window.setInnerSize({ width: settings.width-0 || defWidth, height: settings.height-0 || defHeight })
      }
      reloadOnExternalChange = settings.externalChange ? true : false
      if(settings.shortcut && shortcutKey !== settings.shortcut) {
        shortcutKey = settings.shortcut
        try{
          const hasShortcut = (await shortcut.list()).length > 0
          if(hasShortcut) await shortcut.unregister(0)
          await shortcut.register(settings.shortcut.replace("\\", "Backslash"))
        } catch(e) {
          openAlert("快捷键格式错误", "")
          console.log(e)
        }
      }
    }
  }
);

  ////////////////////////////////////// 托盘菜单 //////////////////////////////////
  // 点击托盘
  Niva.addEventListener(
    "tray.leftClicked",
    async (eventName, trayId) => {
      showWindow()
    }
  );

  // 托盘菜单
  Niva.addEventListener("menu.clicked", async (eventName, menuId) => {
    // 隐藏窗口
    if(menuId === 1) {
      hideWindow();
    }
    // 重新加载
    else if(menuId === 2) {
      //loadFile(file);
      location.reload();
    }
    // 计时器
    else if(menuId === 3) {
      window.open({
        "title":"Timer",
        "icon": "assets/icon.png",
        "entry": "./components/timer.html",
        "alwaysOnTop": true,
        "devtools": true,
        "size": {
          "height": 450,
          "width": 350
        }
      })
    }
    // 配置
    else if(menuId === 4) {
      window.open({
        "title":"Settings",
        "icon": "assets/icon.png",
        "entry": "./settings.html",
        "alwaysOnTop": true,
        "devtools": true,
        "size": {
          "height": 380,
          "width": 455
        }
      })
    }
    // 退出
    else {
      window.close()
      //process.exit()
    }
  });

  ////////////////////////////////////// 监听和注册全局快捷键 //////////////////////////////////

  //注册全局快捷键
  //see https://bramblex.github.io/niva/docs/api/shortcut#nivaapishortcutunregister
  //see https://www.tauri.net.cn/82.html
  let shortcutKey = localStorage.getItem('shortcut') || 'CommandOrControl+Shift+Backslash'
  try{
    await shortcut.register(shortcutKey.replace("\\", "Backslash"));
    //await shortcut.register("CommandOrControl+Alt+i");
  }catch(e) {
    console.log(e)
  }

function showWindow() {
    window.setFocus();
    window.setVisible(true);
    setTimeout(() => {
      //document.getElementById('content').focus()
    }, 300)
}
function hideWindow() {
  window.setVisible(false);
}

  // 响应全局快捷键

  // async function setWindowToCurrentMonitorCenter() {
  //   const cursorPosition = await window.cursorPosition();
  //   const currentMonitor = await monitor.fromPoint(cursorPosition.x, cursorPosition.y)
  //     || await monitor.current();
  //   const { position, size, } = currentMonitor;

  //   const outerSize = await window.outerSize();
  //   await window.setOuterPosition({
  //     x: position.x + (size.width / 2) - (outerSize.width / 2),
  //     y: position.y + (size.height / 2) - (outerSize.height / 2),
  //   });
  // }

  let lastActiveProcessId = null;

  async function recordActiveProcess() {
    lastActiveProcessId = await extra.getActiveWindowId();
  }

  function backToLastActiveProcess() {
    if (lastActiveProcessId) {
      extra.focusByWindowId(lastActiveProcessId);
    }
  }

  Niva.addEventListener('shortcut.emit', (_, id) => {
    if (id === 0) {
      (async () => {

        // const currentActiveWindow = await Niva.api.extra.getActiveWindow();
        // console.log("currentActiveWindow:", currentActiveWindow);
        const [isVisible, isFocused] = await Promise.all([window.isVisible(), window.isFocused()]);

        if (isVisible && isFocused) {
          hideWindow();
          backToLastActiveProcess();
        } else if (isVisible && !isFocused) {
          await recordActiveProcess();
          //await setWindowToCurrentMonitorCenter();
          showWindow();
        } else {
          await recordActiveProcess();
          //await setWindowToCurrentMonitorCenter();
          showWindow();
        }
      })();
    }
    // if (id === 1) {
    //   webview.openDevtools();
    // }
  });

})()