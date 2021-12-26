import { createApp } from 'vue'
import App from './App.vue'
import installElementPlus from './plugins/element'

import '@fortawesome/fontawesome-free/css/all.css'

const app = createApp(App)
installElementPlus(app)
app.mount('#app')