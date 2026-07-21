<template>
  <div class="p-8">
    <div class="mb-8">
      <h1 class="font-serif text-4xl text-chocolate font-light">Notificaciones</h1>
      <p class="text-sm text-neutral-400 mt-1">Envía mensajes a tus usuarios</p>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-5 gap-6">

      <!-- Compose panel -->
      <div class="xl:col-span-2">
        <div class="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div class="px-6 py-4 border-b border-neutral-100">
            <p class="text-sm font-medium text-neutral-800">Redactar notificación</p>
          </div>
          <form class="px-6 py-5 flex flex-col gap-4" @submit.prevent="sendNotification">
            <div>
              <label class="text-[10px] tracking-widest uppercase text-neutral-400 block mb-1.5">Título *</label>
              <input v-model="form.title" required maxlength="80" class="input w-full" placeholder="Ej: Nueva colección disponible" />
            </div>
            <div>
              <label class="text-[10px] tracking-widest uppercase text-neutral-400 block mb-1.5">Mensaje *</label>
              <textarea v-model="form.body" required maxlength="300" rows="4" class="input w-full resize-none" placeholder="Escribe tu mensaje aquí..."></textarea>
              <p class="text-[10px] text-neutral-400 mt-1 text-right">{{ form.body.length }}/300</p>
            </div>

            <!-- Type -->
            <div>
              <label class="text-[10px] tracking-widest uppercase text-neutral-400 block mb-2">Tipo</label>
              <div class="flex gap-2">
                <button
                  v-for="t in types"
                  :key="t.value"
                  type="button"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                  :class="form.type === t.value ? `${t.activeBg} ${t.activeText} border-transparent` : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300'"
                  @click="form.type = t.value"
                >
                  <component :is="t.icon" :size="12" />
                  {{ t.label }}
                </button>
              </div>
            </div>

            <!-- Target -->
            <div>
              <label class="text-[10px] tracking-widest uppercase text-neutral-400 block mb-2">Enviar a</label>
              <div class="flex gap-2">
                <button
                  v-for="tg in targets"
                  :key="tg.value"
                  type="button"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                  :class="form.target === tg.value ? 'bg-rose text-white border-transparent' : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300'"
                  @click="form.target = tg.value"
                >
                  <component :is="tg.icon" :size="12" />
                  {{ tg.label }}
                </button>
              </div>
            </div>

            <!-- Preview -->
            <div class="rounded-xl p-4 border" :class="previewStyle.container">
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" :class="previewStyle.icon">
                  <component :is="currentType.icon" :size="14" :class="previewStyle.iconColor" />
                </div>
                <div>
                  <p class="text-xs font-semibold" :class="previewStyle.title">{{ form.title || 'Título de la notificación' }}</p>
                  <p class="text-xs mt-0.5 opacity-70" :class="previewStyle.title">{{ form.body || 'Vista previa del mensaje...' }}</p>
                </div>
              </div>
            </div>

            <p v-if="sendError" class="text-xs text-red-500">{{ sendError }}</p>
            <p v-if="sendSuccess" class="text-xs text-emerald-600 font-medium">¡Notificación enviada correctamente!</p>

            <button type="submit" class="btn-primary text-xs flex items-center justify-center gap-2" :disabled="sending">
              <SendIcon :size="14" />
              {{ sending ? 'Enviando...' : 'Enviar notificación' }}
            </button>
          </form>
        </div>
      </div>

      <!-- History -->
      <div class="xl:col-span-3">
        <div class="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
            <p class="text-sm font-medium text-neutral-800">Historial</p>
            <span class="text-xs text-neutral-400">{{ notifications.length }} enviadas</span>
          </div>

          <div v-if="loading" class="p-8 text-center text-neutral-400 text-sm">Cargando...</div>

          <div v-else-if="notifications.length === 0" class="p-10 text-center text-neutral-400">
            <BellOffIcon :size="32" class="mx-auto mb-3 opacity-30" />
            <p class="text-sm">Aún no hay notificaciones enviadas</p>
          </div>

          <div v-else class="divide-y divide-neutral-100 max-h-[600px] overflow-y-auto">
            <div v-for="n in notifications" :key="n.id" class="px-6 py-4 hover:bg-neutral-50 transition-colors">
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" :class="typeStyle(n.type).icon">
                  <component :is="typeIcon(n.type)" :size="14" :class="typeStyle(n.type).iconColor" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2">
                    <p class="text-sm font-medium text-neutral-800 truncate">{{ n.title }}</p>
                    <span class="text-[10px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded-full flex-shrink-0" :class="typeStyle(n.type).badge">
                      {{ n.type }}
                    </span>
                  </div>
                  <p class="text-xs text-neutral-500 mt-1 line-clamp-2">{{ n.body }}</p>
                  <div class="flex items-center gap-3 mt-2">
                    <span class="text-[10px] text-neutral-400">{{ formatDate(n.created_at) }}</span>
                    <span class="text-[10px] text-neutral-400">→ {{ targetLabel(n.target) }}</span>
                  </div>
                </div>
                <button class="text-neutral-300 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5" @click="deleteNotif(n)">
                  <Trash2Icon :size="13" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { BellIcon, BellOffIcon, InfoIcon, TagIcon, AlertTriangleIcon, UsersIcon, ShieldIcon, GlobeIcon, SendIcon, Trash2Icon } from '@lucide/vue'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const notifications = ref([])
const loading = ref(true)
const sending = ref(false)
const sendError = ref('')
const sendSuccess = ref(false)

const form = ref({ title: '', body: '', type: 'info', target: 'all' })

const types = [
  { value: 'info', label: 'Info', icon: InfoIcon, activeBg: 'bg-blue-50', activeText: 'text-blue-600' },
  { value: 'promo', label: 'Promo', icon: TagIcon, activeBg: 'bg-rose/10', activeText: 'text-rose' },
  { value: 'alert', label: 'Alerta', icon: AlertTriangleIcon, activeBg: 'bg-amber-50', activeText: 'text-amber-600' },
]

const targets = [
  { value: 'all', label: 'Todos', icon: GlobeIcon },
  { value: 'users', label: 'Usuarios', icon: UsersIcon },
  { value: 'admins', label: 'Admins', icon: ShieldIcon },
]

const currentType = computed(() => types.find(t => t.value === form.value.type) ?? types[0])

const previewStyle = computed(() => ({
  info: { container: 'bg-blue-50 border-blue-100', icon: 'bg-blue-100', iconColor: 'text-blue-600', title: 'text-blue-900' },
  promo: { container: 'bg-rose/5 border-rose/10', icon: 'bg-rose/10', iconColor: 'text-rose', title: 'text-rose-900' },
  alert: { container: 'bg-amber-50 border-amber-100', icon: 'bg-amber-100', iconColor: 'text-amber-600', title: 'text-amber-900' },
}[form.value.type]))

onMounted(fetchNotifications)

async function fetchNotifications() {
  loading.value = true
  const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false })
  notifications.value = data ?? []
  loading.value = false
}

async function sendNotification() {
  sending.value = true
  sendError.value = ''
  sendSuccess.value = false
  const { error } = await supabase.from('notifications').insert({
    title: form.value.title,
    body: form.value.body,
    type: form.value.type,
    target: form.value.target,
    sender_id: auth.user?.id,
  })
  sending.value = false
  if (error) { sendError.value = error.message; return }
  sendSuccess.value = true
  form.value = { title: '', body: '', type: 'info', target: 'all' }
  setTimeout(() => { sendSuccess.value = false }, 3000)
  await fetchNotifications()
}

async function deleteNotif(n) {
  await supabase.from('notifications').delete().eq('id', n.id)
  notifications.value = notifications.value.filter(x => x.id !== n.id)
}

function typeIcon(type) {
  return { info: InfoIcon, promo: TagIcon, alert: AlertTriangleIcon }[type] ?? InfoIcon
}

function typeStyle(type) {
  return {
    info: { icon: 'bg-blue-100', iconColor: 'text-blue-600', badge: 'bg-blue-50 text-blue-600' },
    promo: { icon: 'bg-rose/10', iconColor: 'text-rose', badge: 'bg-rose/10 text-rose' },
    alert: { icon: 'bg-amber-100', iconColor: 'text-amber-600', badge: 'bg-amber-50 text-amber-600' },
  }[type] ?? { icon: 'bg-neutral-100', iconColor: 'text-neutral-500', badge: 'bg-neutral-100 text-neutral-500' }
}

function targetLabel(t) {
  return { all: 'Todos', users: 'Usuarios', admins: 'Admins' }[t] ?? t
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>
