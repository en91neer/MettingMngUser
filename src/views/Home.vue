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
        <div class="home-search-field home-search-subject">
          <label>회의주제</label>
          <input
            v-model="subjectSearch"
            @keyup.enter="loadUsers(true)"
            placeholder="회의 주제 입력"
          />
        </div>

        <div class="home-search-field">
          <label>등록시작일</label>
          <input type="date" v-model="startDateSearch" />
        </div>

        <div class="home-search-field">
          <label>등록종료일</label>
          <input type="date" v-model="endDateSearch" />
        </div>

        <div class="home-search-field">
          <label>분석유형</label>
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

      <!-- 테이블 -->
      <div class="table-wrapper">
        <table v-if="meetingMinutesUser.length > 0" class="user-table home-user-table">
          <colgroup>
            <col class="home-col-analyze" />
            <col class="home-col-title" />
            <col class="home-col-date" />
            <col class="home-col-date" />
            <col class="home-col-delete" />
          </colgroup>
          <thead>
            <tr>
              <th>분석요청</th>
              <th>회의주제</th>
              <th>요청날짜</th>
              <th>등록날짜</th>
              <th>삭제</th>
              <!-- <th>첨부이미지</th> -->
            </tr>
          </thead>

          <tbody>
            <tr v-for="meetingMinutes in meetingMinutesUser" :key="meetingMinutes.id" @click="openDetailModal(meetingMinutes)">
              <td>
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
                <div
                  v-if="meetingMinutes.fileId && meetingMinutes.fileId !== '0'"
                  class="analyze-inline-progress"
                >
                  <span class="analyze-inline-progress-text">
                    {{ getAnalyzeProgress(meetingMinutes) }}%
                  </span>
                  <div class="analyze-inline-progress-bar">
                    <div
                      class="analyze-inline-progress-fill"
                      :style="{ width: getAnalyzeProgress(meetingMinutes) + '%' }"
                    ></div>
                  </div>
                </div>
              </td>
              <td>
                <span class="home-table-title" :title="meetingMinutes.subject">
                  {{ getShortMeetingTitle(meetingMinutes.subject) }}
                </span>
              </td>
              <td>
                {{ meetingMinutes.createdAt }}
              </td>
              <td>
                {{ meetingMinutes.meetingDate }}
              </td>
              <td>
                <button
                  type="button"
                  class="delete-action-btn"
                  @click.stop.prevent="deleteMeetingMinutes(meetingMinutes)"
                >
                  삭제
                </button>
              </td>
              <!-- <td>
                <a v-if="meetingMinutes.fileId && meetingMinutes.fileId !== '0'" href="#" class="image-link"
                  @click.stop.prevent="loadImage(meetingMinutes.fileId)">
                  이미지
                </a>
              </td> -->
            </tr>
          </tbody>
        </table>
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
      <h3>
        분석 상세 정보
      </h3>

      <!-- 회의 주제 -->
      <div class="form-group">
        <label>
          회의 주제
        </label>
        <input type="text" :value="selectedMeetingMinutes.subject" readonly />
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
        <textarea
          class="message-textarea"
          v-model="analysisContent"
          rows="30"
        ></textarea>
      </div>

      <div class="detail-action-row">
        <button
          class="copy-btn"
          :disabled="!isSelectedMeetingMinutesComplete"
          @click="copyAnalysisContent"
        >
          복사
        </button>
        <button
          class="confirm-btn"
          :disabled="!isSelectedMeetingMinutesComplete"
          @click="updateAnalysisContent"
        >
          수정
        </button>
        <button class="cancel-btn" @click="closeDetailModal">
          닫기
        </button>
      </div>
    </div>
  </div>

  <!-- 이미지 모달 -->
  <div v-if="showImageModal" class="image-modal" @click="closeImageModal">
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
      v-if="openAnalyzeMenuMeetingMinutes"
      class="analyze-menu"
      :style="{
        top: analyzeMenuPosition.top + 'px',
        left: analyzeMenuPosition.left + 'px'
      }"
      @click.stop
    >
      <button
        v-for="type in analyzeTypes"
        :key="type.code"
        type="button"
        class="analyze-menu-item"
        @click.stop.prevent="selectAnalyzeType(type)"
      >
        {{ type.name }}
      </button>
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
  excelDownloadApi
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
      analysisTemplates: [],
      detailAnalysisTypes: [
        { code: '전체', name: '전체' }
      ],
      selectedAnalysisType: '전체',
      selectedAnalysisDate: '',
      analysisResults: [],
      analysisContent: '',
      subjectSearch: '',
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
      analyzeMenuPosition: {
        top: 0,
        left: 0
      },
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
        subject: this.subjectSearch,
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
      this.analysisResults = []
      this.analysisContent = ''
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

    toggleAnalyzeMenu(meetingMinutes, event) {
      if (this.openAnalyzeMenuMeetingMinutes?.fileId === meetingMinutes.fileId) {
        this.openAnalyzeMenuMeetingMinutes = null
        return
      }

      const rect = event.currentTarget.getBoundingClientRect()
      const menuHeight = 210
      const gap = 8
      const hasBottomSpace =
        window.innerHeight - rect.bottom > menuHeight + gap

      this.analyzeMenuPosition = {
        top: hasBottomSpace
          ? rect.bottom + gap
          : Math.max(gap, rect.top - menuHeight - gap),
        left: rect.left + (rect.width / 2)
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
      const protocol =
        window.location.protocol === 'https:'
          ? 'wss://'
          : 'ws://'

      this.analyzeWebSocket =
        new WebSocket(
          protocol
          + window.location.host
          + '/ws/stats'
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

    getShortMeetingTitle(title) {
      if (!title) {
        return ''
      }

      return title.length > 20
        ? title.slice(0, 20) + '...'
        : title
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
