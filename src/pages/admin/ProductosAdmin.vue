<template>
  <main class="p-8">
    <div class="flex items-center justify-between mb-8">
      <h1 class="font-serif text-4xl text-chocolate font-light">Productos</h1>
      <button class="btn-primary text-xs" @click="openCreate">+ Nuevo producto</button>
    </div>

    <!-- Categorías -->
    <div class="mb-10">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-xs tracking-widest uppercase text-chocolate/50 font-medium">Categorías</h2>
        <button class="text-xs text-rose hover:text-burgundy transition-colors" @click="openCreateCategory">+ Categoría</button>
      </div>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="cat in productsStore.categories"
          :key="cat.id"
          class="flex items-center gap-2 px-3 py-1.5 bg-white border border-peach text-xs text-chocolate"
        >
          {{ cat.label }}
          <button class="text-chocolate/40 hover:text-chocolate transition-colors" @click="openEditCategory(cat)">
            <PencilIcon :size="12" />
          </button>
          <button class="text-chocolate/40 hover:text-red-500 transition-colors" @click="confirmDeleteCategory(cat)">
            <Trash2Icon :size="12" />
          </button>
        </div>
        <p v-if="productsStore.categories.length === 0" class="text-xs text-chocolate/40">Sin categorías</p>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12 text-chocolate/40">Cargando...</div>
    <div v-else class="bg-white border border-peach overflow-hidden">
      <table class="w-full text-xs">
        <thead>
          <tr class="border-b border-peach bg-blush/30">
            <th class="text-left px-4 py-3 tracking-widest uppercase text-chocolate/50 font-medium w-12">#</th>
            <th class="text-left px-4 py-3 tracking-widest uppercase text-chocolate/50 font-medium">Nombre</th>
            <th class="text-left px-4 py-3 tracking-widest uppercase text-chocolate/50 font-medium">Categoría</th>
            <th class="text-left px-4 py-3 tracking-widest uppercase text-chocolate/50 font-medium">Precio</th>
            <th class="text-left px-4 py-3 tracking-widest uppercase text-chocolate/50 font-medium">Stock</th>
            <th class="text-left px-4 py-3 tracking-widest uppercase text-chocolate/50 font-medium">Dest.</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-peach">
          <tr v-for="p in products" :key="p.id" class="hover:bg-blush/10 transition-colors">
            <td class="px-4 py-3 text-chocolate/40">{{ p.id }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <img v-if="p.images?.[0]" :src="p.images[0]" class="w-9 h-9 object-cover bg-blush flex-shrink-0" />
                <span class="text-chocolate font-medium">{{ p.name }}</span>
              </div>
            </td>
            <td class="px-4 py-3 capitalize text-chocolate/70">{{ p.category }}</td>
            <td class="px-4 py-3 text-chocolate">{{ formatPrice(p.price) }}</td>
            <td class="px-4 py-3 text-chocolate">{{ p.stock }}</td>
            <td class="px-4 py-3">
              <span v-if="p.featured" class="text-rose text-base leading-none">★</span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2 justify-end">
                <button class="text-chocolate/50 hover:text-chocolate transition-colors p-1" @click="openEdit(p)">
                  <PencilIcon :size="14" />
                </button>
                <button class="text-chocolate/50 hover:text-red-500 transition-colors p-1" @click="confirmDelete(p)">
                  <Trash2Icon :size="14" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="products.length === 0">
            <td colspan="7" class="px-4 py-8 text-center text-chocolate/40">Sin productos</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal crear/editar -->
    <Teleport to="body">
      <div v-if="modal" class="fixed inset-0 bg-chocolate/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="modal = null">
        <div class="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto border border-peach">
          <div class="flex items-center justify-between px-6 py-4 border-b border-peach">
            <h2 class="font-serif text-xl text-chocolate font-light">{{ modal.id ? 'Editar producto' : 'Nuevo producto' }}</h2>
            <button class="text-chocolate/40 hover:text-chocolate" @click="modal = null"><XIcon :size="18" /></button>
          </div>

          <form class="px-6 py-6 flex flex-col gap-4" @submit.prevent="saveProduct">
            <div>
              <label class="text-2xs tracking-widest uppercase text-chocolate/50 block mb-1">Nombre *</label>
              <input v-model="modal.name" required class="input w-full" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-2xs tracking-widest uppercase text-chocolate/50 block mb-1">Precio (COP) *</label>
                <input v-model.number="modal.price" type="number" min="0" required class="input w-full" />
              </div>
              <div>
                <label class="text-2xs tracking-widest uppercase text-chocolate/50 block mb-1">Stock</label>
                <input v-model.number="modal.stock" type="number" min="0" class="input w-full" />
              </div>
            </div>
            <div>
              <label class="text-2xs tracking-widest uppercase text-chocolate/50 block mb-1">Categoría *</label>
              <select v-model="modal.category" required class="input w-full">
                <option v-for="cat in productsStore.categories" :key="cat.id" :value="cat.slug">{{ cat.label }}</option>
              </select>
            </div>
            <div>
              <label class="text-2xs tracking-widest uppercase text-chocolate/50 block mb-1">URL imagen</label>
              <input v-model="modal.imageUrl" class="input w-full" placeholder="https://..." />
            </div>
            <div>
              <label class="text-2xs tracking-widest uppercase text-chocolate/50 block mb-1">Descripción</label>
              <textarea v-model="modal.description" class="input w-full" rows="3" />
            </div>
            <div class="flex items-center gap-6">
              <label class="flex items-center gap-2 cursor-pointer text-xs text-chocolate">
                <input v-model="modal.featured" type="checkbox" class="accent-rose" />
                Destacado
              </label>
              <label class="flex items-center gap-2 cursor-pointer text-xs text-chocolate">
                <input v-model="modal.is_new" type="checkbox" class="accent-rose" />
                Nuevo
              </label>
            </div>
            <p v-if="saveError" class="text-xs text-red-500">{{ saveError }}</p>
            <div class="flex gap-3 pt-2">
              <button type="submit" class="btn-primary text-xs flex-1" :disabled="saving">
                {{ saving ? 'Guardando...' : 'Guardar' }}
              </button>
              <button type="button" class="btn-ghost text-xs" @click="modal = null">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Confirm delete -->
    <Teleport to="body">
      <div v-if="toDelete" class="fixed inset-0 bg-chocolate/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="toDelete = null">
        <div class="bg-white border border-peach p-8 max-w-sm w-full text-center">
          <p class="font-serif text-xl text-chocolate font-light mb-2">¿Eliminar producto?</p>
          <p class="text-xs text-chocolate/60 mb-6">{{ toDelete.name }}</p>
          <div class="flex gap-3 justify-center">
            <button class="btn-primary bg-red-500 hover:bg-red-600 text-xs" @click="deleteProduct">Eliminar</button>
            <button class="btn-ghost text-xs" @click="toDelete = null">Cancelar</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal crear/editar categoría -->
    <Teleport to="body">
      <div v-if="categoryModal" class="fixed inset-0 bg-chocolate/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="categoryModal = null">
        <div class="bg-white w-full max-w-sm border border-peach">
          <div class="flex items-center justify-between px-6 py-4 border-b border-peach">
            <h2 class="font-serif text-xl text-chocolate font-light">{{ categoryModal.id ? 'Editar categoría' : 'Nueva categoría' }}</h2>
            <button class="text-chocolate/40 hover:text-chocolate" @click="categoryModal = null"><XIcon :size="18" /></button>
          </div>
          <form class="px-6 py-6 flex flex-col gap-4" @submit.prevent="saveCategory">
            <div>
              <label class="text-2xs tracking-widest uppercase text-chocolate/50 block mb-1">Nombre *</label>
              <input v-model="categoryModal.label" required class="input w-full" @input="syncSlug" />
            </div>
            <div>
              <label class="text-2xs tracking-widest uppercase text-chocolate/50 block mb-1">Slug (interno)</label>
              <input v-model="categoryModal.slug" required class="input w-full" />
            </div>
            <p v-if="categorySaveError" class="text-xs text-red-500">{{ categorySaveError }}</p>
            <div class="flex gap-3 pt-2">
              <button type="submit" class="btn-primary text-xs flex-1" :disabled="savingCategory">
                {{ savingCategory ? 'Guardando...' : 'Guardar' }}
              </button>
              <button type="button" class="btn-ghost text-xs" @click="categoryModal = null">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Confirmar / bloquear eliminar categoría -->
    <Teleport to="body">
      <div v-if="categoryToDelete" class="fixed inset-0 bg-chocolate/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="categoryToDelete = null">
        <div class="bg-white border border-peach p-8 max-w-sm w-full text-center">
          <template v-if="categoryToDelete.productCount > 0">
            <p class="font-serif text-xl text-chocolate font-light mb-2">No se puede eliminar</p>
            <p class="text-xs text-chocolate/60 mb-6">
              "{{ categoryToDelete.label }}" tiene {{ categoryToDelete.productCount }} producto{{ categoryToDelete.productCount === 1 ? '' : 's' }} asignado{{ categoryToDelete.productCount === 1 ? '' : 's' }}. Reasígnalos o elimínalos primero.
            </p>
            <button class="btn-ghost text-xs" @click="categoryToDelete = null">Cerrar</button>
          </template>
          <template v-else>
            <p class="font-serif text-xl text-chocolate font-light mb-2">¿Eliminar categoría?</p>
            <p class="text-xs text-chocolate/60 mb-6">{{ categoryToDelete.label }}</p>
            <div class="flex gap-3 justify-center">
              <button class="btn-primary bg-red-500 hover:bg-red-600 text-xs" @click="deleteCategory">Eliminar</button>
              <button class="btn-ghost text-xs" @click="categoryToDelete = null">Cancelar</button>
            </div>
          </template>
        </div>
      </div>
    </Teleport>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { PencilIcon, Trash2Icon, XIcon } from '@lucide/vue'
import { supabase } from '../../lib/supabase'
import { useProductsStore } from '../../stores/products'

const productsStore = useProductsStore()

const products = ref([])
const loading = ref(true)
const modal = ref(null)
const toDelete = ref(null)
const saving = ref(false)
const saveError = ref('')

const categoryModal = ref(null)
const savingCategory = ref(false)
const categorySaveError = ref('')
const categoryToDelete = ref(null)

onMounted(() => {
  fetchProducts()
  productsStore.fetchCategories()
})

async function fetchProducts() {
  loading.value = true
  const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
  products.value = data ?? []
  loading.value = false
}

function openCreate() {
  modal.value = { name: '', price: 0, stock: 0, category: productsStore.categories[0]?.slug ?? '', imageUrl: '', description: '', featured: false, is_new: false }
  saveError.value = ''
}

function openEdit(p) {
  modal.value = { ...p, imageUrl: p.images?.[0] ?? '' }
  saveError.value = ''
}

function confirmDelete(p) {
  toDelete.value = p
}

async function saveProduct() {
  saving.value = true
  saveError.value = ''
  const payload = {
    name: modal.value.name,
    price: modal.value.price,
    stock: modal.value.stock,
    category: modal.value.category,
    description: modal.value.description,
    featured: modal.value.featured,
    is_new: modal.value.is_new,
    images: modal.value.imageUrl ? [modal.value.imageUrl] : [],
  }
  let error
  if (modal.value.id) {
    ({ error } = await supabase.from('products').update(payload).eq('id', modal.value.id))
  } else {
    ({ error } = await supabase.from('products').insert(payload))
  }
  saving.value = false
  if (error) { saveError.value = error.message; return }
  modal.value = null
  await fetchProducts()
}

async function deleteProduct() {
  await supabase.from('products').delete().eq('id', toDelete.value.id)
  toDelete.value = null
  await fetchProducts()
}

function formatPrice(v) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v)
}

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function openCreateCategory() {
  categoryModal.value = { label: '', slug: '', autoSlug: true }
  categorySaveError.value = ''
}

function openEditCategory(cat) {
  categoryModal.value = { id: cat.id, label: cat.label, slug: cat.slug, autoSlug: false }
  categorySaveError.value = ''
}

function syncSlug() {
  if (categoryModal.value?.autoSlug) {
    categoryModal.value.slug = slugify(categoryModal.value.label)
  }
}

async function saveCategory() {
  savingCategory.value = true
  categorySaveError.value = ''
  const payload = { label: categoryModal.value.label, slug: categoryModal.value.slug }
  let error
  if (categoryModal.value.id) {
    ({ error } = await supabase.from('categories').update(payload).eq('id', categoryModal.value.id))
  } else {
    ({ error } = await supabase.from('categories').insert(payload))
  }
  savingCategory.value = false
  if (error) { categorySaveError.value = error.message; return }
  categoryModal.value = null
  await productsStore.fetchCategories()
}

async function confirmDeleteCategory(cat) {
  const { count } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category', cat.slug)
  categoryToDelete.value = { ...cat, productCount: count ?? 0 }
}

async function deleteCategory() {
  const cat = categoryToDelete.value
  categoryToDelete.value = null
  await supabase.from('categories').delete().eq('id', cat.id)
  await productsStore.fetchCategories()
}
</script>
