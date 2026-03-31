# Next.js Dev Server - Truly Silent Startup
# 使用 Windows API 真正隐藏窗口启动

param(
    [string]$Port = "5000"
)

$projectPath = "F:\project_20260330_064308\projects"
$port = $Port
$logDir = "$projectPath\logs"

# 创建日志目录
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }

# 清理所有 node 进程
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# 等待端口释放
$attempts = 0
while (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue) {
    if ($attempts -ge 20) { break }
    Start-Sleep -Milliseconds 250
    $attempts++
}

# 使用 CreateNoWindow 标志启动进程（真正无窗口）
$env:PORT = $port
$env:NODE_OPTIONS = "--max-old-space-size=4096"

$process = Start-Process -FilePath "npx" -ArgumentList "next dev -p $port" -WorkingDirectory $projectPath -NoNewWindow -PassThru -WindowStyle Hidden

# 保存 PID
$pidFile = "$projectPath\.next\dev.pid"
@($process.Id) | Out-File -FilePath $pidFile -Force

Write-Host "Started Next.js dev server (PID: $($process.Id)) on port $port"
Write-Host "Log: $logDir\nextjs-dev.log"

# 等待服务就绪
Start-Sleep -Seconds 3

# 检查服务状态
$tcpConn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Where-Object { $_.State -eq "Listen" }
if ($tcpConn) {
    Write-Host "Server is ready at http://localhost:$port"
} else {
    Write-Host "Warning: Server may not be fully ready yet"
}
