import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import { useProductsStore } from './stores/products'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const auth = useAuthStore()
const productsStore = useProductsStore()

Promise.allSettled([auth.init(), productsStore.fetchProducts(), productsStore.fetchCategories()]).then(() => {
  app.mount('#app')
})
