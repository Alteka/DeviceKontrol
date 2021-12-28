<template>
  <el-row style="padding-top: 10px;">
      <el-col :span="18" style="text-align: left; font-size: 36px; padding-left: 10px;">
        <img src="~@/assets/bug.png" height="26" @click="openLogs()" />
        Device Kontrol
      </el-col>
      <el-col :span="6" style="text-align: right;">
        <el-button round size="small" style="margin-right: 10px;" @click="reload();"><i class="fas fa-sync-alt"></i></el-button>
      </el-col>
    </el-row>

      <div style="font-size: 70%; position: absolute; top: 50px; right: 18px;">v{{ version }}</div>
    <el-divider content-position="center">Select Video Device</el-divider>

    <device v-for="device in devices" :key="device.deviceId" :device="device"></device>

    <el-row v-if="devices.length == 0" justify="center">
      <el-tag type="info">No Matching Devices Found</el-tag>
    </el-row>

    <resize-observer @notify="handleResize" />
</template>

<script>
import Device from './components/Device.vue'

export default {
  name: 'App',
  components: {
    Device
  },
  data: function () {
      return {
        devices: [],
        version: require('./../package.json').version
      }
    },
    mounted: function(){
      this.$nextTick(function () {
        let h = document.getElementById('app').clientHeight
        let w = document.getElementById('app').clientWidth
        window.ipcRenderer.send('controlResize', {width: w, height: h})
      })
      this.getDevices()
    },
    methods: {
      handleResize: function() {
        let h = document.getElementById('app').clientHeight
        let w = document.getElementById('app').clientWidth
        window.ipcRenderer.send('controlResize', {width: w, height: h})
      },
      openLogs: function() {
        window.ipcRenderer.send('openLogs')
      },
      reload: function() {
        window.document.location.reload()
      },
      getDevices: function() {
        navigator.mediaDevices.enumerateDevices().then((devices) => {
          this.devices = devices.filter(device => device.kind === 'videoinput').filter(device => !device.label.includes('Virtual Camera')).filter(device => !device.label.includes('Virtual Camera')).filter(device => !device.label.includes('NewTek NDI Video')).filter(device => !device.label.includes('vMix'))
          console.log('Update devices... count: ', devices.length)
        })  
      }
    }
}
</script>

<style>
#app {
  font-family: Sansation, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
body {
  font-family: Sansation, Helvetica, sans-serif;
  overflow: hidden !important;
  margin: 0;
}
@font-face {
  font-family: Sansation;
  src: url("~@/assets/Sansation-Regular.ttf");
}
.green {
  color: #6ab42f;
  margin-right: 5px;
}
</style>
