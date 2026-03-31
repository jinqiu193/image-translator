# Stop Next.js Dev Server - Silent Stop
$projectPath = "F:\project_20260330_064308\projects"

# 读取保存的 PID
$pidFile = "$projectPath\.next\dev.pid"
if (Test-Path $pidFile) {
    $pids = Get-Content $pidFile -Raw
    foreach ($pid in $pids -split '\r?\n') {
        if ($pid -match '^\d+$') {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
    }
    Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
}

# 清理所有 next dev 相关进程
Get-Process | Where-Object {
    $_.MainWindowTitle -like "*next*" -or $_.ProcessName -eq "node"
} -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# 额外清理可能的残留
Get-CimInstance Win32_Process | Where-Object {
    $_.Name -eq "node.exe" -and ($_.CommandLine -match "next" -or $_.CommandLine -match "5000")
} -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
}

Write-Host "Next.js dev server stopped."
