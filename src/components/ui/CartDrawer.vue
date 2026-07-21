<template>
  <!-- Overlay -->
  <Teleport to="body">
    <Transition
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
      enter-active-class="transition duration-300"
      leave-active-class="transition duration-200"
    >
      <div
        v-if="cart.isOpen"
        class="fixed inset-0 bg-chocolate/40 z-50"
        @click="cart.isOpen = false"
      />
    </Transition>

    <!-- Drawer -->
    <Transition
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
      enter-active-class="transition duration-300 ease-out-expo"
      leave-active-class="transition duration-250 ease-in"
    >
      <aside
        v-if="cart.isOpen"
        class="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-5 border-b border-peach">
          <h2 class="font-serif text-xl text-chocolate font-light tracking-wide">
            Carrito
            <span v-if="cart.count > 0" class="text-sm font-sans text-chocolate/40 ml-1">({{ cart.count }})</span>
          </h2>
          <button @click="cart.isOpen = false" class="p-1 text-chocolate/50 hover:text-rose transition-colors">
            <XIcon :size="20" />
          </button>
        </div>

        <!-- Items -->
        <div class="flex-1 overflow-y-auto px-6 py-4">
          <div v-if="cart.items.length === 0" class="flex flex-col items-center justify-center h-full gap-4 text-center">
            <ShoppingBagIcon :size="48" class="text-peach" />
            <p class="font-serif text-lg text-chocolate/50">Tu carrito está vacío</p>
            <button
              class="btn-outline text-xs mt-2"
              @click="cart.isOpen = false; $router.push('/tienda')"
            >
              Ver tienda
            </button>
          </div>

          <div v-else class="flex flex-col divide-y divide-peach">
            <div
              v-for="item in cart.items"
              :key="item.id"
              class="flex gap-4 py-5"
            >
              <img
                :src="item.image"
                :alt="item.name"
                class="w-20 h-20 object-cover bg-blush flex-shrink-0"
              />
              <div class="flex-1 min-w-0">
                <p class="font-serif text-sm text-chocolate truncate">{{ item.name }}</p>
                <p class="text-xs text-burgundy font-medium mt-1">{{ cart.formatPrice(item.price) }}</p>
                <div class="flex items-center gap-3 mt-3">
                  <button
                    class="w-6 h-6 border border-peach flex items-center justify-center text-chocolate hover:border-rose hover:text-rose transition-colors"
                    @click="cart.updateQty(item.id, item.qty - 1)"
                  >
                    <MinusIcon :size="12" />
                  </button>
                  <span class="text-sm w-4 text-center">{{ item.qty }}</span>
                  <button
                    class="w-6 h-6 border border-peach flex items-center justify-center text-chocolate hover:border-rose hover:text-rose transition-colors"
                    @click="cart.updateQty(item.id, item.qty + 1)"
                  >
                    <PlusIcon :size="12" />
                  </button>
                </div>
              </div>
              <button
                class="text-chocolate/30 hover:text-rose transition-colors self-start mt-1"
                @click="cart.remove(item.id)"
              >
                <XIcon :size="16" />
              </button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div v-if="cart.items.length > 0" class="px-6 py-5 border-t border-peach bg-blush/30">
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm text-chocolate/60 uppercase tracking-wider">Subtotal</span>
            <span class="font-serif text-lg text-chocolate">{{ cart.formattedSubtotal }}</span>
          </div>
          <RouterLink
            to="/checkout"
            class="btn-primary w-full text-center block"
            @click="cart.isOpen = false"
          >
            Finalizar compra
          </RouterLink>
          <button
            class="w-full text-center text-xs text-chocolate/40 hover:text-rose mt-3 tracking-wider uppercase transition-colors"
            @click="cart.isOpen = false"
          >
            Seguir comprando
          </button>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { XIcon, ShoppingBagIcon, MinusIcon, PlusIcon } from '@lucide/vue'
import { useCartStore } from '../../stores/cart'

const cart = useCartStore()
const $router = useRouter()
</script>
