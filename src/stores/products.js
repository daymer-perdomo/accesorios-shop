import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

export const CATEGORIES = [
  { id: 'all', label: 'Todo' },
  { id: 'collares', label: 'Collares' },
  { id: 'aretes', label: 'Aretes' },
  { id: 'pulseras', label: 'Pulseras' },
  { id: 'anillos', label: 'Anillos' },
]

export const useProductsStore = defineStore('products', () => {
  const products = ref([])
  const loading = ref(false)
  const activeCategory = ref('all')
  const searchQuery = ref('')

  const filtered = computed(() => {
    let result = products.value
    if (activeCategory.value !== 'all') {
      result = result.filter(p => p.category === activeCategory.value)
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(p => p.name.toLowerCase().includes(q))
    }
    return result
  })

  const featured = computed(() => products.value.filter(p => p.featured))

  function getById(id) {
    return products.value.find(p => p.id === Number(id))
  }

  function setCategory(cat) {
    activeCategory.value = cat
  }

  async function fetchProducts() {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      products.value = data.map(p => ({
        ...p,
        isNew: p.is_new,
      }))
    } finally {
      loading.value = false
    }
  }

  return { products, loading, activeCategory, searchQuery, filtered, featured, getById, setCategory, fetchProducts }
})
