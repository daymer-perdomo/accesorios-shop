import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

export const useProductsStore = defineStore('products', () => {
  const products = ref([])
  const categories = ref([])
  const loading = ref(false)
  const activeCategory = ref('all')
  const searchQuery = ref('')

  const CATEGORIES = computed(() => [
    { id: 'all', label: 'Todo' },
    ...categories.value.map(c => ({ id: c.slug, label: c.label })),
  ])

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

  async function fetchCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('order_index', { ascending: true })

    if (!error) categories.value = data ?? []
  }

  return {
    products, categories, CATEGORIES, loading, activeCategory, searchQuery,
    filtered, featured, getById, setCategory, fetchProducts, fetchCategories,
  }
})
