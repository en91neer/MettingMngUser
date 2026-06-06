<template>
  <section class="real-meeting-page">
    <div class="app-page-title real-page-title">
      <div>
        <p class="app-page-kicker">REAL TIME MEETING</p>
        <h1>실시간 회의</h1>
      </div>
      <span class="app-page-subtitle">
        회의를 녹음하고 회의 수집 목록에 업로드합니다.
      </span>
      <div
        class="status-chip"
        :class="{
          active: isRecording,
          ready: hasRecordedFile
        }"
      >
        <span class="status-dot"></span>
        {{ recorderStatusText }}
      </div>
    </div>

    <div class="meeting-workspace" :class="{ recording: isRecording }">
      <section class="meeting-form-panel">
        <div class="form-grid">
          <label class="field-block">
            <span>회의 날짜</span>
            <input v-model="meetingDate" type="text" readonly />
          </label>

          <label class="field-block">
            <span>회의 시간</span>
            <input :value="displayMeetingTime" type="text" readonly />
          </label>

          <label class="field-block wide">
            <span>회의주제</span>
            <input
              v-model="subject"
              type="text"
              placeholder="회의 주제를 입력하세요"
              :disabled="isRecording || isUploading"
            />
          </label>

          <label class="field-block wide">
            <span>회의 요약</span>
            <textarea
              v-model="content"
              rows="4"
              placeholder="회의 요약 또는 키워드를 입력하세요"
              :disabled="isRecording || isUploading"
            ></textarea>
          </label>
        </div>
      </section>

      <section class="recorder-panel">
        <div class="recorder-visual">
          <button
            type="button"
            class="image-action record-image-btn"
            :disabled="isRecording || isUploading"
            @click="startRecording"
            :aria-label="hasRecordedFile ? '이어서 녹음' : '녹음 시작'"
          >
            <span class="image-icon">
              {{ hasRecordedFile ? '▶' : '🎙️' }}
            </span>
          </button>

          <div class="recorder-state">
            <strong>{{ recorderStateText }}</strong>
            <span>{{ elapsedTime }}</span>
          </div>

          <button
            type="button"
            class="image-action stop-image-btn"
            :disabled="isUploading"
            @click="stopRecording"
            aria-label="녹음 일시정지"
          >
            <span class="image-icon">⏸</span>
          </button>
        </div>

        <div class="recording-progress" :class="{ active: isRecording }">
          <div class="progress-meta">
            <span>{{ recorderProgressText }}</span>
            <strong>{{ elapsedTime }}</strong>
          </div>
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: progressWidth }"></div>
          </div>
        </div>

        <div class="button-row">
          <button
            type="button"
            class="complete-btn"
            :disabled="isUploading"
            @click="completeRecording"
          >
            {{ isUploading ? '업로드 중' : '완료' }}
          </button>
        </div>
      </section>
    </div>

    <div v-if="isRecording" class="recording-lock" aria-hidden="true"></div>
  </section>
</template>

<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref
} from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

import {
  showAlert,
  showConfirm,
  showSuccess
} from '@/utils/alert.js'
import '@/assets/css/views/RealMetting.css'
import { postMultiApi } from '@/utils/api'
import { showPremiumUpgradeConfirm } from '@/utils/subscription.js'

const FREE_RECORDING_LIMIT_SECONDS = 10 * 60

const meetingDate = ref('')
const meetingTime = ref('')
const subject = ref('')
const content = ref('')
const isRecording = ref(false)
const isUploading = ref(false)
const elapsedSeconds = ref(0)

const mediaRecorder = ref(null)
const mediaStream = ref(null)
const recordedChunks = ref([])
const recordedFile = ref(null)
const timerId = ref(null)
const startedAt = ref(null)
const elapsedBeforeStart = ref(0)
const freeLimitAlertShown = ref(false)

const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const formatTime24 = (date) => {
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')

  return `${hour}:${minute}`
}

const formatKoreanTime = (time) => {
  const [hourText, minuteText] = time.split(':')
  const hour = Number(hourText)
  const period = hour >= 12 ? '오후' : '오전'
  const displayHour = hour % 12 || 12

  return `${period} ${displayHour}:${minuteText}`
}

const displayMeetingTime = computed(() => {
  if (!meetingTime.value) {
    return ''
  }

  return formatKoreanTime(meetingTime.value)
})

const elapsedTime = computed(() => {
  const minutes = String(Math.floor(elapsedSeconds.value / 60)).padStart(2, '0')
  const seconds = String(elapsedSeconds.value % 60).padStart(2, '0')

  return `${minutes}:${seconds}`
})

const hasRecordedFile = computed(() => !!recordedFile.value)

const recorderStatusText = computed(() => {
  if (isRecording.value) {
    return '녹음중'
  }

  if (hasRecordedFile.value) {
    return '일시정지'
  }

  return '대기중'
})

const recorderStateText = computed(() => {
  if (isRecording.value) {
    return '녹음중'
  }

  if (hasRecordedFile.value) {
    return '일시정지'
  }

  return '녹음 대기'
})

const recorderProgressText = computed(() => {
  if (isRecording.value) {
    return '녹음중'
  }

  if (hasRecordedFile.value) {
    return '일시정지'
  }

  return '녹음 준비'
})

const progressWidth = computed(() => {
  if (!isRecording.value && !hasRecordedFile.value) {
    return '0%'
  }

  if (isFreeUser()) {
    const totalSeconds = getFreeRecordingUsedSeconds() + elapsedSeconds.value
    return `${Math.min(100, (totalSeconds / FREE_RECORDING_LIMIT_SECONDS) * 100)}%`
  }

  return `${Math.max(8, (elapsedSeconds.value % 60) / 60 * 100)}%`
})

const getStoredAuth = () => {
  const authText =
    localStorage.getItem('aiVoiceAuth')
    || sessionStorage.getItem('aiVoiceAuth')

  if (!authText) {
    return {}
  }

  try {
    return JSON.parse(authText)
  } catch (error) {
    return {}
  }
}

const isFreeUser = () => {
  return (getStoredAuth().roleCode || 'FREE_USER') === 'FREE_USER'
}

const getFreeRecordingUsageKey = () => {
  const auth = getStoredAuth()
  const today = formatDate(new Date())
  return `freeRecordingSeconds:${auth.email || 'guest'}:${today}`
}

const getFreeRecordingUsedSeconds = () => {
  return Number(localStorage.getItem(getFreeRecordingUsageKey()) || 0)
}

const addFreeRecordingUsedSeconds = (seconds) => {
  if (!isFreeUser() || seconds <= 0) {
    return
  }

  localStorage.setItem(
    getFreeRecordingUsageKey(),
    String(getFreeRecordingUsedSeconds() + seconds)
  )
}

const setRecordingLock = (locked) => {
  if (locked) {
    localStorage.setItem('realMeetingRecording', 'Y')
  } else {
    localStorage.removeItem('realMeetingRecording')
  }

  window.dispatchEvent(
    new CustomEvent(
      'real-meeting-recording-change',
      { detail: { recording: locked } }
    )
  )
}

const resetDefaultDateTime = () => {
  const now = new Date()
  meetingDate.value = formatDate(now)
  meetingTime.value = formatTime24(now)
}

const startTimer = (reset = false) => {
  if (reset) {
    elapsedBeforeStart.value = 0
    elapsedSeconds.value = 0
  }

  startedAt.value = Date.now()

  timerId.value = window.setInterval(() => {
    elapsedSeconds.value =
      elapsedBeforeStart.value
      + Math.floor((Date.now() - startedAt.value) / 1000)

    if (
      isFreeUser()
      && getFreeRecordingUsedSeconds() + elapsedSeconds.value >= FREE_RECORDING_LIMIT_SECONDS
      && !freeLimitAlertShown.value
    ) {
      void handleFreeRecordingLimitReached()
    }
  }, 1000)
}

const clearTimer = () => {
  if (timerId.value) {
    window.clearInterval(timerId.value)
    timerId.value = null
  }

  elapsedBeforeStart.value = elapsedSeconds.value
}

const cleanupStream = () => {
  if (mediaStream.value) {
    mediaStream.value.getTracks().forEach(track => track.stop())
    mediaStream.value = null
  }
}

const getSupportedMimeType = () => {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4'
  ]

  return candidates.find(type => MediaRecorder.isTypeSupported(type)) || ''
}

const getRecordingExtension = (mimeType) => {
  if (mimeType.includes('mp4')) {
    return 'm4a'
  }

  return 'webm'
}

const getMicrophonePermissionState = async () => {
  if (!navigator.permissions?.query) {
    return 'unknown'
  }

  try {
    const permission = await navigator.permissions.query({ name: 'microphone' })
    return permission.state
  } catch (error) {
    return 'unknown'
  }
}

const requestMicrophoneStream = async () => {
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    })
  } catch (error) {
    if (error?.name !== 'OverconstrainedError') {
      throw error
    }

    return await navigator.mediaDevices.getUserMedia({ audio: true })
  }
}

const handleFreeRecordingLimitReached = async () => {
  freeLimitAlertShown.value = true

  if (isRecording.value) {
    await stopRecording({ silent: true })
  }

  await showPremiumUpgradeConfirm()
}

const getNotAllowedMessage = async () => {
  const permissionState = await getMicrophonePermissionState()

  if (!window.isSecureContext) {
    return '마이크는 HTTPS 또는 localhost 환경에서만 사용할 수 있습니다. http://127.0.0.1:5173/realMetting 또는 https 주소로 접속해주세요.'
  }

  if (permissionState === 'granted') {
    return '브라우저 사이트 권한은 허용 상태입니다. Windows 설정 > 개인정보 및 보안 > 마이크에서 마이크 접근, 데스크톱 앱의 마이크 접근, 사용 중인 브라우저의 마이크 접근이 켜져 있는지 확인해주세요. 다른 프로그램이 마이크를 점유 중인 경우에도 녹음이 막힐 수 있습니다.'
  }

  if (permissionState === 'prompt') {
    return '브라우저가 아직 마이크 권한을 결정하지 않은 상태입니다. 녹음 버튼을 다시 누른 뒤 권한 요청 창에서 허용을 선택해주세요.'
  }

  return '이 사이트의 마이크 권한이 차단되어 있습니다. 주소창 왼쪽 아이콘의 사이트 설정에서 마이크를 허용으로 바꾼 뒤 페이지를 새로고침해주세요.'
}
const startRecording = async () => {
  if (isRecording.value || isUploading.value) {
    return
  }

  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
    await showAlert('녹음 불가', '현재 브라우저에서 녹음을 지원하지 않습니다.', 'warning')
    return
  }

  try {
    const isResumeRecording = !!recordedFile.value

    if (!isResumeRecording && recordedChunks.value.length === 0) {
      resetDefaultDateTime()
      elapsedBeforeStart.value = 0
      elapsedSeconds.value = 0
      freeLimitAlertShown.value = false
    }

    if (isFreeUser() && getFreeRecordingUsedSeconds() >= FREE_RECORDING_LIMIT_SECONDS) {
      await showPremiumUpgradeConfirm()
      return
    }

    recordedFile.value = null

    const stream = await requestMicrophoneStream()
    mediaStream.value = stream

    const mimeType = getSupportedMimeType()
    const recorder = new MediaRecorder(
      stream,
      mimeType ? { mimeType } : undefined
    )
    mediaRecorder.value = recorder

    recorder.ondataavailable = (event) => {
      if (event.data?.size > 0) {
        recordedChunks.value.push(event.data)
      }
    }

    recorder.start()
    isRecording.value = true
    setRecordingLock(true)
    startTimer(false)
  } catch (error) {
    console.error('MICROPHONE_RECORDING_ERROR', {
      name: error?.name,
      message: error?.message,
      constraint: error?.constraint
    })
    cleanupStream()
    if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
      await showAlert(
        '마이크를 열 수 없습니다.',
        await getNotAllowedMessage(),
        'warning'
      )
      return
    }
    if (error?.name === 'NotFoundError' || error?.name === 'DevicesNotFoundError') {
      await showAlert('마이크를 찾을 수 없습니다.', '마이크 연결 상태를 확인해주세요.', 'warning')
      return
    }

    await showAlert('녹음 실패', '마이크를 사용할 수 없습니다. 브라우저 권한과 장치 상태를 확인해주세요.', 'error')
  }
}

const stopRecorderAndBuildFile = async () => {
  return await new Promise((resolve, reject) => {
    const recorder = mediaRecorder.value

    if (!recorder || recorder.state === 'inactive') {
      reject(new Error('녹음기가 실행중이 아닙니다.'))
      return
    }

    recorder.onstop = () => {
      const mimeType = recorder.mimeType || 'audio/webm'
      const extension = getRecordingExtension(mimeType)
      const blob = new Blob(recordedChunks.value, { type: mimeType })
      const fileName = `real-meeting-${meetingDate.value}-${meetingTime.value.replace(':', '')}.${extension}`
      const file = new File([blob], fileName, { type: mimeType })

      resolve(file)
    }

    recorder.stop()
  })
}

const uploadRecording = async (file) => {
  const params = {
    subject: subject.value || '실시간 회의',
    subjectCode: 'GENERAL_MEETING',
    content: content.value || '',
    meetingDate: `${meetingDate.value} ${meetingTime.value}`
  }

  return await postMultiApi(
    '/api/meeting-minutes/upload',
    params,
    file
  )
}

const stopRecording = async (options = {}) => {
  if (!isRecording.value) {
    if (!options.silent) {
      await showAlert('일시정지할 녹음이 없습니다.', '', 'info')
    }
    return
  }

  try {
    clearTimer()

    const file = await stopRecorderAndBuildFile()
    recordedFile.value = file
    isRecording.value = false
    setRecordingLock(false)
    cleanupStream()
  } catch (error) {
    console.error(error)
    await showAlert('일시정지 실패', '녹음파일을 생성하지 못했습니다.', 'error')
  } finally {
    mediaRecorder.value = null
    cleanupStream()
    setRecordingLock(false)
  }
}

const completeRecording = async () => {
  let uploadFile = recordedFile.value

  if (!isRecording.value && !uploadFile) {
    await showAlert('녹음파일이 없습니다.', '녹음을 완료한 뒤 업로드해주세요.', 'warning')
    return
  }

  const confirmResult =
    await showConfirm(
      '업로드 확인',
      '분석을 위해 녹음파일을 업로드 하시겠습니까?'
    )

  if (!confirmResult.isConfirmed) {
    return
  }

  try {
    isUploading.value = true

    if (isRecording.value) {
      clearTimer()
      uploadFile = await stopRecorderAndBuildFile()
      recordedFile.value = uploadFile
      isRecording.value = false
      mediaRecorder.value = null
      cleanupStream()
      setRecordingLock(false)
    }

    const success = await uploadRecording(uploadFile)

    if (success) {
      addFreeRecordingUsedSeconds(elapsedSeconds.value)
      await showSuccess('업로드 완료', '회의 수집 목록에 녹음파일이 등록되었습니다.')
      subject.value = ''
      content.value = ''
      recordedFile.value = null
      recordedChunks.value = []
      elapsedSeconds.value = 0
      elapsedBeforeStart.value = 0
      freeLimitAlertShown.value = false
    } else {
      await showAlert('업로드 실패', '녹음파일 업로드 중 오류가 발생했습니다.', 'error')
    }
  } catch (error) {
    console.error(error)
    await showAlert('업로드 실패', '녹음파일 업로드 중 오류가 발생했습니다.', 'error')
  } finally {
    isUploading.value = false
    if (!isRecording.value) {
      setRecordingLock(false)
    }
  }
}

const forceCleanup = () => {
  if (mediaRecorder.value?.state === 'recording') {
    mediaRecorder.value.stop()
  }

  clearTimer()
  cleanupStream()
  recordedFile.value = null
  recordedChunks.value = []
  elapsedSeconds.value = 0
  elapsedBeforeStart.value = 0
  freeLimitAlertShown.value = false
  setRecordingLock(false)
}

const handleBeforeUnload = (event) => {
  if (!isRecording.value) {
    return
  }

  event.preventDefault()
  event.returnValue = ''
}

onBeforeRouteLeave(() => {
  if (isRecording.value) {
    showAlert('녹음중입니다.', '일시정지한 뒤 이동해주세요.', 'warning')
    return false
  }

  recordedFile.value = null
  recordedChunks.value = []
  elapsedSeconds.value = 0
  elapsedBeforeStart.value = 0
  freeLimitAlertShown.value = false
  return true
})

onMounted(() => {
  resetDefaultDateTime()
  setRecordingLock(false)
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
  forceCleanup()
})
</script>
