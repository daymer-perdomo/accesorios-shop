<template>
  <div class="p-8">
    <div class="flex items-start justify-between mb-8">
      <div>
        <h1 class="font-serif text-4xl text-chocolate font-light">Slider Hero</h1>
        <p class="text-sm text-neutral-400 mt-1">Imágenes del banner principal</p>
      </div>
      <button class="btn-primary text-xs" @click="openCreate">+ Nuevo slide</button>
    </div>

    <div v-if="loading" class="text-center py-16 text-neutral-400">Cargando...</div>

    <!-- Grid de slides -->
    <div v-else class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
      <div v-for="(s, i) in slides" :key="s.id" class="group flex flex-col">

        <!-- Thumbnail -->
        <div class="relative aspect-[3/4] bg-neutral-100 rounded-xl overflow-hidden">
          <img :src="s.image_url" :alt="s.title || 'Slide'" class="w-full h-full object-cover" />

          <!-- Overlay acciones -->
          <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 rounded-xl">
            <button
              class="w-9 h-9 bg-white rounded-full flex items-center justify-center text-neutral-700 hover:text-rose transition-colors shadow"
              @click="openEdit(s)"
            >
              <PencilIcon :size="15" />
            </button>
            <button
              class="w-9 h-9 bg-white rounded-full flex items-center justify-center text-neutral-700 hover:text-red-500 transition-colors shadow"
              @click="confirmDelete(s)"
            >
              <Trash2Icon :size="15" />
            </button>
          </div>

          <!-- Order badge -->
          <div class="absolute top-2 left-2 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center text-[10px] font-bold text-neutral-600 shadow">
            {{ i + 1 }}
          </div>

          <!-- Active badge -->
          <div class="absolute top-2 right-2">
            <button
              class="text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-wider uppercase transition-colors"
              :class="s.active ? 'bg-emerald-500 text-white' : 'bg-neutral-400 text-white'"
              @click="toggleActive(s)"
            >
              {{ s.active ? 'Activo' : 'Oculto' }}
            </button>
          </div>
        </div>

        <!-- Info + reorder -->
        <div class="mt-2.5 flex items-start justify-between gap-2">
          <div class="flex-1 min-w-0">
            <p class="text-xs font-medium text-neutral-800 truncate">{{ s.title || 'Sin título' }}</p>
            <p class="text-[10px] text-neutral-400 truncate mt-0.5">{{ s.subtitle || '—' }}</p>
          </div>
          <div class="flex flex-col gap-0.5 flex-shrink-0">
            <button
              class="w-6 h-5 flex items-center justify-center rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors disabled:opacity-30"
              :disabled="i === 0"
              @click="moveUp(i)"
            >
              <ChevronUpIcon :size="12" />
            </button>
            <button
              class="w-6 h-5 flex items-center justify-center rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors disabled:opacity-30"
              :disabled="i === slides.length - 1"
              @click="moveDown(i)"
            >
              <ChevronDownIcon :size="12" />
            </button>
          </div>
        </div>
      </div>

      <!-- Placeholder agregar -->
      <button
        class="aspect-[3/4] rounded-xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center gap-2 text-neutral-400 hover:border-rose/40 hover:text-rose transition-colors"
        @click="openCreate"
      >
        <PlusIcon :size="24" />
        <span class="text-xs">Agregar slide</span>
      </button>
    </div>

    <!-- Preview del slider -->
    <div v-if="slides.length" class="mt-10 bg-white border border-neutral-200 rounded-xl overflow-hidden">
      <div class="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
        <p class="text-sm font-medium text-neutral-800">Vista previa</p>
        <div class="flex items-center gap-2">
          <button
            v-for="(_, i) in slides"
            :key="i"
            class="h-1.5 rounded-full transition-all duration-400"
            :class="preview === i ? 'bg-chocolate w-5' : 'bg-neutral-300 w-2'"
            @click="preview = i"
          />
        </div>
      </div>
      <div class="relative aspect-video overflow-hidden bg-blush">
        <Transition name="preview-fade">
          <img :key="preview" :src="slides[preview]?.image_url" class="absolute inset-0 w-full h-full object-cover" />
        </Transition>
        <div class="absolute inset-0 flex items-center px-10 bg-gradient-to-r from-blush/80 to-transparent">
          <div class="max-w-xs">
            <p class="font-serif text-2xl text-chocolate font-light leading-tight mb-2">
              {{ slides[preview]?.title || 'Título del slide' }}
            </p>
            <p class="text-xs text-chocolate/60 mb-4">{{ slides[preview]?.subtitle || 'Subtítulo del slide' }}</p>
            <span class="btn-primary text-xs pointer-events-none">
              {{ slides[preview]?.cta_text || 'Ver colección' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal crear/editar -->
    <Teleport to="body">
      <div v-if="modal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="modal = null">
        <div class="bg-white w-full max-w-lg rounded-2xl border border-neutral-200 shadow-xl overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
            <h2 class="font-serif text-xl text-chocolate font-light">{{ modal.id ? 'Editar slide' : 'Nuevo slide' }}</h2>
            <button class="text-neutral-400 hover:text-neutral-700" @click="modal = null"><XIcon :size="18" /></button>
          </div>
          <div class="px-6 py-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">

            <!-- Image URL + preview -->
            <div>
              <label class="text-[10px] tracking-widest uppercase text-neutral-400 block mb-1.5">URL de imagen *</label>
              <input v-model="modal.image_url" required class="input w-full" placeholder="https://images.unsplash.com/..." />
            </div>
            <div v-if="modal.image_url" class="aspect-video rounded-xl overflow-hidden bg-neutral-100">
              <img :src="modal.image_url" class="w-full h-full object-cover" @error="imgError = true" />
            </div>

            <div>
              <label class="text-[10px] tracking-widest uppercase text-neutral-400 block mb-1.5">Título</label>
              <input v-model="modal.title" class="input w-full" placeholder="Ej: Nueva colección 2025" />
            </div>
            <div>
              <label class="text-[10px] tracking-widest uppercase text-neutral-400 block mb-1.5">Subtítulo</label>
              <textarea v-model="modal.subtitle" class="input w-full resize-none" rows="2" placeholder="Descripción breve..." />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-[10px] tracking-widest uppercase text-neutral-400 block mb-1.5">Texto del botón</label>
                <input v-model="modal.cta_text" class="input w-full" placeholder="Ver colección" />
              </div>
              <div>
                <label class="text-[10px] tracking-widest uppercase text-neutral-400 block mb-1.5">URL del botón</label>
                <input v-model="modal.cta_url" class="input w-full" placeholder="/tienda" />
              </div>
            </div>

            <label class="flex items-center gap-2 cursor-pointer text-sm text-neutral-700">
              <input v-model="modal.active" type="checkbox" class="accent-rose" />
              Visible en el sitio
            </label>

            <p v-if="saveError" class="text-xs text-red-500">{{ saveError }}</p>

            <div class="flex gap-3 pt-1">
              <button class="btn-primary text-xs flex-1" :disabled="saving" @click="saveSlide">
                {{ saving ? 'Guardando...' : 'Guardar' }}
              </button>
              <button class="btn-ghost text-xs" @click="modal = null">Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Confirm delete -->
    <Teleport to="body">
      <div v-if="toDelete" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="toDelete = null">
        <div class="bg-white rounded-2xl border border-neutral-200 p-8 max-w-sm w-full text-center shadow-xl">
          <p class="font-serif text-xl text-chocolate font-light mb-2">¿Eliminar slide?</p>
          <p class="text-xs text-neutral-400 mb-6 truncate">{{ toDelete.title || toDelete.image_url }}</p>
          <div class="flex gap-3 justify-center">
            <button class="btn-primary text-xs bg-red-500 hover:bg-red-600" @click="deleteSlide">Eliminar</button>
            <button class="btn-ghost text-xs" @click="toDelete = null">Cancelar</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { PencilIcon, Trash2Icon, XIcon, PlusIcon, ChevronUpIcon, ChevronDownIcon } from '@lucide/vue'
import { supabase } from '../../lib/supabase'

const slides = ref([])
const loading = ref(true)
const modal = ref(null)
const toDelete = ref(null)
const saving = ref(false)
const saveError = ref('')
const preview = ref(0)

onMounted(fetchSlides)

async function fetchSlides() {
  loading.value = true
  const { data } = await supabase.from('hero_slides').select('*').order('order_index')
  slides.value = data ?? []
  loading.value = false
}

function openCreate() {
  modal.value = { image_url: '', title: '', subtitle: '', cta_text: '', cta_url: '/tienda', active: true }
  saveError.value = ''
}

function openEdit(s) {
  modal.value = { ...s }
  saveError.value = ''
}

function confirmDelete(s) { toDelete.value = s }

async function saveSlide() {
  if (!modal.value.image_url.trim()) { saveError.value = 'La URL de imagen es obligatoria'; return }
  saving.value = true
  saveError.value = ''

  const payload = {
    image_url: modal.value.image_url.trim(),
    title: modal.value.title || null,
    subtitle: modal.value.subtitle || null,
    cta_text: modal.value.cta_text || null,
    cta_url: modal.value.cta_url || '/tienda',
    active: modal.value.active,
    order_index: modal.value.id ? modal.value.order_index : slides.value.length,
  }

  let error
  if (modal.value.id) {
    ({ error } = await supabase.from('hero_slides').update(payload).eq('id', modal.value.id))
  } else {
    ({ error } = await supabase.from('hero_slides').insert(payload))
  }

  saving.value = false
  if (error) { saveError.value = error.message; return }
  modal.value = null
  await fetchSlides()
}

async function deleteSlide() {
  await supabase.from('hero_slides').delete().eq('id', toDelete.value.id)
  toDelete.value = null
  await fetchSlides()
}

async function toggleActive(s) {
  s.active = !s.active
  await supabase.from('hero_slides').update({ active: s.active }).eq('id', s.id)
}

async function moveUp(i) {
  if (i === 0) return
  const a = slides.value[i]
  const b = slides.value[i - 1]
  await Promise.all([
    supabase.from('hero_slides').update({ order_index: b.order_index }).eq('id', a.id),
    supabase.from('hero_slides').update({ order_index: a.order_index }).eq('id', b.id),
  ])
  await fetchSlides()
}

async function moveDown(i) {
  if (i === slides.value.length - 1) return
  const a = slides.value[i]
  const b = slides.value[i + 1]
  await Promise.all([
    supabase.from('hero_slides').update({ order_index: b.order_index }).eq('id', a.id),
    supabase.from('hero_slides').update({ order_index: a.order_index }).eq('id', b.id),
  ])
  await fetchSlides()
}
</script>

<style scoped>
.preview-fade-enter-active { transition: opacity 0.7s ease; }
.preview-fade-leave-active { transition: opacity 0.7s ease; position: absolute; inset: 0; }
.preview-fade-enter-from,
.preview-fade-leave-to    { opacity: 0; }
</style>
