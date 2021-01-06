import { app, BrowserWindow, ipcMain, webContents, nativeTheme, dialog, screen, TouchBar, Menu, MenuItem, shell } from 'electron'
import { create } from 'domain'
const fs = require('fs')
const say = require('say')
const Store = require('electron-store')
const menu = require('./menu.js').menu
const log = require('electron-log')
const {exec} = require('child_process')


const store = new Store()

if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
  log.info('Running in production mode')
}

process.on('uncaughtException', function (error) {
  if (process.env.NODE_ENV === 'development') {
    dialog.showErrorBox('Unexpected Error', error + '\r\n\r\n' + JSON.stringify(error))
  }
  log.warn('Error: ', error)
})

let controlWindow

function createWindow () {
  log.info('Showing control window')
  const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080` : `file://${__dirname}/index.html`

  controlWindow = new BrowserWindow({ show: false, height: 450, resizable: false, maximizable: false, useContentSize: true, width: 620, webPreferences: { nodeIntegration: true } })

  if (process.platform == 'darwin') {
    Menu.setApplicationMenu(menu)
  } else {
    Menu.setApplicationMenu(null)
  }
  
  controlWindow.loadURL(winURL)

  controlWindow.once('ready-to-show', () => {
    controlWindow.show()
  })

  controlWindow.on('closed', (event) => { 
    event.preventDefault()
    app.quit()
   })
}

app.on('ready', function() {
  log.info('Launching Device Kontrol')
  createWindow()
})

app.on('activate', () => {
  if (controlWindow === null) {
    createWindow()
  }
})


//========================//
//       IPC Handlers     //
//========================//
ipcMain.on('getConfigControl', (event, arg) => {
  controlWindow.webContents.send('darkMode', nativeTheme.shouldUseDarkColors)
  // send list of devices here?!?!!?!
})

ipcMain.on('controlResize', (event, w, h) => {
  controlWindow.setContentSize(620, h)
})

ipcMain.on('openLogs', (event, w, h) => {
  const path = log.transports.file.findLogPath()
  shell.showItemInFolder(path)
})


//========================//
//     Device Control     //
//========================//
ipcMain.on('controlDevice', (event, device) => {
  log.info('Control Device: ', device)

  var pathToFfmpeg = require('ffmpeg-static')
  var cmd = pathToFfmpeg + ' -f dshow -show_video_device_dialog true -i video="' + device + '"'

  log.info('Executing ffmpeg: ' + cmd)

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      dialog.showErrorBox('Unexpected Error', error + '\r\n\r\n' + JSON.stringify(error))
      log.error(error)
      return;
    }
    log.verbose(`stdout: ${stdout}`)
  });
  
})