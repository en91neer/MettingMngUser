<template>
  <section class="inquiry-page">
    <div class="inquiry-card">
      <div class="inquiry-header app-page-title">
        <p class="app-page-kicker">SERVICE CONSULTING</p>
        <h1>도입문의</h1>
        <span>
          성함과 연락처를 남겨주시면 담당자가 확인 후 연락드립니다.
        </span>
      </div>

      <form class="inquiry-form" @submit.prevent="submitInquiry">
        <label>
          성함
          <input v-model="inquiryForm.customerName" type="text" placeholder="홍길동" />
        </label>

        <label>
          이메일
          <input v-model="inquiryForm.email" type="email" placeholder="name@example.com" />
        </label>

        <label>
          전화번호
          <input v-model="inquiryForm.phoneNumber" type="tel" placeholder="010-0000-0000" />
        </label>

        <label>
          문의내용
          <textarea
            v-model="inquiryForm.inquiryContent"
            rows="5"
            placeholder="도입 목적, 예상 사용자 수, 궁금한 내용을 남겨주세요."
          ></textarea>
        </label>

        <button type="submit" class="inquiry-submit-btn" :disabled="inquirySaving">
          {{ inquirySaving ? '저장중' : '문의 남기기' }}
        </button>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { postApi } from '@/utils/api'
import {
  showAlert,
  showError
} from '@/utils/alert.js'
import {
  getRequiredMessage,
  isValidEmail,
  isValidPhoneNumber
} from '@/utils/validation.js'

const inquirySaving = ref(false)
const inquiryForm = ref({
  customerName: '',
  email: '',
  phoneNumber: '',
  inquiryContent: ''
})

const resetInquiryForm = () => {
  inquiryForm.value = {
    customerName: '',
    email: '',
    phoneNumber: '',
    inquiryContent: ''
  }
}

const submitInquiry = async () => {
  const requiredMessage =
    getRequiredMessage(inquiryForm.value.customerName, '성함')
    || getRequiredMessage(inquiryForm.value.email, '이메일')
    || getRequiredMessage(inquiryForm.value.phoneNumber, '전화번호')
    || getRequiredMessage(inquiryForm.value.inquiryContent, '문의내용')

  if (requiredMessage) {
    await showAlert('입력 확인', requiredMessage, 'warning')
    return
  }

  if (!isValidEmail(inquiryForm.value.email)) {
    await showAlert('입력 확인', '올바른 이메일 형식으로 입력해주세요.', 'warning')
    return
  }

  if (!isValidPhoneNumber(inquiryForm.value.phoneNumber)) {
    await showAlert('입력 확인', '올바른 전화번호 형식으로 입력해주세요. 예: 010-0000-0000', 'warning')
    return
  }

  try {
    inquirySaving.value = true
    await postApi('/api/implementation-inquiries', inquiryForm.value)
    resetInquiryForm()
    window.dispatchEvent(new CustomEvent('implementation-inquiry-created'))
    await showAlert('문의 접수 완료', '담당자가 확인 후 연락드리겠습니다.', 'success')
  } catch (error) {
    await showError('저장 실패', '도입문의 저장 중 오류가 발생했습니다.', 'error')
  } finally {
    inquirySaving.value = false
  }
}
</script>

<style scoped>
.inquiry-page {
  min-height: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.inquiry-card {
  width: min(100%, 620px);
  padding: 26px;
  border: 1px solid #d8efe2;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 10px 28px rgba(18, 53, 36, 0.08);
  box-sizing: border-box;
}

.inquiry-header {
  margin-bottom: 22px;
}

.inquiry-header p {
  margin: 0 0 8px;
  color: #03c75a;
  font-size: 13px;
  font-weight: 900;
}

.inquiry-header h1 {
  margin: 0 0 8px;
  color: #123524;
  font-size: 28px;
  line-height: 1.2;
}

.inquiry-header span {
  color: #6a8f79;
  font-size: 14px;
  line-height: 1.5;
}

.inquiry-form {
  display: grid;
  gap: 14px;
}

.inquiry-form label {
  display: grid;
  gap: 7px;
  color: #315743;
  font-size: 14px;
  font-weight: 800;
}

.inquiry-form input,
.inquiry-form textarea {
  width: 100%;
  min-height: 46px;
  padding: 0 13px;
  border: 1px solid #cfe8da;
  border-radius: 12px;
  color: #123524;
  background: #f8fffb;
  font: inherit;
  box-sizing: border-box;
}

.inquiry-form textarea {
  min-height: 128px;
  padding: 12px 13px;
  resize: vertical;
  line-height: 1.55;
}

.inquiry-form input:focus,
.inquiry-form textarea:focus {
  outline: none;
  border-color: #03c75a;
  box-shadow: 0 0 0 3px rgba(3, 199, 90, 0.16);
}

.inquiry-submit-btn {
  width: 100%;
  min-height: 52px;
  margin-top: 6px;
  border: none;
  border-radius: 14px;
  color: white;
  background: #03c75a;
  cursor: pointer;
  font-size: 15px;
  font-weight: 900;
}

.inquiry-submit-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .inquiry-page {
    display: block;
  }

  .inquiry-card {
    padding: 18px;
    border-radius: 14px;
  }

  .inquiry-header h1 {
    font-size: 24px;
  }
}
</style>
