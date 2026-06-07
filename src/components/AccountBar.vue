<template>
  <section v-if="loginEmail" class="account-bar">
    <div class="account-main">
      <span class="account-avatar" :class="avatarClass">{{ avatarIcon }}</span>
      <span class="account-email">{{ loginEmail }}</span>
      <strong class="account-role">{{ roleName }}</strong>
    </div>

    <button
      type="button"
      class="account-logout-btn"
      :disabled="isRecordingLocked"
      @click="logout"
    >
      로그아웃
    </button>
  </section>
</template>

<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref
} from 'vue'
import { postApi } from '@/utils/api'
import {
  showConfirm,
  showError
} from '@/utils/alert.js'

const loginEmail = ref('')
const roleCode = ref('')
const isRecordingLocked = ref(false)

const roleName = computed(() => {
  if (roleCode.value === 'PREMIUM_USER') {
    return '프리미엄'
  }

  if (roleCode.value === 'SUPER_USER') {
    return '슈퍼유저'
  }

  return '무료사용자'
})

const avatarIcon = computed(() => {
  if (roleCode.value === 'SUPER_USER') {
    return '👥'
  }

  if (roleCode.value === 'PREMIUM_USER') {
    return '👤'
  }

  return '👤'
})

const avatarClass = computed(() => {
  if (roleCode.value === 'SUPER_USER') {
    return 'super'
  }

  if (roleCode.value === 'PREMIUM_USER') {
    return 'premium'
  }

  return 'free'
})

const syncRecordingLock = (event) => {
  isRecordingLocked.value =
    event?.detail?.recording
    ?? localStorage.getItem('realMeetingRecording') === 'Y'
}

const loadLoginInfo = () => {
  const authText =
    localStorage.getItem('aiVoiceAuth')
    || sessionStorage.getItem('aiVoiceAuth')

  if (!authText) {
    loginEmail.value = ''
    roleCode.value = ''
    return
  }

  try {
    const auth = JSON.parse(authText)
    loginEmail.value = auth.email || ''
    roleCode.value = auth.roleCode || 'FREE_USER'
  } catch (error) {
    loginEmail.value = ''
    roleCode.value = ''
  }
}

const clearAuth = () => {
  localStorage.removeItem('aiVoiceAuth')
  sessionStorage.removeItem('aiVoiceAuth')
  loginEmail.value = ''
  roleCode.value = ''
  window.dispatchEvent(new CustomEvent('ai-voice-logout'))
}

const logout = async () => {
  if (isRecordingLocked.value) {
    return
  }

  const confirmResult =
    await showConfirm(
      '로그아웃',
      '로그아웃 하시겠습니까?'
    )

  if (!confirmResult.isConfirmed) {
    return
  }

  try {
    await postApi('/api/auth/logout')
  } catch (error) {
    await showError('로그아웃 실패', '서버 로그아웃 중 오류가 발생했습니다.', 'error')
  } finally {
    clearAuth()
  }
}

onMounted(() => {
  loadLoginInfo()
  syncRecordingLock()
  window.addEventListener('ai-voice-login', loadLoginInfo)
  window.addEventListener('ai-voice-logout', loadLoginInfo)
  window.addEventListener('real-meeting-recording-change', syncRecordingLock)
})

onBeforeUnmount(() => {
  window.removeEventListener('ai-voice-login', loadLoginInfo)
  window.removeEventListener('ai-voice-logout', loadLoginInfo)
  window.removeEventListener('real-meeting-recording-change', syncRecordingLock)
})
</script>

<style scoped>
.account-bar {
  position: sticky;
  top: 0;
  z-index: 90;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 48px;
  padding: 8px 18px;
  border-bottom: 1px solid #d8efe2;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  box-sizing: border-box;
}

.account-main {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  gap: 8px;
}

.account-avatar {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 10px;
  color: #0f3d2b;
  background: #dff7e9;
  font-size: 14px;
  font-weight: 900;
}

.account-avatar.super {
  color: #7a4b00;
  background: #fff3d6;
}

.account-avatar.premium {
  color: #0b7a3b;
  background: #dff7e9;
}

.account-avatar.free {
  color: #315743;
  background: #eef6f1;
}

.account-email {
  min-width: 0;
  max-width: min(48vw, 360px);
  overflow: hidden;
  color: #123524;
  font-size: 13px;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-role {
  flex: 0 0 auto;
  padding: 5px 8px;
  border-radius: 999px;
  color: #0b7a3b;
  background: #e8f7ef;
  font-size: 11px;
  font-weight: 900;
}

.account-logout-btn {
  flex: 0 0 auto;
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid #cfe8da;
  border-radius: 999px;
  color: #315743;
  background: #ffffff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 900;
}

.account-logout-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .account-bar {
    min-height: 44px;
    padding: 7px 12px;
  }

  .account-avatar {
    width: 26px;
    height: 26px;
    border-radius: 9px;
  }

  .account-email {
    max-width: 42vw;
    font-size: 12px;
  }

  .account-role {
    padding: 4px 7px;
    font-size: 10px;
  }

  .account-logout-btn {
    min-height: 32px;
    padding: 0 10px;
    font-size: 11px;
  }
}
</style>
