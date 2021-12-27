'use strict'

import { app, protocol, BrowserWindow, Menu, ipcMain, dialog, shell } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
const log = require('electron-log')
const { exec } = require('child_process')
const axios = require('axios')
var compareVersions = require('compare-versions')
const Store = require('electron-store')
const path = require('path')
const menu = require('./menu.js').menu

const store = new Store()

const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

process.on('uncaughtException', function (error) {
  if (isDevelopment) {
    dialog.showErrorBox('Unexpected Error', error + '\r\n\r\n' + JSON.stringify(error))
  }
  log.warn('Error: ', error)
})


let controlWindow

async function createWindow() {
  log.info('Showing control window')
  controlWindow = new BrowserWindow({
    width: 460,
    height: 450,
    resizable: false,
    maximizable: false,
    useContentSize: true,
    webPreferences: {
      
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // if (process.platform == 'darwin') {
  //   Menu.setApplicationMenu(menu)
  // } else {
  //   Menu.setApplicationMenu(null)
  // }

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await controlWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) controlWindow.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    controlWindow.loadURL('app://./index.html')
  }
}



// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }

  if (process.platform == 'darwin' && !isDevelopment) {
    log.warn('Launching on a mac... No worky')
    dialog.showMessageBox(null, {
      type: 'warning',
      title: 'Sorry!',
      message: 'At the moment, Device Kontrol can\'t run on a mac.'
    }).then(function (response) {
      process.exit()
    })
  } else {
    createWindow()
  }

  // DO ANALYTICS STUFF HERE!!

})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}




//========================//
//       IPC Handlers     //
//========================//
ipcMain.on('controlResize', (event, data) => {
  controlWindow.setContentSize(460, data.height + 20)
})

ipcMain.on('openLogs', (event) => {
  const path = log.transports.file.findLogPath()
  shell.showItemInFolder(path)
  Nucleus.track('Open Logs')
})



//========================//
//     Device Control     //
//========================//
var child = null

ipcMain.on('controlDevice', (event, device) => {
  log.info('Control Device: ', device)
  Nucleus.track('Launch FFMPEG Window')

  var pathToFfmpeg = '"' + require('ffmpeg-static').replace('app.asar', 'app.asar.unpacked') + '"'
  var cmd = pathToFfmpeg + ' -hide_banner -f dshow -show_video_device_dialog true -i video="' + device + '"'

  log.info('Executing ffmpeg: ' + cmd)

  if (child != null) {
    child.kill()
    log.verbose('killing old process')
  }

  child = exec(cmd, (error, stdout, stderr) => {
    if (error) {
      log.error(error)
      if (error.message.includes('requested filter does not have a property page')) {
        controlWindow.webContents.send('message', 'Device does not have any editable properties')
        dialog.showErrorBox('Oops', device + ' does not have any editable properties')
      } else if (error.message.includes('Failure showing property pages for')) {
        controlWindow.webContents.send('message', 'Can not access properties for device')
        dialog.showErrorBox('Oops', device + ' does not have any editable properties')
      }
      return
    }
  })
  
})




// setTimeout(function() {
//   let current = require('./../package.json').version

// // Make a request for a user with a given ID
// axios.get('https://api.github.com/repos/alteka/devicekontrol/releases/latest')
//   .then(function (response) {
//     let status = compareVersions(response.data.tag_name, current, '>')
//     if (status == 1) { 

//       let link = ''
//       for (const asset in response.data.assets) {
//         if (process.platform == 'darwin' && response.data.assets[asset].name.includes('.pkg')) {
//           link = response.data.assets[asset].browser_download_url
//         }
//         if (process.platform != 'darwin' && response.data.assets[asset].name.includes('.exe')) {
//           link = response.data.assets[asset].browser_download_url
//         }
//       }
//       dialog.showMessageBox(controlWindow, {
//         type: 'question',
//         title: 'An Update Is Available',
//         message: 'Would you like to download version: ' + response.data.tag_name,
//         buttons: ['Cancel', 'Yes']
//       }).then(function (response) {
//         if (response.response == 1) {
//           shell.openExternal(link)
//         }
//       });
//     } else if (status == 0) {
//       log.info('Running latest version')
//     } else if (status == -1) {
//       log.info('Running version newer than release')
//     }
//   })
//   .catch(function (error) {
//     console.log(error);
//   })
// }, 3000)