<template>

  <div class="calendar-container">
    <div class="app-page-title">
      <div>
        <p class="app-page-kicker">MEETING COLLECTION</p>
        <h1>회의 수집</h1>
      </div>
      <span class="app-page-subtitle">
        날짜별 회의 자료를 등록하고 관리합니다.
      </span>
    </div>

    <!-- 헤더 -->
    <div class="calendar-header">

      <button type="button" class="calendar-nav-btn" @click="prevMonth">
        <span class="calendar-nav-icon">‹</span>
        <span>이전달</span>
      </button>

      <div class="calendar-title-wrap">
        <button type="button" class="calendar-title-button" @click="toggleMonthPicker">
          <span>{{ currentYear }}년 {{ currentMonth + 1 }}월</span>
          <span class="calendar-title-caret">▾</span>
        </button>

        <div v-if="showMonthPicker" class="month-picker-panel">
          <div class="month-picker-fields">
            <label>
              년도
              <select v-model.number="pickerYear">
                <option
                  v-for="year in yearOptions"
                  :key="year"
                  :value="year"
                >
                  {{ year }}년
                </option>
              </select>
            </label>

            <label>
              월
              <select v-model.number="pickerMonth">
                <option
                  v-for="month in 12"
                  :key="month"
                  :value="month - 1"
                >
                  {{ month }}월
                </option>
              </select>
            </label>
          </div>

          <div class="month-picker-actions">
            <button type="button" @click="goToday">
              오늘
            </button>
            <button type="button" class="month-picker-apply" @click="applyMonth">
              이동
            </button>
          </div>
        </div>
      </div>

      <button type="button" class="calendar-nav-btn" @click="nextMonth">
        <span>다음달</span>
        <span class="calendar-nav-icon">›</span>
      </button>

    </div>

    <!-- 달력 -->
    <table class="calendar">

      <thead>
        <tr>
          <th class="sun">일</th>
          <th>월</th>
          <th>화</th>
          <th>수</th>
          <th>목</th>
          <th>금</th>
          <th class="sat">토</th>
        </tr>
      </thead>

      <tbody>

        <tr v-for="(week, wIndex) in calendar" :key="wIndex">

          <td v-for="(day, dIndex) in week" :key="dIndex" @click="selectDate(day)" :class="[
            'day-cell',
            day === '' ? 'empty' : '',
            isToday(day) ? 'today' : ''
          ]">

            <!-- 날짜 -->
            <div class="day-number">
              {{ day }}
            </div>

            <!-- 회의록 목록 -->
            <button
              v-for="meetingMinutes in getMeetingMinutesByDay(day)"
              :key="meetingMinutes.id"
              type="button"
              class="meetingMinutes-item"
              @click.stop="openMeetingMinutesDetail(meetingMinutes)"
            >
              <span class="meetingMinutes-time">
                {{ meetingMinutes.meetingDate?.substring(11, 16) }}
              </span>
              <span class="meetingMinutes-title">
                {{ meetingMinutes.subject }}
              </span>
            </button>

          </td>

        </tr>

      </tbody>

    </table>

    <!-- 회의록 모달 -->
    <div v-if="showModal" class="modal-overlay">

      <div class="modal">

        <h3>
          회의정보 입력
        </h3>

        <p class="selected-date">
          회의 날짜 : {{ selectedDate }}
        </p>

        <!-- 시간 -->
        <div class="form-group">

          <label>
            회의 시간
          </label>

          <input type="time" v-model="meetingTime" />

        </div>

        <!-- 회의 주제 -->
        <div class="form-group">
          <label>
            회의주제
          </label>
          <input type="text" v-model="subject" value="옷환불에 대한 클레임" placeholder="회의 주제 입력" />
        </div>

        <!-- 회의 요약 -->
        <div class="form-group">
          <label>
            회의 요약
          </label>
          <input type="text" v-model="content" value="환불에 대한 클레임 회의" placeholder="회의 요약 키워드 입력" />
        </div>

        <div class="form-group">
          <label>
            첨부파일
          </label>

          <!-- 숨김 input -->
          <input
            ref="fileInput"
            type="file"
            accept=".mp3,.mp4,.mpeg,.mpga,.m4a,.wav,.webm,.flac,.ogg,.txt,.md,.csv,.json,.doc,.docx,.pdf,audio/*,video/mp4,text/plain,application/pdf"
            @change="handleImageUpload"
            class="hidden-file-input"
          />

          <div class="file-upload-box">
            <button type="button" class="upload-btn" @click="openFileSelector">
              파일 선택
            </button>

            <div class="file-upload-info">
              <span class="file-name">
                {{ selectedFileName || '선택된 파일 없음' }}
              </span>
              <span class="file-help-text">
                음성, PDF, 문서, 텍스트 파일을 첨부할 수 있습니다.
              </span>
            </div>

            <button
              v-if="selectedFile"
              type="button"
              class="file-remove-btn"
              @click.stop="removeImage"
            >
              삭제
            </button>
          </div>
        </div>

        <!-- 버튼 -->
        <div class="modal-buttons">
          <button class="confirm-btn" @click="confirmMeetingMinutes">
            저장
          </button>

          <button class="cancel-btn" @click="closeModal">
            취소
          </button>
        </div>
      </div>
    </div>

    <!-- 이미지 확대 -->
    <div v-if="showImageModal" class="image-modal-overlay" @click="closeImageModal">
      <img :src="imagePreview" class="full-image" />
    </div>

    <!-- 등록 상세 -->
    <div v-if="showDetailModal" class="modal-overlay">
      <div class="modal">
        <h3>
          등록된 회의 정보
        </h3>

        <div class="detail-info-list">
          <div class="detail-info-row">
            <span>회의 시간</span>
            <strong>{{ selectedMeetingMinutes.meetingDate }}</strong>
          </div>
          <div class="detail-info-row">
            <span>회의 주제</span>
            <strong>{{ selectedMeetingMinutes.subject }}</strong>
          </div>
          <div class="detail-info-row">
            <span>회의 요약</span>
            <strong>{{ selectedMeetingMinutes.content || '-' }}</strong>
          </div>
          <div class="detail-info-row">
            <span>분석 상태</span>
            <strong>{{ selectedMeetingMinutes.analyzeStatus || '대기' }}</strong>
          </div>
        </div>

        <div class="modal-buttons">
          <button class="cancel-btn" @click="closeMeetingMinutesDetail">
            닫기
          </button>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>

import {
  ref,
  computed,
  onMounted
} from 'vue'

import {
  showAlert,
  showConfirm
} from '@/utils/alert.js'

import {
  getApi,
  postMultiApi
} from '@/utils/api'

import '@/assets/css/views/Metting.css'

const today = new Date()

// 현재 년/월
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth())
const showMonthPicker = ref(false)
const pickerYear = ref(today.getFullYear())
const pickerMonth = ref(today.getMonth())

// 오늘 날짜
const todayYear = today.getFullYear()
const todayMonth = today.getMonth()
const todayDate = today.getDate()

// 모달
const showModal = ref(false)
const showImageModal = ref(false)
const showDetailModal = ref(false)

// 회의록 정보
const selectedDate = ref('')
const meetingTime = ref('')
const subject = ref('')
const content = ref('')

// 이미지
const imagePreview = ref('')

// 파일
const fileInput = ref(null)
const selectedFileName = ref('')
const selectedFile = ref(null)
const selectedMeetingMinutes = ref({})

// 회의록 목록
const meetingMinutesList = ref([])

const yearOptions = computed(() => {
  const startYear = currentYear.value - 5
  return Array.from({ length: 11 }, (_, index) => startYear + index)
})

/* =========================
   회의록 목록 조회
========================= */
const loadMeetingMinutesList = async () => {

  const result =
    await getApi('/api/meeting-minutes/list')

  if (result.success) {

    meetingMinutesList.value = result.data

  } else {

    meetingMinutesList.value = []
  }
}

/* =========================
   최초 로딩
========================= */
onMounted(() => {
  loadMeetingMinutesList()
})

/* =========================
   날짜별 회의록 조회
========================= */
const getMeetingMinutesByDay = (day) => {

  if (!day) {
    return []
  }

  const month =
    String(currentMonth.value + 1)
      .padStart(2, '0')

  const date =
    String(day)
      .padStart(2, '0')

  const fullDate =
    `${currentYear.value}-${month}-${date}`

  return meetingMinutesList.value.filter(item => {

    return (
      item.meetingDate &&
      item.meetingDate.startsWith(fullDate)
    )
  })
}

/* =========================
   달력 생성
========================= */
const calendar = computed(() => {

  const firstDay = new Date(
    currentYear.value,
    currentMonth.value,
    1
  ).getDay()

  const lastDate = new Date(
    currentYear.value,
    currentMonth.value + 1,
    0
  ).getDate()

  const days = []

  // 빈칸
  for (let i = 0; i < firstDay; i++) {
    days.push('')
  }

  // 날짜
  for (let d = 1; d <= lastDate; d++) {
    days.push(d)
  }

  // 7개씩 자르기
  const result = []

  for (let i = 0; i < days.length; i += 7) {
    result.push(days.slice(i, i + 7))
  }

  return result
})

/* =========================
   오늘 여부
========================= */
const isToday = (day) => {

  return (
    day &&
    currentYear.value === todayYear &&
    currentMonth.value === todayMonth &&
    day === todayDate
  )
}

/* =========================
   이전달
========================= */
const prevMonth = () => {
  showMonthPicker.value = false

  if (currentMonth.value === 0) {

    currentMonth.value = 11
    currentYear.value--

  } else {

    currentMonth.value--
  }
}

/* =========================
   다음달
========================= */
const nextMonth = () => {
  showMonthPicker.value = false

  if (currentMonth.value === 11) {

    currentMonth.value = 0
    currentYear.value++

  } else {

    currentMonth.value++
  }
}

const toggleMonthPicker = () => {
  pickerYear.value = currentYear.value
  pickerMonth.value = currentMonth.value
  showMonthPicker.value = !showMonthPicker.value
}

const applyMonth = () => {
  currentYear.value = pickerYear.value
  currentMonth.value = pickerMonth.value
  showMonthPicker.value = false
}

const goToday = () => {
  currentYear.value = todayYear
  currentMonth.value = todayMonth
  pickerYear.value = todayYear
  pickerMonth.value = todayMonth
  showMonthPicker.value = false
}

/* =========================
   날짜 클릭
========================= */
const selectDate = (day) => {

  if (!day) {
    return
  }

  const month =
    String(currentMonth.value + 1)
      .padStart(2, '0')

  const date =
    String(day)
      .padStart(2, '0')

  selectedDate.value =
    `${currentYear.value}-${month}-${date}`

  // 현재 시간
  const now = new Date()

  const hour =
    String(now.getHours())
      .padStart(2, '0')

  const minute =
    String(now.getMinutes())
      .padStart(2, '0')

  meetingTime.value =
    `${hour}:${minute}`

  // 초기화
  imagePreview.value = ''

  selectedFileName.value = ''
  selectedFile.value = null

  showModal.value = true
}

/* =========================
   이미지 확대
========================= */
const openImageModal = () => {
  showImageModal.value = true
}

const closeImageModal = () => {
  showImageModal.value = false
}

/* =========================
   회의록 모달 닫기
========================= */
const closeModal = () => {
  showModal.value = false
}

const openMeetingMinutesDetail = (meetingMinutes) => {
  selectedMeetingMinutes.value = meetingMinutes
  showDetailModal.value = true
}

const closeMeetingMinutesDetail = () => {
  showDetailModal.value = false
}

/* =========================
   회의록 저장
========================= */
const confirmMeetingMinutes = async () => {

  if (!meetingTime.value) {

    await showAlert(
      '입력 오류',
      '회의 시간을 입력해주세요.',
      'warning'
    )

    return
  }

  if (!subject.value) {

    await showAlert(
      '입력 오류',
      '회의 주제를 입력해주세요.',
      'warning'
    )

    return
  }

  if (!selectedFile.value) {

    await showAlert(
      '입력 오류',
      '첨부파일을 선택해야 저장할 수 있습니다.',
      'warning'
    )

    return
  }

  const message =
    `회의 날짜 : ${selectedDate.value}<br>` +
    `회의 시간 : ${meetingTime.value}<br>` +
    `회의 주제 : ${subject.value}<br><br>` +
    `회의 요약 : ${content.value}<br><br>` +
    `진행 하시겠습니까?`

  const result =
    await showConfirm(
      '요청 완료',
      message
    )

  if (!result.isConfirmed) {
    return
  }

  // 서버 파라미터
  const params = {
    subject: subject.value,
    subjectCode: 'GENERAL_MEETING',
    content: content.value,
    meetingDate:
      `${selectedDate.value} ${meetingTime.value}`
  }

  // 저장
  const success =
    await postMultiApi(
      '/api/meeting-minutes/upload',
      params,
      selectedFile.value
    )

  // 결과
  if (success) {
    // 재조회
    await loadMeetingMinutesList()

    await showAlert(
      '요청 완료',
      '저장완료 하였습니다.',
      'success'
    )

    showModal.value = false

  } else {
    await showAlert(
      '요청 실패',
      '저장중 오류가 발생하였습니다.',
      'error'
    )
  }
}

/* =========================
   파일 선택창
========================= */
const openFileSelector = () => {

  if (fileInput.value) {
    fileInput.value.click()
  }
}

/* =========================
   첨부파일 업로드
========================= */
const handleImageUpload = (event) => {

  const file =
    event.target.files[0]

  if (!file) {
    return
  }

  selectedFile.value = file
  selectedFileName.value = file.name

  if (!file.type.startsWith('image/')) {
    imagePreview.value = ''
    return
  }

  const reader = new FileReader()

  reader.onload = (e) => {
    imagePreview.value = e.target.result
  }

  reader.readAsDataURL(file)
}

/* =========================
   첨부파일 삭제
========================= */
const removeImage = async () => {

  const result =
    await showConfirm(
      '삭제 확인',
      '첨부파일을 삭제하시겠습니까?'
    )

  if (!result.isConfirmed) {
    return
  }

  imagePreview.value = ''

  if (fileInput.value) {
    fileInput.value.value = ''
  }

  selectedFileName.value = ''
  selectedFile.value = null
}

</script>
