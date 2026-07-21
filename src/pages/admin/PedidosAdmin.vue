<template>
  <div class="p-8">
    <div class="flex items-start justify-between mb-8">
      <div>
        <h1 class="font-serif text-4xl text-chocolate font-light">Pedidos</h1>
        <p class="text-sm text-neutral-400 mt-1">Gestión de ventas y consultas</p>
      </div>
    </div>

    <!-- Filter tabs -->
    <div class="flex gap-2 mb-6">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="text-xs px-4 py-2 rounded-full border transition-colors"
        :class="activeTab === tab.value
          ? 'bg-chocolate text-white border-chocolate'
          : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400'"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
        <span class="ml-1 opacity-60">{{ countFor(tab.value) }}</span>
      </button>
    </div>

    <div v-if="loading" class="text-center py-12 text-neutral-400">Cargando...</div>

    <div v-else-if="!filtered.length" class="bg-white border border-neutral-200 rounded-xl p-12 text-center text-neutral-400">
      Sin pedidos
    </div>

    <div v-else class="flex flex-col gap-4">
      <div
        v-for="order in filtered"
        :key="order.id"
        class="bg-white border rounded-xl overflow-hidden transition-colors"
        :class="order.channel === 'whatsapp' ? 'border-[#25D366]/40' : 'border-neutral-200'"
      >
        <!-- Header -->
        <div class="flex items-start justify-between px-6 py-4 border-b"
          :class="order.channel === 'whatsapp' ? 'border-[#25D366]/20 bg-[#f0fdf4]' : 'border-neutral-100'">
          <div class="flex items-start gap-3">
            <!-- WhatsApp badge -->
            <div v-if="order.channel === 'whatsapp'"
              class="mt-0.5 flex-shrink-0 flex items-center gap-1.5 bg-[#25D366] text-white text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wider">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </div>
            <div>
              <p class="font-serif text-base text-chocolate">Pedido #{{ order.id }}</p>
              <p class="text-xs text-neutral-400 mt-0.5">{{ formatDate(order.created_at) }}</p>
              <template v-if="order.channel !== 'whatsapp'">
                <p class="text-xs text-neutral-600 mt-1">{{ order.first_name }} {{ order.last_name }} — {{ order.email }}</p>
                <p class="text-xs text-neutral-400 mt-0.5">{{ order.address }}, {{ order.city }}</p>
              </template>
              <p v-else class="text-xs text-neutral-500 mt-1 italic">{{ order.notes }}</p>
            </div>
          </div>

          <!-- Right side -->
          <div class="flex flex-col items-end gap-2 flex-shrink-0">
            <p class="font-serif text-lg text-chocolate">{{ formatPrice(order.total) }}</p>

            <!-- WhatsApp controls -->
            <div v-if="order.channel === 'whatsapp'" class="flex flex-col gap-1.5 items-end">
              <label class="flex items-center gap-2 cursor-pointer select-none">
                <span class="text-xs text-neutral-500">Vendido</span>
                <button
                  class="w-9 h-5 rounded-full transition-colors relative flex-shrink-0"
                  :class="order.wa_sold ? 'bg-[#25D366]' : 'bg-neutral-200'"
                  @click="toggleWa(order, 'wa_sold')"
                >
                  <span class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                    :class="order.wa_sold ? 'left-[18px]' : 'left-0.5'" />
                </button>
              </label>
              <label class="flex items-center gap-2 cursor-pointer select-none">
                <span class="text-xs text-neutral-500">Pagado</span>
                <button
                  class="w-9 h-5 rounded-full transition-colors relative flex-shrink-0"
                  :class="order.wa_paid ? 'bg-emerald-500' : 'bg-neutral-200'"
                  @click="toggleWa(order, 'wa_paid')"
                >
                  <span class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                    :class="order.wa_paid ? 'left-[18px]' : 'left-0.5'" />
                </button>
              </label>
            </div>

            <!-- Web order status select -->
            <select
              v-else
              :value="order.status"
              class="text-[10px] tracking-widest uppercase border border-neutral-200 rounded-lg px-2 py-1.5 bg-white text-neutral-600 focus:outline-none focus:border-rose cursor-pointer"
              @change="updateStatus(order, $event.target.value)"
            >
              <option value="pending">Pendiente</option>
              <option value="confirmed">Confirmado</option>
              <option value="shipped">Enviado</option>
              <option value="delivered">Entregado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>

        <!-- Items (solo pedidos web) -->
        <div v-if="order.order_items?.length" class="divide-y divide-neutral-50">
          <div v-for="item in order.order_items" :key="item.id" class="flex items-center gap-4 px-6 py-3">
            <img v-if="item.product_image" :src="item.product_image" class="w-10 h-10 object-cover bg-blush rounded flex-shrink-0" />
            <div class="flex-1 min-w-0">
              <p class="text-xs text-neutral-700 truncate">{{ item.product_name }}</p>
              <p class="text-[10px] text-neutral-400 mt-0.5">x{{ item.qty }}</p>
            </div>
            <p class="text-xs text-neutral-700">{{ formatPrice(item.price * item.qty) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../../lib/supabase'

const orders = ref([])
const loading = ref(true)
const activeTab = ref('all')

const tabs = [
  { label: 'Todos',      value: 'all' },
  { label: 'Web',        value: 'web' },
  { label: 'WhatsApp',   value: 'whatsapp' },
]

const filtered = computed(() => {
  if (activeTab.value === 'all') return orders.value
  return orders.value.filter(o => o.channel === activeTab.value)
})

function countFor(tab) {
  if (tab === 'all') return orders.value.length
  return orders.value.filter(o => o.channel === tab).length
}

onMounted(async () => {
  const { data } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })
  orders.value = data ?? []
  loading.value = false
})

async function updateStatus(order, newStatus) {
  order.status = newStatus
  await supabase.from('orders').update({ status: newStatus }).eq('id', order.id)
}

async function toggleWa(order, field) {
  order[field] = !order[field]
  await supabase.from('orders').update({ [field]: order[field] }).eq('id', order.id)
}

function formatPrice(v) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v ?? 0)
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
