<template>
  <main class="pt-20 md:pt-24">
    <!-- Header -->
    <div class="bg-blush py-12 border-b border-peach">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="font-serif text-4xl md:text-5xl text-chocolate font-light">Tienda</h1>
        <p class="text-sm text-chocolate/50 mt-2">{{ store.filtered.length }} productos</p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-3 mb-10">
        <button
          v-for="cat in store.CATEGORIES"
          :key="cat.id"
          class="text-xs tracking-widest uppercase px-4 py-2 border transition-all duration-200"
          :class="store.activeCategory === cat.id
            ? 'bg-chocolate text-white border-chocolate'
            : 'border-peach text-chocolate/60 hover:border-rose hover:text-rose'"
          @click="store.setCategory(cat.id)"
        >
          {{ cat.label }}
        </button>

        <input
          v-model="store.searchQuery"
          type="search"
          placeholder="Buscar..."
          class="input-base ml-auto w-48"
        />
      </div>

      <!-- Grid -->
      <div v-if="store.filtered.length > 0" class="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        <ProductCard v-for="product in store.filtered" :key="product.id" :product="product" />
      </div>
      <div v-else class="text-center py-24 text-chocolate/40 font-serif text-xl">
        No se encontraron productos.
      </div>
    </div>
  </main>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ProductCard from '../components/ui/ProductCard.vue'
import { useProductsStore } from '../stores/products'

const store = useProductsStore()
const route = useRoute()

onMounted(() => {
  const cat = route.query.cat
  if (cat) store.setCategory(cat)
})
</script>
