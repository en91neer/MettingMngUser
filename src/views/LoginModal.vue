<template>
  <div v-if="visible" class="login-overlay">
    <div class="login-modal">
      <div class="login-logo">
        🎙️
      </div>

      <h2>
        AI 음성 회의록 {{ mode === 'login' ? '로그인' : '회원가입' }}
      </h2>

      <p v-if="mode === 'login'" class="login-desc">
        이메일로 받은 인증코드를 입력해주세요.
      </p>
      <p v-else class="login-desc">
        가입 후 무료 체험으로 바로 시작할 수 있습니다.
      </p>

      <template v-if="mode === 'login'">
      <div class="login-field">
        <label>이메일</label>
        <input
          v-model="email"
          type="email"
          placeholder="email@example.com"
          :disabled="codeRequested"
          @keyup.enter="requestCode"
        />
      </div>

      <div v-if="codeRequested" class="login-field">
        <label>인증코드</label>
        <input
          v-model="code"
          type="text"
          maxlength="6"
          placeholder="6자리 코드"
          :readonly="!!devCode"
          :class="{ 'auto-filled-code': !!devCode }"
          @keyup.enter="verifyCode"
        />
      </div>

      <label class="login-remember">
        <input type="checkbox" v-model="rememberOneDay" />
        <span>하루동안 로그인 유지</span>
      </label>

      <div v-if="devCode" class="login-dev-code">
        데모 인증코드:
        <strong>{{ devCode }}</strong>
      </div>

      <div class="login-actions">
        <button
          v-if="!codeRequested"
          type="button"
          class="login-primary-btn"
          @click="requestCode"
        >
          인증코드 받기
        </button>

        <button
          v-else
          type="button"
          class="login-primary-btn"
          @click="verifyCode"
        >
          로그인
        </button>

        <button
          v-if="codeRequested"
          type="button"
          class="login-secondary-btn"
          @click="resetCode"
        >
          다시 입력
        </button>
      </div>

      <button type="button" class="login-link-btn" @click="switchMode('signup')">
        회원가입
      </button>
      </template>

      <template v-else>
      <div class="login-field">
        <label>이름</label>
        <input v-model="signupForm.name" type="text" placeholder="홍길동" />
      </div>

      <div class="login-field">
        <label>이메일</label>
        <input v-model="signupForm.email" type="email" placeholder="email@example.com" />
      </div>

      <div class="login-field">
        <label>전화번호</label>
        <input v-model="signupForm.phoneNumber" type="tel" placeholder="010-0000-0000" />
      </div>

      <section class="signup-terms">
        <strong>서비스 이용약관</strong>
        <p>회의 음성, 전사문, 요약 결과는 사용자가 요청한 회의록 생성과 분석 기능 제공을 위해 저장 및 처리됩니다.</p>
        <p>사용자는 본인 권한이 있는 회의 자료만 업로드해야 하며, 타인의 개인정보가 포함된 자료는 관련 법령과 내부 규정을 준수해야 합니다.</p>
        <p>서비스 운영자는 안정적인 서비스 제공, 장애 대응, 보안 감사 목적의 최소 로그를 보관할 수 있습니다.</p>
      </section>

      <label class="login-remember">
        <input type="checkbox" v-model="signupForm.agreeTerms" />
        <span>이용약관 동의</span>
      </label>

      <div class="login-actions">
        <button type="button" class="login-primary-btn" @click="signup">
          가입 신청
        </button>

        <button type="button" class="login-secondary-btn" @click="switchMode('login')">
          로그인으로
        </button>
      </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  watch
} from 'vue'
import { postApi } from '@/utils/api'
import '@/assets/css/views/LoginModal.css'
import {
  showAlert,
  showConfirm,
  showError
} from '@/utils/alert.js'
import {
  getRequiredMessage,
  isValidEmail,
  isValidPhoneNumber
} from '@/utils/validation.js'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['login-success'])

const email = ref('')
const code = ref('')
const codeRequested = ref(false)
const rememberOneDay = ref(false)
const devCode = ref('')
const mode = ref('login')
const signupForm = ref({
  name: '',
  email: '',
  phoneNumber: '',
  agreeTerms: false
})

const resetLoginForm = () => {
  email.value = ''
  code.value = ''
  codeRequested.value = false
  rememberOneDay.value = false
  devCode.value = ''
}

const resetSignupForm = () => {
  signupForm.value = {
    name: '',
    email: '',
    phoneNumber: '',
    agreeTerms: false
  }
}

const switchMode = (nextMode) => {
  mode.value = nextMode
  resetLoginForm()
  resetSignupForm()
}

const promptSignup = async () => {
  const confirmResult = await showConfirm(
    '등록된 사용자가 없습니다.',
    '무료 체험을 진행하시겠습니까?'
  )

  if (confirmResult.isConfirmed) {
    const requestedEmail = email.value
    switchMode('signup')
    signupForm.value.email = requestedEmail
  }
}

const requestCode = async () => {
  if (!email.value) {
    await showAlert('입력 오류', '이메일을 입력해주세요.', 'warning')
    return
  }

  if (!isValidEmail(email.value)) {
    await showAlert('입력 오류', '올바른 이메일 형식으로 입력해주세요.', 'warning')
    return
  }

  try {
    const result = await postApi(
      '/api/auth/request-code',
      {
        email: email.value
      }
    )

    devCode.value = result.devCode || ''
    code.value = devCode.value || ''
    codeRequested.value = true

    await showAlert(
      '인증코드 발송',
      devCode.value ? '데모 인증코드가 자동으로 입력되었습니다.' : '인증코드를 확인해주세요.',
      'success'
    )
  } catch (error) {
    const message =
      error?.response?.data?.message
      || error?.response?.data
      || '인증코드 요청 중 오류가 발생했습니다.'

    if (String(message).includes('등록된 사용자가 없습니다')) {
      await promptSignup()
      return
    }

    await showError('요청 실패', message, 'error')
  }
}

const verifyCode = async () => {
  if (!code.value) {
    await showAlert('입력 오류', '인증코드를 입력해주세요.', 'warning')
    return
  }

  try {
    const result =
      await postApi(
        '/api/auth/verify-code',
        {
          email: email.value,
          code: code.value,
          rememberOneDay: rememberOneDay.value
        }
      )

    const auth = {
      email: result.email,
      token: result.token,
      expiresAt: result.expiresAt,
      roleCode: result.roleCode,
      statusCode: result.statusCode,
      rememberOneDay: rememberOneDay.value
    }

    localStorage.removeItem('aiVoiceAuth')
    sessionStorage.removeItem('aiVoiceAuth')

    if (rememberOneDay.value) {
      localStorage.setItem('aiVoiceAuth', JSON.stringify(auth))
    } else {
      sessionStorage.setItem('aiVoiceAuth', JSON.stringify(auth))
    }

    window.dispatchEvent(new CustomEvent('ai-voice-login', { detail: auth }))
    emit('login-success', auth)
    resetLoginForm()
  } catch (error) {
    const message =
      error?.response?.data?.message
      || error?.response?.data
      || '인증코드 확인 중 오류가 발생했습니다.'

    if (String(message).includes('등록된 사용자가 없습니다')) {
      await promptSignup()
      return
    }

    await showError('로그인 실패', message, 'error')
  }
}

const signup = async () => {
  const requiredMessage =
    getRequiredMessage(signupForm.value.name, '이름')
    || getRequiredMessage(signupForm.value.email, '이메일')
    || getRequiredMessage(signupForm.value.phoneNumber, '전화번호')

  if (requiredMessage) {
    await showAlert('입력 오류', requiredMessage, 'warning')
    return
  }

  if (!isValidEmail(signupForm.value.email)) {
    await showAlert('입력 오류', '올바른 이메일 형식으로 입력해주세요.', 'warning')
    return
  }

  if (!isValidPhoneNumber(signupForm.value.phoneNumber)) {
    await showAlert('입력 오류', '올바른 전화번호 형식으로 입력해주세요. 예: 010-0000-0000', 'warning')
    return
  }

  if (!signupForm.value.agreeTerms) {
    await showAlert('입력 오류', '이용약관에 동의해주세요.', 'warning')
    return
  }

  try {
    await postApi('/api/auth/signup', signupForm.value)
    await showAlert('회원가입 완료', '무료 체험 계정이 생성되었습니다. 이메일 인증 후 로그인해주세요.', 'success')
    switchMode('login')
  } catch (error) {
    const message =
      error?.response?.data?.message
      || error?.response?.data
      || '회원가입 처리 중 오류가 발생했습니다.'
    await showError('가입 실패', message, 'error')
  }
}

const resetCode = () => {
  code.value = ''
  devCode.value = ''
  codeRequested.value = false
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      mode.value = 'login'
      resetLoginForm()
      resetSignupForm()
    }
  }
)
</script>
