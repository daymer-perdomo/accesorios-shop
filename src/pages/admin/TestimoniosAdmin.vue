<template>
  <div class="p-8">

    <!-- Header -->
    <div class="flex items-start justify-between mb-8">
      <div>
        <h1 class="font-serif text-4xl text-chocolate font-light">Testimonios</h1>
        <p class="text-sm text-neutral-400 mt-1">Clientes felices</p>
      </div>
      <div class="flex items-center gap-3">
        <!-- Copy share link -->
        <button
          class="flex items-center gap-2 text-xs border border-neutral-200 bg-white px-4 py-2 rounded-lg hover:border-[#25D366] hover:text-[#25D366] transition-colors"
          @click="copyLink"
        >
          <LinkIcon :size="13" />
          {{ copied ? '¡Enlace copiado!' : 'Copiar enlace de reseña' }}
        </button>
        <button class="btn-primary text-xs" @click="openCreate">+ Agregar</button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 mb-6">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="flex items-center gap-2 text-xs px-4 py-2 rounded-full border transition-colors"
        :class="activeTab === tab.value
          ? 'bg-chocolate text-white border-chocolate'
          : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400'"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
        <span
          v-if="countFor(tab.value)"
          class="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
          :class="tab.value === 'pending'
            ? (activeTab === 'pending' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-600')
            : 'bg-black/10'"
        >
          {{ countFor(tab.value) }}
        </span>
      </button>
    </div>

    <div v-if="loading" class="text-center py-16 text-neutral-400">Cargando...</div>

    <!-- Pending list -->
    <div v-else-if="activeTab === 'pending'" class="flex flex-col gap-4">
      <div v-if="!pending.length" class="text-center py-16 text-neutral-400 text-sm">Sin reseñas pendientes ✓</div>

      <div
        v-for="t in pending"
        :key="t.id"
        class="bg-white border border-amber-200 rounded-xl p-6 flex gap-5"
      >
        <!-- Avatar -->
        <div class="flex-shrink-0">
          <div v-if="t.avatar_url" class="w-16 h-16 rounded-full overflow-hidden border-2 border-peach">
            <img :src="t.avatar_url" :alt="t.name" class="w-full h-full object-cover" />
          </div>
          <div v-else class="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-sm font-semibold text-amber-600">
            {{ initials(t.name) }}
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="flex gap-0.5 mb-1">
                <span v-for="s in 5" :key="s" class="text-sm" :class="s <= t.rating ? 'text-amber-400' : 'text-neutral-200'">★</span>
              </div>
              <p class="text-sm font-medium text-neutral-800">{{ t.name }}
                <span v-if="t.location" class="text-neutral-400 font-normal text-xs ml-1">· {{ t.location }}</span>
              </p>
              <p class="text-[10px] text-neutral-400 mt-0.5">{{ formatDate(t.created_at) }}</p>
            </div>
            <span class="text-[10px] font-semibold px-2 py-1 bg-amber-100 text-amber-600 rounded-full uppercase tracking-wider flex-shrink-0">Pendiente</span>
          </div>

          <p class="text-sm text-neutral-600 leading-relaxed mt-3 italic">"{{ t.body }}"</p>

          <!-- Actions -->
          <div class="flex gap-3 mt-4">
            <button
              class="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors font-medium"
              @click="approve(t)"
            >
              <CheckIcon :size="13" /> Aprobar y publicar
            </button>
            <button
              class="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              @click="confirmDelete(t)"
            >
              <XIcon :size="13" /> Rechazar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Approved grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      <div v-if="!approved.length" class="col-span-full text-center py-16 text-neutral-400 text-sm">Sin testimonios publicados</div>

      <div
        v-for="(t, i) in approved"
        :key="t.id"
        class="bg-white border border-neutral-200 rounded-xl overflow-hidden group flex flex-col"
      >
        <!-- Avatar section -->
        <div class="relative h-32 bg-blush/40 flex items-center justify-center">
          <div v-if="t.avatar_url" class="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow">
            <img :src="t.avatar_url" :alt="t.name" class="w-full h-full object-cover" />
          </div>
          <div v-else class="w-20 h-20 rounded-full bg-rose/20 border-4 border-white shadow flex items-center justify-center text-lg font-semibold text-rose">
            {{ initials(t.name) }}
          </div>

          <!-- visible toggle -->
          <button
            class="absolute top-3 right-3 text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wider transition-colors"
            :class="t.active ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-400'"
            @click="toggleActive(t)"
          >
            {{ t.active ? 'Visible' : 'Oculto' }}
          </button>
        </div>

        <!-- Content -->
        <div class="p-5 flex flex-col gap-3 flex-1">
          <div class="flex gap-0.5">
            <span v-for="s in 5" :key="s" class="text-sm" :class="s <= t.rating ? 'text-amber-400' : 'text-neutral-200'">★</span>
          </div>
          <p class="text-xs text-neutral-600 leading-relaxed flex-1 italic">"{{ t.body }}"</p>
          <div class="pt-2 border-t border-neutral-100">
            <p class="text-xs font-medium text-neutral-800">{{ t.name }}</p>
            <p v-if="t.location" class="text-[10px] text-neutral-400 mt-0.5">{{ t.location }}</p>
          </div>
        </div>

        <!-- Footer actions -->
        <div class="px-5 pb-4 flex items-center justify-between">
          <div class="flex gap-0.5">
            <button class="w-6 h-6 flex items-center justify-center rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 transition-colors" :disabled="i===0" @click="moveUp(i)">
              <ChevronUpIcon :size="12" />
            </button>
            <button class="w-6 h-6 flex items-center justify-center rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 transition-colors" :disabled="i===approved.length-1" @click="moveDown(i)">
              <ChevronDownIcon :size="12" />
            </button>
          </div>
          <div class="flex gap-2">
            <button class="text-neutral-400 hover:text-neutral-700 p-1 transition-colors" @click="openEdit(t)"><PencilIcon :size="13" /></button>
            <button class="text-neutral-300 hover:text-red-500 p-1 transition-colors" @click="confirmDelete(t)"><Trash2Icon :size="13" /></button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal crear/editar -->
    <Teleport to="body">
      <div v-if="modal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="modal=null">
        <div class="bg-white w-full max-w-md rounded-2xl border border-neutral-200 shadow-xl overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
            <h2 class="font-serif text-xl text-chocolate font-light">{{ modal.id ? 'Editar' : 'Nuevo' }} testimonio</h2>
            <button class="text-neutral-400 hover:text-neutral-700" @click="modal=null"><XIcon :size="18" /></button>
          </div>
          <div class="px-6 py-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
            <div>
              <label class="field-label">Nombre *</label>
              <input v-model="modal.name" class="input w-full" placeholder="Valentina R." />
            </div>
            <div>
              <label class="field-label">Ciudad / País</label>
              <input v-model="modal.location" class="input w-full" placeholder="Bogotá" />
            </div>
            <div>
              <label class="field-label">Testimonio *</label>
              <textarea v-model="modal.body" class="input w-full resize-none" rows="3" />
            </div>
            <div>
              <label class="field-label">Calificación</label>
              <div class="flex gap-1 mt-1">
                <button v-for="s in 5" :key="s" type="button" class="text-2xl transition-colors" :class="s <= modal.rating ? 'text-amber-400' : 'text-neutral-200'" @click="modal.rating = s">★</button>
              </div>
            </div>
            <!-- Foto -->
            <div>
              <label class="field-label">Foto del cliente</label>
              <div
                class="relative w-full h-36 bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-xl overflow-hidden flex items-center justify-center cursor-pointer hover:border-rose/40 transition-colors"
                @click="$refs.adminFileInput.click()"
              >
                <img
                  v-if="modal.avatar_url || modalPhotoPreview"
                  :src="modalPhotoPreview || modal.avatar_url"
                  class="absolute inset-0 w-full h-full object-cover"
                />
                <div v-if="!modal.avatar_url && !modalPhotoPreview" class="flex flex-col items-center gap-1.5 text-neutral-400">
                  <ImageIcon :size="22" />
                  <span class="text-xs">Subir foto</span>
                </div>
                <div v-else class="absolute bottom-2 right-2 bg-white/90 text-neutral-600 text-[10px] font-medium px-2 py-1 rounded shadow">
                  Cambiar
                </div>
                <input
                  ref="adminFileInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleAdminPhoto"
                />
              </div>
              <button
                v-if="modal.avatar_url || modalPhotoPreview"
                class="text-[10px] text-red-400 hover:text-red-600 mt-1.5 transition-colors"
                @click="modal.avatar_url = ''; modalPhotoPreview = ''; modalPhotoFile = null"
              >
                Quitar foto
              </button>
            </div>

            <p v-if="saveError" class="text-xs text-red-500">{{ saveError }}</p>
            <div class="flex gap-3 pt-1">
              <button class="btn-primary text-xs flex-1" :disabled="saving" @click="save">{{ saving ? 'Guardando...' : 'Guardar' }}</button>
              <button class="btn-ghost text-xs" @click="modal=null">Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Confirm delete -->
    <Teleport to="body">
      <div v-if="toDelete" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="toDelete=null">
        <div class="bg-white rounded-2xl border border-neutral-200 p-8 max-w-sm w-full text-center shadow-xl">
          <p class="font-serif text-xl text-chocolate font-light mb-2">¿Eliminar testimonio?</p>
          <p class="text-xs text-neutral-400 mb-6">{{ toDelete.name }}</p>
          <div class="flex gap-3 justify-center">
            <button class="btn-primary text-xs bg-red-500 hover:bg-red-600" @click="deleteItem">Eliminar</button>
            <button class="btn-ghost text-xs" @click="toDelete=null">Cancelar</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { PencilIcon, Trash2Icon, XIcon, ChevronUpIcon, ChevronDownIcon, LinkIcon, CheckIcon, ImageIcon } from '@lucide/vue'
import { supabase } from '../../lib/supabase'

const items = ref([])
const loading = ref(true)
const modal = ref(null)
const toDelete = ref(null)
const saving = ref(false)
const saveError = ref('')
const activeTab = ref('pending')
const copied = ref(false)
const modalPhotoPreview = ref('')
const modalPhotoFile = ref(null)
const adminFileInput = ref(null)

const tabs = [
  { label: 'Pendientes', value: 'pending' },
  { label: 'Publicados', value: 'approved' },
]

const pending  = computed(() => items.value.filter(t => t.status === 'pending'))
const approved = computed(() => items.value.filter(t => t.status === 'approved').sort((a, b) => a.order_index - b.order_index))

function countFor(tab) {
  return tab === 'pending' ? pending.value.length : approved.value.length
}

onMounted(async () => {
  await fetchAll()
  // Si no hay pendientes, mostrar aprobados directamente
  if (!pending.value.length) activeTab.value = 'approved'
})

async function fetchAll() {
  loading.value = true
  const { data } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false })
  items.value = data ?? []
  loading.value = false
}

function copyLink() {
  const url = `${window.location.origin}/dejar-resena`
  navigator.clipboard.writeText(url)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2500)
}

async function approve(t) {
  t.status = 'approved'
  t.active = true
  t.order_index = approved.value.length
  await supabase.from('testimonials').update({ status: 'approved', active: true, order_index: t.order_index }).eq('id', t.id)
  activeTab.value = 'approved'
}

function openCreate() {
  modal.value = { name: '', location: '', body: '', rating: 5, avatar_url: '', status: 'approved', active: true }
  modalPhotoPreview.value = ''
  modalPhotoFile.value = null
  saveError.value = ''
}
function openEdit(t) {
  modal.value = { ...t }
  modalPhotoPreview.value = ''
  modalPhotoFile.value = null
  saveError.value = ''
}

function handleAdminPhoto(e) {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) { saveError.value = 'La foto debe pesar menos de 5 MB'; return }
  modalPhotoFile.value = file
  modalPhotoPreview.value = URL.createObjectURL(file)
  saveError.value = ''
}
function confirmDelete(t) { toDelete.value = t }

async function save() {
  if (!modal.value.name.trim() || !modal.value.body.trim()) { saveError.value = 'Nombre y testimonio son obligatorios'; return }
  saving.value = true; saveError.value = ''

  // Subir foto nueva si la hay
  let avatarUrl = modal.value.avatar_url || null
  if (modalPhotoFile.value) {
    const ext = modalPhotoFile.value.name.split('.').pop().toLowerCase()
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error: uploadErr } = await supabase.storage
      .from('reviews')
      .upload(filename, modalPhotoFile.value, { contentType: modalPhotoFile.value.type })
    if (uploadErr) { saveError.value = 'Error al subir la foto'; saving.value = false; return }
    const { data: { publicUrl } } = supabase.storage.from('reviews').getPublicUrl(filename)
    avatarUrl = publicUrl
  }

  const payload = {
    name: modal.value.name.trim(),
    location: modal.value.location || null,
    body: modal.value.body.trim(),
    rating: modal.value.rating,
    avatar_url: avatarUrl,
    active: modal.value.active ?? true,
    status: 'approved',
    order_index: modal.value.id ? modal.value.order_index : approved.value.length,
  }
  const { error } = modal.value.id
    ? await supabase.from('testimonials').update(payload).eq('id', modal.value.id)
    : await supabase.from('testimonials').insert(payload)
  saving.value = false
  if (error) { saveError.value = error.message; return }
  modal.value = null
  await fetchAll()
}

async function deleteItem() {
  await supabase.from('testimonials').delete().eq('id', toDelete.value.id)
  toDelete.value = null
  await fetchAll()
}

async function toggleActive(t) {
  t.active = !t.active
  await supabase.from('testimonials').update({ active: t.active }).eq('id', t.id)
}

async function moveUp(i) {
  const list = approved.value
  const a = list[i], b = list[i - 1]
  await Promise.all([
    supabase.from('testimonials').update({ order_index: b.order_index }).eq('id', a.id),
    supabase.from('testimonials').update({ order_index: a.order_index }).eq('id', b.id),
  ])
  await fetchAll()
}
async function moveDown(i) {
  const list = approved.value
  const a = list[i], b = list[i + 1]
  await Promise.all([
    supabase.from('testimonials').update({ order_index: b.order_index }).eq('id', a.id),
    supabase.from('testimonials').update({ order_index: a.order_index }).eq('id', b.id),
  ])
  await fetchAll()
}

function initials(name) {
  return (name || '?').split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
}
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.field-label { @apply text-[10px] tracking-widest uppercase text-neutral-400 block mb-1.5; }
</style>
