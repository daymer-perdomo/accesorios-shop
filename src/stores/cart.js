import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const isOpen = ref(false)

  const count = computed(() => items.value.reduce((sum, i) => sum + i.qty, 0))

  const subtotal = computed(() =>
    items.value.reduce((sum, i) => sum + i.price * i.qty, 0)
  )

  const formattedSubtotal = computed(() =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(subtotal.value)
  )

  function add(product, qty = 1) {
    const existing = items.value.find(i => i.id === product.id)
    if (existing) {
      existing.qty += qty
    } else {
      items.value.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] ?? '',
        qty,
      })
    }
    isOpen.value = true
  }

  function remove(id) {
    items.value = items.value.filter(i => i.id !== id)
  }

  function updateQty(id, qty) {
    if (qty <= 0) return remove(id)
    const item = items.value.find(i => i.id === id)
    if (item) item.qty = qty
  }

  function clear() {
    items.value = []
  }

  function formatPrice(amount) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount)
  }

  return { items, isOpen, count, subtotal, formattedSubtotal, add, remove, updateQty, clear, formatPrice }
})
