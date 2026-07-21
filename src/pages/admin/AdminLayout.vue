<template>
  <div class="min-h-screen bg-neutral-50 flex">

    <!-- Sidebar -->
    <aside class="w-60 bg-white border-r border-neutral-200 fixed inset-y-0 left-0 flex flex-col z-40">

      <!-- Logo -->
      <div class="h-16 flex items-center gap-3 px-5 border-b border-neutral-200 flex-shrink-0">
        <RouterLink to="/" class="block">
          <img src="/assets/logo.png" alt="MAI ACCESORIOS" class="h-8 object-contain" />
        </RouterLink>
        <span class="text-[10px] tracking-widest uppercase text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full font-semibold">Admin</span>
      </div>

      <!-- Nav -->
      <nav class="flex-1 overflow-y-auto py-5 px-3 space-y-5">
        <div v-for="group in navGroups" :key="group.label">
          <p class="text-[10px] font-semibold tracking-widest uppercase text-neutral-400 px-3 mb-1.5">{{ group.label }}</p>
          <RouterLink
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors mb-0.5"
            active-class="bg-rose/10 text-rose font-medium"
          >
            <component :is="item.icon" :size="16" class="flex-shrink-0" />
            {{ item.label }}
          </RouterLink>
        </div>
      </nav>

      <!-- User info + sign out -->
      <div class="border-t border-neutral-200 p-4 flex-shrink-0">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-8 h-8 rounded-full bg-rose flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {{ initials }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-medium text-neutral-800 truncate">{{ auth.profile?.full_name || 'Admin' }}</p>
            <p class="text-[10px] text-neutral-400 truncate">{{ auth.user?.email }}</p>
          </div>
        </div>
        <button
          class="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-neutral-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          @click="handleSignOut"
        >
          <LogOutIcon :size="14" />
          Cerrar sesión
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 ml-60 min-h-screen">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import {
  LayoutDashboardIcon, PackageIcon, ShoppingBagIcon, TagIcon,
  UsersIcon, BellIcon, LogOutIcon, ImagesIcon, MailIcon, SettingsIcon, SmileIcon,
} from '@lucide/vue'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const router = useRouter()

const initials = computed(() => {
  const name = auth.profile?.full_name || auth.user?.email || 'A'
  return name.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
})

const navGroups = [
  {
    label: 'General',
    items: [
      { label: 'Dashboard',      to: '/admin/dashboard',      icon: LayoutDashboardIcon },
      { label: 'Configuración',  to: '/admin/configuracion',  icon: SettingsIcon },
    ],
  },
  {
    label: 'Catálogo',
    items: [
      { label: 'Productos', to: '/admin/productos', icon: PackageIcon },
      { label: 'Pedidos', to: '/admin/pedidos', icon: ShoppingBagIcon },
      { label: 'Ofertas', to: '/admin/ofertas', icon: TagIcon },
      { label: 'Slider', to: '/admin/slider', icon: ImagesIcon },
    ],
  },
  {
    label: 'Comunidad',
    items: [
      { label: 'Usuarios', to: '/admin/usuarios', icon: UsersIcon },
      { label: 'Notificaciones', to: '/admin/notificaciones', icon: BellIcon },
      { label: 'Suscriptores', to: '/admin/suscriptores', icon: MailIcon },
      { label: 'Testimonios',  to: '/admin/testimonios',  icon: SmileIcon },
    ],
  },
]

async function handleSignOut() {
  await auth.signOut()
  router.push('/')
}
</script>
