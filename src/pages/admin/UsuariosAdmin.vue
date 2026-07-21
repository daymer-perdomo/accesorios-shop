<template>
  <div class="p-8">
    <div class="flex items-start justify-between mb-8">
      <div>
        <h1 class="font-serif text-4xl text-chocolate font-light">Usuarios</h1>
        <p class="text-sm text-neutral-400 mt-1">{{ users.length }} usuarios registrados</p>
      </div>
      <div class="relative">
        <SearchIcon :size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          v-model="search"
          placeholder="Buscar por email o nombre..."
          class="input pl-9 w-72 text-sm"
        />
      </div>
    </div>

    <!-- Role summary chips -->
    <div class="flex items-center gap-3 mb-6">
      <button
        v-for="f in roleFilters"
        :key="f.value"
        class="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
        :class="activeFilter === f.value ? 'bg-rose text-white' : 'bg-white border border-neutral-200 text-neutral-600 hover:border-rose/50'"
        @click="activeFilter = f.value"
      >
        {{ f.label }}
        <span class="bg-black/10 rounded-full px-1.5 py-0.5 text-[10px] leading-none">{{ f.count }}</span>
      </button>
    </div>

    <div v-if="loading" class="text-center py-16 text-neutral-400">Cargando usuarios...</div>

    <div v-if="rpcError" class="mb-4 bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3 rounded-lg">
      Error al cargar usuarios: {{ rpcError }}
    </div>

    <div v-if="!loading" class="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      <table class="w-full text-xs">
        <thead>
          <tr class="border-b border-neutral-100 bg-neutral-50">
            <th class="text-left px-6 py-3 text-[10px] tracking-widest uppercase text-neutral-400 font-semibold">Usuario</th>
            <th class="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-neutral-400 font-semibold">Teléfono</th>
            <th class="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-neutral-400 font-semibold">Registro</th>
            <th class="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-neutral-400 font-semibold">Rol</th>
            <th class="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-100">
          <tr v-for="u in filtered" :key="u.id" class="hover:bg-neutral-50 transition-colors">
            <td class="px-6 py-3.5">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0" :class="avatarClass(u.role)">
                  {{ initials(u) }}
                </div>
                <div>
                  <p class="font-medium text-neutral-800">{{ u.full_name || '—' }}</p>
                  <p class="text-neutral-400 mt-0.5">{{ u.email }}</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3.5 text-neutral-500">{{ u.phone || '—' }}</td>
            <td class="px-4 py-3.5 text-neutral-400">{{ formatDate(u.created_at) }}</td>
            <td class="px-4 py-3.5">
              <span class="px-2.5 py-1 rounded-full text-[10px] tracking-widest uppercase font-semibold" :class="roleBadge(u.role)">
                {{ u.role }}
              </span>
            </td>
            <td class="px-6 py-3.5">
              <select
                :value="u.role"
                class="text-xs border border-neutral-200 rounded-lg px-2 py-1.5 bg-white text-neutral-600 focus:outline-none focus:border-rose cursor-pointer"
                @change="updateRole(u, $event.target.value)"
              >
                <option value="user">user</option>
                <option value="editor">editor</option>
                <option value="admin">admin</option>
              </select>
            </td>
          </tr>
          <tr v-if="filtered.length === 0">
            <td colspan="5" class="px-6 py-10 text-center text-neutral-400">No se encontraron usuarios</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { SearchIcon } from '@lucide/vue'
import { supabase } from '../../lib/supabase'

const users = ref([])
const loading = ref(true)
const search = ref('')
const activeFilter = ref('all')
const rpcError = ref('')

const roleFilters = computed(() => [
  { label: 'Todos', value: 'all', count: users.value.length },
  { label: 'Admins', value: 'admin', count: users.value.filter(u => u.role === 'admin').length },
  { label: 'Editores', value: 'editor', count: users.value.filter(u => u.role === 'editor').length },
  { label: 'Usuarios', value: 'user', count: users.value.filter(u => u.role === 'user').length },
])

const filtered = computed(() => {
  let result = users.value
  if (activeFilter.value !== 'all') result = result.filter(u => u.role === activeFilter.value)
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    result = result.filter(u => (u.email || '').toLowerCase().includes(q) || (u.full_name || '').toLowerCase().includes(q))
  }
  return result
})

onMounted(async () => {
  const { data, error } = await supabase.rpc('get_all_users')
  if (error) {
    rpcError.value = error.message
  } else {
    users.value = data ?? []
  }
  loading.value = false
})

async function updateRole(user, newRole) {
  const prev = user.role
  user.role = newRole
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, role: newRole, is_admin: newRole === 'admin' })
  if (error) {
    user.role = prev
    alert('Error al actualizar el rol')
  }
}

function initials(u) {
  const name = u.full_name || u.email || '?'
  return name.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function avatarClass(role) {
  return {
    admin: 'bg-rose/20 text-rose',
    editor: 'bg-blue-100 text-blue-600',
    user: 'bg-neutral-100 text-neutral-500',
  }[role] ?? 'bg-neutral-100 text-neutral-500'
}

function roleBadge(role) {
  return {
    admin: 'bg-rose/10 text-rose',
    editor: 'bg-blue-50 text-blue-600',
    user: 'bg-neutral-100 text-neutral-500',
  }[role] ?? 'bg-neutral-100 text-neutral-500'
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
