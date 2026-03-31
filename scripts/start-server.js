/**
 * Next.js Dev Server Manager
 * 真正的无窗口启动脚本
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const projectPath = 'F:\\project_20260330_064308\\projects';
const port = 5000;
const pidFile = path.join(projectPath, '.next', 'dev.pid');
const logDir = path.join(projectPath, 'logs');

// 确保目录存在
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(logDir, 'nextjs-dev.log');

// 清理函数
function cleanup() {
  // 杀掉所有 node 进程
  try {
    const { execSync } = require('child_process');
    execSync('taskkill /F /IM node.exe', { stdio: 'ignore', windowsHide: true });
  } catch (e) {
    // 忽略错误
  }
  
  // 删除 PID 文件
  if (fs.existsSync(pidFile)) {
    fs.unlinkSync(pidFile);
  }
}

// 清理旧的进程
cleanup();

// 等待端口释放
function waitForPort() {
  return new Promise((resolve) => {
    const net = require('net');
    const client = new net.Socket();
    
    client.connect(port, '127.0.0.1', () => {
      client.destroy();
      // 端口被占用，等待
      setTimeout(waitForPort, 500);
    });
    
    client.on('error', () => {
      client.destroy();
      // 端口空闲
      resolve();
    });
  });
}

// 启动服务器
async function start() {
  console.log('Waiting for port 5000 to be free...');
  await waitForPort();
  
  console.log('Starting Next.js dev server...');
  
  // 创建日志流
  const logStream = fs.createWriteStream(logFile, { flags: 'a' });
  
  // 设置环境变量
  const env = {
    ...process.env,
    PORT: port.toString(),
    NODE_OPTIONS: '--max-old-space-size=4096',
  };
  
  // 启动进程 - 使用 spawn 而不是 exec
  // spawn 默认不会创建新窗口（除非 inherit）
  const child = spawn('npx', ['next', 'dev', '-p', port], {
    cwd: projectPath,
    env,
    detached: true,  // 分离进程
    stdio: ['ignore', 'pipe', 'pipe'],  // 不继承 stdin，pipe stdout/stderr
    windowsHide: true,  // 隐藏窗口
  });
  
  // 保存 PID
  fs.writeFileSync(pidFile, child.pid.toString());
  
  // 处理输出
  child.stdout.on('data', (data) => {
    const text = data.toString();
    logStream.write(text);
    process.stdout.write(text);
  });
  
  child.stderr.on('data', (data) => {
    const text = data.toString();
    logStream.write(text);
    process.stderr.write(text);
  });
  
  child.on('error', (err) => {
    console.error('Failed to start:', err);
    logStream.write(`Error: ${err.message}\n`);
  });
  
  child.on('exit', (code) => {
    console.log(`Server exited with code ${code}`);
    logStream.write(`Server exited with code ${code}\n`);
    cleanup();
  });
  
  console.log(`Server started with PID ${child.pid}`);
  console.log(`Log file: ${logFile}`);
  
  // 分离子进程
  child.unref();
  
  // 等待服务器就绪
  setTimeout(() => {
    const net = require('net');
    const client = new net.Socket();
    
    client.connect(port, '127.0.0.1', () => {
      client.destroy();
      console.log(`Server is ready at http://localhost:${port}`);
    });
    
    client.on('error', () => {
      client.destroy();
      console.log('Server is starting...');
    });
  }, 3000);
}

start();
