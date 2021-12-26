<template>
  <el-row style="text-align: center; margin-bottom: 10px;"> 
    <el-button type="primary" round @click="controlDevice()">
      <i class="fas fa-video" v-if="device.kind == 'videoinput'"> </i>
    {{ label }}
    </el-button>
  </el-row>
</template>

<script>
  export default {
    props: {
      device: Object
    },
    computed: {
      label: function() {
        return this.device.label.replace(/\s\([^)]+\)$/, '')
      }
    },
    methods: {
      controlDevice: function() { 
        window.ipcRenderer.send('controlDevice', this.label)
      }
    }
  }
</script>

<style scoped>

</style>
