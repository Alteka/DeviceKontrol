module.exports = {
    pluginOptions: {
      electronBuilder: {
        preload: 'src/preload.js',
        builderOptions: { 
          "productName": "DeviceKontrol",
          "appId": "solutions.alteka.devicekontrol",
          "directories": {
            "output": "build"
          },
          "files": [
            "dist/electron/**/*"
          ],
          "mac": {
            "icon": "build/icons/icon.png",
            "target": "pkg"
          },
          "win": {
            "icon": "build/icons/icon.png"
          },
          "nsis": {
            "oneClick": false,
            "createDesktopShortcut": false,
            "menuCategory": true
          }
        }
      }
    }
  }