(function () {

  const { window, dialog, process } = Niva.api;

  // 初始化
  document.querySelector("#file").value = localStorage.getItem('file') || ''
  document.querySelector("#width").value = localStorage.getItem('width') || 315
  document.querySelector("#height").value = localStorage.getItem('height') || 415
  const externalChangeAutoChecked = localStorage.getItem('externalChange') ? true : false
  document.querySelector("#externalChangeAuto").checked = externalChangeAutoChecked
  document.querySelector("#externalChangeAsk").checked = !externalChangeAutoChecked
  document.querySelector("#shortcut").value = localStorage.getItem('shortcut') || 'CommandOrControl+Shift+Backslash'
  document.querySelector("#theme").value = localStorage.getItem('theme') || 'none'
  document.querySelector("#toolbar").checked = localStorage.getItem('toolbar') === 'show' ? true : false
  document.querySelector("#statusbar").checked = localStorage.getItem('statusbar') === 'show' ? true : false
  document.querySelector("#toolbar-status-shortcut").value = localStorage.getItem('toolbar-status-shortcut') || 'CommandOrControl+Shift+/'

  // 文件浏览
  document.querySelector("#select").addEventListener("click", async () => {

    let file = ''
    try {
      file = await dialog.pickFile()
    } catch (error) {
      console.log(error)
    }
    if(file) document.querySelector("#file").value = file
  });

  //shortcut 帮助
  document.querySelectorAll(".shortcut-help").forEach(item => {
    item.addEventListener("click", async () => {
      process.open(item.href)
    });
  });

  //保存设置
  const save = document.querySelector("#save");
  save.addEventListener("click", async () => {
    save.disabled = true;
    const file = document.querySelector("#file").value
    const width = document.querySelector("#width").value
    const height = document.querySelector("#height").value
    const externalChange = document.querySelector("#externalChangeAuto").checked
    const shortcut = document.querySelector("#shortcut").value
    const theme = document.querySelector("#theme").value
    const toolbar = document.querySelector("#toolbar").checked ? 'show' : 'hide'
    const statusbar = document.querySelector("#statusbar").checked ? 'show' : 'hide'
    const toolbarStatusShortcut = document.querySelector("#toolbar-status-shortcut").value
    localStorage.setItem('file', file)
    localStorage.setItem('width', width)
    localStorage.setItem('height', height)
    localStorage.setItem('externalChange', externalChange ? '1' : '')
    localStorage.setItem('shortcut', shortcut)
    localStorage.setItem('theme', theme)
    localStorage.setItem('toolbar', toolbar)
    localStorage.setItem('statusbar', statusbar)
    localStorage.setItem('toolbar-status-shortcut', toolbarStatusShortcut)
    save.value = '✓ 保存成功'
    const settings = {
      file: file,
      width: width,
      height: height,
      externalChange: externalChange,
      shortcut: shortcut,
      theme: theme,
      toolbar: toolbar,
      statusbar: statusbar,
      toolbarStatusShortcut: toolbarStatusShortcut
    }
    await window.sendMessage(JSON.stringify(settings), 0)
    setTimeout(() => {
      save.value = '保存'
      save.disabled = false;
    }, 1500)
  });

})()