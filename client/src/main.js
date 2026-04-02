import { createApp } from 'vue'
import { createBootstrap } from 'bootstrap-vue-next'
import App from './App.vue'
import router from './router'
import BaseButton from './components/BaseButton.vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

const app = createApp(App)
app.component('BaseButton', BaseButton)
app.use(createBootstrap())
app.use(router)
app.mount('#app')
