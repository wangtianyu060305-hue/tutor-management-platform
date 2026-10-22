// Electron 桌面应用入口
const { app, BrowserWindow, Menu, dialog, Tray, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let tray = null;

const SERVER_PORT = 3000;
const isDev = !app.isPackaged;

// 获取数据目录：开发时用相对路径，打包后用 userData
function getDataDir() {
  if (isDev) return path.join(__dirname, 'data');
  return path.join(app.getPath('userData'), 'data');
}

// 确保数据目录存在
function ensureDataDir() {
  const dir = getDataDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function startServer() {
  const dataDir = ensureDataDir();

  // 在 require 服务器模块之前设置环境变量
  process.env.DATA_DIR = dataDir;
  process.env.PORT = String(SERVER_PORT);

  // 直接在 Electron 主进程中运行 Express 后端（无需子进程）
  require('./src/index');

  // 轮询等待服务器就绪
  return new Promise((resolve) => {
    const check = () => {
      const http = require('http');
      http.get(`http://localhost:${SERVER_PORT}/api/health`, (res) => {
        resolve();
      }).on('error', () => {
        setTimeout(check, 500);
      });
    };
    setTimeout(check, 500);
  });
}

function createWindow() {
  const iconPath = path.join(__dirname, 'public', 'icons', 'icon-256.png');

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 1000,
    minHeight: 680,
    title: '家教管理 - 一人公司',
    icon: iconPath,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // 窗口准备好后再显示，避免白屏闪烁
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.loadURL(`http://localhost:${SERVER_PORT}`);

  // 窗口关闭时最小化到托盘
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  // 开发时打开 DevTools
  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
}

function createTray() {
  const iconPath = path.join(__dirname, 'public', 'icons', 'icon-32.png');
  const trayIcon = nativeImage.createFromPath(iconPath);
  tray = new Tray(trayIcon);

  const contextMenu = Menu.buildFromTemplate([
    { label: '显示主窗口', click: () => { mainWindow.show(); mainWindow.focus(); } },
    { type: 'separator' },
    { label: '退出家教管理', click: () => { app.isQuitting = true; app.quit(); } }
  ]);

  tray.setToolTip('家教管理');
  tray.setContextMenu(contextMenu);

  // 双击托盘图标显示窗口
  tray.on('double-click', () => {
    mainWindow.show();
    mainWindow.focus();
  });
}

// 确保单实例运行
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// 配置应用菜单栏
function buildMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    ...(isMac ? [{
      label: '家教管理',
      submenu: [
        { role: 'about', label: '关于' },
        { type: 'separator' },
        { role: 'quit', label: '退出' }
      ]
    }] : []),
    {
      label: '视图',
      submenu: [
        { role: 'reload', label: '刷新页面' },
        { role: 'forceReload', label: '强制刷新' },
        { role: 'toggleDevTools', label: '开发者工具' },
        { type: 'separator' },
        { role: 'resetZoom', label: '重置缩放' },
        { role: 'zoomIn', label: '放大' },
        { role: 'zoomOut', label: '缩小' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '全屏' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        { label: '关于家教管理', click: () => {
          dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: '关于',
            message: '家教管理 v1.0.0',
            detail: '一人公司家教管理桌面应用\n支持课程排课、老师管理、家长反馈、AI 备课等功能。',
            buttons: ['确定']
          });
        }}
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(async () => {
  buildMenu();

  // 启动后端（在主进程中运行，无需子进程）
  try {
    await startServer();
    console.log('Backend server started in-process');
  } catch (e) {
    console.error('Failed to start server:', e);
  }

  // 创建窗口
  createWindow();

  // 创建系统托盘
  createTray();

  // macOS: dock 点击时恢复窗口
  app.on('activate', () => {
    if (mainWindow === null) createWindow();
    else mainWindow.show();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // 不退出，留在托盘
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
});

// 应用退出后清理
app.on('will-quit', () => {
  if (tray) {
    tray.destroy();
    tray = null;
  }
});
