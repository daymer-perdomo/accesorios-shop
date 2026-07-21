<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 bg-white border-b border-peach"
    @mouseleave="closeShop"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 md:h-20">

        <!-- Mobile menu button -->
        <button
          class="md:hidden p-2 text-chocolate hover:text-rose transition-colors"
          @click="mobileOpen = !mobileOpen"
          aria-label="Menú"
        >
          <component :is="mobileOpen ? XIcon : MenuIcon" :size="22" />
        </button>

        <!-- Logo -->
        <RouterLink to="/" class="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
          <img src="/assets/logo.png" alt="MAI ACCESORIOS" class="h-10 md:h-12 object-contain" />
        </RouterLink>

        <!-- Desktop nav -->
        <nav class="hidden md:flex items-center gap-8">

          <RouterLink
            to="/"
            class="nav-link"
            active-class="text-rose"
          >
            Inicio
          </RouterLink>

          <!-- Tienda trigger -->
          <button
            class="nav-link flex items-center gap-1"
            :class="{ 'text-rose': isShopActive }"
            @mouseenter="openShop"
          >
            Tienda
            <ChevronDownIcon
              :size="11"
              class="transition-transform duration-200 mt-px"
              :class="shopOpen ? 'rotate-180 text-rose' : ''"
            />
          </button>

          <RouterLink to="/nosotros" class="nav-link" active-class="text-rose">Nosotros</RouterLink>
          <RouterLink to="/clientes" class="nav-link" active-class="text-rose">Clientes</RouterLink>
        </nav>

        <!-- Right actions -->
        <div class="flex items-center gap-1">
          <RouterLink v-if="auth.isAdmin" to="/admin/dashboard" class="hidden md:flex p-2 text-chocolate hover:text-rose transition-colors" aria-label="Admin">
            <SettingsIcon :size="20" />
          </RouterLink>

          <!-- Notification bell -->
          <div v-if="auth.isLoggedIn" class="relative hidden md:block">
            <button class="relative p-2 text-chocolate hover:text-rose transition-colors" @click="bellOpen = !bellOpen">
              <BellIcon :size="20" />
              <span v-if="unreadCount > 0" class="absolute -top-0.5 -right-0.5 bg-rose text-white text-2xs font-medium rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {{ unreadCount > 9 ? '9+' : unreadCount }}
              </span>
            </button>
            <Transition enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-1" enter-active-class="transition duration-150 ease-out" leave-active-class="transition duration-100 ease-in">
              <div v-if="bellOpen" class="absolute right-0 top-12 w-80 bg-white border border-peach shadow-xl z-50">
                <div class="flex items-center justify-between px-4 py-3 border-b border-peach">
                  <p class="text-xs tracking-widest uppercase text-chocolate font-medium">Notificaciones</p>
                  <button class="text-2xs text-rose hover:text-burgundy transition-colors" @click="markAllRead">Marcar leídas</button>
                </div>
                <div class="max-h-72 overflow-y-auto">
                  <div v-if="!notifications.length" class="px-4 py-8 text-center text-chocolate/40 text-sm">Sin notificaciones</div>
                  <div v-for="n in notifications" :key="n.id" class="flex items-start gap-3 px-4 py-3 border-b border-peach/50 last:border-0 hover:bg-blush/20 transition-colors">
                    <div class="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" :class="notifDot(n.type)" />
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-medium text-chocolate truncate">{{ n.title }}</p>
                      <p class="text-xs text-chocolate/60 mt-0.5 line-clamp-2">{{ n.body }}</p>
                      <p class="text-2xs text-chocolate/30 mt-1">{{ formatDate(n.created_at) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>

          <RouterLink :to="auth.isLoggedIn ? '/mi-cuenta' : '/cuenta'" class="hidden md:flex p-2 text-chocolate hover:text-rose transition-colors" aria-label="Mi cuenta">
            <UserIcon :size="20" />
          </RouterLink>

          <button class="relative p-2 text-chocolate hover:text-rose transition-colors" @click="cartStore.isOpen = true" aria-label="Carrito">
            <ShoppingBagIcon :size="20" />
            <span v-if="cartStore.count > 0" class="absolute -top-0.5 -right-0.5 bg-rose text-white text-2xs font-medium rounded-full w-4 h-4 flex items-center justify-center leading-none">
              {{ cartStore.count }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- ─── MEGA MENU (full width) ─── -->
    <Transition
      enter-from-class="opacity-0 -translate-y-3"
      enter-to-class="opacity-100 translate-y-0"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-3"
      enter-active-class="transition duration-200 ease-out"
      leave-active-class="transition duration-150 ease-in"
    >
      <div
        v-if="shopOpen"
        class="hidden md:flex absolute top-full left-0 right-0 bg-white border-t border-peach shadow-2xl overflow-hidden"
        style="height: 380px;"
        @mouseenter="openShop"
      >
        <!-- Left: large hero image -->
        <div class="w-[42%] relative overflow-hidden flex-shrink-0">
          <Transition name="preview-fade">
            <img
              :key="hoveredCat.to"
              :src="hoveredCat.image"
              :alt="hoveredCat.label"
              class="absolute inset-0 w-full h-full object-cover"
            />
          </Transition>
          <!-- gradient overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-chocolate/70 via-chocolate/10 to-transparent" />
          <!-- label at bottom -->
          <Transition name="preview-text">
            <div :key="hoveredCat.to" class="absolute bottom-0 left-0 right-0 p-8">
              <p class="text-[10px] tracking-widest uppercase text-white/50 mb-1.5">Colección</p>
              <p class="font-serif text-4xl text-white font-light leading-none mb-3">{{ hoveredCat.label }}</p>
              <RouterLink
                :to="hoveredCat.to"
                class="inline-flex items-center gap-2 text-[11px] tracking-widest uppercase text-white/80 hover:text-rose transition-colors border-b border-white/30 hover:border-rose pb-0.5"
                @click="shopOpen = false"
              >
                Explorar <ArrowRightIcon :size="11" />
              </RouterLink>
            </div>
          </Transition>
        </div>

        <!-- Right: category grid -->
        <div class="flex-1 flex flex-col justify-between px-12 py-10">
          <div>
            <p class="text-[10px] tracking-widest uppercase text-neutral-300 mb-7">Categorías</p>
            <div class="grid grid-cols-2 gap-x-10 gap-y-3">
              <RouterLink
                v-for="cat in shopCategories"
                :key="cat.to"
                :to="cat.to"
                class="flex items-center gap-4 group py-3 border-b border-neutral-100 hover:border-rose/30 transition-colors"
                @mouseenter="hoveredCat = cat"
                @click="shopOpen = false"
              >
                <!-- Thumbnail -->
                <div class="w-14 h-14 overflow-hidden flex-shrink-0 bg-blush">
                  <img :src="cat.image" :alt="cat.label" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" />
                </div>
                <!-- Text -->
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-chocolate group-hover:text-rose transition-colors tracking-wide">{{ cat.label }}</p>
                  <p class="text-[11px] text-neutral-400 mt-0.5">{{ cat.sub }}</p>
                </div>
                <ArrowRightIcon :size="13" class="text-rose opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </RouterLink>
            </div>
          </div>

          <!-- CTA -->
          <RouterLink
            to="/tienda"
            class="inline-flex items-center gap-2 text-[11px] tracking-widest uppercase font-semibold text-rose hover:text-burgundy transition-colors"
            @click="shopOpen = false"
          >
            Ver toda la colección <ArrowRightIcon :size="12" />
          </RouterLink>
        </div>
      </div>
    </Transition>

    <!-- Mobile menu -->
    <Transition
      enter-from-class="-translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="-translate-y-2 opacity-0"
      enter-active-class="transition duration-200 ease-out"
      leave-active-class="transition duration-150 ease-in"
    >
      <nav v-if="mobileOpen" class="md:hidden bg-white border-t border-peach px-6 py-4 flex flex-col">
        <RouterLink to="/" class="mobile-link" @click="mobileOpen = false">Inicio</RouterLink>

        <div>
          <button class="mobile-link w-full flex items-center justify-between" @click="mobileShopOpen = !mobileShopOpen">
            <span>Tienda</span>
            <ChevronDownIcon :size="14" class="transition-transform duration-200" :class="mobileShopOpen ? 'rotate-180' : ''" />
          </button>
          <div v-if="mobileShopOpen" class="pl-4 flex flex-col border-l border-peach ml-2 mb-2">
            <RouterLink
              v-for="cat in shopCategories"
              :key="cat.to"
              :to="cat.to"
              class="mobile-link text-sm text-chocolate/60"
              @click="mobileOpen = false; mobileShopOpen = false"
            >
              {{ cat.label }}
            </RouterLink>
          </div>
        </div>

        <RouterLink to="/nosotros" class="mobile-link" @click="mobileOpen = false">Nosotros</RouterLink>
        <RouterLink to="/clientes" class="mobile-link" @click="mobileOpen = false">Clientes</RouterLink>
        <RouterLink :to="auth.isLoggedIn ? '/mi-cuenta' : '/cuenta'" class="mobile-link" @click="mobileOpen = false">Mi cuenta</RouterLink>
      </nav>
    </Transition>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ShoppingBagIcon, UserIcon, MenuIcon, XIcon, SettingsIcon, BellIcon, ChevronDownIcon, ArrowRightIcon } from '@lucide/vue'
import { useCartStore } from '../../stores/cart'
import { useAuthStore } from '../../stores/auth'
import { supabase } from '../../lib/supabase'

const cartStore = useCartStore()
const auth = useAuthStore()
const route = useRoute()

const mobileOpen = ref(false)
const mobileShopOpen = ref(false)
const shopOpen = ref(false)
const bellOpen = ref(false)
const notifications = ref([])
const lastRead = ref(localStorage.getItem('notif_last_read') ?? '1970-01-01')

const shopCategories = [
  { label: 'Ver todo',  sub: 'Toda la colección',          to: '/tienda',             image: 'https://images.unsplash.com/photo-1609709295948-17d77cb2a69b?w=500&q=80' },
  { label: 'Collares',  sub: 'Desde delicadas hasta íconas', to: '/tienda?cat=collares', image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=500&q=80' },
  { label: 'Aretes',   sub: 'Para cada ocasión',           to: '/tienda?cat=aretes',   image: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=500&q=80' },
  { label: 'Pulseras', sub: 'Sencillas y elegantes',       to: '/tienda?cat=pulseras', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&q=80' },
  { label: 'Anillos',  sub: 'Detalles que brillan',        to: '/tienda?cat=anillos',  image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&q=80' },
]

const hoveredCat = ref(shopCategories[0])

const isShopActive = computed(() => route.path.startsWith('/tienda'))
const unreadCount = computed(() => notifications.value.filter(n => n.created_at > lastRead.value).length)

let shopTimer = null
function openShop() { clearTimeout(shopTimer); shopOpen.value = true }
function closeShop() { shopTimer = setTimeout(() => { shopOpen.value = false; hoveredCat.value = shopCategories[0] }, 120) }

onMounted(async () => {
  if (!auth.isLoggedIn) return
  const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(10)
  notifications.value = data ?? []
  document.addEventListener('click', handleOutsideClick)
})
onUnmounted(() => { document.removeEventListener('click', handleOutsideClick); clearTimeout(shopTimer) })

function handleOutsideClick(e) {
  if (bellOpen.value && !e.target.closest('[data-bell]')) bellOpen.value = false
}
function markAllRead() {
  const now = new Date().toISOString()
  lastRead.value = now
  localStorage.setItem('notif_last_read', now)
  bellOpen.value = false
}
function notifDot(type) { return { info: 'bg-blue-400', promo: 'bg-rose', alert: 'bg-amber-400' }[type] ?? 'bg-neutral-300' }
function formatDate(iso) { return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }) }
</script>

<style scoped>
.nav-link {
  @apply text-xs tracking-widest uppercase text-chocolate/70 hover:text-rose transition-colors font-medium;
}
.mobile-link {
  @apply text-sm tracking-widest uppercase text-chocolate/70 hover:text-rose transition-colors py-2.5 block;
}

/* Large image fade */
.preview-fade-enter-active { transition: opacity 0.4s ease; }
.preview-fade-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.preview-fade-enter-from, .preview-fade-leave-to { opacity: 0; }

/* Label slide */
.preview-text-enter-active { transition: opacity 0.35s ease 0.1s, transform 0.35s ease 0.1s; }
.preview-text-leave-active { transition: opacity 0.15s ease; }
.preview-text-enter-from { opacity: 0; transform: translateY(8px); }
.preview-text-leave-to { opacity: 0; }
</style>
