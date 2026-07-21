<template>
  <main class="pt-20 md:pt-24">

    <!-- Hero -->
    <section class="bg-blush py-20">
      <div class="max-w-2xl mx-auto px-6 text-center">
        <p class="text-xs tracking-widest uppercase text-rose mb-4">Comunidad MAI ACCESORIOS</p>
        <h1 class="font-serif text-5xl md:text-6xl text-chocolate font-light leading-none mb-6">
          Clientes felices
        </h1>
        <p class="text-sm text-chocolate/60 leading-relaxed">
          Estas son las historias de mujeres que llevan MAI ACCESORIOS con orgullo.
        </p>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div v-if="loading" class="text-center py-16 text-chocolate/40">Cargando...</div>

        <div v-else-if="!testimonials.length" class="text-center py-16 text-chocolate/40 font-serif text-2xl">
          Pronto compartiremos testimonios aquí.
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="t in testimonials"
            :key="t.id"
            class="bg-white border border-peach flex flex-col"
          >
            <!-- Avatar large -->
            <div class="relative h-44 bg-blush/50 flex items-center justify-center overflow-hidden">
              <img v-if="t.avatar_url" :src="t.avatar_url" :alt="t.name" class="w-full h-full object-cover" />
              <div v-else class="w-20 h-20 rounded-full bg-rose/20 flex items-center justify-center">
                <span class="font-serif text-2xl text-rose/60">{{ initials(t.name) }}</span>
              </div>
            </div>

            <div class="p-6 flex flex-col gap-3 flex-1">
              <!-- Stars -->
              <div class="flex gap-0.5">
                <span v-for="i in 5" :key="i" class="text-base" :class="i <= t.rating ? 'text-amber-400' : 'text-neutral-200'">★</span>
              </div>
              <!-- Body -->
              <p class="text-sm text-chocolate/70 leading-relaxed flex-1 italic">"{{ t.body }}"</p>
              <!-- Author -->
              <div class="pt-3 border-t border-peach">
                <p class="text-xs font-semibold text-chocolate">{{ t.name }}</p>
                <p v-if="t.location" class="text-[10px] text-chocolate/40 mt-0.5">{{ t.location }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="bg-blush/40 border-t border-peach py-20 text-center">
      <div class="max-w-md mx-auto px-6">
        <h2 class="font-serif text-3xl text-chocolate font-light mb-4">¿Quieres ser parte de nuestra comunidad?</h2>
        <RouterLink to="/tienda" class="btn-primary mt-6 inline-block">Explorar colección</RouterLink>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { supabase } from '../lib/supabase'

const testimonials = ref([])
const loading = ref(true)

onMounted(async () => {
  const { data } = await supabase
    .from('testimonials')
    .select('*')
    .eq('active', true)
    .order('order_index')
  testimonials.value = data ?? []
  loading.value = false
})

function initials(name) {
  return name.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
}
</script>
