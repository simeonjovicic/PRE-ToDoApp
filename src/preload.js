const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    prompt: (message, defaultValue) => ipcRenderer.invoke('prompt', { message, defaultValue })
});