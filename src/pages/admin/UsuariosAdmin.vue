<template>
  <div class="p-8">
    <div class="flex items-start justify-between mb-8">
      <div>
        <h1 class="font-serif text-4xl text-chocolate font-light">Usuarios</h1>
        <p class="text-sm text-neutral-400 mt-1">{{ users.length }} usuarios registrados</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="relative">
          <SearchIcon :size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            v-model="search"
            placeholder="Buscar por email o nombre..."
            class="input pl-9 w-72 text-sm"
          />
        </div>
        <button class="btn-primary text-xs flex items-center gap-1.5" @click="openInvite">
          <UserPlusIcon :size="14" /> Nuevo usuario
        </button>
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
    <div v-if="banner" class="mb-4 bg-green-50 border border-green-200 text-green-700 text-xs px-4 py-3 rounded-lg">
      {{ banner }}
    </div>

    <div v-if="!loading" class="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      <table class="w-full text-xs">
        <thead>
          <tr class="border-b border-neutral-100 bg-neutral-50">
            <th class="text-left px-6 py-3 text-[10px] tracking-widest uppercase text-neutral-400 font-semibold">Usuario</th>
            <th class="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-neutral-400 font-semibold">Teléfono</th>
            <th class="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-neutral-400 font-semibold">Registro</th>
            <th class="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-neutral-400 font-semibold">Rol</th>
            <th class="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-neutral-400 font-semibold">Estado</th>
            <th class="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-100">
          <tr v-for="u in filtered" :key="u.id" class="hover:bg-neutral-50 transition-colors" :class="{ 'opacity-50': !u.is_active }">
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
            <td class="px-4 py-3.5">
              <span
                class="px-2.5 py-1 rounded-full text-[10px] tracking-widest uppercase font-semibold"
                :class="u.is_active ? 'bg-green-50 text-green-600' : 'bg-neutral-100 text-neutral-500'"
              >
                {{ u.is_active ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="px-6 py-3.5">
              <div class="flex items-center gap-2 justify-end">
                <button class="text-neutral-400 hover:text-chocolate transition-colors p-1" title="Editar" @click="openEdit(u)">
                  <PencilIcon :size="14" />
                </button>
                <button
                  v-if="u.is_active"
                  class="text-neutral-400 hover:text-red-500 transition-colors p-1"
                  title="Desactivar"
                  @click="toDeactivate = u"
                >
                  <Trash2Icon :size="14" />
                </button>
                <button
                  v-else
                  class="text-neutral-400 hover:text-green-600 transition-colors p-1"
                  title="Reactivar"
                  @click="reactivate(u)"
                >
                  <RotateCcwIcon :size="14" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filtered.length === 0">
            <td colspan="6" class="px-6 py-10 text-center text-neutral-400">No se encontraron usuarios</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal invitar -->
    <Teleport to="body">
      <div v-if="inviteModal" class="fixed inset-0 bg-chocolate/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="inviteModal = null">
        <div class="bg-white w-full max-w-md border border-neutral-200 rounded-xl overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
            <h2 class="font-serif text-xl text-chocolate font-light">Invitar usuario</h2>
            <button class="text-neutral-400 hover:text-chocolate" @click="inviteModal = null"><XIcon :size="18" /></button>
          </div>
          <form class="px-6 py-6 flex flex-col gap-4" @submit.prevent="sendInvite">
            <div>
              <label class="text-2xs tracking-widest uppercase text-neutral-400 block mb-1">Correo *</label>
              <input v-model="inviteModal.email" type="email" required class="input w-full" placeholder="correo@ejemplo.com" />
            </div>
            <div>
              <label class="text-2xs tracking-widest uppercase text-neutral-400 block mb-1">Nombre completo</label>
              <input v-model="inviteModal.full_name" class="input w-full" />
            </div>
            <div>
              <label class="text-2xs tracking-widest uppercase text-neutral-400 block mb-1">Rol</label>
              <select v-model="inviteModal.role" class="input w-full">
                <option value="user">user</option>
                <option value="editor">editor</option>
                <option value="admin">admin</option>
              </select>
            </div>
            <p class="text-2xs text-neutral-400">Se enviará un correo de invitación para que la persona cree su contraseña.</p>
            <p v-if="inviteError" class="text-xs text-red-500">{{ inviteError }}</p>
            <div class="flex gap-3 pt-2">
              <button type="submit" class="btn-primary text-xs flex-1" :disabled="inviting">
                {{ inviting ? 'Enviando...' : 'Enviar invitación' }}
              </button>
              <button type="button" class="btn-ghost text-xs" @click="inviteModal = null">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal editar -->
    <Teleport to="body">
      <div v-if="editModal" class="fixed inset-0 bg-chocolate/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="editModal = null">
        <div class="bg-white w-full max-w-md border border-neutral-200 rounded-xl overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
            <h2 class="font-serif text-xl text-chocolate font-light">Editar usuario</h2>
            <button class="text-neutral-400 hover:text-chocolate" @click="editModal = null"><XIcon :size="18" /></button>
          </div>
          <form class="px-6 py-6 flex flex-col gap-4" @submit.prevent="saveEdit">
            <div>
              <label class="text-2xs tracking-widest uppercase text-neutral-400 block mb-1">Correo</label>
              <input :value="editModal.email" disabled class="input w-full bg-neutral-50 text-neutral-400" />
            </div>
            <div>
              <label class="text-2xs tracking-widest uppercase text-neutral-400 block mb-1">Nombre completo</label>
              <input v-model="editModal.full_name" class="input w-full" />
            </div>
            <div>
              <label class="text-2xs tracking-widest uppercase text-neutral-400 block mb-1">Teléfono</label>
              <input v-model="editModal.phone" class="input w-full" />
            </div>
            <div>
              <label class="text-2xs tracking-widest uppercase text-neutral-400 block mb-1">Rol</label>
              <select v-model="editModal.role" class="input w-full">
                <option value="user">user</option>
                <option value="editor">editor</option>
                <option value="admin">admin</option>
              </select>
            </div>
            <p v-if="editError" class="text-xs text-red-500">{{ editError }}</p>
            <div class="flex gap-3 pt-2">
              <button type="submit" class="btn-primary text-xs flex-1" :disabled="saving">
                {{ saving ? 'Guardando...' : 'Guardar' }}
              </button>
              <button type="button" class="btn-ghost text-xs" @click="editModal = null">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Confirmar desactivar -->
    <Teleport to="body">
      <div v-if="toDeactivate" class="fixed inset-0 bg-chocolate/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="toDeactivate = null">
        <div class="bg-white border border-neutral-200 rounded-xl p-8 max-w-sm w-full text-center">
          <p class="font-serif text-xl text-chocolate font-light mb-2">¿Desactivar usuario?</p>
          <p class="text-xs text-neutral-500 mb-6">{{ toDeactivate.full_name || toDeactivate.email }} perderá acceso a la plataforma. Podrás reactivarlo cuando quieras.</p>
          <div class="flex gap-3 justify-center">
            <button class="btn-primary bg-red-500 hover:bg-red-600 text-xs" @click="deactivate">Desactivar</button>
            <button class="btn-ghost text-xs" @click="toDeactivate = null">Cancelar</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { SearchIcon, PencilIcon, Trash2Icon, RotateCcwIcon, UserPlusIcon, XIcon } from '@lucide/vue'
import { supabase } from '../../lib/supabase'

const users = ref([])
const loading = ref(true)
const search = ref('')
const activeFilter = ref('all')
const rpcError = ref('')
const banner = ref('')

const inviteModal = ref(null)
const inviting = ref(false)
const inviteError = ref('')

const editModal = ref(null)
const saving = ref(false)
const editError = ref('')

const toDeactivate = ref(null)

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

onMounted(fetchUsers)

async function fetchUsers() {
  loading.value = true
  const { data, error } = await supabase.rpc('get_all_users')
  if (error) {
    rpcError.value = error.message
  } else {
    users.value = data ?? []
    rpcError.value = ''
  }
  loading.value = false
}

function showBanner(msg) {
  banner.value = msg
  setTimeout(() => { if (banner.value === msg) banner.value = '' }, 4000)
}

function openInvite() {
  inviteModal.value = { email: '', full_name: '', role: 'user' }
  inviteError.value = ''
}

async function sendInvite() {
  inviting.value = true
  inviteError.value = ''
  const { data, error } = await supabase.functions.invoke('admin-invite-user', {
    body: {
      email: inviteModal.value.email,
      full_name: inviteModal.value.full_name,
      role: inviteModal.value.role,
    },
  })
  inviting.value = false
  if (error || data?.error) {
    inviteError.value = data?.error || error.message
    return
  }
  inviteModal.value = null
  showBanner('Invitación enviada correctamente')
  await fetchUsers()
}

function openEdit(u) {
  editModal.value = { ...u }
  editError.value = ''
}

async function saveEdit() {
  saving.value = true
  editError.value = ''
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: editModal.value.id,
      full_name: editModal.value.full_name,
      phone: editModal.value.phone,
      role: editModal.value.role,
      is_admin: editModal.value.role === 'admin',
    })
  saving.value = false
  if (error) { editError.value = error.message; return }
  editModal.value = null
  await fetchUsers()
}

async function deactivate() {
  const u = toDeactivate.value
  toDeactivate.value = null
  const { error } = await supabase.from('profiles').upsert({ id: u.id, is_active: false })
  if (error) { rpcError.value = error.message; return }
  showBanner('Usuario desactivado')
  await fetchUsers()
}

async function reactivate(u) {
  const { error } = await supabase.from('profiles').upsert({ id: u.id, is_active: true })
  if (error) { rpcError.value = error.message; return }
  showBanner('Usuario reactivado')
  await fetchUsers()
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
