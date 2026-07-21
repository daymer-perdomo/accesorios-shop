<template>
  <article class="product-card group" @click="$router.push(`/producto/${product.id}`)">
    <!-- Image -->
    <div class="relative overflow-hidden bg-blush aspect-square mb-4">
      <img
        :src="product.images[0]"
        :alt="product.name"
        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <span
        v-if="product.isNew"
        class="absolute top-3 left-3 bg-rose text-white text-2xs tracking-widest uppercase px-2 py-1"
      >
        Nuevo
      </span>
      <!-- Quick add overlay -->
      <div class="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out-expo">
        <button
          class="w-full bg-chocolate text-white text-xs tracking-widest uppercase py-3 hover:bg-burgundy transition-colors"
          @click.stop="addToCart"
        >
          Agregar al carrito
        </button>
      </div>
    </div>

    <!-- Info -->
    <div class="px-1">
      <p class="text-2xs tracking-widest uppercase text-chocolate/40 mb-1">{{ categoryLabel }}</p>
      <h3 class="font-serif text-base text-chocolate group-hover:text-rose transition-colors duration-200 leading-snug">
        {{ product.name }}
      </h3>
      <p class="text-sm text-burgundy font-medium mt-1">{{ formattedPrice }}</p>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../../stores/cart'
import { useProductsStore } from '../../stores/products'

const props = defineProps({
  product: { type: Object, required: true },
})

const $router = useRouter()
const cart = useCartStore()
const productsStore = useProductsStore()

const categoryLabel = computed(() =>
  productsStore.CATEGORIES.find(c => c.id === props.product.category)?.label ?? ''
)

const formattedPrice = computed(() =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(props.product.price)
)

function addToCart() {
  cart.add(props.product)
}
</script>
