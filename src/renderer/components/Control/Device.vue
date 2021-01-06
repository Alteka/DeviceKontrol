<template>
  <el-row style="text-align: center"> 
    <el-button round>
      <i class="fas fa-video" v-if="device.kind == 'videoinput'"> </i>
    {{ device.label }}
    </el-button>
  </el-row>
</template>

<script>
const { ipcRenderer } = require('electron')
  export default {
    props: {
      device: InputDeviceInfo
    },
    data: function() {
      return {
        screens: []
      }
    },
    methods: {
      selectScreen: function(id) { 
        
      }
    },
    mounted: function() {
      let vm = this
      
    }
  }
</script>

<style scoped>

</style>
