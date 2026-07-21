<template>
  <main class="pt-20 md:pt-24">
    <div v-if="product" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        <!-- Image -->
        <div class="bg-blush overflow-hidden">
          <img
            :src="product.images[0]"
            :alt="product.name"
            class="w-full aspect-square object-cover"
          />
        </div>

        <!-- Details -->
        <div class="flex flex-col justify-center">
          <RouterLink to="/tienda" class="flex items-center gap-1 text-xs tracking-widest uppercase text-chocolate/40 hover:text-rose transition-colors mb-6 w-fit">
            <ArrowLeftIcon :size="12" />
            Volver a la tienda
          </RouterLink>

          <span class="text-xs tracking-widest uppercase text-rose mb-2">{{ categoryLabel }}</span>
          <h1 class="font-serif text-3xl md:text-4xl text-chocolate font-light leading-tight mb-4">
            {{ product.name }}
          </h1>
          <p class="font-serif text-2xl text-burgundy mb-6">{{ formattedPrice }}</p>

          <p class="text-sm text-chocolate/60 leading-relaxed mb-8">{{ product.description }}</p>

          <div class="flex items-center gap-2 mb-8 text-xs text-chocolate/40">
            <span
              class="inline-block w-2 h-2 rounded-full"
              :class="product.stock > 0 ? 'bg-green-400' : 'bg-red-400'"
            />
            {{ product.stock > 0 ? `${product.stock} disponibles` : 'Agotado' }}
          </div>

          <!-- Qty + Add -->
          <div class="flex gap-3 mb-4">
            <div class="flex items-center border border-peach">
              <button class="px-3 py-3 text-chocolate hover:text-rose transition-colors" @click="qty = Math.max(1, qty - 1)">
                <MinusIcon :size="14" />
              </button>
              <span class="w-10 text-center text-sm">{{ qty }}</span>
              <button class="px-3 py-3 text-chocolate hover:text-rose transition-colors" @click="qty++">
                <PlusIcon :size="14" />
              </button>
            </div>
            <button
              class="btn-primary flex-1"
              :disabled="product.stock === 0"
              @click="addToCart"
            >
              {{ product.stock > 0 ? 'Agregar al carrito' : 'Agotado' }}
            </button>
          </div>

          <!-- Comprar ahora (pasarela de pago) -->
          <button class="btn-outline w-full mb-3" :disabled="product.stock === 0">
            Comprar ahora
          </button>

          <!-- WhatsApp buy -->
          <button
            class="w-full flex items-center justify-center gap-2 py-3 px-6 bg-[#25D366] hover:bg-[#20b858] text-white text-sm font-medium transition-colors duration-200"
            :disabled="product.stock === 0"
            @click="buyWhatsApp"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Comprar por WhatsApp
          </button>

          <!-- Details -->
          <div class="mt-10 pt-8 border-t border-peach">
            <div class="flex flex-col gap-3 text-sm text-chocolate/60">
              <div class="flex items-center gap-3">
                <TruckIcon :size="16" class="text-rose" />
                <span>Envío gratis en compras mayores a $200.000</span>
              </div>
              <div class="flex items-center gap-3">
                <RotateCcwIcon :size="16" class="text-rose" />
                <span>Cambios y devoluciones en 30 días</span>
              </div>
              <div class="flex items-center gap-3">
                <ShieldCheckIcon :size="16" class="text-rose" />
                <span>Garantía de calidad en todos los productos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="pt-32 text-center font-serif text-2xl text-chocolate/30">
      Producto no encontrado.
    </div>
  </main>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { ArrowLeftIcon, MinusIcon, PlusIcon, TruckIcon, RotateCcwIcon, ShieldCheckIcon } from '@lucide/vue'
import { useProductsStore, CATEGORIES } from '../stores/products'
import { useCartStore } from '../stores/cart'
import { supabase } from '../lib/supabase'
import { useSettings } from '../composables/useSettings'

const route = useRoute()
const productsStore = useProductsStore()
const cartStore = useCartStore()
const { fetchSettings, get } = useSettings()

const qty = ref(1)
const product = computed(() => productsStore.getById(route.params.id))

const categoryLabel = computed(() =>
  CATEGORIES.find(c => c.id === product.value?.category)?.label ?? ''
)

const formattedPrice = computed(() =>
  product.value
    ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(product.value.price)
    : ''
)

function addToCart() {
  if (product.value) {
    cartStore.add(product.value, qty.value)
  }
}

async function buyWhatsApp() {
  const p = product.value
  if (!p) return

  const price = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(p.price)
  const url = window.location.href

  const message = [
    '¡Hola! 👋 Quiero comprar el siguiente producto:',
    '',
    `🛍️ *${p.name}*`,
    `💰 Precio: ${price}`,
    `📦 Cantidad: ${qty.value}`,
    `🔗 ${url}`,
    '',
    '¿Me pueden ayudar con el proceso de compra?',
  ].join('\n')

  await supabase.from('orders').insert({
    channel: 'whatsapp',
    status: 'pending',
    total: p.price * qty.value,
    notes: `Consulta WhatsApp — Producto: ${p.name} | Cantidad: ${qty.value}`,
  })

  await fetchSettings()
  const wa = get('whatsapp_number', import.meta.env.VITE_WHATSAPP_NUMBER)
  window.open(`https://wa.me/${wa}?text=${encodeURIComponent(message)}`, '_blank')
}
</script>
