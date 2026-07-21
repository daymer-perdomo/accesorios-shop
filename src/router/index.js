import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import HomePage from '../pages/HomePage.vue'
import ShopPage from '../pages/ShopPage.vue'
import ProductPage from '../pages/ProductPage.vue'
import CartPage from '../pages/CartPage.vue'
import CheckoutPage from '../pages/CheckoutPage.vue'
import AuthPage from '../pages/AuthPage.vue'
import AccountPage from '../pages/AccountPage.vue'
import NosotrosPage from '../pages/NosotrosPage.vue'
import ClientesPage from '../pages/ClientesPage.vue'
import AdminLayout from '../pages/admin/AdminLayout.vue'
import DashboardAdmin from '../pages/admin/DashboardAdmin.vue'
import ProductosAdmin from '../pages/admin/ProductosAdmin.vue'
import PedidosAdmin from '../pages/admin/PedidosAdmin.vue'
import UsuariosAdmin from '../pages/admin/UsuariosAdmin.vue'
import OfertasAdmin from '../pages/admin/OfertasAdmin.vue'
import NotificacionesAdmin from '../pages/admin/NotificacionesAdmin.vue'
import SliderAdmin from '../pages/admin/SliderAdmin.vue'
import SuscriptoresAdmin from '../pages/admin/SuscriptoresAdmin.vue'
import ConfigAdmin from '../pages/admin/ConfigAdmin.vue'
import TestimoniosAdmin from '../pages/admin/TestimoniosAdmin.vue'

const routes = [
  { path: '/', component: HomePage, name: 'home' },
  { path: '/tienda', component: ShopPage, name: 'shop' },
  { path: '/producto/:id', component: ProductPage, name: 'product' },
  { path: '/carrito', component: CartPage, name: 'cart' },
  { path: '/checkout', component: CheckoutPage, name: 'checkout' },
  { path: '/cuenta', component: AuthPage, name: 'auth', meta: { guestOnly: true } },
  { path: '/mi-cuenta', component: AccountPage, name: 'account', meta: { requiresAuth: true } },
  { path: '/nosotros', component: NosotrosPage, name: 'nosotros' },
  { path: '/clientes', component: ClientesPage, name: 'clientes' },
  { path: '/dejar-resena', component: () => import('../pages/DejarResenaPage.vue'), name: 'dejar-resena' },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAdmin: true },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', component: DashboardAdmin, name: 'admin-dashboard' },
      { path: 'productos', component: ProductosAdmin, name: 'admin-productos' },
      { path: 'pedidos', component: PedidosAdmin, name: 'admin-pedidos' },
      { path: 'usuarios', component: UsuariosAdmin, name: 'admin-usuarios' },
      { path: 'ofertas', component: OfertasAdmin, name: 'admin-ofertas' },
      { path: 'notificaciones', component: NotificacionesAdmin, name: 'admin-notificaciones' },
      { path: 'slider', component: SliderAdmin, name: 'admin-slider' },
      { path: 'suscriptores', component: SuscriptoresAdmin, name: 'admin-suscriptores' },
      { path: 'configuracion', component: ConfigAdmin, name: 'admin-configuracion' },
      { path: 'testimonios', component: TestimoniosAdmin, name: 'admin-testimonios' },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() { return { top: 0 } },
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAdmin && !auth.isAdmin) return { name: 'home' }
  if (to.meta.requiresAuth && !auth.isLoggedIn) return { name: 'auth' }
  if (to.meta.guestOnly && auth.isLoggedIn) return { name: 'account' }
})

export default router
