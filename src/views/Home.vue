<template>
  <div class="container home-page">
    <div class="card">
      <div class="app-page-title">
        <div>
          <p class="app-page-kicker">AI ANALYSIS DASHBOARD</p>
          <h1>AI분석 대시보드</h1>
        </div>
        <span class="app-page-subtitle">
          회의 파일을 조회하고 AI 분석을 요청합니다.
        </span>
      </div>

      <!-- 검색 영역 -->
      <div class="home-search-panel">
        <div class="home-search-field">
          <label><span class="home-search-icon">📅</span>등록시작일</label>
          <input type="date" v-model="startDateSearch" />
        </div>

        <div class="home-search-field">
          <label><span class="home-search-icon">📆</span>등록종료일</label>
          <input type="date" v-model="endDateSearch" />
        </div>

        <div class="home-search-field">
          <label><span class="home-search-icon">✨</span>분석유형</label>
          <select v-model="analysisTypeSearch">
            <option
              v-for="type in searchAnalysisTypes"
              :key="type.code"
              :value="type.code"
            >
              {{ type.name }}
            </option>
          </select>
        </div>

        <div class="home-search-actions">
          <button class="load-btn search-btn" @click="loadUsers(true)">
            조회
          </button>

          <button class="load-btn excel-btn" @click="excelDownLoad">
            엑셀다운로드
          </button>
        </div>
      </div>

      <!-- 목록 -->
      <div v-if="meetingMinutesUser.length > 0" class="home-feed-list">
        <article
          v-for="meetingMinutes in meetingMinutesUser"
          :key="meetingMinutes.id"
          class="home-feed-card"
          @click="openDetailModal(meetingMinutes)"
        >
          <div class="home-feed-main">
            <div class="home-feed-header">
              <span class="home-feed-badge">{{ getAnalyzeProgressText(meetingMinutes) }}</span>
              <button
                type="button"
                class="delete-action-btn"
                @click.stop.prevent="deleteMeetingMinutes(meetingMinutes)"
              >
                삭제
              </button>
            </div>

            <h2 class="home-feed-title">
              {{ meetingMinutes.subject || '제목 없는 회의' }}
            </h2>

            <div class="home-feed-meta">
              <span>분석 {{ formatFriendlyDate(meetingMinutes.createdAt) }}</span>
              <span>등록 {{ formatFriendlyDate(meetingMinutes.meetingDate) }}</span>
            </div>

            <div
              v-if="meetingMinutes.fileId && meetingMinutes.fileId !== '0'"
              class="analyze-inline-progress home-feed-progress"
            >
              <span class="analyze-inline-progress-text">
                분석 진행률 {{ getAnalyzeProgress(meetingMinutes) }}%
              </span>
              <div class="analyze-inline-progress-bar">
                <div
                  class="analyze-inline-progress-fill"
                  :style="{ width: getAnalyzeProgress(meetingMinutes) + '%' }"
                ></div>
              </div>
            </div>
          </div>

          <div class="home-feed-actions">
                <button
                  v-if="isAnalyzing(meetingMinutes)"
                  type="button"
                  class="analyze-action-btn"
                  disabled
                >
                  AI분석 중
                </button>
                <button
                  v-else-if="meetingMinutes.fileId && meetingMinutes.fileId !== '0'"
                  type="button"
                  class="analyze-action-btn"
                  @click.stop.prevent="toggleAnalyzeMenu(meetingMinutes, $event)"
                >
                  AI분석
                </button>
          </div>
        </article>
      </div>

      <!-- 데이터 없을 때 -->
      <div v-if="meetingMinutesUser.length === 0 && loaded" class="empty">
        조건에 맞는 회의록이 없습니다.
      </div>

      <div v-if="loadingList" class="home-list-state">
        목록을 불러오는 중...
      </div>

      <div v-else-if="loaded && meetingMinutesUser.length > 0 && !hasMore" class="home-list-state">
        마지막 목록입니다.
      </div>

      <div
        v-if="hasMore"
        ref="scrollSentinel"
        class="home-scroll-sentinel"
        aria-hidden="true"
      ></div>
    </div>
  </div>

  <!-- 상세 모달 -->
  <div v-if="showDetailModal" class="modal-overlay">

    <div class="modal">
      <button
        type="button"
        class="popup-close-btn"
        aria-label="팝업 닫기"
        @click="closeDetailModal"
      >
        ×
      </button>

      <h3>
        분석 상세 정보
      </h3>

      <!-- 회의 주제 -->
      <div class="form-group">
        <label>
          회의 주제
        </label>
        <div class="subject-edit-row">
          <input
            type="text"
            v-model="selectedMeetingSubject"
            placeholder="회의 주제 입력"
          />
          <button
            type="button"
            class="confirm-btn subject-save-btn"
            :disabled="savingSubject"
            @click="updateMeetingSubject"
          >
            {{ savingSubject ? '저장중' : '주제 저장' }}
          </button>
        </div>
      </div>

      <!-- 회의 날짜 -->
      <div class="form-group">
        <label>
          회의 날짜
        </label>
        <input type="text" :value="selectedMeetingMinutes.meetingDate" readonly />
      </div>

      <div class="detail-meta-grid">
        <div class="form-group">
          <label>
            분석유형
          </label>
          <select
            v-model="selectedAnalysisType"
            class="detail-select"
            @change="changeAnalysisType"
          >
            <option
              v-for="type in detailAnalysisTypes"
              :key="type.code"
              :value="type.code"
            >
              {{ type.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>
            분석날짜
          </label>
          <input type="text" :value="selectedAnalysisDate || '-'" readonly />
        </div>
      </div>

      <div
        v-if="isSelectedMeetingMinutesWaiting || isSelectedMeetingMinutesAnalyzing"
        class="analyze-detail-status"
      >
        <div
          v-if="isSelectedMeetingMinutesAnalyzing"
          class="analyze-detail-spinner"
        ></div>
        <div>
          <strong>
            {{ selectedAnalyzeProgress }}%
          </strong>
          <p>
            {{ selectedAnalyzeMessage }}
          </p>
        </div>
      </div>

      <div
        v-if="isSelectedMeetingMinutesWaiting"
        class="analyze-empty-result"
      >
        아직 분석결과가 없습니다.
      </div>

      <div
        v-if="isSelectedMeetingMinutesFail"
        class="analyze-empty-result analyze-fail-result"
      >
        {{ selectedAnalyzeMessage }}
      </div>

      <!-- 분석요약 -->
      <div v-if="isSelectedMeetingMinutesComplete" class="form-group">
        <label>
          분석요약
        </label>
        <p class="analysis-touch-hint">
          분석요약을 터치하면 전체화면에서 복사 및 수정할 수 있습니다.
        </p>
        <textarea
          class="message-textarea analysis-preview-textarea"
          :value="analysisContent"
          rows="30"
          readonly
          @click="openAnalysisFullscreen"
        ></textarea>
      </div>
    </div>
  </div>

  <!-- 이미지 모달 -->
  <div v-if="showImageModal" class="image-modal" @click="closeImageModal">
    <button
      type="button"
      class="popup-close-btn image-popup-close-btn"
      aria-label="팝업 닫기"
      @click.stop="closeImageModal"
    >
      ×
    </button>
    <img :src="imageUrl" class="detail-image" />
  </div>

  <!-- 로딩바 -->
  <div v-if="loding" class="loading-overlay">
    <div class="loading-box">
      <div class="spinner"></div>
      <div class="loading-text">
        엑셀 다운로드 중...
      </div>
    </div>
  </div>

  <teleport to="body">
    <div
      v-if="showAnalysisFullscreen"
      class="analysis-fullscreen-overlay"
      @click.self="closeAnalysisFullscreen"
    >
      <div class="analysis-fullscreen-panel" @click.stop>
        <button
          type="button"
          class="popup-close-btn"
          aria-label="팝업 닫기"
          @click="closeAnalysisFullscreen"
        >
          ×
        </button>

        <div class="analysis-fullscreen-head">
          <div>
            <p>분석요약 편집</p>
            <strong>{{ getAnalysisTypeName(selectedAnalysisType) }}</strong>
          </div>
          <div class="analysis-fullscreen-actions">
            <button
              type="button"
              class="copy-btn"
              @click="copyFullscreenAnalysisContent"
            >
              복사
            </button>
            <button
              type="button"
              class="confirm-btn"
              @click="updateFullscreenAnalysisContent"
            >
              수정
            </button>
          </div>
        </div>

        <textarea
          v-model="fullscreenAnalysisContent"
          class="analysis-fullscreen-textarea"
        ></textarea>
      </div>
    </div>

    <div
      v-if="openAnalyzeMenuMeetingMinutes"
      class="analyze-modal-overlay"
      @click.self="openAnalyzeMenuMeetingMinutes = null"
    >
      <div class="analyze-type-modal" @click.stop>
        <button
          type="button"
          class="popup-close-btn"
          aria-label="팝업 닫기"
          @click="openAnalyzeMenuMeetingMinutes = null"
        >
          ×
        </button>

        <div class="analyze-type-modal-head">
          <p>분석유형 선택</p>
          <strong>{{ openAnalyzeMenuMeetingMinutes.subject || '회의 분석' }}</strong>
        </div>

        <div class="analyze-type-grid">
          <button
            v-for="type in analyzeTypes"
            :key="type.code"
            type="button"
            class="analyze-type-card"
            @click.stop.prevent="selectAnalyzeType(type)"
          >
            <span class="analyze-type-icon">✨</span>
            <strong>{{ type.name }}</strong>
          </button>
        </div>

      </div>
    </div>
  </teleport>
</template>

<script>
import {
  showAlert,
  showConfirm,
  showError
} from '@/utils/alert.js'

import {
  getApi,
  getBlobApi,
  putApi,
  deleteApi,
  excelDownloadApi,
  getWebSocketUrl
} from '@/utils/api'
import { showPremiumUpgradeConfirm } from '@/utils/subscription.js'

import '@/assets/css/views/Home.css'
import '@/assets/css/button.css'

export default {
  name: 'Dashboard',
  computed: {
    selectedAnalyzeProgress() {
      return this.getAnalyzeProgress(this.selectedMeetingMinutes || {})
    },

    selectedAnalyzeInfo() {
      return this.getAnalyzeInfo(this.selectedMeetingMinutes || {})
    },

    selectedAnalyzeMessage() {
      if (this.selectedAnalyzeInfo?.message) {
        return this.selectedAnalyzeInfo.message
      }

      if (this.isSelectedMeetingMinutesFail) {
        return this.getAnalyzeFailMessage(this.selectedMeetingMinutes)
      }

      if (this.isSelectedMeetingMinutesWaiting) {
        return '아직 분석결과가 없습니다.'
      }

      if (this.isSelectedMeetingMinutesAnalyzing) {
        return '분석진행중입니다.'
      }

      return '분석이 완료되었습니다.'
    },

    isSelectedMeetingMinutesWaiting() {
      return (
        this.selectedAnalyzeProgress === 0
        && !this.isSelectedMeetingMinutesFail
      )
    },

    isSelectedMeetingMinutesAnalyzing() {
      return (
        this.selectedAnalyzeProgress > 0
        && this.selectedAnalyzeProgress < 100
        && !this.isSelectedMeetingMinutesFail
      )
    },

    isSelectedMeetingMinutesFail() {
      return this.isAnalyzeFail(this.selectedMeetingMinutes || {})
    },

    isSelectedMeetingMinutesComplete() {
      return (
        this.selectedAnalyzeProgress === 100
        && !this.isSelectedMeetingMinutesFail
      )
    }
  },
  data() {
    return {
      meetingMinutesUser: [],
      showImageModal: false,
      imageUrl: '',
      loaded: false,
      loding: false,
      /* 상세 모달 */
      showDetailModal: false,
      /* 선택 데이터 */
      selectedMeetingMinutes: {},
      selectedMeetingSubject: '',
      savingSubject: false,
      analysisTemplates: [],
      detailAnalysisTypes: [
        { code: '전체', name: '전체' }
      ],
      selectedAnalysisType: '전체',
      selectedAnalysisDate: '',
      analysisResults: [],
      analysisContent: '',
      showAnalysisFullscreen: false,
      fullscreenAnalysisContent: '',
      startDateSearch: '',
      endDateSearch: '',
      analysisTypeSearch: '전체',
      searchAnalysisTypes: [
        { code: '전체', name: '전체' }
      ],
      pageSize: 20,
      offset: 0,
      hasMore: true,
      loadingList: false,
      scrollContainer: null,
      scrollObserver: null,
      analyzeProgressMap: {},
      analyzeWebSocket: null,
      openAnalyzeMenuMeetingMinutes: null,
      analyzeTypes: [
      ]
    }
  },

  methods: {
    /* 회의록 목록 조회 */
    async loadAnalysisTemplates() {
      const result = await getApi('/api/templates/active')
      const templates =
        result.success && Array.isArray(result.data)
          ? result.data
          : []

      this.analysisTemplates =
        templates.map(template => ({
          code: template.analysisTypeCode,
          name: template.templateName
        }))

      this.analyzeTypes = this.analysisTemplates

      this.searchAnalysisTypes = [
        { code: '전체', name: '전체' },
        ...this.analyzeTypes
      ]

      this.detailAnalysisTypes = [
        { code: '전체', name: '전체' },
        ...this.analyzeTypes
      ]
    },

    getAnalysisTypeName(code) {
      if (code === '전체') {
        return '전체'
      }

      return this.analysisTemplates.find(type => type.code === code)?.name || code
    },

    /* 회의록 목록 조회 */
    async loadUsers(reset = true) {
      if (this.loadingList) {
        return
      }

      if (!reset && !this.hasMore) {
        return
      }

      if (reset) {
        this.offset = 0
        this.hasMore = true
        this.meetingMinutesUser = []
      }

      this.loadingList = true

      const result =
        await getApi(
          '/api/meeting-minutes/list',
          this.getSearchParams(true)
        )
      if (result.success) {
        const rows = Array.isArray(result.data)
          ? result.data
          : []

        this.meetingMinutesUser = reset
          ? rows
          : [
              ...this.meetingMinutesUser,
              ...rows
            ]

        this.offset += rows.length
        this.hasMore = rows.length === this.pageSize
        this.loaded = true
        this.$nextTick(() => {
          this.observeScrollSentinel()
        })
      } else {
        await showError(
          '조회 실패',
          '조회중 오류가 발생했습니다.',
          'error'
        )
      }

      this.loadingList = false
    },

    getSearchParams(includePaging = false) {
      const params = {
        subject: '',
        startDate: this.startDateSearch,
        endDate: this.endDateSearch,
        analysisType: this.analysisTypeSearch
      }

      if (includePaging) {
        params.offset = this.offset
        params.limit = this.pageSize
      }

      return params
    },

    initializeSearchDates() {
      const today = new Date()
      const startDate = new Date()

      startDate.setDate(today.getDate() - 3)

      this.startDateSearch = this.formatDate(startDate)
      this.endDateSearch = this.formatDate(today)
    },

    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')

      return year + '-' + month + '-' + day
    },

    formatFriendlyDate(value) {
      if (!value) {
        return '-'
      }

      const dateText = String(value).replace('T', ' ')
      const match =
        dateText.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:\s+(\d{1,2}):(\d{1,2}))?/)

      if (!match) {
        return value
      }

      const [, year, month, day, hourText, minuteText] = match

      if (!hourText || !minuteText) {
        return Number(month) + '월 ' + Number(day) + '일'
      }

      const hour = Number(hourText)
      const period = hour >= 12 ? '오후' : '오전'
      const displayHour = hour % 12 || 12

      return (
        year + '년 '
        + Number(month) + '월 '
        + Number(day) + '일 '
        + period + ' '
        + displayHour + ':'
        + String(minuteText).padStart(2, '0')
      )
    },

    handleWindowScroll() {
      const windowScrollTop =
        window.scrollY
        || document.documentElement.scrollTop

      const windowRemaining =
        document.documentElement.scrollHeight
        - (windowScrollTop + window.innerHeight)

      const containerRemaining = this.scrollContainer
        ? (
            this.scrollContainer.scrollHeight
            - (
                this.scrollContainer.scrollTop
                + this.scrollContainer.clientHeight
              )
          )
        : Number.POSITIVE_INFINITY

      if (
        windowRemaining < 260
        || containerRemaining < 260
      ) {
        this.loadUsers(false)
      }
    },

    setupInfiniteScroll() {
      if (!('IntersectionObserver' in window)) {
        return
      }

      if (this.scrollObserver) {
        this.scrollObserver.disconnect()
      }

      this.scrollObserver =
        new IntersectionObserver(
          (entries) => {
            const isVisible =
              entries.some(entry => entry.isIntersecting)

            if (isVisible) {
              this.loadUsers(false)
            }
          },
          {
            root: null,
            rootMargin: '320px 0px',
            threshold: 0
          }
        )

      this.observeScrollSentinel()
    },

    observeScrollSentinel() {
      if (
        !this.scrollObserver
        || !this.$refs.scrollSentinel
      ) {
        return
      }

      this.scrollObserver.disconnect()
      this.scrollObserver.observe(this.$refs.scrollSentinel)
    },

    /* 상세팝업 열기 */
    async openDetailModal(meetingMinutes) {
      this.openAnalyzeMenuMeetingMinutes = null

      this.selectedMeetingMinutes = meetingMinutes
      this.selectedMeetingSubject = meetingMinutes.subject || ''
      this.analysisResults = []
      this.analysisContent = ''
      this.fullscreenAnalysisContent = ''
      this.selectedAnalysisDate = ''

      if (this.isAnalyzeComplete(meetingMinutes)) {
        await this.loadAnalysisResults(meetingMinutes.fileId)
      }

      this.selectedAnalysisType = '전체'
      this.changeAnalysisType()
      this.showDetailModal = true
    },

    /* 상세팝업 닫기 */
    closeDetailModal() {
      this.showDetailModal = false
      this.showAnalysisFullscreen = false
    },

    async updateMeetingSubject() {
      const subject = String(this.selectedMeetingSubject || '').trim()

      if (!subject) {
        await showAlert(
          '입력 확인',
          '회의 주제를 입력해주세요.',
          'warning'
        )
        return
      }

      if (!this.selectedMeetingMinutes?.id) {
        return
      }

      this.savingSubject = true

      const result =
        await putApi(
          '/api/meeting-minutes/subject',
          {
            id: this.selectedMeetingMinutes.id,
            subject
          }
        )

      this.savingSubject = false

      if (!result.success) {
        await showError(
          '수정 실패',
          '회의 주제 수정 중 오류가 발생했습니다.',
          'error'
        )
        return
      }

      this.selectedMeetingMinutes.subject = subject
      const target =
        this.meetingMinutesUser.find(
          item => item.id === this.selectedMeetingMinutes.id
        )

      if (target) {
        target.subject = subject
      }

      await showAlert(
        '수정 완료',
        '회의 주제가 수정되었습니다.',
        'success'
      )
    },

    async loadAnalysisResults(fileId) {
      const result =
        await getApi(
          '/api/meeting-minutes/analysisResults',
          {
            fileId
          }
        )

      this.analysisResults =
        result.success && Array.isArray(result.data)
          ? result.data
          : []
    },

    changeAnalysisType() {
      if (this.selectedAnalysisType === '전체') {
        this.selectedAnalysisDate = this.getLatestAnalysisDate()
        this.analysisContent = this.getAllAnalysisContent()
        return
      }

      const selectedResult = this.getAnalysisResultByType(
        this.selectedAnalysisType
      )

      this.selectedAnalysisDate = selectedResult?.analyzedAt || ''
      this.analysisContent = selectedResult?.content || ''
    },

    getAnalysisResultByType(analysisType) {
      return this.analysisResults.find(
        result => (result.analysisTypeCode || result.analysisType) === analysisType
      )
    },

    getAllAnalysisContent() {
      if (this.analysisResults.length === 0) {
        return ''
      }

      return this.detailAnalysisTypes
        .filter(type => type.code !== '전체')
        .map(type => {
          const result = this.getAnalysisResultByType(type.code)

          if (!result?.content) {
            return ''
          }

          if (this.hasAnalysisTitle(result.content, type.name)) {
            return result.content
          }

          return '[' + type.name + ']\n\n' + result.content
        })
        .filter(Boolean)
        .join('\n\n')
    },

    hasAnalysisTitle(content, type) {
      const escapedType = type.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const titlePattern = new RegExp(
        '^\\s*(?:\\*\\*)?\\[' + escapedType + '\\](?:\\*\\*)?',
        'm'
      )

      return titlePattern.test(content || '')
    },

    getLatestAnalysisDate() {
      const dates =
        this.analysisResults
          .map(result => result.analyzedAt)
          .filter(Boolean)

      if (dates.length === 0) {
        return ''
      }

      return dates[dates.length - 1]
    },

    async copyAnalysisContent() {
      if (!this.isSelectedMeetingMinutesComplete) {
        return
      }

      try {
        await navigator.clipboard.writeText(this.analysisContent || '')
        await showAlert(
          '내용 복사성공하였습니다.',
          '',
          'success'
        )
      } catch (error) {
        await showError(
          '복사 실패',
          '내용 복사중 오류가 발생했습니다.',
          'error'
        )
      }
    },

    openAnalysisFullscreen() {
      if (!this.isSelectedMeetingMinutesComplete) {
        return
      }

      this.fullscreenAnalysisContent = this.analysisContent || ''
      this.showAnalysisFullscreen = true
    },

    closeAnalysisFullscreen() {
      this.showAnalysisFullscreen = false
    },

    async copyFullscreenAnalysisContent() {
      try {
        await navigator.clipboard.writeText(this.fullscreenAnalysisContent || '')
        await showAlert(
          '내용 복사성공하였습니다.',
          '',
          'success'
        )
      } catch (error) {
        await showError(
          '복사 실패',
          '내용 복사중 오류가 발생했습니다.',
          'error'
        )
      }
    },

    async updateFullscreenAnalysisContent() {
      this.analysisContent = this.fullscreenAnalysisContent || ''
      await this.updateAnalysisContent()
    },

    async updateAnalysisContent() {
      if (!this.isSelectedMeetingMinutesComplete) {
        return
      }

      if (this.selectedAnalysisType === '전체') {
        await showAlert(
          '수정 안내',
          '전체는 조회용입니다. 수정할 분석유형을 선택해주세요.',
          'info'
        )
        return
      }

      const result =
        await putApi(
          '/api/meeting-minutes/analysisResult',
          {
            fileId: this.selectedMeetingMinutes.fileId,
            analysisType: this.selectedAnalysisType,
            analysisTypeCode: this.selectedAnalysisType,
            content: this.analysisContent
          }
        )

      if (result.success) {
        const index =
          this.analysisResults.findIndex(
            item => (item.analysisTypeCode || item.analysisType) === (result.data.analysisTypeCode || result.data.analysisType)
          )

        if (index >= 0) {
          this.analysisResults.splice(index, 1, result.data)
        } else {
          this.analysisResults.push(result.data)
        }

        this.changeAnalysisType()

        await showAlert(
          '수정 완료',
          '수정되었습니다.',
          'success'
        )
      } else {
        await showError(
          '수정 실패',
          '수정중 오류가 발생했습니다.',
          'error'
        )
      }
    },

    /* 이미지 보기 */
    async loadImage(fileId) {
      const result =
        await getBlobApi(
          '/api/meeting-minutes/getDogImg',
          {
            fileId
          }
        )

      if (!result.success) {
        await showError(
          '파일 보기 실패',
          '파일을 불러오는 중 오류가 발생했습니다.',
          'error'
        )
        return
      }

      if (this.imageUrl) {
        window.URL.revokeObjectURL(this.imageUrl)
      }

      this.imageUrl = window.URL.createObjectURL(result.data)

      this.showImageModal = true
    },

    /* 분석 */
    async loadAnalyze(fileId, title, analysisType) {
      if (this.isFileAnalyzing(fileId)) {
        return
      }

      this.openAnalyzeMenuMeetingMinutes = null

      const checkResult = await getApi('/api/metting/analyze/check')

      if (!checkResult.success) {
        const message =
          checkResult.data?.message
          || checkResult.data
          || '분석 가능 여부 확인 중 오류가 발생했습니다.'

        this.setAnalyzeProgress(fileId, 0, 'FAIL', message)
        await showError('분석 실패', message, 'error')
        return
      }

      if (checkResult.data?.allowed === false) {
        const message =
          checkResult.data?.message
          || '무료 체험 횟수를 모두 사용하셨습니다.'

        this.setAnalyzeProgress(fileId, 0, 'FAIL', message)
        await showPremiumUpgradeConfirm(message)
        return
      }

      this.setAnalyzeProgress(
        fileId,
        10,
        'PROCESSING',
        '분석 요청을 시작했습니다.'
      )

      const result =
        await getApi(
          '/api/metting/analyze',
          {
            fileId: fileId,
            title: title,
            analysisType: analysisType
          }
        )
      if (result.success) {
        //this.meetingMinutesUser = result.data
        console.log(result.data)
        this.loaded = true
      } else {
        const message =
          result.data?.message
          || result.data
          || '분석중 오류가 발생했습니다.'

        this.setAnalyzeProgress(
          fileId,
          0,
          'FAIL',
          message
        )

        if (String(message).includes('무료 체험 횟수를 모두 사용하셨습니다')) {
          await showPremiumUpgradeConfirm(message)
          return
        }

        await showError(
          '분석 실패',
          message,
          'error'
        )
      }
    },

    async deleteMeetingMinutes(meetingMinutes) {
      const confirmResult =
        await showConfirm(
          '삭제 확인',
          '삭제하시겠습니까?'
        )

      if (!confirmResult.isConfirmed) {
        return
      }

      const result =
        await deleteApi(
          '/api/meeting-minutes/delete/' + meetingMinutes.id
        )

      if (result.success) {
        const progressMap = { ...this.analyzeProgressMap }
        delete progressMap[meetingMinutes.fileId]
        this.analyzeProgressMap = progressMap

        await this.loadUsers()

        await showAlert(
          '삭제 완료',
          '삭제되었습니다.',
          'success'
        )
      } else {
        await showError(
          '삭제 실패',
          '삭제중 오류가 발생했습니다.',
          'error'
        )
      }
    },

    /* 이미지 팝업 닫기 */
    closeImageModal() {
      this.showImageModal = false
      if (this.imageUrl) {
        window.URL.revokeObjectURL(this.imageUrl)
        this.imageUrl = ''
      }
    },

    /* 엑셀 다운로드 */
    async excelDownLoad() {
      try {
        this.loding = true
        await excelDownloadApi(
          '/api/meeting-minutes/excelDownload',
          {
            ...this.getSearchParams(false)
          },
          '회의분석목록.xlsx'
        )
      } finally {
        this.loding = false
      }
    },

    toggleAnalyzeMenu(meetingMinutes) {
      if (this.openAnalyzeMenuMeetingMinutes?.fileId === meetingMinutes.fileId) {
        this.openAnalyzeMenuMeetingMinutes = null
        return
      }

      this.openAnalyzeMenuMeetingMinutes = meetingMinutes
    },

    async selectAnalyzeType(analysisType) {
      const meetingMinutes = this.openAnalyzeMenuMeetingMinutes
      this.openAnalyzeMenuMeetingMinutes = null

      if (!meetingMinutes) {
        return
      }

      const confirmResult =
        await showConfirm(
          '분석요청',
          '"' + analysisType.name + '" 으로 분석요청하시겠습니까?'
        )

      if (!confirmResult.isConfirmed) {
        return
      }

      this.loadAnalyze(
        meetingMinutes.fileId,
        meetingMinutes.subject,
        analysisType.code
      )
    },

    connectAnalyzeWebSocket() {
      this.analyzeWebSocket =
        new WebSocket(
          getWebSocketUrl('/ws/stats')
        )

      this.analyzeWebSocket.onmessage =
        (event) => {
          this.handleAnalyzeProgressMessage(event)
        }

      this.analyzeWebSocket.onerror =
        (error) => {
          console.error('분석 웹소켓 오류', error)
        }
    },

    handleAnalyzeProgressMessage(event) {
      const data = JSON.parse(event.data)

      if (data.type !== 'ANALYZE_PROGRESS') {
        return
      }

      this.setAnalyzeProgress(
        data.fileId,
        data.progress,
        data.status,
        data.message
      )

      if (
        data.status === 'FAIL'
        && this.isLimitExceededMessage(data.message)
        && this.showDetailModal
        && String(this.selectedMeetingMinutes.fileId) === String(data.fileId)
      ) {
        showAlert(
          '분석 불가',
          '한도가 소진되어 분석이 불가합니다.',
          'warning'
        )
      }

      if (
        data.status === 'COMPLETE'
        && this.showDetailModal
        && String(this.selectedMeetingMinutes.fileId) === String(data.fileId)
      ) {
        this.loadAnalysisResults(data.fileId)
          .then(() => {
            this.changeAnalysisType()
          })
      }

      if (data.status === 'COMPLETE') {
        this.loadUsers(true)
      }
    },

    setAnalyzeProgress(fileId, progress, status, message = '') {
      const normalizedProgress =
        status === 'FAIL'
          ? 0
          : this.roundProgress(progress)

      this.analyzeProgressMap = {
        ...this.analyzeProgressMap,
        [fileId]: {
          progress: normalizedProgress,
          status,
          message
        }
      }
    },

    roundProgress(progress) {
      return Math.max(
        0,
        Math.min(
          100,
          Math.floor(Number(progress || 0) / 10) * 10
        )
      )
    },

    getAnalyzeInfo(meetingMinutes) {
      return this.analyzeProgressMap[meetingMinutes.fileId]
    },

    getAnalyzeProgress(meetingMinutes) {
      const info = this.getAnalyzeInfo(meetingMinutes)

      if (info) {
        if (info.status === 'FAIL') {
          return 0
        }

        return info.progress
      }

      if (meetingMinutes.analyzeStatus === 'FAIL') {
        return 0
      }

      if (meetingMinutes.analyzeStatus === 'COMPLETE') {
        return 100
      }

      return 0
    },

    getAnalyzeProgressText(meetingMinutes) {
      const info = this.getAnalyzeInfo(meetingMinutes)

      if (info?.status === 'FAIL') {
        return '분석실패'
      }

      if (
        info
        && info.status !== 'COMPLETE'
        && info.status !== 'FAIL'
      ) {
        return 'AI분석 중 ' + info.progress + '%'
      }

      if (info?.status === 'COMPLETE') {
        return '100%'
      }

      if (meetingMinutes.analyzeStatus === 'COMPLETE') {
        return '100%'
      }

      if (meetingMinutes.analyzeStatus === 'FAIL') {
        return '분석실패'
      }

      return '대기'
    },

    isAnalyzeFail(meetingMinutes) {
      const info = this.getAnalyzeInfo(meetingMinutes)

      return (
        info?.status === 'FAIL'
        || meetingMinutes.analyzeStatus === 'FAIL'
      )
    },

    isLimitExceededMessage(message = '') {
      return String(message).includes('한도가 소진되어 분석이 불가합니다.')
    },

    getAnalyzeFailMessage(meetingMinutes) {
      const info = this.getAnalyzeInfo(meetingMinutes)

      if (this.isLimitExceededMessage(info?.message)) {
        return '한도가 소진되어 분석이 불가합니다.'
      }

      if (info?.message) {
        return info.message
      }

      return '분석중 오류가 발생했습니다.'
    },

    isAnalyzing(meetingMinutes) {
      return this.isFileAnalyzing(meetingMinutes.fileId)
    },

    isAnalyzeComplete(meetingMinutes) {
      return this.getAnalyzeProgress(meetingMinutes) === 100
    },

    isFileAnalyzing(fileId) {
      const info = this.analyzeProgressMap[fileId]

      return (
        info
        && info.status !== 'COMPLETE'
        && info.status !== 'FAIL'
        && info.progress > 0
        && info.progress < 100
      )
    }
  },

  async mounted() {
    this.initializeSearchDates()
    await this.loadAnalysisTemplates()
    this.loadUsers(true)
    this.connectAnalyzeWebSocket()
    this.scrollContainer =
      document.querySelector('.content')

    window.addEventListener('scroll', this.handleWindowScroll, { passive: true })

    if (this.scrollContainer) {
      this.scrollContainer.addEventListener('scroll', this.handleWindowScroll, { passive: true })
    }

    this.setupInfiniteScroll()
  },

  beforeUnmount() {
    if (this.analyzeWebSocket) {
      this.analyzeWebSocket.close()
    }

    window.removeEventListener('scroll', this.handleWindowScroll)

    if (this.scrollContainer) {
      this.scrollContainer.removeEventListener('scroll', this.handleWindowScroll)
    }

    if (this.scrollObserver) {
      this.scrollObserver.disconnect()
    }
  }
}

</script>
