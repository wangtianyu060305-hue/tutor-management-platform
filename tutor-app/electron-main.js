const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  const iconPath = path.join(__dirname, 'dist/build/h5/static/logo-256.png');
  const htmlPath = path.join(__dirname, 'dist/build/h5/index.html');

  console.log('Loading HTML from:', htmlPath);

  mainWindow = new BrowserWindow({
    width: 420,
    height: 900,
    title: '家教管理',
    icon: iconPath,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile(htmlPath).catch(err => {
    console.error('Failed to load:', err.message);
  });

  mainWindow.on('page-title-updated', (e) => e.preventDefault());
  mainWindow.on('closed', () => { mainWindow = null; });

  // Open DevTools for debugging (remove in production)
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => { app.quit(); });
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
