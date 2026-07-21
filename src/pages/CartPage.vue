<template>
  <main class="pt-20 md:pt-24 min-h-screen bg-white">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="font-serif text-4xl text-chocolate font-light mb-10">Tu carrito</h1>

      <div v-if="cart.items.length === 0" class="text-center py-24">
        <ShoppingBagIcon :size="56" class="text-peach mx-auto mb-4" />
        <p class="font-serif text-xl text-chocolate/40 mb-8">Tu carrito está vacío</p>
        <RouterLink to="/tienda" class="btn-primary">Ver tienda</RouterLink>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <!-- Items list -->
        <div class="lg:col-span-2 flex flex-col divide-y divide-peach">
          <div v-for="item in cart.items" :key="item.id" class="flex gap-5 py-6">
            <img :src="item.image" :alt="item.name" class="w-24 h-24 object-cover bg-blush flex-shrink-0" />
            <div class="flex-1">
              <p class="font-serif text-base text-chocolate">{{ item.name }}</p>
              <p class="text-sm text-burgundy font-medium mt-1">{{ cart.formatPrice(item.price) }}</p>
              <div class="flex items-center gap-3 mt-3">
                <button class="w-7 h-7 border border-peach flex items-center justify-center text-chocolate hover:border-rose hover:text-rose transition-colors" @click="cart.updateQty(item.id, item.qty - 1)">
                  <MinusIcon :size="12" />
                </button>
                <span class="text-sm w-5 text-center">{{ item.qty }}</span>
                <button class="w-7 h-7 border border-peach flex items-center justify-center text-chocolate hover:border-rose hover:text-rose transition-colors" @click="cart.updateQty(item.id, item.qty + 1)">
                  <PlusIcon :size="12" />
                </button>
              </div>
            </div>
            <div class="text-right flex flex-col justify-between items-end">
              <button class="text-chocolate/30 hover:text-rose transition-colors" @click="cart.remove(item.id)">
                <XIcon :size="16" />
              </button>
              <p class="font-serif text-base text-chocolate">{{ cart.formatPrice(item.price * item.qty) }}</p>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div class="bg-blush/40 p-6 h-fit">
          <h2 class="font-serif text-xl text-chocolate font-light mb-6">Resumen</h2>
          <div class="flex flex-col gap-3 text-sm mb-6">
            <div class="flex justify-between text-chocolate/60">
              <span>Subtotal</span>
              <span>{{ cart.formattedSubtotal }}</span>
            </div>
            <div class="flex justify-between text-chocolate/60">
              <span>Envío</span>
              <span class="text-green-600">Gratis</span>
            </div>
          </div>
          <div class="border-t border-peach pt-4 flex justify-between mb-6">
            <span class="font-medium text-chocolate">Total</span>
            <span class="font-serif text-xl text-chocolate">{{ cart.formattedSubtotal }}</span>
          </div>
          <RouterLink to="/checkout" class="btn-primary w-full text-center block">
            Finalizar compra
          </RouterLink>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { ShoppingBagIcon, MinusIcon, PlusIcon, XIcon } from '@lucide/vue'
import { useCartStore } from '../stores/cart'

const cart = useCartStore()
</script>
