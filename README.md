# Alteka Device Kontrol

A simple utility for Windows, to access Webcam Settings easily. 

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![GitHub release](https://img.shields.io/github/release/Alteka/DeviceKontrol.svg)](https://GitHub.com/Alteka/DeviceKontrol/releases/)
[![GitHub issues](https://img.shields.io/github/issues/Alteka/DeviceKontrol.svg)](https://GitHub.com/Alteka/DeviceKontrol/issues/)

## About
Most webcams on windows use USB 'Video Input Device Class' specifications. This can let you control certain parameters but these aren't exposed in any kind of user interface very well. This app simply wraps the devices out to a basic control window (rendered by ffmpeg).


#### Design

The app is based around Electron to create and manage the windows. The content is heavily Vue.js driven.

#### Build Setup
``` bash
#Clone the repo into a folder
# cd into the folder and run the below
#You'll need to have node.js installed

# install dependencies
yarn install

# serve with hot reload at localhost:9080
yarn run electron:serve

# build electron application for production
yarn run electron:build
```

---

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

---

For more information please see our website: [Alteka Solutions](https://alteka.solutions/kards)