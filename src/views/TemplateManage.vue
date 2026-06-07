<template>
  <main class="template-manage">
    <section class="template-header">
      <div>
        <p class="app-page-kicker">PROMPT TEMPLATE</p>
        <h1>템플릿 관리</h1>
      </div>
      <span class="app-page-subtitle">
        분석 유형별 모델과 프롬프트를 관리합니다.
      </span>
      <button type="button" class="template-new-btn" @click="resetTemplateForm">
        신규
      </button>
    </section>

    <section class="template-grid">
      <div class="template-panel">
        <div class="template-panel-title">등록된 템플릿</div>
        <div class="template-list">
          <button
            v-for="template in templates"
            :key="template.id"
            type="button"
            class="template-list-item"
            :class="{ selected: form.id === template.id }"
            @click="selectTemplate(template)"
          >
            <span>{{ template.templateName }}</span>
            <small>{{ template.analysisTypeCode }} / {{ template.modelType }}</small>
          </button>
        </div>
      </div>

      <form class="template-editor" @submit.prevent="saveTemplate">
        <div class="template-form-row two">
          <label>
            템플릿 구분
            <select v-model="form.templateCategoryCode" @change="handleTemplateCategoryChange">
              <option
                v-for="category in templateCategories"
                :key="category.code"
                :value="category.code"
              >
                {{ category.codeName }}
              </option>
            </select>
          </label>

          <label>
            분석유형
            <select v-model="form.analysisTypeCode" @change="syncTemplateName">
              <option value="">선택</option>
              <option
                v-for="type in filteredAnalysisTypes"
                :key="type.code"
                :value="type.code"
              >
                {{ type.codeName }} ({{ type.code }})
              </option>
            </select>
          </label>
        </div>

        <div class="template-form-row two">
          <label>
            템플릿명
            <input v-model="form.templateName" type="text" readonly />
          </label>
        </div>

        <div class="template-form-row four">
          <label>
            분석모델 타입
            <select v-model="form.modelType">
              <option
                v-for="model in modelTypes"
                :key="model.code"
                :value="model.code"
              >
                {{ model.codeName }}
              </option>
            </select>
          </label>

          <label>
            정렬
            <input v-model.number="form.sortOrder" type="number" min="0" />
          </label>

          <label class="template-check">
            <input v-model="form.active" type="checkbox" />
            <span>사용</span>
          </label>

          <label class="template-check">
            <input v-model="form.speakerAnalysisEnabled" type="checkbox" />
            <span>화자분석</span>
          </label>
        </div>

        <label class="template-prompt">
          <span>System Prompt</span>
          <small>
            AI의 역할과 답변 규칙을 정하는 관리자 지시문입니다. 예: 회의록 작성자 역할, 출력 형식, 금지 규칙.
          </small>
          <div class="template-variable-help">
            <span><strong>{title}</strong> 회의 제목</span>
            <span><strong>{analysisType}</strong> 분석유형명</span>
            <span><strong>{transcript}</strong> 화자분리 전사문</span>
          </div>
          <textarea v-model="form.systemPromptTemplate" rows="12"></textarea>
        </label>

        <label class="template-prompt template-prompt-separated">
          <span>User Prompt</span>
          <small>
            실제 회의 데이터와 함께 AI에게 전달되는 요청문입니다. 아래 치환값을 넣으면 분석 시 실제 값으로 바뀝니다.
          </small>
          <div class="template-variable-help">
            <span><strong>{title}</strong> 회의 제목</span>
            <span><strong>{analysisType}</strong> 분석유형명</span>
            <span><strong>{transcript}</strong> 화자분리 전사문</span>
          </div>
          <textarea v-model="form.userPromptTemplate" rows="12"></textarea>
        </label>

        <div class="template-actions">
          <button type="submit" class="template-save-btn">
            저장
          </button>
          <button
            type="button"
            class="template-delete-btn"
            :disabled="!form.id"
            @click="deleteTemplate"
          >
            삭제
          </button>
        </div>
      </form>
    </section>

  </main>
</template>

<script setup>
import {
  computed,
  onMounted,
  reactive,
  ref,
  watch
} from 'vue'
import {
  getApi,
  postApi,
  deleteApi
} from '@/utils/api'
import {
  showAlert,
  showConfirm,
  showError
} from '@/utils/alert.js'
import '@/assets/css/views/TemplateManage.css'

const templates = ref([])
const analysisTypes = ref([])
const templateCategories = ref([])
const modelTypes = ref([])
const CATEGORY_ANALYSIS_SUMMARY = 'ANALYSIS_SUMMARY'
const CATEGORY_SPEAKER_SEPARATION = 'SPEAKER_SEPARATION'
const ANALYSIS_TYPE_SPEAKER_SEPARATION = 'SPEAKER_SEPARATION'
const SUMMARY_ANALYSIS_TYPE_CODES = new Set([
  'GENERAL_MEETING',
  'DEV_MEETING',
  'CONSULTING_MEETING'
])
const allowedPromptVariables = new Set([
  'title',
  'analysisType',
  'transcript'
])

const form = reactive({
  id: null,
  analysisTypeCode: '',
  templateCategoryCode: 'ANALYSIS_SUMMARY',
  templateName: '',
  modelType: 'gpt-4.1-mini',
  systemPromptTemplate: '',
  userPromptTemplate: '',
  speakerAnalysisEnabled: true,
  sortOrder: 0,
  active: true
})

const filteredAnalysisTypes = computed(() => {
  if (form.templateCategoryCode === CATEGORY_SPEAKER_SEPARATION) {
    return analysisTypes.value.filter(type => type.code === ANALYSIS_TYPE_SPEAKER_SEPARATION)
  }

  return analysisTypes.value.filter(type => SUMMARY_ANALYSIS_TYPE_CODES.has(type.code))
})

const loadTemplates = async () => {
  const result = await getApi('/api/templates')
  templates.value = result.success ? result.data || [] : []
  selectDefaultTemplate()
}

const selectDefaultTemplate = () => {
  if (templates.value.length === 0) {
    resetTemplateForm()
    return
  }

  const selectedTemplate = templates.value.find(template => template.id === form.id)

  if (selectedTemplate) {
    selectTemplate(selectedTemplate)
    return
  }

  selectTemplate(templates.value[0])
}

const loadCodes = async () => {
  const [
    analysisResult,
    categoryResult,
    modelResult
  ] = await Promise.all([
    getApi('/api/codes/ANALYSIS_TYPE'),
    getApi('/api/codes/TEMPLATE_CATEGORY'),
    getApi('/api/codes/AI_MODEL_TYPE')
  ])

  analysisTypes.value = analysisResult.success ? analysisResult.data || [] : []
  templateCategories.value = categoryResult.success ? categoryResult.data || [] : []
  modelTypes.value = modelResult.success ? modelResult.data || [] : []
}

const syncTemplateName = () => {
  const selected = analysisTypes.value.find(type => type.code === form.analysisTypeCode)
  form.templateName = selected?.codeName || ''
}

const handleTemplateCategoryChange = () => {
  const hasCurrentType = filteredAnalysisTypes.value
    .some(type => type.code === form.analysisTypeCode)

  if (!hasCurrentType) {
    form.analysisTypeCode =
      form.templateCategoryCode === CATEGORY_SPEAKER_SEPARATION
        ? ANALYSIS_TYPE_SPEAKER_SEPARATION
        : ''
  }

  syncTemplateName()
}

const selectTemplate = (template) => {
  Object.assign(form, {
    id: template.id,
    analysisTypeCode: template.analysisTypeCode,
    templateCategoryCode: template.templateCategoryCode || 'ANALYSIS_SUMMARY',
    templateName: template.templateName,
    modelType: template.modelType,
    systemPromptTemplate: template.systemPromptTemplate || '',
    userPromptTemplate: template.userPromptTemplate || '',
    speakerAnalysisEnabled: template.speakerAnalysisEnabled !== false,
    sortOrder: template.sortOrder,
    active: template.active
  })
}

const resetTemplateForm = () => {
  Object.assign(form, {
    id: null,
    analysisTypeCode: '',
    templateCategoryCode: templateCategories.value[0]?.code || CATEGORY_ANALYSIS_SUMMARY,
    templateName: '',
    modelType: modelTypes.value[0]?.code || 'gpt-4.1-mini',
    systemPromptTemplate: '',
    userPromptTemplate: '',
    speakerAnalysisEnabled: true,
    sortOrder: 0,
    active: true
  })
}

const deleteTemplate = async () => {
  if (!form.id) {
    return
  }

  const confirmResult = await showConfirm('템플릿 삭제', '선택한 템플릿을 삭제하시겠습니까?')

  if (!confirmResult.isConfirmed) {
    return
  }

  const result = await deleteApi('/api/templates/' + form.id)

  if (result.success) {
    await loadTemplates()
    await showAlert('삭제 완료', '템플릿이 삭제되었습니다.', 'success')
    return
  }

  await showError('삭제 실패', '템플릿 삭제 중 오류가 발생했습니다.', 'error')
}

const saveTemplate = async () => {
  try {
    const duplicateMessage = getDuplicateTemplateMessage()

    if (duplicateMessage) {
      await showError('저장 실패', duplicateMessage, 'error')
      return
    }

    syncTemplateName()
    const invalidVariables = getInvalidPromptVariables([
      form.systemPromptTemplate,
      form.userPromptTemplate
    ])

    if (invalidVariables.length > 0) {
      await showError(
        '저장 실패',
        `사용할 수 없는 치환값입니다: ${invalidVariables.join(', ')}`,
        'error'
      )
      return
    }

    await postApi('/api/templates', { ...form })
    await loadTemplates()
    await showAlert('저장 완료', '템플릿이 저장되었습니다.', 'success')
  } catch (error) {
    const message =
      error?.response?.data?.message
      || error?.response?.data
      || '템플릿 저장 중 오류가 발생했습니다.'
    await showError('저장 실패', message, 'error')
  }
}

const getDuplicateTemplateMessage = () => {
  const sameCategoryTemplates = templates.value.filter(template =>
    template.id !== form.id
    && (template.templateCategoryCode || CATEGORY_ANALYSIS_SUMMARY) === form.templateCategoryCode
  )

  if (
    form.templateCategoryCode === CATEGORY_SPEAKER_SEPARATION
    && sameCategoryTemplates.length > 0
  ) {
    return '화자분리 템플릿은 한 개만 등록할 수 있습니다.'
  }

  const hasDuplicateAnalysisType = sameCategoryTemplates
    .some(template => template.analysisTypeCode === form.analysisTypeCode)

  if (hasDuplicateAnalysisType) {
    return '이미 등록된 분석유형입니다.'
  }

  return ''
}

const getInvalidPromptVariables = (prompts) => {
  const invalidVariables = new Set()
  const variablePattern = /\{([^{}]+)\}/g

  prompts.forEach(prompt => {
    const text = prompt || ''
    for (const match of text.matchAll(variablePattern)) {
      const variableName = match[1]
      if (!allowedPromptVariables.has(variableName)) {
        invalidVariables.add(`{${variableName}}`)
      }
    }
  })

  return Array.from(invalidVariables).sort()
}

onMounted(async () => {
  await loadCodes()
  await loadTemplates()
})

watch(
  () => form.templateCategoryCode,
  () => {
    handleTemplateCategoryChange()
  }
)
</script>
