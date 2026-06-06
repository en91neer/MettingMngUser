<template>
  <div
    v-if="showLayout"
    class="app-shell"
    :class="{ 'app-shell-blurred': loginVisible }"
  >
    <MainLayout :key="layoutKey" />
  </div>
  <LoginModal
    :visible="loginVisible"
    @login-success="handleLoginSuccess"
  />
</template>

<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref
} from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import LoginModal from '@/views/LoginModal.vue'

const router = useRouter()
const loginVisible = ref(false)
const isAuthenticated = ref(false)
const hasRenderedLayout = ref(false)
const layoutKey = ref(0)

const showLayout = computed(() => (
  isAuthenticated.value
  || hasRenderedLayout.value
))

const getSavedAuth = () => {
  const authText =
    localStorage.getItem('aiVoiceAuth')
    || sessionStorage.getItem('aiVoiceAuth')

  if (!authText) {
    return null
  }

  try {
    return JSON.parse(authText)
  } catch (error) {
    localStorage.removeItem('aiVoiceAuth')
    sessionStorage.removeItem('aiVoiceAuth')
    return null
  }
}

const isValidAuth = (auth) => {
  if (!auth?.email || !auth?.token || !auth?.expiresAt) {
    return false
  }

  return new Date(auth.expiresAt).getTime() > Date.now()
}

const handleLoginSuccess = async () => {
  isAuthenticated.value = true
  hasRenderedLayout.value = true
  layoutKey.value += 1
  loginVisible.value = false

  await router.replace('/realMetting')
}

const handleLogout = () => {
  isAuthenticated.value = false
  loginVisible.value = true
}

onMounted(() => {
  const auth = getSavedAuth()

  if (!isValidAuth(auth)) {
    localStorage.removeItem('aiVoiceAuth')
    sessionStorage.removeItem('aiVoiceAuth')
    isAuthenticated.value = false
    loginVisible.value = true
  } else {
    isAuthenticated.value = true
    hasRenderedLayout.value = true
    loginVisible.value = false
  }

  window.addEventListener('ai-voice-logout', handleLogout)
})

onBeforeUnmount(() => {
  window.removeEventListener('ai-voice-logout', handleLogout)
})
</script>

<style scoped>
.app-shell {
  height: 100%;
  min-height: 0;
  transition:
    filter 0.2s ease,
    transform 0.2s ease,
    opacity 0.2s ease;
}

.app-shell-blurred {
  filter: blur(12px) brightness(0.86);
  opacity: 0.72;
  pointer-events: none;
  user-select: none;
}
</style>
