<template>
  <div class="p-8">
    <div class="mb-8">
      <h1 class="font-serif text-4xl text-chocolate font-light">Dashboard</h1>
      <p class="text-sm text-neutral-400 mt-1">Resumen general de la tienda</p>
    </div>

    <!-- Stats grid -->
    <div class="grid grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
      <div v-for="s in statCards" :key="s.label" class="bg-white border border-neutral-200 rounded-xl p-5">
        <div class="flex items-start justify-between mb-4">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center" :class="s.bg">
            <component :is="s.icon" :size="17" :class="s.color" />
          </div>
        </div>
        <p class="font-serif text-3xl text-neutral-900 font-light leading-none mb-1">
          {{ s.formatted }}
        </p>
        <p class="text-xs text-neutral-400">{{ s.label }}</p>
      </div>
    </div>

    <!-- Two columns: recent orders + quick actions -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">

      <!-- Recent orders -->
      <div class="xl:col-span-2 bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <p class="text-sm font-medium text-neutral-800">Últimos pedidos</p>
          <RouterLink to="/admin/pedidos" class="text-xs text-rose hover:text-burgundy transition-colors">Ver todos</RouterLink>
        </div>
        <div v-if="loading" class="p-8 text-center text-neutral-400 text-sm">Cargando...</div>
        <table v-else class="w-full text-xs">
          <tbody class="divide-y divide-neutral-100">
            <tr v-for="o in recentOrders" :key="o.id" class="hover:bg-neutral-50 transition-colors">
              <td class="px-6 py-3 text-neutral-400">#{{ o.id }}</td>
              <td class="px-4 py-3 text-neutral-700 font-medium">{{ o.first_name }} {{ o.last_name }}</td>
              <td class="px-4 py-3 text-neutral-900">{{ formatPrice(o.total) }}</td>
              <td class="px-4 py-3">
                <span class="px-2 py-1 rounded-full text-[10px] tracking-wider uppercase font-semibold" :class="statusClass(o.status)">
                  {{ statusLabel(o.status) }}
                </span>
              </td>
              <td class="px-4 py-3 pr-6 text-neutral-400">{{ formatDate(o.created_at) }}</td>
            </tr>
            <tr v-if="recentOrders.length === 0">
              <td colspan="5" class="px-6 py-8 text-center text-neutral-400">Sin pedidos aún</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Quick actions -->
      <div class="flex flex-col gap-4">
        <div class="bg-white border border-neutral-200 rounded-xl p-5">
          <p class="text-sm font-medium text-neutral-800 mb-4">Acciones rápidas</p>
          <div class="flex flex-col gap-2">
            <RouterLink
              v-for="a in quickActions"
              :key="a.to"
              :to="a.to"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
            >
              <div class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" :class="a.bg">
                <component :is="a.icon" :size="14" :class="a.color" />
              </div>
              {{ a.label }}
            </RouterLink>
          </div>
        </div>

        <!-- Orders by status -->
        <div class="bg-white border border-neutral-200 rounded-xl p-5">
          <p class="text-sm font-medium text-neutral-800 mb-4">Estado de pedidos</p>
          <div class="flex flex-col gap-2.5">
            <div v-for="s in ordersByStatus" :key="s.status" class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full" :class="s.dot"></div>
                <span class="text-xs text-neutral-600">{{ s.label }}</span>
              </div>
              <span class="text-xs font-medium text-neutral-800">{{ s.count }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import {
  PackageIcon, ShoppingBagIcon, TrendingUpIcon, UsersIcon, TagIcon,
  PlusIcon, BellIcon, PercentIcon,
} from '@lucide/vue'
import { supabase } from '../../lib/supabase'

const loading = ref(true)
const recentOrders = ref([])
const rawStats = ref({ products: 0, orders: 0, revenue: 0, users: 0, discounts: 0 })
const allOrders = ref([])

const statCards = computed(() => [
  { label: 'Productos', formatted: rawStats.value.products, icon: PackageIcon, bg: 'bg-blue-50', color: 'text-blue-500' },
  { label: 'Pedidos', formatted: rawStats.value.orders, icon: ShoppingBagIcon, bg: 'bg-orange-50', color: 'text-orange-500' },
  { label: 'Ingresos', formatted: formatPrice(rawStats.value.revenue), icon: TrendingUpIcon, bg: 'bg-emerald-50', color: 'text-emerald-500' },
  { label: 'Usuarios', formatted: rawStats.value.users, icon: UsersIcon, bg: 'bg-purple-50', color: 'text-purple-500' },
  { label: 'Ofertas activas', formatted: rawStats.value.discounts, icon: TagIcon, bg: 'bg-amber-50', color: 'text-amber-500' },
])

const ordersByStatus = computed(() => {
  const statuses = [
    { status: 'pending', label: 'Pendiente', dot: 'bg-yellow-400' },
    { status: 'confirmed', label: 'Confirmado', dot: 'bg-blue-400' },
    { status: 'shipped', label: 'Enviado', dot: 'bg-purple-400' },
    { status: 'delivered', label: 'Entregado', dot: 'bg-emerald-400' },
    { status: 'cancelled', label: 'Cancelado', dot: 'bg-red-400' },
  ]
  return statuses.map(s => ({
    ...s,
    count: allOrders.value.filter(o => o.status === s.status).length,
  }))
})

const quickActions = [
  { label: 'Nuevo producto', to: '/admin/productos', icon: PlusIcon, bg: 'bg-blue-50', color: 'text-blue-500' },
  { label: 'Nueva oferta', to: '/admin/ofertas', icon: PercentIcon, bg: 'bg-amber-50', color: 'text-amber-500' },
  { label: 'Enviar notificación', to: '/admin/notificaciones', icon: BellIcon, bg: 'bg-rose/10', color: 'text-rose' },
]

onMounted(async () => {
  const [
    { count: pCount },
    { count: oCount },
    { data: orders },
    { data: revenue },
    { count: uCount },
    { count: dCount },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*').order('created_at', { ascending: false }),
    supabase.from('orders').select('total'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('discount_codes').select('*', { count: 'exact', head: true }).eq('active', true),
  ])

  rawStats.value = {
    products: pCount ?? 0,
    orders: oCount ?? 0,
    revenue: (revenue ?? []).reduce((a, o) => a + Number(o.total), 0),
    users: uCount ?? 0,
    discounts: dCount ?? 0,
  }
  allOrders.value = orders ?? []
  recentOrders.value = (orders ?? []).slice(0, 8)
  loading.value = false
})

function formatPrice(v) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v)
}
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
}
function statusLabel(s) {
  return { pending: 'Pendiente', confirmed: 'Confirmado', shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado' }[s] ?? s
}
function statusClass(s) {
  return {
    pending: 'bg-yellow-50 text-yellow-700',
    confirmed: 'bg-blue-50 text-blue-700',
    shipped: 'bg-purple-50 text-purple-700',
    delivered: 'bg-emerald-50 text-emerald-700',
    cancelled: 'bg-red-50 text-red-700',
  }[s] ?? 'bg-neutral-100 text-neutral-600'
}
</script>
