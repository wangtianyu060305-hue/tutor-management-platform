Set-Location "E:\家教管理\tutor-miniapp\backend"

$env:DATA_DIR = "E:\家教管理\tutor-miniapp\backend\data"
$env:PORT = "3000"

# 后台启动 Node 后端
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = "node"
$psi.Arguments = "src\index.js"
$psi.WorkingDirectory = "E:\家教管理\tutor-miniapp\backend"
$psi.UseShellExecute = $false
$psi.CreateNoWindow = $true
[System.Diagnostics.Process]::Start($psi) | Out-Null

# 等待后端就绪
Start-Sleep -Seconds 2

# 在浏览器打开
Start-Process "http://localhost:3000"
