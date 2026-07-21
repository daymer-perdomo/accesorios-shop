<template>
  <footer class="bg-chocolate text-white/70 mt-24">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-12">

        <!-- Brand -->
        <div class="md:col-span-1">
          <img src="/assets/logo-blanco.png" alt="MAI ACCESORIOS" class="h-12 mb-4 object-contain" />
          <p class="text-sm leading-relaxed text-white/50 mb-6">
            Accesorios únicos para mujeres que celebran su estilo. Piezas elaboradas con materiales premium.
          </p>

          <!-- Social icons -->
          <div class="flex items-center gap-3">
            <a
              v-if="instagram"
              :href="instagram"
              target="_blank"
              rel="noopener"
              class="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white/60 transition-colors"
              aria-label="Instagram"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <a
              v-if="tiktok"
              :href="tiktok"
              target="_blank"
              rel="noopener"
              class="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white/60 transition-colors"
              aria-label="TikTok"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.19 8.19 0 0 0 4.78 1.52V6.74a4.85 4.85 0 0 1-1.01-.05z"/>
              </svg>
            </a>
          </div>
        </div>

        <!-- Tienda -->
        <div class="flex flex-col gap-3">
          <p class="text-xs tracking-widest uppercase text-white/40 mb-2">Tienda</p>
          <RouterLink v-for="l in shopLinks" :key="l.to" :to="l.to" class="text-sm hover:text-white transition-colors">{{ l.label }}</RouterLink>
        </div>

        <!-- Nosotros -->
        <div class="flex flex-col gap-3">
          <p class="text-xs tracking-widest uppercase text-white/40 mb-2">Nosotros</p>
          <RouterLink to="/nosotros" class="text-sm hover:text-white transition-colors">Nuestra historia</RouterLink>
          <RouterLink to="/clientes" class="text-sm hover:text-white transition-colors">Clientes felices</RouterLink>
          <RouterLink to="/dejar-resena" class="text-sm hover:text-white transition-colors">Deja tu reseña</RouterLink>
        </div>

        <!-- Info -->
        <div class="flex flex-col gap-3">
          <p class="text-xs tracking-widest uppercase text-white/40 mb-2">Información</p>
          <span v-for="l in infoLinks" :key="l" class="text-sm text-white/50 cursor-default">{{ l }}</span>
        </div>
      </div>

      <div class="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p class="text-xs text-white/30">© {{ new Date().getFullYear() }} MAI ACCESORIOS. Todos los derechos reservados.</p>
        <div class="flex items-center gap-4">
          <p class="text-xs text-white/30">Hecho con amor · Colombia</p>
          <!-- Social inline repeat for mobile visibility -->
          <div class="flex items-center gap-2 md:hidden">
            <a v-if="instagram" :href="instagram" target="_blank" rel="noopener" class="text-white/40 hover:text-white transition-colors" aria-label="Instagram">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <a v-if="tiktok" :href="tiktok" target="_blank" rel="noopener" class="text-white/40 hover:text-white transition-colors" aria-label="TikTok">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.19 8.19 0 0 0 4.78 1.52V6.74a4.85 4.85 0 0 1-1.01-.05z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useSettings } from '../../composables/useSettings'

const { fetchSettings, get } = useSettings()
const instagram = ref('')
const tiktok = ref('')

onMounted(async () => {
  await fetchSettings()
  instagram.value = get('instagram_url')
  tiktok.value = get('tiktok_url')
})

const shopLinks = [
  { label: 'Todos los productos', to: '/tienda' },
  { label: 'Collares',  to: '/tienda?cat=collares' },
  { label: 'Aretes',   to: '/tienda?cat=aretes' },
  { label: 'Pulseras', to: '/tienda?cat=pulseras' },
  { label: 'Anillos',  to: '/tienda?cat=anillos' },
]

const infoLinks = [
  'Política de envíos',
  'Cambios y devoluciones',
  'Preguntas frecuentes',
  'Contáctanos',
]
</script>
