<template>
  <div id="wrapper" style="position: relative; padding-bottom: 15px" :class="{ darkMode : darkMode }">

    <el-row style="padding-top: 10px;">
      <el-col :span="6" style="font-size: 100%; color: #bbb; padding-left: 10px;">
        <img src="~@/assets/bug.png" height="32" @click="openLogs()" />
      </el-col>
      <el-col :span="12" style="font-size: 200%; color: #bbb; text-align: center;">
        Device Kontrol
      </el-col>
      <el-col :span="6" style="text-align: right;">
        <el-button round size="mini" style="margin-right: 10px;" @click="updateDevices()"><i class="fas fa-sync-alt"></i> Refresh</el-button>
      </el-col>
    </el-row>
      
    <el-divider content-position="center">Select Video Device</el-divider>

    <device v-for="device in devices" :key="device.deviceId" :device="device"></device>

    <resize-observer @notify="handleResize" />
  </div>
</template>

<script>
const { ipcRenderer } = require('electron')
import Device from './Control/Device.vue'
import { Notification } from 'element-ui'
var compareVersions = require('compare-versions')

  export default {
    name: 'control',
    components: { Device },
    data: function () {
    return {
      devices: [],
      darkMode: false
    }
  },
    created: function() {
      let vm = this
      ipcRenderer.on('darkMode', function(event, val) {
        vm.darkMode = val
      })
      ipcRenderer.send('getConfigControl')
    },

    mounted: function(){
      this.$nextTick(function () {
        let h = document.getElementById('wrapper').clientHeight
        let w = document.getElementById('wrapper').clientWidth
        ipcRenderer.send('controlResize', w, h)
      })
      this.updateDevices()
    },
    methods: {
      handleResize: function({ width, height }) {
        ipcRenderer.send('controlResize', width, height)
      },
      openLogs: function() {
        ipcRenderer.send('openLogs')
      },
      updateDevices: function() {
        navigator.mediaDevices.enumerateDevices().then((devices) => {
          this.devices = devices.filter(device => device.kind === 'videoinput')
          console.log('Update devices... count: ', devices.length)
        })  
      }
    }
  }
</script>

<style>
 body {
  font-family: Sansation, Helvetica, sans-serif;
  overflow: hidden !important;
}
@font-face {
  font-family: Sansation;
  src: url("~@/assets/Sansation-Regular.ttf");
}
.green {
  color: #6ab42f;
  margin-right: 5px;
}
.darkMode {
  background: #222;
}
.darkMode .el-divider {
  background: #555;
}
.darkMode .el-divider__text {
  background: #222;
  color: #aaa;
}
.darkMode label {
  color: #bbb;
}
.darkMode .el-tabs--border-card {
  background: #333;
  border: 1px solid #111;
}
.darkMode .el-tabs--border-card>.el-tabs__header {
  background: #292929;
  border-bottom: 1px solid #111;
}
.darkMode .el-tabs--border-card>.el-tabs__header .el-tabs__item.is-active {
  background: #333;
  border-right: 1px solid #111;
  border-left: 1px solid #111;
}
.darkMode .el-color-picker__trigger {
  border: 1px solid #666;
}
.darkMode .el-radio-button__inner {
  background: #3d3d3d;
  color: #ddd;
  border: 1px solid #666;
}
.darkMode .el-radio-button:first-child .el-radio-button__inner {
  border-left: 1px solid #666;
}
.darkMode .el-button {
  background: #3d3d3d;
  color: #ddd;
  border: 1px solid #666;
}
.darkMode .el-input__inner {
  background: #3d3d3d;
  color: #ddd;
  border: 1px solid #666;
}
.darkMode .el-input-number__increase {
  background: #292929;
  color: #ddd;
}
.darkMode .el-input-number__decrease {
  background: #292929;
  color: #ddd;
}
.darkMode .el-drawer {
  background: #292929;
  border-top: 3px solid #6ab42f;
  color: #ddd;
}
.darkMode .el-checkbox-button__inner {
  background: none;
}
</style>
