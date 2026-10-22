Set WshShell = CreateObject("Wscript.Shell")

' 启动 Node 后端服务（隐藏窗口）
WshShell.Run "node ""E:\家教管理\tutor-miniapp\backend\src\index.js""", 0, False

' 等后端启动
WScript.Sleep 2000

' 在默认浏览器中打开
WshShell.Run "http://localhost:3000", 1, False
