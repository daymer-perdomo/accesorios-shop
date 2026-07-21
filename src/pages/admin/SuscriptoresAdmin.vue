<template>
  <div class="p-8">
    <div class="flex items-start justify-between mb-8">
      <div>
        <h1 class="font-serif text-4xl text-chocolate font-light">Suscriptores</h1>
        <p class="text-sm text-neutral-400 mt-1">Comunidad del newsletter</p>
      </div>
      <button class="btn-ghost text-xs flex items-center gap-2" @click="exportCsv">
        <DownloadIcon :size="14" /> Exportar CSV
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
      <div class="bg-white border border-neutral-200 rounded-xl p-5">
        <p class="text-[10px] tracking-widest uppercase text-neutral-400 mb-1">Total</p>
        <p class="font-serif text-3xl text-chocolate font-light">{{ subscribers.length }}</p>
      </div>
      <div class="bg-white border border-neutral-200 rounded-xl p-5">
        <p class="text-[10px] tracking-widest uppercase text-neutral-400 mb-1">Activos</p>
        <p class="font-serif text-3xl text-emerald-600 font-light">{{ activeCount }}</p>
      </div>
      <div class="bg-white border border-neutral-200 rounded-xl p-5">
        <p class="text-[10px] tracking-widest uppercase text-neutral-400 mb-1">Inactivos</p>
        <p class="font-serif text-3xl text-neutral-400 font-light">{{ subscribers.length - activeCount }}</p>
      </div>
    </div>

    <!-- Search + filter -->
    <div class="flex items-center gap-3 mb-5">
      <div class="relative flex-1 max-w-xs">
        <SearchIcon :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input v-model="search" placeholder="Buscar correo..." class="input w-full pl-8 text-xs" />
      </div>
      <div class="flex gap-2">
        <button
          v-for="f in filters"
          :key="f.value"
          class="text-xs px-3 py-1.5 rounded-full border transition-colors"
          :class="filter === f.value
            ? 'bg-chocolate text-white border-chocolate'
            : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400'"
          @click="filter = f.value"
        >
          {{ f.label }}
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      <div v-if="loading" class="text-center py-16 text-neutral-400 text-sm">Cargando...</div>
      <div v-else-if="!filtered.length" class="text-center py-16 text-neutral-400 text-sm">Sin resultados</div>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="border-b border-neutral-100">
            <th class="text-left text-[10px] tracking-widest uppercase text-neutral-400 px-6 py-3 font-normal">Correo</th>
            <th class="text-left text-[10px] tracking-widest uppercase text-neutral-400 px-6 py-3 font-normal hidden md:table-cell">Fecha</th>
            <th class="text-left text-[10px] tracking-widest uppercase text-neutral-400 px-6 py-3 font-normal">Estado</th>
            <th class="px-6 py-3 w-10" />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="s in filtered"
            :key="s.id"
            class="border-b border-neutral-50 hover:bg-neutral-50 transition-colors"
          >
            <td class="px-6 py-3 text-neutral-800 font-mono text-xs">{{ s.email }}</td>
            <td class="px-6 py-3 text-neutral-400 text-xs hidden md:table-cell">{{ formatDate(s.created_at) }}</td>
            <td class="px-6 py-3">
              <button
                class="text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider transition-colors"
                :class="s.active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'"
                @click="toggleActive(s)"
              >
                {{ s.active ? 'Activo' : 'Inactivo' }}
              </button>
            </td>
            <td class="px-6 py-3 text-right">
              <button class="text-neutral-300 hover:text-red-500 transition-colors" @click="confirmDelete(s)">
                <Trash2Icon :size="14" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Confirm delete -->
    <Teleport to="body">
      <div v-if="toDelete" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="toDelete = null">
        <div class="bg-white rounded-2xl border border-neutral-200 p-8 max-w-sm w-full text-center shadow-xl">
          <p class="font-serif text-xl text-chocolate font-light mb-2">¿Eliminar suscriptor?</p>
          <p class="text-xs text-neutral-400 mb-6">{{ toDelete.email }}</p>
          <div class="flex gap-3 justify-center">
            <button class="btn-primary text-xs bg-red-500 hover:bg-red-600" @click="deleteSub">Eliminar</button>
            <button class="btn-ghost text-xs" @click="toDelete = null">Cancelar</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { SearchIcon, Trash2Icon, DownloadIcon } from '@lucide/vue'
import { supabase } from '../../lib/supabase'

const subscribers = ref([])
const loading = ref(true)
const search = ref('')
const filter = ref('all')
const toDelete = ref(null)

const filters = [
  { label: 'Todos', value: 'all' },
  { label: 'Activos', value: 'active' },
  { label: 'Inactivos', value: 'inactive' },
]

const activeCount = computed(() => subscribers.value.filter(s => s.active).length)

const filtered = computed(() => {
  return subscribers.value.filter(s => {
    const matchSearch = !search.value || s.email.includes(search.value.toLowerCase())
    const matchFilter = filter.value === 'all' || (filter.value === 'active' ? s.active : !s.active)
    return matchSearch && matchFilter
  })
})

onMounted(fetchSubscribers)

async function fetchSubscribers() {
  loading.value = true
  const { data } = await supabase.from('subscribers').select('*').order('created_at', { ascending: false })
  subscribers.value = data ?? []
  loading.value = false
}

async function toggleActive(s) {
  s.active = !s.active
  await supabase.from('subscribers').update({ active: s.active }).eq('id', s.id)
}

function confirmDelete(s) { toDelete.value = s }

async function deleteSub() {
  await supabase.from('subscribers').delete().eq('id', toDelete.value.id)
  subscribers.value = subscribers.value.filter(s => s.id !== toDelete.value.id)
  toDelete.value = null
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

function exportCsv() {
  const rows = [['email', 'activo', 'fecha'], ...filtered.value.map(s => [s.email, s.active, s.created_at])]
  const csv = rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'suscriptores.csv'; a.click()
  URL.revokeObjectURL(url)
}
</script>
