<template>
  <main>
    <!-- Hero (full-screen slider) -->
    <section class="relative h-screen min-h-[600px] overflow-hidden bg-chocolate">

      <!-- Background images -->
      <Transition name="hero-img">
        <img
          v-if="slides.length"
          :key="current"
          :src="slide.image_url"
          alt="MAI ACCESORIOS"
          class="absolute inset-0 w-full h-full object-cover"
        />
      </Transition>

      <!-- Gradient overlay — opaque on the left, fades out at 55% -->
      <div class="absolute inset-0 bg-gradient-to-r from-chocolate via-chocolate/90 to-transparent to-[55%]" />
      <!-- Bottom vignette for polish -->
      <div class="absolute inset-0 bg-gradient-to-t from-chocolate/40 via-transparent to-transparent" />

      <!-- Text content -->
      <div class="relative z-10 h-full flex items-center">
        <div class="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full">
          <div class="max-w-xl">
            <p class="text-xs tracking-widest uppercase text-rose/90 mb-4">Nueva colección 2025</p>
            <Transition name="hero-text" mode="out-in">
              <div :key="current">
                <h1 class="font-serif text-5xl md:text-7xl text-white font-light leading-none mb-6 drop-shadow-sm">
                  {{ slide.title || 'Piezas que cuentan tu historia' }}
                </h1>
                <p class="text-base text-white/70 leading-relaxed mb-10">
                  {{ slide.subtitle || 'Accesorios elaborados con materiales premium para mujeres que celebran su estilo único.' }}
                </p>
              </div>
            </Transition>
            <div class="flex flex-wrap gap-4">
              <RouterLink :to="slide.cta_url || '/tienda'" class="btn-primary">
                {{ slide.cta_text || 'Ver colección' }}
              </RouterLink>
              <RouterLink to="/tienda?cat=collares" class="btn-outline border-white/40 text-white hover:bg-white/10">Collares</RouterLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation dots (bottom center) -->
      <div v-if="slides.length > 1" class="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-2 z-10">
        <button
          v-for="(_, i) in slides"
          :key="i"
          class="h-1.5 rounded-full transition-all duration-500"
          :class="current === i ? 'bg-white w-7' : 'bg-white/40 w-2 hover:bg-white/60'"
          @click="goTo(i)"
        />
      </div>
    </section>

    <!-- Categories strip -->
    <section class="bg-white py-16 border-y border-peach">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <RouterLink
            v-for="cat in categories"
            :key="cat.to"
            :to="cat.to"
            class="group relative overflow-hidden aspect-square"
          >
            <!-- Image -->
            <img
              :src="cat.image"
              :alt="cat.label"
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <!-- Gradient overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-chocolate/80 via-chocolate/20 to-transparent" />
            <!-- Label -->
            <div class="absolute bottom-0 left-0 right-0 p-5 flex items-center justify-between">
              <span class="font-serif text-xl text-white leading-none">{{ cat.label }}</span>
              <ArrowRightIcon
                :size="16"
                class="text-white/60 group-hover:text-rose group-hover:translate-x-1 transition-all duration-300 flex-shrink-0"
              />
            </div>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Featured products -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-end justify-between mb-10">
          <h2 class="section-title">Destacados</h2>
          <RouterLink to="/tienda" class="text-xs tracking-widest uppercase text-rose hover:text-burgundy transition-colors">
            Ver todo
          </RouterLink>
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <ProductCard v-for="product in featuredProducts" :key="product.id" :product="product" />
        </div>
      </div>
    </section>

    <!-- Banner -->
    <section class="bg-chocolate py-24">
      <div class="max-w-3xl mx-auto px-4 text-center">
        <p class="text-xs tracking-widest uppercase text-rose/80 mb-4">Envío gratis</p>
        <h2 class="font-serif text-4xl md:text-5xl text-white font-light leading-tight mb-6">
          En compras mayores a $200.000
        </h2>
        <p class="text-white/50 text-sm mb-10">Entrega en todo Colombia en 3-5 días hábiles.</p>
        <RouterLink to="/tienda" class="btn-primary bg-rose hover:bg-burgundy">
          Explorar tienda
        </RouterLink>
      </div>
    </section>

    <!-- New arrivals -->
    <section class="py-20 bg-blush/40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-end justify-between mb-10">
          <h2 class="section-title">Nuevos ingresos</h2>
          <RouterLink to="/tienda" class="text-xs tracking-widest uppercase text-rose hover:text-burgundy transition-colors">
            Ver todo
          </RouterLink>
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <ProductCard v-for="product in newProducts" :key="product.id" :product="product" />
        </div>
      </div>
    </section>

    <!-- Newsletter -->
    <section class="py-20 bg-white border-t border-peach">
      <div class="max-w-lg mx-auto px-4 text-center">
        <h2 class="section-title mb-3">Únete a nuestra comunidad</h2>
        <p class="text-sm text-chocolate/50 mb-8">Recibe descuentos exclusivos y acceso anticipado a nuevas colecciones.</p>

        <Transition name="nl-fade" mode="out-in">
          <div v-if="subscribeStatus === 'ok'" class="bg-green-50 border border-green-200 text-green-700 text-sm px-5 py-4 rounded-lg">
            ¡Gracias! Ya eres parte de nuestra comunidad.
          </div>
          <div v-else-if="subscribeStatus === 'dup'" class="bg-amber-50 border border-amber-200 text-amber-700 text-sm px-5 py-4 rounded-lg">
            Este correo ya está suscrito. ¡Gracias por tu interés!
          </div>
          <div v-else-if="subscribeStatus === 'err'" class="bg-red-50 border border-red-200 text-red-600 text-sm px-5 py-4 rounded-lg">
            Ocurrió un error. Intenta de nuevo.
          </div>
          <form v-else class="flex gap-0" @submit.prevent="subscribe">
            <input
              v-model="email"
              type="email"
              placeholder="tu@email.com"
              class="input-base flex-1"
              required
              :disabled="subscribing"
            />
            <button type="submit" class="btn-primary whitespace-nowrap" :disabled="subscribing">
              {{ subscribing ? '...' : 'Suscribirme' }}
            </button>
          </form>
        </Transition>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowRightIcon } from '@lucide/vue'
import ProductCard from '../components/ui/ProductCard.vue'
import { useProductsStore } from '../stores/products'
import { supabase } from '../lib/supabase'

const store = useProductsStore()
const email = ref('')
const subscribing = ref(false)
const subscribeStatus = ref('') // '' | 'ok' | 'dup' | 'err'

const featuredProducts = computed(() => store.featured.slice(0, 4))
const newProducts = computed(() => store.products.filter(p => p.isNew).slice(0, 4))

// Slider
const slides = ref([])
const current = ref(0)
const slide = computed(() => slides.value[current.value] ?? {})
let timer = null

onMounted(async () => {
  const { data } = await supabase
    .from('hero_slides')
    .select('*')
    .order('order_index')
  slides.value = data ?? []
  startTimer()
})

onUnmounted(() => clearInterval(timer))

function startTimer() {
  clearInterval(timer)
  timer = setInterval(() => {
    if (slides.value.length > 1) {
      current.value = (current.value + 1) % slides.value.length
    }
  }, 5000)
}

function goTo(i) {
  current.value = i
  startTimer()
}

const categories = [
  { label: 'Collares',  to: '/tienda?cat=collares',  image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&q=80' },
  { label: 'Aretes',   to: '/tienda?cat=aretes',    image: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=600&q=80' },
  { label: 'Pulseras', to: '/tienda?cat=pulseras',  image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80' },
  { label: 'Anillos',  to: '/tienda?cat=anillos',   image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80' },
]

async function subscribe() {
  if (!email.value) return
  subscribing.value = true
  const { error } = await supabase.from('subscribers').insert({ email: email.value.trim().toLowerCase() })
  subscribing.value = false
  if (!error) {
    subscribeStatus.value = 'ok'
    email.value = ''
  } else if (error.code === '23505') {
    subscribeStatus.value = 'dup'
  } else {
    subscribeStatus.value = 'err'
  }
}
</script>

<style scoped>
/* Image fade */
.hero-img-enter-active { transition: opacity 0.9s ease; }
.hero-img-leave-active { transition: opacity 0.9s ease; position: absolute; inset: 0; }
.hero-img-enter-from,
.hero-img-leave-to    { opacity: 0; }

/* Newsletter fade */
.nl-fade-enter-active, .nl-fade-leave-active { transition: opacity 0.3s ease; }
.nl-fade-enter-from, .nl-fade-leave-to { opacity: 0; }

/* Text fade */
.hero-text-enter-active { transition: opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s; }
.hero-text-leave-active { transition: opacity 0.25s ease; }
.hero-text-enter-from   { opacity: 0; transform: translateY(10px); }
.hero-text-leave-to     { opacity: 0; }
</style>
