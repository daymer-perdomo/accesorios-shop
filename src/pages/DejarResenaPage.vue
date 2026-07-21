<template>
  <main class="min-h-screen bg-blush/30 flex flex-col items-center justify-start py-12 px-4">

    <!-- Logo -->
    <RouterLink to="/" class="mb-10">
      <img src="/assets/logo.png" alt="MAI ACCESORIOS" class="h-12 object-contain" />
    </RouterLink>

    <!-- Success state -->
    <Transition name="fade" mode="out-in">
      <div v-if="submitted" class="w-full max-w-md bg-white border border-peach p-10 text-center shadow-sm">
        <div class="text-4xl mb-4">✦</div>
        <h2 class="font-serif text-3xl text-chocolate font-light mb-3">¡Gracias!</h2>
        <p class="text-sm text-chocolate/60 leading-relaxed mb-8">
          Tu reseña fue enviada correctamente. La revisaremos y la publicaremos pronto.
        </p>
        <RouterLink to="/" class="btn-primary text-xs">Volver al inicio</RouterLink>
      </div>

      <!-- Form -->
      <div v-else class="w-full max-w-md">
        <div class="bg-white border border-peach shadow-sm p-8 md:p-10">
          <h1 class="font-serif text-3xl text-chocolate font-light text-center mb-1">Tu reseña</h1>
          <p class="text-xs text-chocolate/40 text-center tracking-wide mb-8">Cuéntanos tu experiencia con MAI ACCESORIOS</p>

          <!-- Photo upload -->
          <div class="mb-6">
            <label class="field-label">Tu foto</label>
            <div
              class="relative w-full aspect-[3/2] bg-blush/50 border-2 border-dashed border-peach flex flex-col items-center justify-center cursor-pointer hover:border-rose/50 transition-colors overflow-hidden"
              @click="$refs.fileInput.click()"
            >
              <img v-if="photoPreview" :src="photoPreview" class="absolute inset-0 w-full h-full object-cover" />
              <div v-else class="flex flex-col items-center gap-2 text-chocolate/40">
                <CameraIcon :size="28" />
                <p class="text-xs tracking-wide">Toca para tomar foto o elegir de galería</p>
              </div>
              <div v-if="photoPreview" class="absolute bottom-2 right-2 bg-white/90 text-rose text-[10px] font-medium px-2 py-1 rounded">
                Cambiar foto
              </div>
            </div>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              capture="environment"
              class="hidden"
              @change="handlePhoto"
            />
            <p class="text-[10px] text-chocolate/30 mt-1.5 text-center">Opcional · máx. 5 MB</p>
          </div>

          <!-- Name -->
          <div class="mb-4">
            <label class="field-label">Nombre *</label>
            <input v-model="form.name" class="input w-full" placeholder="Valentina R." maxlength="80" />
          </div>

          <!-- Location -->
          <div class="mb-4">
            <label class="field-label">Ciudad</label>
            <input v-model="form.location" class="input w-full" placeholder="Bogotá, Colombia" maxlength="60" />
          </div>

          <!-- Rating -->
          <div class="mb-4">
            <label class="field-label">Calificación *</label>
            <div class="flex gap-2 mt-1.5">
              <button
                v-for="s in 5"
                :key="s"
                type="button"
                class="text-3xl leading-none transition-transform active:scale-90"
                :class="s <= form.rating ? 'text-amber-400' : 'text-neutral-200'"
                @click="form.rating = s"
              >
                ★
              </button>
            </div>
          </div>

          <!-- Review text -->
          <div class="mb-6">
            <label class="field-label">Tu experiencia *</label>
            <textarea
              v-model="form.body"
              class="input w-full resize-none"
              rows="4"
              placeholder="Cuéntanos qué compraste y cómo fue tu experiencia..."
              maxlength="600"
            />
            <p class="text-[10px] text-chocolate/30 text-right mt-1">{{ form.body.length }}/600</p>
          </div>

          <!-- Error -->
          <p v-if="error" class="text-xs text-red-500 mb-4">{{ error }}</p>

          <!-- Submit -->
          <button
            class="btn-primary w-full flex items-center justify-center gap-2"
            :disabled="sending"
            @click="submit"
          >
            <span v-if="sending">Enviando...</span>
            <template v-else>
              <SendIcon :size="14" /> Enviar reseña
            </template>
          </button>
        </div>

        <p class="text-center text-[10px] text-chocolate/30 mt-6">
          Al enviar aceptas que tu reseña puede ser publicada en nuestro sitio.
        </p>
      </div>
    </Transition>
  </main>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { RouterLink } from 'vue-router'
import { CameraIcon, SendIcon } from '@lucide/vue'
import { supabase } from '../lib/supabase'

const fileInput = ref(null)
const photoPreview = ref('')
const photoFile = ref(null)
const submitted = ref(false)
const sending = ref(false)
const error = ref('')

const form = reactive({ name: '', location: '', body: '', rating: 5 })

function handlePhoto(e) {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) { error.value = 'La foto debe pesar menos de 5 MB'; return }
  photoFile.value = file
  photoPreview.value = URL.createObjectURL(file)
  error.value = ''
}

async function submit() {
  error.value = ''
  if (!form.name.trim()) { error.value = 'El nombre es obligatorio'; return }
  if (!form.body.trim()) { error.value = 'Escribe tu experiencia'; return }

  sending.value = true

  // Subir foto si hay una
  let avatarUrl = null
  if (photoFile.value) {
    const ext = photoFile.value.name.split('.').pop().toLowerCase()
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error: uploadErr } = await supabase.storage
      .from('reviews')
      .upload(filename, photoFile.value, { contentType: photoFile.value.type, upsert: false })

    if (uploadErr) {
      error.value = 'Error al subir la foto. Intenta de nuevo.'
      sending.value = false
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('reviews').getPublicUrl(filename)
    avatarUrl = publicUrl
  }

  // Insertar reseña como pendiente
  const { error: insertErr } = await supabase.from('testimonials').insert({
    name: form.name.trim(),
    location: form.location.trim() || null,
    body: form.body.trim(),
    rating: form.rating,
    avatar_url: avatarUrl,
    status: 'pending',
    active: false,
    order_index: 9999,
  })

  sending.value = false

  if (insertErr) {
    error.value = 'Ocurrió un error. Por favor intenta de nuevo.'
    return
  }

  submitted.value = true
}
</script>

<style scoped>
.field-label { @apply text-[10px] tracking-widest uppercase text-chocolate/50 block mb-1.5; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
