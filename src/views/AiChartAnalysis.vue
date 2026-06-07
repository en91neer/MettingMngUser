<template>
  <div class="ai-chart-page">
    <div class="app-page-title">
      <div>
        <p class="app-page-kicker">AI CHART ANALYSIS</p>
        <h1>AI차트분석</h1>
      </div>
      <span class="app-page-subtitle">
        화자별 발언률을 확인하고 화자명을 정리합니다.
      </span>
    </div>

    <section class="ai-chart-toolbar">
      <div class="ai-chart-field">
        <label>전사문 파일</label>
        <select v-model="selectedFileId" @change="selectTranscript">
          <option value="">선택</option>
          <option
            v-for="item in transcriptItems"
            :key="item.fileId"
            :value="item.fileId"
          >
            {{ item.subject }} / 파일ID {{ item.fileId }}
          </option>
        </select>
      </div>

      <div class="ai-chart-options">
        <label class="ai-chart-option">
          <input
            v-model="visibleCharts.speaker"
            type="checkbox"
            @change="ensureChartSelection('speaker')"
          />
          <span>화자별 발언률</span>
        </label>
        <label class="ai-chart-option">
          <input
            v-model="visibleCharts.repeatedWords"
            type="checkbox"
            @change="ensureChartSelection('repeatedWords')"
          />
          <span>반복단어사용률</span>
        </label>
      </div>
    </section>

    <section v-if="!selectedItem" class="ai-chart-empty">
      화자분리 전사문이 있는 회의를 선택해주세요.
    </section>

    <section v-else class="ai-chart-grid">
      <div v-if="visibleCharts.speaker" class="ai-chart-panel">
        <div class="ai-chart-panel-title ai-chart-panel-title-row">
          <span>화자별 발언률</span>
          <button
            type="button"
            class="ai-chart-save-btn"
            :disabled="!selectedItem || saving"
            @click="saveTranscript"
          >
            저장
          </button>
        </div>

        <div v-if="speakerStats.length === 0" class="ai-chart-empty-inline">
          화자 발언을 찾을 수 없습니다.
        </div>

        <div v-else class="ai-chart-bars">
          <div
            v-for="speaker in speakerStats"
            :key="speaker.originalName"
            class="ai-chart-bar-row"
          >
            <div class="ai-chart-speaker-edit">
              <input
                v-model="speakerNames[speaker.originalName]"
                :aria-label="speaker.originalName + ' 이름'"
              />
            </div>

            <div class="ai-chart-bar-track">
              <div
                class="ai-chart-bar-fill"
                :style="{ width: speaker.percent + '%' }"
              ></div>
            </div>

            <div class="ai-chart-percent">
              {{ speaker.percent }}%
            </div>
          </div>
        </div>
      </div>

      <div v-if="visibleCharts.repeatedWords" class="ai-chart-panel">
        <div class="ai-chart-panel-title">
          반복단어사용률
        </div>

        <div v-if="repeatedWordStats.length === 0" class="ai-chart-empty-inline">
          반복해서 사용된 단어를 찾을 수 없습니다.
        </div>

        <div v-else class="ai-chart-bars">
          <div
            v-for="word in repeatedWordStats"
            :key="word.text"
            class="ai-chart-bar-row ai-chart-word-row"
          >
            <div class="ai-chart-word-label">
              {{ word.text }}
            </div>

            <div class="ai-chart-bar-track">
              <div
                class="ai-chart-bar-fill ai-chart-word-fill"
                :style="{ width: word.barPercent + '%' }"
              ></div>
            </div>

            <div class="ai-chart-percent ai-chart-word-percent">
              {{ word.percent }}% · {{ word.count }}회
            </div>
          </div>
        </div>
      </div>

      <div class="ai-chart-panel">
        <div class="ai-chart-panel-title">
          전사문 미리보기
        </div>

        <textarea
          v-model="transcriptContent"
          class="ai-chart-transcript"
          readonly
          @click="openTranscriptModal"
        ></textarea>
      </div>
    </section>

    <teleport to="body">
      <div
        v-if="showTranscriptModal"
        class="transcript-fullscreen"
        @click.self="closeTranscriptModal"
      >
        <div class="transcript-fullscreen-panel">
          <button
            type="button"
            class="popup-close-btn"
            aria-label="팝업 닫기"
            @click="closeTranscriptModal"
          >
            ×
          </button>

          <div class="transcript-fullscreen-head">
            <strong>전사문 전체보기</strong>
            <div class="transcript-fullscreen-actions">
              <button type="button" @click="copyTranscriptContent">
                복사하기
              </button>
            </div>
          </div>
          <textarea
            v-model="transcriptContent"
            class="transcript-fullscreen-text"
            readonly
          ></textarea>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script>
import {
  showAlert,
  showError
} from '@/utils/alert.js'
import {
  getApi,
  putApi
} from '@/utils/api'
import '@/assets/css/views/AiChartAnalysis.css'

export default {
  name: 'AiChartAnalysis',
  data() {
    return {
      meetingMinutesList: [],
      selectedFileId: '',
      selectedItem: null,
      transcriptContent: '',
      speakerNames: {},
      saving: false,
      showTranscriptModal: false,
      visibleCharts: {
        speaker: true,
        repeatedWords: false
      }
    }
  },
  computed: {
    transcriptItems() {
      return this.meetingMinutesList.filter(
        item => item.fileId && item.fileId !== '0' && item.transcript
      )
    },

    speakerStats() {
      const stats = this.extractSpeakerStats(this.transcriptContent)
      const total = stats.reduce((sum, item) => sum + item.amount, 0)

      if (total === 0) {
        return []
      }

      return stats.map(item => ({
        ...item,
        percent: Math.round((item.amount / total) * 100)
      }))
    },

    repeatedWordStats() {
      const words = this.extractWords(this.transcriptContent)
      const total = words.length

      if (total === 0) {
        return []
      }

      const wordMap = new Map()

      words.forEach(word => {
        wordMap.set(word, (wordMap.get(word) || 0) + 1)
      })

      const repeatedWords =
        Array.from(wordMap.entries())
          .filter(([, count]) => count > 1)
          .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
          .slice(0, 12)

      const maxCount =
        repeatedWords.reduce(
          (max, [, count]) => Math.max(max, count),
          0
        )

      return repeatedWords.map(([text, count]) => ({
        text,
        count,
        percent: Math.round((count / total) * 100),
        barPercent: Math.max(6, Math.round((count / maxCount) * 100))
      }))
    }
  },
  methods: {
    ensureChartSelection(chartName) {
      if (
        this.visibleCharts.speaker
        || this.visibleCharts.repeatedWords
      ) {
        return
      }

      this.visibleCharts[chartName] = true
    },

    async loadTranscripts() {
      const result =
        await getApi('/api/meeting-minutes/list')

      this.meetingMinutesList =
        result.success && Array.isArray(result.data)
          ? result.data
          : []

      if (!result.success) {
        await showError(
          '조회 실패',
          '전사문 목록을 불러오는 중 오류가 발생했습니다.',
          'error'
        )
      }
    },

    selectTranscript() {
      this.selectedItem =
        this.transcriptItems.find(
          item => String(item.fileId) === String(this.selectedFileId)
        ) || null

      this.transcriptContent = this.selectedItem?.transcript || ''
      this.initializeSpeakerNames()
    },

    initializeSpeakerNames() {
      const speakerNames = {}

      this.extractSpeakerStats(this.transcriptContent).forEach(speaker => {
        speakerNames[speaker.originalName] = speaker.originalName
      })

      this.speakerNames = speakerNames
    },

    extractSpeakerStats(content) {
      const speakerMap = new Map()
      const lines = String(content || '').split(/\r?\n/)

      lines.forEach(line => {
        const match = line.match(/^([^:\n]{1,40})\s*:\s*(.*)$/)

        if (!match) {
          return
        }

        const speakerName = match[1].trim()
        const speech = match[2].trim()

        if (!speakerName || !speech) {
          return
        }

        speakerMap.set(
          speakerName,
          (speakerMap.get(speakerName) || 0) + speech.length
        )
      })

      return Array.from(speakerMap.entries())
        .map(([originalName, amount]) => ({
          originalName,
          amount
        }))
        .sort((a, b) => b.amount - a.amount)
    },

    extractWords(content) {
      const stopWords = new Set([
        '그리고',
        '그런데',
        '그래서',
        '그러면',
        '하지만',
        '회의',
        '내용',
        '부분',
        '관련',
        '오늘',
        '저희',
        '제가',
        '우리',
        '이것',
        '저것',
        '그것',
        '합니다',
        '했습니다',
        '있습니다',
        '됩니다',
        '있고',
        '없는',
        '있는',
        'the',
        'and',
        'for',
        'you',
        'that',
        'this',
        'with',
        'from'
      ])

      return String(content || '')
        .replace(/^([^:\n]{1,40})\s*:\s*/gm, ' ')
        .toLowerCase()
        .match(/[가-힣a-z0-9]{2,}/g)
        ?.filter(word => !stopWords.has(word))
        || []
    },

    getUpdatedTranscript() {
      return String(this.transcriptContent || '')
        .split(/\r?\n/)
        .map(line => {
          const match = line.match(/^([^:\n]{1,40})(\s*:\s*.*)$/)

          if (!match) {
            return line
          }

          const originalName = match[1].trim()
          const nextName =
            (this.speakerNames[originalName] || originalName).trim()

          return nextName + match[2]
        })
        .join('\n')
    },

    async saveTranscript() {
      if (!this.selectedItem) {
        return
      }

      this.saving = true

      const updatedTranscript = this.getUpdatedTranscript()
      const result =
        await putApi(
          '/api/meeting-minutes/transcript',
          {
            fileId: this.selectedItem.fileId,
            content: updatedTranscript
          }
        )

      this.saving = false

      if (!result.success) {
        await showError(
          '저장 실패',
          '화자명 저장 중 오류가 발생했습니다.',
          'error'
        )
        return
      }

      this.transcriptContent = updatedTranscript
      this.selectedItem.transcript = updatedTranscript
      this.initializeSpeakerNames()

      await showAlert(
        '저장 완료',
        '화자명이 전사문 파일에 반영되었습니다.',
        'success'
      )
    },

    openTranscriptModal() {
      if (!this.selectedItem) {
        return
      }

      this.showTranscriptModal = true
    },

    closeTranscriptModal() {
      this.showTranscriptModal = false
    },

    async copyTranscriptContent() {
      try {
        await navigator.clipboard.writeText(this.transcriptContent || '')
        await showAlert(
          '복사 완료',
          '전사문이 복사되었습니다.',
          'success'
        )
      } catch (error) {
        await showError(
          '복사 실패',
          '전사문 복사 중 오류가 발생했습니다.',
          'error'
        )
      }
    }
  },
  mounted() {
    this.loadTranscripts()
  }
}
</script>
