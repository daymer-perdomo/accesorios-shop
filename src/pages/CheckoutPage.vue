<template>
  <main class="pt-20 md:pt-24 min-h-screen bg-blush/20">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="font-serif text-4xl text-chocolate font-light mb-10">Finalizar compra</h1>

      <!-- Success state -->
      <div v-if="orderPlaced" class="text-center py-20">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
          <CheckCircleIcon :size="32" class="text-green-600" />
        </div>
        <h2 class="font-serif text-3xl text-chocolate font-light mb-3">¡Pedido confirmado!</h2>
        <p class="text-chocolate/50 text-sm mb-2">Pedido #{{ orderId }}</p>
        <p class="text-chocolate/50 text-sm mb-8">Te enviaremos una confirmación a {{ form.email }}</p>
        <RouterLink to="/tienda" class="btn-primary">Seguir comprando</RouterLink>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <!-- Form -->
        <form class="flex flex-col gap-5" @submit.prevent="placeOrder">
          <div v-if="errorMsg" class="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
            {{ errorMsg }}
          </div>

          <div>
            <p class="text-xs tracking-widest uppercase text-chocolate/40 mb-4">Información de contacto</p>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-xs text-chocolate/50 block mb-1">Nombre</label>
                <input v-model="form.firstName" type="text" placeholder="Ana" class="input-base" required />
              </div>
              <div>
                <label class="text-xs text-chocolate/50 block mb-1">Apellido</label>
                <input v-model="form.lastName" type="text" placeholder="García" class="input-base" required />
              </div>
            </div>
          </div>

          <div>
            <label class="text-xs text-chocolate/50 block mb-1">Correo electrónico</label>
            <input v-model="form.email" type="email" placeholder="ana@email.com" class="input-base" required />
          </div>

          <div>
            <label class="text-xs text-chocolate/50 block mb-1">Teléfono</label>
            <input v-model="form.phone" type="tel" placeholder="+57 300 000 0000" class="input-base" />
          </div>

          <div class="pt-2">
            <p class="text-xs tracking-widest uppercase text-chocolate/40 mb-4">Dirección de envío</p>
            <div class="flex flex-col gap-4">
              <div>
                <label class="text-xs text-chocolate/50 block mb-1">Dirección</label>
                <input v-model="form.address" type="text" placeholder="Calle 123 #45-67" class="input-base" required />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-xs text-chocolate/50 block mb-1">Ciudad</label>
                  <input v-model="form.city" type="text" placeholder="Bogotá" class="input-base" required />
                </div>
                <div>
                  <label class="text-xs text-chocolate/50 block mb-1">Departamento</label>
                  <input v-model="form.state" type="text" placeholder="Cundinamarca" class="input-base" />
                </div>
              </div>
            </div>
          </div>

          <div class="pt-2">
            <p class="text-xs tracking-widest uppercase text-chocolate/40 mb-4">Método de pago</p>
            <div class="border border-peach p-4 bg-white text-sm text-chocolate/50 text-center">
              Integración de pasarela de pago próximamente
            </div>
          </div>

          <button type="submit" class="btn-primary mt-4" :disabled="submitting || cart.items.length === 0">
            <span v-if="submitting">Procesando...</span>
            <span v-else>Confirmar pedido</span>
          </button>
        </form>

        <!-- Order summary -->
        <div>
          <div class="bg-white border border-peach p-6">
            <h2 class="font-serif text-lg text-chocolate font-light mb-5">Tu pedido</h2>
            <div class="flex flex-col divide-y divide-peach">
              <div v-for="item in cart.items" :key="item.id" class="flex items-center gap-4 py-4">
                <div class="relative">
                  <img :src="item.image" :alt="item.name" class="w-14 h-14 object-cover bg-blush" />
                  <span class="absolute -top-1.5 -right-1.5 bg-chocolate text-white text-2xs w-4 h-4 flex items-center justify-center rounded-full">{{ item.qty }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-serif text-sm text-chocolate truncate">{{ item.name }}</p>
                </div>
                <p class="text-sm text-chocolate font-medium">{{ cart.formatPrice(item.price * item.qty) }}</p>
              </div>
            </div>

            <div class="border-t border-peach mt-4 pt-4 flex flex-col gap-2 text-sm">
              <div class="flex justify-between text-chocolate/50">
                <span>Subtotal</span>
                <span>{{ cart.formattedSubtotal }}</span>
              </div>
              <div class="flex justify-between text-chocolate/50">
                <span>Envío</span>
                <span class="text-green-600">Gratis</span>
              </div>
              <div class="flex justify-between font-medium text-chocolate pt-2 border-t border-peach mt-1">
                <span class="font-serif text-base">Total</span>
                <span class="font-serif text-base">{{ cart.formattedSubtotal }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { RouterLink } from 'vue-router'
import { CheckCircleIcon } from '@lucide/vue'
import { supabase } from '../lib/supabase'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'

const cart = useCartStore()
const auth = useAuthStore()

const submitting = ref(false)
const orderPlaced = ref(false)
const orderId = ref(null)
const errorMsg = ref('')

const form = reactive({
  firstName: '', lastName: '', email: auth.user?.email ?? '',
  phone: '', address: '', city: '', state: '',
})

async function placeOrder() {
  submitting.value = true
  errorMsg.value = ''
  try {
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        user_id: auth.user?.id ?? null,
        total: cart.subtotal,
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
      })
      .select('id')
      .single()

    if (orderErr) throw orderErr

    const items = cart.items.map(i => ({
      order_id: order.id,
      product_id: i.id,
      product_name: i.name,
      product_image: i.image,
      qty: i.qty,
      price: i.price,
    }))

    const { error: itemsErr } = await supabase.from('order_items').insert(items)
    if (itemsErr) throw itemsErr

    orderId.value = order.id
    cart.clear()
    orderPlaced.value = true
  } catch (err) {
    errorMsg.value = 'Ocurrió un error al procesar tu pedido. Intenta de nuevo.'
    console.error(err)
  } finally {
    submitting.value = false
  }
}
</script>
