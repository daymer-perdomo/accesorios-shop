<template>
  <main class="pt-20 md:pt-24 min-h-screen bg-blush/20 flex items-center justify-center py-16">
    <div class="w-full max-w-md px-4">
      <div class="bg-white border border-peach p-8 md:p-10">
        <h1 class="font-serif text-3xl text-chocolate font-light text-center mb-2">
          {{ isLogin ? 'Bienvenida' : 'Crear cuenta' }}
        </h1>
        <p class="text-sm text-chocolate/40 text-center mb-8">
          {{ isLogin ? 'Ingresa a tu cuenta para continuar' : 'Únete a nuestra comunidad' }}
        </p>

        <div v-if="errorMsg" class="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 mb-5">
          {{ errorMsg }}
        </div>
        <div v-if="successMsg" class="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 mb-5">
          {{ successMsg }}
        </div>

        <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
          <div v-if="!isLogin">
            <label class="text-xs text-chocolate/50 block mb-1">Nombre completo</label>
            <input v-model="form.name" type="text" placeholder="Ana García" class="input-base" required />
          </div>
          <div>
            <label class="text-xs text-chocolate/50 block mb-1">Correo electrónico</label>
            <input v-model="form.email" type="email" placeholder="ana@email.com" class="input-base" required />
          </div>
          <div>
            <label class="text-xs text-chocolate/50 block mb-1">Contraseña</label>
            <input v-model="form.password" type="password" placeholder="••••••••" class="input-base" required minlength="6" />
          </div>
          <button type="submit" class="btn-primary mt-2" :disabled="auth.loading">
            <span v-if="auth.loading">Cargando...</span>
            <span v-else>{{ isLogin ? 'Ingresar' : 'Crear cuenta' }}</span>
          </button>
        </form>

        <p class="text-center text-sm text-chocolate/40 mt-6">
          {{ isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?' }}
          <button class="text-rose hover:text-burgundy ml-1 transition-colors" @click="toggle">
            {{ isLogin ? 'Regístrate' : 'Inicia sesión' }}
          </button>
        </p>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

const isLogin = ref(true)
const errorMsg = ref('')
const successMsg = ref('')
const form = reactive({ name: '', email: '', password: '' })

function toggle() {
  isLogin.value = !isLogin.value
  errorMsg.value = ''
  successMsg.value = ''
}

async function handleSubmit() {
  errorMsg.value = ''
  successMsg.value = ''

  if (isLogin.value) {
    const result = await auth.signIn(form.email, form.password)
    if (result.success) {
      router.push('/mi-cuenta')
    } else {
      errorMsg.value = result.message
    }
  } else {
    const result = await auth.signUp(form.email, form.password, form.name)
    if (result.success) {
      if (result.loggedIn) {
        router.push('/mi-cuenta')
      } else {
        successMsg.value = 'Revisa tu correo para confirmar tu cuenta y luego inicia sesión.'
        form.name = ''
        form.email = ''
        form.password = ''
      }
    } else {
      errorMsg.value = result.message
    }
  }
}
</script>
