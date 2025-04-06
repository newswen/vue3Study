import {createApp} from 'vue'
import App from './App.vue'
import router from './router/router.js'

const  app = createApp(App)
// 创建一个Vue应用把路由挂载到页面app上面
app.use(router)
// 创建一个Vue应用把响应数据挂载到页面app上面
app.mount('#app')
