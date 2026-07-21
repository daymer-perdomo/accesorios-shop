<template>
  <main class="pt-20 md:pt-24 min-h-screen bg-blush/20">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="font-serif text-4xl text-chocolate font-light mb-10">Finalizar compra</h1>

      <!-- Success state -->
      <div v-if="orderPlaced" class="text-center py-20">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
          <CheckCircleIcon :size="32" class="text-green-600" />
        </div>
        <h2 class="font-serif text-3xl text-chocolate font-light mb-3">¡Pedido registrado!</h2>
        <p class="text-chocolate/50 text-sm mb-2">Pedido #{{ orderId }}</p>
        <p class="text-chocolate/50 text-sm mb-8">Abrimos WhatsApp para confirmar tu pago y envío. Si no se abrió, usa el botón de abajo.</p>
        <div class="flex flex-col items-center gap-4">
          <a :href="lastWhatsAppUrl" target="_blank" class="btn-primary flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Continuar por WhatsApp
          </a>
          <RouterLink to="/tienda" class="text-sm text-chocolate/50 hover:text-chocolate transition-colors">Seguir comprando</RouterLink>
        </div>
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
            <span v-else>Finalizar por WhatsApp</span>
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
import { useSettings } from '../composables/useSettings'

const cart = useCartStore()
const auth = useAuthStore()
const { fetchSettings, get } = useSettings()

const submitting = ref(false)
const orderPlaced = ref(false)
const orderId = ref(null)
const errorMsg = ref('')
const lastWhatsAppUrl = ref('')

const form = reactive({
  firstName: '', lastName: '', email: auth.user?.email ?? '',
  phone: '', address: '', city: '', state: '',
})

async function placeOrder() {
  submitting.value = true
  errorMsg.value = ''
  try {
    const { data: newOrderId, error: orderErr } = await supabase.rpc('create_order', {
      order_data: {
        user_id: auth.user?.id ?? null,
        total: cart.subtotal,
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        channel: 'web',
      },
      items_data: cart.items.map(i => ({
        product_id: i.id,
        product_name: i.name,
        product_image: i.image,
        qty: i.qty,
        price: i.price,
      })),
    })

    if (orderErr) throw orderErr

    orderId.value = newOrderId

    const itemsList = cart.items
      .map(i => `• ${i.name} x${i.qty} — ${cart.formatPrice(i.price * i.qty)}`)
      .join('\n')

    const message = [
      '¡Hola! 👋 Acabo de hacer un pedido en la tienda:',
      '',
      `🧾 *Pedido #${newOrderId}*`,
      itemsList,
      `💰 Total: ${cart.formattedSubtotal}`,
      '',
      `👤 ${form.firstName} ${form.lastName}`,
      `📍 ${form.address}, ${form.city}${form.state ? ', ' + form.state : ''}`,
      '',
      '¿Me ayudan a coordinar el pago y el envío?',
    ].join('\n')

    await fetchSettings()
    const wa = get('whatsapp_number', import.meta.env.VITE_WHATSAPP_NUMBER)
    lastWhatsAppUrl.value = `https://wa.me/${wa}?text=${encodeURIComponent(message)}`

    cart.clear()
    orderPlaced.value = true
    window.open(lastWhatsAppUrl.value, '_blank')
  } catch (err) {
    errorMsg.value = 'Ocurrió un error al procesar tu pedido. Intenta de nuevo.'
    console.error(err)
  } finally {
    submitting.value = false
  }
}
</script>
