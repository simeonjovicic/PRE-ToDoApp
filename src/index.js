const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      devTools: false
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('prompt', async (event, { message, defaultValue }) => {
  const result = await dialog.showMessageBox({
    type: 'question',
    buttons: ['OK', 'Cancel'],
    defaultId: 0,
    title: 'Edit Column Title',
    message: message,
    detail: '',
    input: true,
    inputPlaceholder: defaultValue
  });

  if (result.response === 0) { // OK button
    return result.inputValue;
  }
  return null;
});
