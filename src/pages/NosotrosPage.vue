<template>
  <main class="pt-20 md:pt-24">

    <!-- Hero -->
    <section class="bg-blush py-24 md:py-32">
      <div class="max-w-4xl mx-auto px-6 text-center">
        <p class="text-xs tracking-widest uppercase text-rose mb-4">Nuestra historia</p>
        <h1 class="font-serif text-5xl md:text-7xl text-chocolate font-light leading-none mb-8">
          MAI ACCESORIOS
        </h1>
        <p class="text-base md:text-lg text-chocolate/60 leading-relaxed max-w-2xl mx-auto">
          Nacimos de la pasión por los detalles y la creencia de que cada accesorio cuenta una historia.
          Creamos piezas para mujeres que celebran su estilo con autenticidad.
        </p>
      </div>
    </section>

    <!-- Story -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div class="aspect-[4/5] bg-blush overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&q=80"
            alt="Taller MAI ACCESORIOS"
            class="w-full h-full object-cover"
          />
        </div>
        <div>
          <p class="text-xs tracking-widest uppercase text-rose mb-4">Quiénes somos</p>
          <h2 class="font-serif text-4xl text-chocolate font-light leading-tight mb-6">
            Hechos con amor, pensados para ti
          </h2>
          <p class="text-sm text-chocolate/60 leading-relaxed mb-5">
            MAI ACCESORIOS nació con un propósito claro: crear accesorios de alta calidad que combinen elegancia y estilo contemporáneo.
            Cada pieza es cuidadosamente seleccionada para reflejar la esencia de la mujer moderna.
          </p>
          <p class="text-sm text-chocolate/60 leading-relaxed mb-8">
            Trabajamos con materiales premium, procesos responsables y un servicio personalizado que convierte
            cada compra en una experiencia memorable.
          </p>
          <RouterLink to="/tienda" class="btn-primary">Explorar colección</RouterLink>
        </div>
      </div>
    </section>

    <!-- Values -->
    <section class="py-20 bg-blush/30 border-y border-peach">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="text-center mb-14">
          <p class="text-xs tracking-widest uppercase text-rose mb-3">Lo que nos define</p>
          <h2 class="font-serif text-4xl text-chocolate font-light">Nuestros valores</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="v in values" :key="v.title" class="bg-white p-8 text-center">
            <div class="text-3xl mb-4">{{ v.emoji }}</div>
            <h3 class="font-serif text-xl text-chocolate font-light mb-3">{{ v.title }}</h3>
            <p class="text-sm text-chocolate/60 leading-relaxed">{{ v.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-20 bg-chocolate text-center">
      <div class="max-w-xl mx-auto px-6">
        <h2 class="font-serif text-4xl text-white font-light mb-4">¿Lista para encontrar tu pieza perfecta?</h2>
        <p class="text-white/50 text-sm mb-8">Envío gratis en compras mayores a $200.000</p>
        <RouterLink to="/tienda" class="btn-primary bg-rose hover:bg-burgundy">Ver colección</RouterLink>
      </div>
    </section>
  </main>
</template>

<script setup>
import { RouterLink } from 'vue-router'

const values = [
  { emoji: '✦', title: 'Calidad premium', text: 'Seleccionamos materiales de alta calidad para garantizar piezas duraderas y elegantes.' },
  { emoji: '♡', title: 'Atención personalizada', text: 'Cada cliente merece un servicio único. Estamos aquí para acompañarte en cada paso.' },
  { emoji: '◇', title: 'Estilo auténtico', text: 'Diseños que celebran la individualidad y el estilo único de cada mujer.' },
]
</script>
