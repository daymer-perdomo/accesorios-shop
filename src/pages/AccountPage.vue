<template>
  <main class="pt-20 md:pt-24 min-h-screen bg-blush/10">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex items-start justify-between mb-10">
        <h1 class="font-serif text-4xl text-chocolate font-light">Mi cuenta</h1>
        <button class="btn-ghost text-xs" @click="handleSignOut">Cerrar sesión</button>
      </div>

      <!-- Profile info -->
      <div class="bg-white border border-peach p-6 mb-8">
        <p class="text-xs tracking-widest uppercase text-chocolate/40 mb-1">Correo</p>
        <p class="text-sm text-chocolate">{{ auth.user?.email }}</p>
      </div>

      <!-- Orders -->
      <h2 class="font-serif text-2xl text-chocolate font-light mb-6">Mis pedidos</h2>

      <div v-if="loadingOrders" class="text-center py-12 text-chocolate/40 font-serif text-lg">
        Cargando pedidos...
      </div>

      <div v-else-if="orders.length === 0" class="bg-white border border-peach p-10 text-center">
        <p class="font-serif text-xl text-chocolate/40 mb-4">Aún no tienes pedidos</p>
        <RouterLink to="/tienda" class="btn-outline text-xs">Explorar tienda</RouterLink>
      </div>

      <div v-else class="flex flex-col gap-4">
        <div
          v-for="order in orders"
          :key="order.id"
          class="bg-white border border-peach p-6"
        >
          <div class="flex items-start justify-between mb-4">
            <div>
              <p class="font-serif text-base text-chocolate">Pedido #{{ order.id }}</p>
              <p class="text-xs text-chocolate/40 mt-0.5">{{ formatDate(order.created_at) }}</p>
            </div>
            <span
              class="text-2xs tracking-widest uppercase px-3 py-1 font-medium"
              :class="statusClass(order.status)"
            >
              {{ statusLabel(order.status) }}
            </span>
          </div>

          <div class="flex flex-col divide-y divide-peach">
            <div
              v-for="item in order.order_items"
              :key="item.id"
              class="flex items-center gap-4 py-3"
            >
              <img
                :src="item.product_image"
                :alt="item.product_name"
                class="w-12 h-12 object-cover bg-blush flex-shrink-0"
              />
              <div class="flex-1 min-w-0">
                <p class="font-serif text-sm text-chocolate truncate">{{ item.product_name }}</p>
                <p class="text-xs text-chocolate/40 mt-0.5">x{{ item.qty }}</p>
              </div>
              <p class="text-sm text-chocolate">{{ formatPrice(item.price * item.qty) }}</p>
            </div>
          </div>

          <div class="border-t border-peach pt-4 mt-2 flex justify-between items-center">
            <span class="text-xs text-chocolate/40 uppercase tracking-widest">Total</span>
            <span class="font-serif text-base text-chocolate">{{ formatPrice(order.total) }}</span>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const orders = ref([])
const loadingOrders = ref(true)

onMounted(async () => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: false })

  if (!error) orders.value = data
  loadingOrders.value = false
})

async function handleSignOut() {
  await auth.signOut()
  router.push('/')
}

function formatPrice(amount) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount)
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
}

function statusLabel(status) {
  const map = { pending: 'Pendiente', confirmed: 'Confirmado', shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado' }
  return map[status] ?? status
}

function statusClass(status) {
  const map = {
    pending: 'bg-yellow-50 text-yellow-700',
    confirmed: 'bg-blue-50 text-blue-700',
    shipped: 'bg-purple-50 text-purple-700',
    delivered: 'bg-green-50 text-green-700',
    cancelled: 'bg-red-50 text-red-700',
  }
  return map[status] ?? 'bg-peach text-chocolate'
}
</script>
