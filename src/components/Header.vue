<template>
  <header class="header">

    <!-- 로고 영역 -->
    <div class="logo-area">

      <div class="logo-icon">
        🎙️
      </div>

      <div class="logo-text">
        AI 음성 회의록 분석
      </div>

    </div>

    <!-- 모바일 메뉴 버튼 -->
    <button
      class="mobile-menu-btn"
      @click="menuOpen = !menuOpen"
    >
      ☰
    </button>

    <!-- 메뉴 -->
    <nav
      class="nav-menu"
      :class="{ open: menuOpen }"
    >
      <router-link
        to="/dashboard"
        class="nav-link"
        :class="{ disabled: isRecordingLocked }"
        @click="handleMenuClick($event)"
      >
        <span class="nav-icon">📊</span>
        AI분석 대시보드
      </router-link>

      <router-link
        to="/realMetting"
        class="nav-link"
        @click="handleMenuClick($event)"
      >
        <span class="nav-icon">🎙️</span>
        실시간 회의
      </router-link>

      <router-link
        to="/aiChartAnalysis"
        class="nav-link"
        :class="{ disabled: isRecordingLocked }"
        @click="handleMenuClick($event)"
      >
        <span class="nav-icon">📈</span>
        AI차트분석
      </router-link>

      <router-link
        to="/metting"
        class="nav-link"
        :class="{ disabled: isRecordingLocked }"
        @click="handleMenuClick($event)"
      >
        <span class="nav-icon">🗂️</span>
        회의 수집
      </router-link>

      <router-link
        v-if="isAdmin"
        to="/codeManage"
        class="nav-link"
        :class="{ disabled: isRecordingLocked }"
        @click="handleMenuClick($event)"
      >
        <span class="nav-icon">🔖</span>
        코드관리
      </router-link>

      <router-link
        v-if="isAdmin"
        to="/templateManage"
        class="nav-link"
        :class="{ disabled: isRecordingLocked }"
        @click="handleMenuClick($event)"
      >
        <span class="nav-icon">🧩</span>
        템플릿 관리
      </router-link>

      <router-link
        v-if="isAdmin"
        to="/userManage"
        class="nav-link"
        :class="{ disabled: isRecordingLocked }"
        @click="handleMenuClick($event)"
      >
        <span class="nav-icon">👥</span>
        사용자 관리
      </router-link>

      <router-link
        to="/inquiry"
        class="nav-link"
        :class="{ disabled: isRecordingLocked }"
        @click="handleMenuClick($event)"
      >
        <span class="nav-icon">☎</span>
        도입문의
      </router-link>
    </nav>

  </header>
</template>

<script setup>
import {
  onBeforeUnmount,
  onMounted,
  ref
} from 'vue'

const menuOpen = ref(false)
const isRecordingLocked = ref(false)
const isAdmin = ref(false)

const loadAdminState = () => {
  const authText =
    localStorage.getItem('aiVoiceAuth')
    || sessionStorage.getItem('aiVoiceAuth')

  if (!authText) {
    isAdmin.value = false
    return
  }

  try {
    const auth = JSON.parse(authText)
    isAdmin.value = auth.email === 'en91neer@naver.com'
  } catch (error) {
    isAdmin.value = false
  }
}

const syncRecordingLock = (event) => {
  isRecordingLocked.value =
    event?.detail?.recording
    ?? localStorage.getItem('realMeetingRecording') === 'Y'
}

const guardMenuClick = (event) => {
  if (!isRecordingLocked.value) {
    return false
  }

  event.preventDefault()
  event.stopPropagation()
  return true
}

const handleMenuClick = (event) => {
  if (guardMenuClick(event)) {
    return
  }

  menuOpen.value = false
}

onMounted(() => {
  syncRecordingLock()
  loadAdminState()
  window.addEventListener('ai-voice-login', loadAdminState)
  window.addEventListener('ai-voice-logout', loadAdminState)
  window.addEventListener('real-meeting-recording-change', syncRecordingLock)
})

onBeforeUnmount(() => {
  window.removeEventListener('ai-voice-login', loadAdminState)
  window.removeEventListener('ai-voice-logout', loadAdminState)
  window.removeEventListener('real-meeting-recording-change', syncRecordingLock)
})
</script>

<style scoped>

/* 헤더 */
.header {
    width: 100%;
    height: 72px;

    display: flex;
    justify-content: space-between;
    align-items: center;

    padding: 0 32px;

    background: white;
    box-sizing: border-box;

    border-bottom: 1px solid #d8efe2;

    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

    position: sticky;
    top: 0;

    z-index: 100;
}

/* 로고 영역 */
.header .logo-area {
    display: flex;
    align-items: center;
    min-width: 0;
}

/* 로고 아이콘 */
.header .logo-icon {
    width: 42px;
    height: 42px;

    display: flex;
    justify-content: center;
    align-items: center;

    border-radius: 12px;

    background: #03c75a;

    font-size: 22px;

    margin-right: 12px;

    box-shadow: 0 4px 10px rgba(3, 199, 90, 0.25);
}

/* 로고 텍스트 */
.header .logo-text {
    font-size: 22px;
    font-weight: 700;

    color: #123524;

    letter-spacing: -0.5px;
}

/* 메뉴 */
.header .nav-menu {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
}

/* 메뉴 링크 */
.header .nav-link {
    position: relative;

    display: inline-flex;
    align-items: center;
    gap: 6px;

    padding: 10px 18px;

    margin-left: 8px;

    border-radius: 8px;

    color: #315743;

    font-size: 15px;
    font-weight: 600;

    text-decoration: none;

    transition: all 0.2s ease;
}

.header .nav-icon {
    font-size: 15px;
    line-height: 1;
}

.header .nav-link.disabled {
    opacity: 0.45;
    cursor: not-allowed;
}

/* hover */
.header .nav-link:hover {
    background: #f1fbf6;
    color: #03c75a;
}

.header .nav-link.disabled:hover {
    background: transparent;
    color: #315743;
}

/* 현재 활성 메뉴 */
.header .nav-link.router-link-active {
    background: #e8f7ef;
    color: #03c75a;
}

/* 활성 메뉴 밑줄 효과 */
.header .nav-link.router-link-active::after {
    content: '';

    position: absolute;

    left: 12px;
    right: 12px;
    bottom: 6px;

    height: 2px;

    background: #03c75a;

    border-radius: 999px;
}

/* 모바일 메뉴 버튼 */
.header .mobile-menu-btn {

    display: none;

    border: none;

    background: transparent;

    font-size: 28px;

    cursor: pointer;

    color: #174331;
    line-height: 1;
    padding: 0;
}

/* 모바일 */
@media (max-width: 768px) {

    .header {
        padding: 0 18px;
        height: 64px;
    }

    .header .logo-text {
        font-size: 16px;
    }

    .header .mobile-menu-btn {
        display: block;
    }

    .header .nav-menu {

        position: absolute;

        top: 64px;
        left: 0;
        right: 0;

        background: white;

        flex-direction: column;
        align-items: stretch;

        padding: 10px;

        border-bottom: 1px solid #d8efe2;

        box-shadow:
          0 10px 25px rgba(0,0,0,0.08);

        opacity: 0;
        visibility: hidden;

        transform: translateY(-10px);

        transition: all 0.3s ease;
    }

    .header .nav-menu.open {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
    }

    .header .nav-link {

        margin: 0;

        padding: 14px 16px;

        border-radius: 12px;
    }
}

</style>

