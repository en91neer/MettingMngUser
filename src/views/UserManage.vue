<template>
  <main class="user-manage">
    <section class="user-manage-header">
      <div>
        <p class="app-page-kicker">USER ADMIN</p>
        <h1>사용자 관리</h1>
      </div>
      <span class="app-page-subtitle">
        가입자 권한, 사용 가능 템플릿, 도입문의 이력을 관리합니다.
      </span>
    </section>

    <section class="user-manage-panel">
      <div class="user-manage-panel-title">가입자 권한 및 사용가능 템플릿체크</div>
      <div class="user-table-wrap">
        <table class="user-table">
          <thead>
            <tr>
              <th>이름</th>
              <th>이메일</th>
              <th>상태</th>
              <th>권한</th>
              <th>사용가능 템플릿체크</th>
              <th>저장</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="users.length === 0">
              <td colspan="6" class="user-empty-row">
                등록된 가입자가 없습니다.
              </td>
            </tr>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>{{ getStatusName(user.statusCode) }}</td>
              <td>
                <select v-model="user.roleCode">
                  <option
                    v-for="role in roles"
                    :key="role.code"
                    :value="role.code"
                  >
                    {{ role.codeName }}
                  </option>
                </select>
              </td>
              <td>
                <div class="template-permission-list">
                  <label
                    v-for="type in templatePermissionTypes"
                    :key="type.code"
                    class="template-permission"
                  >
                    <input
                      type="checkbox"
                      :value="type.code"
                      v-model="user.allowedTemplateCodes"
                    />
                    <span>{{ type.codeName }}</span>
                  </label>
                </div>
              </td>
              <td>
                <button type="button" class="user-save-btn" @click="saveUserSettings(user)">
                  저장
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="user-manage-panel">
      <div class="user-manage-panel-title">도입문의 이력</div>
      <div class="user-table-wrap">
        <table class="user-table">
          <thead>
            <tr>
              <th>성함</th>
              <th>이메일</th>
              <th>전화번호</th>
              <th>문의내용</th>
              <th>문의일시</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="implementationInquiries.length === 0">
              <td colspan="5" class="user-empty-row">
                등록된 도입문의가 없습니다.
              </td>
            </tr>
            <tr
              v-for="inquiry in implementationInquiries"
              :key="inquiry.id"
            >
              <td>{{ inquiry.customerName }}</td>
              <td>{{ inquiry.email }}</td>
              <td>{{ inquiry.phoneNumber }}</td>
              <td class="inquiry-content">{{ inquiry.inquiryContent }}</td>
              <td>{{ formatDateTime(inquiry.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </main>
</template>

<script setup>
import {
  onBeforeUnmount,
  onMounted,
  ref
} from 'vue'
import {
  getApi,
  postApi
} from '@/utils/api'
import {
  showAlert,
  showError
} from '@/utils/alert.js'
import '@/assets/css/views/UserManage.css'

const users = ref([])
const roles = ref([])
const templates = ref([])
const templatePermissionTypes = ref([])
const implementationInquiries = ref([])

const loadUsers = async () => {
  const result = await getApi('/api/admin/users')
  const allTemplateCodes = templatePermissionTypes.value.map(type => type.code)
  const validTemplateCodes = new Set(allTemplateCodes)

  users.value = result.success
    ? (result.data || []).map(user => {
        const savedTemplateCodes = user.allowedTemplateCodes || []

        return {
          ...user,
          allowedTemplateCodes: savedTemplateCodes.length > 0
            ? savedTemplateCodes.filter(code => validTemplateCodes.has(code))
            : [...allTemplateCodes]
        }
      })
    : []
}

const loadTemplates = async () => {
  const result = await getApi('/api/templates')
  templates.value = result.success ? result.data || [] : []
  syncTemplatePermissionTypes()
}

const loadImplementationInquiries = async () => {
  const result = await getApi('/api/implementation-inquiries')
  implementationInquiries.value = result.success ? result.data || [] : []
}

const loadCodes = async () => {
  const result = await getApi('/api/codes/USER_ROLE')
  roles.value = result.success ? result.data || [] : []
}

const syncTemplatePermissionTypes = () => {
  const activeSummaryTemplates = templates.value.filter(template =>
    template.active
    && (template.templateCategoryCode || 'ANALYSIS_SUMMARY') === 'ANALYSIS_SUMMARY'
    && template.analysisTypeCode !== 'SPEAKER_SEPARATION'
  )

  templatePermissionTypes.value = activeSummaryTemplates.map(template => ({
    code: template.analysisTypeCode,
    codeName: template.templateName
  }))
}

const saveUserSettings = async (user) => {
  try {
    const validTemplateCodes = new Set(templatePermissionTypes.value.map(type => type.code))
    const allowedTemplateCodes = (user.allowedTemplateCodes || [])
      .filter(code => validTemplateCodes.has(code))

    await postApi('/api/admin/users/approve', {
      userId: user.id,
      roleCode: user.roleCode
    })
    await postApi('/api/admin/users/template-permissions', {
      userEmail: user.email,
      analysisTypeCodes: allowedTemplateCodes
    })
    await loadUsers()
    await showAlert('저장 완료', '사용자 설정이 저장되었습니다.', 'success')
  } catch (error) {
    await showError('저장 실패', '사용자 설정 저장 중 오류가 발생했습니다.', 'error')
  }
}

const getStatusName = (statusCode) => {
  if (statusCode === 'ACTIVE') {
    return '정상'
  }

  if (statusCode === 'SUSPENDED') {
    return '중지'
  }

  return '승인대기'
}

const formatDateTime = (value) => {
  if (!value) {
    return '-'
  }

  return String(value).replace('T', ' ').substring(0, 16)
}

const handleInquiryCreated = () => {
  loadImplementationInquiries()
}

onMounted(async () => {
  await Promise.all([
    loadCodes(),
    loadTemplates()
  ])
  await Promise.all([
    loadUsers(),
    loadImplementationInquiries()
  ])
  window.addEventListener('implementation-inquiry-created', handleInquiryCreated)
})

onBeforeUnmount(() => {
  window.removeEventListener('implementation-inquiry-created', handleInquiryCreated)
})
</script>
