import { app, BrowserWindow, ipcMain, webContents, nativeTheme, dialog, screen, TouchBar, Menu, MenuItem, shell } from 'electron'
import { create } from 'domain'
const menu = require('./menu.js').menu
const log = require('electron-log')
const {exec} = require('child_process')


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

  controlWindow = new BrowserWindow({ show: false, height: 450, resizable: false, maximizable: false, useContentSize: true, width: 460, webPreferences: { nodeIntegration: true } })

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
ipcMain.on('controlResize', (event, w, h) => {
  controlWindow.setContentSize(460, h)
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
  var cmd = pathToFfmpeg + ' -hide_banner -f dshow -show_video_device_dialog true -i video="' + device + '"'

  log.info('Executing ffmpeg: ' + cmd)

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      log.error(error)
      if (error.message.includes('requested filter does not have a property page')) {
        controlWindow.webContents.send('message', 'Device does not have any editable properties')
        dialog.showErrorBox('Oops', device + ' does not have any editable properties')
      } else if (error.message.includes('Failure showing property pages for')) {
        controlWindow.webContents.send('message', 'Can not access properties for device')
        dialog.showErrorBox('Oops', device + ' does not have any editable properties')
      }
      return;
    }
    log.verbose(`stdout: ${stdout}`)
  });
  
})