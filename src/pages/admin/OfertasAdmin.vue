<template>
  <div class="p-8">
    <div class="flex items-start justify-between mb-8">
      <div>
        <h1 class="font-serif text-4xl text-chocolate font-light">Ofertas</h1>
        <p class="text-sm text-neutral-400 mt-1">Códigos de descuento</p>
      </div>
      <button class="btn-primary text-xs" @click="openCreate">+ Nuevo código</button>
    </div>

    <!-- Summary chips -->
    <div class="grid grid-cols-3 gap-4 mb-8">
      <div class="bg-white border border-neutral-200 rounded-xl p-5">
        <p class="text-[10px] tracking-widest uppercase text-neutral-400 mb-2">Activos</p>
        <p class="font-serif text-3xl text-neutral-900 font-light">{{ codes.filter(c => c.active).length }}</p>
      </div>
      <div class="bg-white border border-neutral-200 rounded-xl p-5">
        <p class="text-[10px] tracking-widest uppercase text-neutral-400 mb-2">Total usos</p>
        <p class="font-serif text-3xl text-neutral-900 font-light">{{ codes.reduce((a, c) => a + c.uses_count, 0) }}</p>
      </div>
      <div class="bg-white border border-neutral-200 rounded-xl p-5">
        <p class="text-[10px] tracking-widest uppercase text-neutral-400 mb-2">Vencidos</p>
        <p class="font-serif text-3xl text-neutral-900 font-light">{{ expired }}</p>
      </div>
    </div>

    <div v-if="loading" class="text-center py-16 text-neutral-400">Cargando...</div>
    <div v-else class="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      <table class="w-full text-xs">
        <thead>
          <tr class="border-b border-neutral-100 bg-neutral-50">
            <th class="text-left px-6 py-3 text-[10px] tracking-widest uppercase text-neutral-400 font-semibold">Código</th>
            <th class="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-neutral-400 font-semibold">Descuento</th>
            <th class="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-neutral-400 font-semibold">Compra mínima</th>
            <th class="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-neutral-400 font-semibold">Usos</th>
            <th class="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-neutral-400 font-semibold">Vence</th>
            <th class="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-neutral-400 font-semibold">Estado</th>
            <th class="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-100">
          <tr v-for="c in codes" :key="c.id" class="hover:bg-neutral-50 transition-colors">
            <td class="px-6 py-3.5">
              <div class="flex items-center gap-2">
                <span class="font-mono font-semibold text-neutral-800 tracking-wider">{{ c.code }}</span>
                <button class="text-neutral-300 hover:text-neutral-600 transition-colors" @click="copyCode(c.code)">
                  <CopyIcon :size="12" />
                </button>
              </div>
            </td>
            <td class="px-4 py-3.5">
              <span class="font-semibold" :class="c.type === 'percent' ? 'text-emerald-600' : 'text-blue-600'">
                {{ c.type === 'percent' ? `${c.value}%` : formatPrice(c.value) }}
              </span>
            </td>
            <td class="px-4 py-3.5 text-neutral-500">
              {{ c.min_purchase > 0 ? formatPrice(c.min_purchase) : '—' }}
            </td>
            <td class="px-4 py-3.5 text-neutral-600">
              {{ c.uses_count }} / {{ c.max_uses ?? '∞' }}
            </td>
            <td class="px-4 py-3.5 text-neutral-500">
              {{ c.expires_at ? formatDate(c.expires_at) : 'Sin vencimiento' }}
            </td>
            <td class="px-4 py-3.5">
              <button
                class="flex items-center gap-1.5 text-[10px] tracking-widest uppercase font-semibold px-2.5 py-1 rounded-full transition-colors"
                :class="c.active ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'"
                @click="toggleActive(c)"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="c.active ? 'bg-emerald-500' : 'bg-neutral-300'"></span>
                {{ c.active ? 'Activo' : 'Inactivo' }}
              </button>
            </td>
            <td class="px-6 py-3.5">
              <div class="flex items-center gap-2 justify-end">
                <button class="text-neutral-400 hover:text-neutral-700 transition-colors p-1" @click="openEdit(c)">
                  <PencilIcon :size="13" />
                </button>
                <button class="text-neutral-400 hover:text-red-500 transition-colors p-1" @click="confirmDelete(c)">
                  <Trash2Icon :size="13" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="codes.length === 0">
            <td colspan="7" class="px-6 py-10 text-center text-neutral-400">Sin códigos de descuento</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal crear/editar -->
    <Teleport to="body">
      <div v-if="modal" class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="modal = null">
        <div class="bg-white w-full max-w-md border border-neutral-200 rounded-2xl overflow-hidden shadow-xl">
          <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
            <h2 class="font-serif text-xl text-chocolate font-light">{{ modal.id ? 'Editar código' : 'Nuevo código' }}</h2>
            <button class="text-neutral-400 hover:text-neutral-700 transition-colors" @click="modal = null"><XIcon :size="18" /></button>
          </div>
          <form class="px-6 py-5 flex flex-col gap-4" @submit.prevent="saveCode">
            <div>
              <label class="text-[10px] tracking-widest uppercase text-neutral-400 block mb-1.5">Código *</label>
              <div class="flex gap-2">
                <input v-model="modal.code" required class="input flex-1 font-mono uppercase" placeholder="VERANO25" />
                <button type="button" class="btn-outline text-xs px-3 py-2 whitespace-nowrap" @click="modal.code = generateCode()">Auto</button>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-[10px] tracking-widest uppercase text-neutral-400 block mb-1.5">Tipo *</label>
                <select v-model="modal.type" class="input w-full">
                  <option value="percent">Porcentaje (%)</option>
                  <option value="fixed">Monto fijo (COP)</option>
                </select>
              </div>
              <div>
                <label class="text-[10px] tracking-widest uppercase text-neutral-400 block mb-1.5">Valor *</label>
                <input v-model.number="modal.value" type="number" min="0.01" step="0.01" required class="input w-full" :placeholder="modal.type === 'percent' ? '20' : '10000'" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-[10px] tracking-widest uppercase text-neutral-400 block mb-1.5">Compra mínima (COP)</label>
                <input v-model.number="modal.min_purchase" type="number" min="0" class="input w-full" placeholder="0" />
              </div>
              <div>
                <label class="text-[10px] tracking-widest uppercase text-neutral-400 block mb-1.5">Usos máximos</label>
                <input v-model.number="modal.max_uses" type="number" min="1" class="input w-full" placeholder="Sin límite" />
              </div>
            </div>
            <div>
              <label class="text-[10px] tracking-widest uppercase text-neutral-400 block mb-1.5">Válido hasta</label>
              <input v-model="modal.expires_at" type="datetime-local" class="input w-full" />
            </div>
            <label class="flex items-center gap-2 cursor-pointer text-sm text-neutral-700">
              <input v-model="modal.active" type="checkbox" class="accent-rose" />
              Activo al crear
            </label>
            <p v-if="saveError" class="text-xs text-red-500">{{ saveError }}</p>
            <div class="flex gap-3 pt-1">
              <button type="submit" class="btn-primary text-xs flex-1" :disabled="saving">
                {{ saving ? 'Guardando...' : 'Guardar' }}
              </button>
              <button type="button" class="btn-ghost text-xs" @click="modal = null">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Confirm delete -->
    <Teleport to="body">
      <div v-if="toDelete" class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="toDelete = null">
        <div class="bg-white border border-neutral-200 rounded-2xl p-8 max-w-sm w-full text-center shadow-xl">
          <p class="font-serif text-xl text-chocolate font-light mb-2">¿Eliminar código?</p>
          <p class="text-sm text-neutral-400 mb-6 font-mono font-semibold">{{ toDelete.code }}</p>
          <div class="flex gap-3 justify-center">
            <button class="btn-primary text-xs bg-red-500 hover:bg-red-600" @click="deleteCode">Eliminar</button>
            <button class="btn-ghost text-xs" @click="toDelete = null">Cancelar</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PencilIcon, Trash2Icon, XIcon, CopyIcon } from '@lucide/vue'
import { supabase } from '../../lib/supabase'

const codes = ref([])
const loading = ref(true)
const modal = ref(null)
const toDelete = ref(null)
const saving = ref(false)
const saveError = ref('')

const expired = computed(() => codes.value.filter(c => c.expires_at && new Date(c.expires_at) < new Date()).length)

onMounted(fetchCodes)

async function fetchCodes() {
  loading.value = true
  const { data } = await supabase.from('discount_codes').select('*').order('created_at', { ascending: false })
  codes.value = data ?? []
  loading.value = false
}

function openCreate() {
  modal.value = { code: '', type: 'percent', value: null, min_purchase: 0, max_uses: null, expires_at: '', active: true }
  saveError.value = ''
}

function openEdit(c) {
  modal.value = {
    ...c,
    expires_at: c.expires_at ? c.expires_at.slice(0, 16) : '',
  }
  saveError.value = ''
}

function confirmDelete(c) { toDelete.value = c }

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

async function saveCode() {
  saving.value = true
  saveError.value = ''
  const payload = {
    code: modal.value.code.toUpperCase().trim(),
    type: modal.value.type,
    value: modal.value.value,
    min_purchase: modal.value.min_purchase || 0,
    max_uses: modal.value.max_uses || null,
    expires_at: modal.value.expires_at || null,
    active: modal.value.active,
  }
  let error
  if (modal.value.id) {
    ({ error } = await supabase.from('discount_codes').update(payload).eq('id', modal.value.id))
  } else {
    ({ error } = await supabase.from('discount_codes').insert(payload))
  }
  saving.value = false
  if (error) { saveError.value = error.message; return }
  modal.value = null
  await fetchCodes()
}

async function deleteCode() {
  await supabase.from('discount_codes').delete().eq('id', toDelete.value.id)
  toDelete.value = null
  await fetchCodes()
}

async function toggleActive(c) {
  c.active = !c.active
  await supabase.from('discount_codes').update({ active: c.active }).eq('id', c.id)
}

function copyCode(code) {
  navigator.clipboard.writeText(code).catch(() => {})
}

function formatPrice(v) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v)
}
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
