<template>

  <!-- 모바일 오버레이 -->
  <div
    v-if="mobileOpen"
    class="sidebar-overlay"
    @click="mobileOpen = false"
  ></div>

  <!-- 모바일 토글 버튼 -->
  <button
    class="sidebar-toggle"
    @click="mobileOpen = !mobileOpen"
  >
    ☰
  </button>

  <aside
    class="sidebar"
    :class="{ open: mobileOpen }"
  >
    <button
      type="button"
      class="sidebar-close-btn"
      aria-label="메뉴 닫기"
      @click="mobileOpen = false"
    >
      ×
    </button>

    <!-- 메뉴 -->
    <nav class="sidebar-menu">
      <!-- 관리자 -->
      <router-link
        to="/dashboard"
        class="menu-item"
        :class="{ disabled: isRecordingLocked }"
        @click="handleMenuClick($event)"
      >

        <span class="menu-icon">
          📊
        </span>

        <span class="menu-text">
          AI분석 대시보드
        </span>

        <div class="tooltip">
          <div>음성 → 텍스트 변환</div>
          <div>대화 화자 자동 분리</div>
          <div>분석 유형 선택</div>
          <div>맞춤형 요약 생성</div>
          <div>다중 파일 일괄 분석</div>
        </div>
      </router-link>

      <!-- 실시간 등록 -->
      <router-link
        to="/realMetting"
        class="menu-item"
        @click="handleMenuClick($event)"
      >
        <span class="menu-icon">
          🎙️
        </span>

        <span class="menu-text">
          실시간 회의
        </span>
      </router-link>

      <!-- AI 차트 분석 -->
      <router-link
        to="/aiChartAnalysis"
        class="menu-item"
        :class="{ disabled: isRecordingLocked }"
        @click="handleMenuClick($event)"
      >
        <span class="menu-icon">
          📈
        </span>

        <span class="menu-text">
          AI차트분석
        </span>
      </router-link>

      <!-- 회의 수집 -->
      <router-link
        to="/metting"
        class="menu-item"
        :class="{ disabled: isRecordingLocked }"
        @click="handleMenuClick($event)"
      >
        <span class="menu-icon">
          🗂️
        </span>

        <span class="menu-text">
          회의 수집
        </span>
      </router-link>

      <!-- 프로젝트 연혁 -->
      <router-link
        v-if="isAdmin"
        to="/codeManage"
        class="menu-item"
        :class="{ disabled: isRecordingLocked }"
        @click="handleMenuClick($event)"
      >
        <span class="menu-icon">
          🔖
        </span>

        <span class="menu-text">
          코드관리
        </span>
      </router-link>

      <router-link
        v-if="isAdmin"
        to="/templateManage"
        class="menu-item"
        :class="{ disabled: isRecordingLocked }"
        @click="handleMenuClick($event)"
      >
        <span class="menu-icon">
          🧩
        </span>

        <span class="menu-text">
          템플릿 관리
        </span>
      </router-link>

      <router-link
        v-if="isAdmin"
        to="/userManage"
        class="menu-item"
        :class="{ disabled: isRecordingLocked }"
        @click="handleMenuClick($event)"
      >
        <span class="menu-icon">
          👥
        </span>

        <span class="menu-text">
          사용자 관리
        </span>
      </router-link>

      <router-link
        to="/inquiry"
        class="menu-item"
        :class="{ disabled: isRecordingLocked }"
        @click="handleMenuClick($event)"
      >
        <span class="menu-icon">
          ☎
        </span>

        <span class="menu-text">
          도입문의
        </span>

        <div class="tooltip">
          <div>서비스 도입 상담</div>
          <div>담당자 연락 요청</div>
        </div>

      </router-link>
    </nav>
  </aside>
</template>

<script setup>
import {
  onMounted,
  onBeforeUnmount,
  ref
} from 'vue'

const mobileOpen = ref(false)
const isAdmin = ref(false)
const isRecordingLocked = ref(false)

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

  mobileOpen.value = false
}

const loadLoginEmail = () => {
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

onMounted(() => {
  loadLoginEmail()
  syncRecordingLock()
  window.addEventListener('ai-voice-login', loadLoginEmail)
  window.addEventListener('ai-voice-logout', loadLoginEmail)
  window.addEventListener('real-meeting-recording-change', syncRecordingLock)
})

onBeforeUnmount(() => {
  window.removeEventListener('ai-voice-login', loadLoginEmail)
  window.removeEventListener('ai-voice-logout', loadLoginEmail)
  window.removeEventListener('real-meeting-recording-change', syncRecordingLock)
})
</script>

<style scoped>

/* 사이드바 */
.sidebar {

  width: 250px;

  min-height: 100vh;

  background: #f4fbf7;

  border-right: 1px solid #d8efe2;

  padding: 24px 18px;

  box-sizing: border-box;

  color: #123524;

  position: relative;

  z-index: 9999;
}

/* 타이틀 */
.sidebar-title {

  font-size: 13px;

  font-weight: 700;

  letter-spacing: 2px;

  color: #6a8f79;

  margin-bottom: 24px;

  padding-left: 10px;
}

.sidebar-close-btn {
  display: none;
}

/* 메뉴 */
.sidebar-menu {

  display: flex;

  flex-direction: column;

  gap: 12px;
}

/* 메뉴 아이템 */
.menu-item {

  position: relative;

  display: flex;

  align-items: center;

  gap: 14px;

  padding: 16px 18px;

  border-radius: 14px;

  color: #315743;

  text-decoration: none;

  transition: all 0.25s ease;

  background: white;

  border: 1px solid #d8efe2;

  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}

.menu-item.disabled {

  opacity: 0.45;

  cursor: not-allowed;
}

/* hover */
.menu-item:hover {

  background: #f1fbf6;

  transform: translateX(4px);

  box-shadow:
    0 6px 14px rgba(0,0,0,0.08);
}

.menu-item.disabled:hover {

  background: white;

  transform: none;

  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}

/* 활성 메뉴 */
.router-link-active {

  background: linear-gradient(
    135deg,
    #03c75a,
    #0b7a3b
  );

  color: white;

  border: none;

  box-shadow:
    0 8px 18px rgba(3,199,90,0.25);
}

/* 아이콘 */
.menu-icon {

  font-size: 20px;

  width: 24px;

  text-align: center;
}

/* 텍스트 */
.menu-text {

  font-size: 15px;

  font-weight: 600;
}

/* 툴팁 */
.tooltip {

  position: absolute;

  left: 105%;
  top: 0;

  background: rgba(255,255,255,0.92);

  backdrop-filter: blur(8px);

  color: #123524;

  padding: 14px 16px;

  border-radius: 14px;

  min-width: 190px;

  font-size: 13px;

  line-height: 1.8;

  border: 1px solid rgba(229,231,235,0.8);

  box-shadow: 0 10px 28px rgba(0,0,0,0.12);

  opacity: 0;

  visibility: hidden;

  transition: all 0.2s ease;

  z-index: 9999;
}

/* 툴팁 표시 */
.menu-item:hover .tooltip {

  opacity: 1;

  visibility: visible;
}

/* 모바일 버튼 */
.sidebar-toggle {

  display: none;

  position: fixed;

  bottom: 24px;
  left: 16px;

  width: 54px;
  height: 54px;

  border: none;

  border-radius: 50%;

  background: linear-gradient(135deg, #5c7c89, #3f6370);

  color: white;

  font-size: 24px;

  cursor: pointer;

  box-shadow:
    0 8px 24px rgba(63, 99, 112, 0.28);

  z-index: 10001;
}

/* 오버레이 */
.sidebar-overlay {

  position: fixed;

  inset: 0;

  background: rgba(0,0,0,0.35);

  backdrop-filter: blur(2px);

  z-index: 9998;
}

/* 모바일 */
@media (max-width: 768px) {

  .sidebar-toggle {

    display: flex;

    justify-content: center;
    align-items: center;
  }

  .sidebar {

    position: fixed;

    top: 0;
    left: 0;

    width: 260px;

    height: 100vh;

    transform: translateX(-100%);

    transition: transform 0.3s ease;

    box-shadow:
      10px 0 30px rgba(0,0,0,0.12);
  }

  .sidebar-close-btn {
    position: absolute;
    top: 14px;
    right: 14px;
    z-index: 2;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border: 1px solid #d8efe2;
    border-radius: 14px;
    color: #174331;
    background: #ffffff;
    cursor: pointer;
    font-size: 28px;
    font-weight: 700;
    line-height: 1;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .tooltip {
    display: none;
  }
}

</style>

