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
  document.querySelector("#shortcutFormat").addEventListener("click", async () => {
    process.open(document.querySelector("#shortcutFormat").href)
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
    localStorage.setItem('file', file)
    localStorage.setItem('width', width)
    localStorage.setItem('height', height)
    localStorage.setItem('externalChange', externalChange ? '1' : '')
    localStorage.setItem('shortcut', shortcut)
    save.value = '✓ 保存成功'
    const settings = {
      file: file,
      width: width,
      height: height,
      externalChange: externalChange,
      shortcut: shortcut
    }
    await window.sendMessage(JSON.stringify(settings), 0)
    setTimeout(() => {
      save.value = '保存'
      save.disabled = false;
    }, 1500)
  });

})()