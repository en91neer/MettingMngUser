<template>
  <main class="code-manage">
    <section class="code-header">
      <div>
        <p class="app-page-kicker">COMMON CODE</p>
        <h1>코드관리</h1>
      </div>
      <span class="app-page-subtitle">
        서비스에서 사용하는 그룹코드와 개별코드를 관리합니다.
      </span>
    </section>

    <section class="code-grid">
      <section class="code-panel">
        <div class="code-panel-heading">
          <div>
            <div class="code-panel-title">그룹코드</div>
            <p>새 그룹코드는 등록하고, 선택한 그룹은 그룹명과 설명만 수정합니다.</p>
          </div>
          <button type="button" class="code-sub-btn code-stacked-btn" @click="newGroup">
            <span>그룹</span>
            <span>등록</span>
          </button>
        </div>

        <form class="code-form" @submit.prevent="saveGroup">
          <label>
            그룹코드
            <input
              v-model.trim="groupForm.groupCode"
              ref="groupCodeInput"
              type="text"
              placeholder="ANALYSIS_TYPE"
              :readonly="!!groupForm.id"
            />
          </label>

          <label>
            그룹명
            <input
              v-model.trim="groupForm.groupName"
              type="text"
              placeholder="분석 유형"
            />
          </label>

          <label>
            설명
            <input v-model.trim="groupForm.description" type="text" />
          </label>

          <label class="code-check">
            <input v-model="groupForm.active" type="checkbox" />
            <span>사용</span>
          </label>

          <div class="code-action-row">
            <button type="submit" class="code-save-btn">
              저장
            </button>
            <button
              type="button"
              class="code-delete-btn"
              :disabled="!groupForm.id"
              @click="deleteGroup"
            >
              삭제
            </button>
          </div>
        </form>

        <div class="code-list">
          <button
            v-for="group in groups"
            :key="group.id"
            type="button"
            class="code-list-item"
            :class="{ selected: selectedGroupCode === group.groupCode }"
            @click="selectGroup(group)"
          >
            <span>{{ group.groupName }}</span>
            <small>{{ group.groupCode }}</small>
            <em>{{ group.active ? '사용' : '미사용' }}</em>
          </button>
        </div>
      </section>

      <section class="code-panel">
        <div class="code-panel-heading">
          <div>
            <div class="code-panel-title">개별코드</div>
            <p>{{ selectedGroupCode || '그룹코드를 선택해주세요.' }}</p>
          </div>
          <button
            type="button"
            class="code-sub-btn"
            :disabled="!selectedGroupCode"
            @click="newItem"
          >
            개별코드 추가
          </button>
        </div>

        <form
          v-if="showItemEditor"
          class="code-form code-item-editor"
          @submit.prevent="saveItem"
        >
          <div class="code-detail-title">
            {{ itemForm.id ? '개별코드 상세' : '개별코드 등록' }}
          </div>

          <div class="code-form-row two">
            <label>
              그룹
              <select v-model="itemForm.groupCode" disabled>
                <option
                  v-for="group in groups"
                  :key="group.groupCode"
                  :value="group.groupCode"
                >
                  {{ group.groupName }} ({{ group.groupCode }})
                </option>
              </select>
            </label>

            <label>
              코드
              <input
                v-model.trim="itemForm.code"
                ref="itemCodeInput"
                type="text"
                placeholder="GENERAL_MEETING"
                :readonly="!!itemForm.id"
              />
            </label>
          </div>

          <div class="code-form-row two">
            <label>
              코드명
              <input
                v-model.trim="itemForm.codeName"
                ref="itemCodeNameInput"
                type="text"
                placeholder="일반회의"
              />
            </label>

            <label>
              정렬
              <input v-model.number="itemForm.sortOrder" type="number" min="0" />
            </label>
          </div>

          <label>
            설명
            <input v-model.trim="itemForm.description" type="text" />
          </label>

          <label class="code-check">
            <input v-model="itemForm.active" type="checkbox" />
            <span>사용</span>
          </label>

          <div class="code-action-row compact">
            <button type="submit" class="code-save-btn">
              저장
            </button>
            <button
              v-if="itemForm.id"
              type="button"
              class="code-delete-btn"
              @click="deleteItem(itemForm)"
            >
              삭제
            </button>
            <button type="button" class="code-cancel-btn" @click="closeItemEditor">
              닫기
            </button>
          </div>
        </form>

        <div class="code-table-wrap">
          <table class="code-table">
            <thead>
              <tr>
                <th>코드</th>
                <th>코드명</th>
                <th>설명</th>
                <th>정렬</th>
                <th>사용</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="items.length === 0">
                <td colspan="5" class="code-empty-row">
                  등록된 개별코드가 없습니다.
                </td>
              </tr>
              <tr
                v-for="item in items"
                :key="item.id"
                :class="{ selected: itemForm.id === item.id }"
                @click="selectItem(item)"
              >
                <td>{{ item.code }}</td>
                <td>{{ item.codeName }}</td>
                <td class="code-desc-cell">{{ item.description || '-' }}</td>
                <td>{{ item.sortOrder }}</td>
                <td>{{ item.active ? 'Y' : 'N' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </section>
  </main>
</template>

<script setup>
import {
  nextTick,
  onMounted,
  reactive,
  ref
} from 'vue'
import {
  deleteApi,
  getApi,
  postApi
} from '@/utils/api'
import {
  showAlert,
  showConfirm,
  showError
} from '@/utils/alert.js'
import '@/assets/css/views/CodeManage.css'

const groups = ref([])
const items = ref([])
const selectedGroupCode = ref('')
const showItemEditor = ref(false)
const groupCodeInput = ref(null)
const itemCodeInput = ref(null)
const itemCodeNameInput = ref(null)

const groupForm = reactive({
  id: null,
  groupCode: '',
  groupName: '',
  description: '',
  active: true
})

const itemForm = reactive({
  id: null,
  groupCode: '',
  code: '',
  codeName: '',
  description: '',
  sortOrder: 0,
  active: true
})

const loadGroups = async () => {
  const result = await getApi('/api/codes/groups')
  groups.value = result.success ? result.data || [] : []

  if (!selectedGroupCode.value && groups.value.length > 0) {
    await selectGroup(groups.value[0])
  }
}

const loadItems = async () => {
  if (!selectedGroupCode.value) {
    items.value = []
    return
  }

  const result = await getApi('/api/codes/' + selectedGroupCode.value + '/all')
  items.value = result.success ? result.data || [] : []
}

const selectGroup = async (group) => {
  Object.assign(groupForm, group)
  selectedGroupCode.value = group.groupCode
  closeItemEditor()
  await loadItems()
}

const newGroup = async () => {
  resetGroupForm()
  await focusElement(groupCodeInput)
}

const saveGroup = async () => {
  if (!groupForm.groupCode) {
    await showAlert('입력 확인', '그룹코드를 입력해주세요.', 'warning')
    await focusElement(groupCodeInput)
    return
  }

  if (!groupForm.groupName) {
    await showAlert('입력 확인', '그룹명을 입력해주세요.', 'warning')
    return
  }

  const confirmResult = await showConfirm(
    groupForm.id ? '그룹코드 저장' : '그룹코드 등록',
    '그룹코드 정보를 저장하시겠습니까?'
  )

  if (!confirmResult.isConfirmed) {
    return
  }

  try {
    const saved = await postApi('/api/codes/groups', { ...groupForm })
    selectedGroupCode.value = saved.groupCode
    await loadGroups()
    const target = groups.value.find(group => group.groupCode === saved.groupCode)
    if (target) {
      await selectGroup(target)
    }
    await showAlert('저장 완료', '그룹코드가 저장되었습니다.', 'success')
  } catch (error) {
    await showError('저장 실패', getErrorMessage(error, '그룹코드 저장 중 오류가 발생했습니다.'), 'error')
  }
}

const deleteGroup = async () => {
  if (!groupForm.id) {
    return
  }

  const confirmResult = await showConfirm(
    '그룹코드 삭제',
    '그룹코드를 삭제하면 하위 개별코드도 함께 삭제됩니다. 삭제하시겠습니까?'
  )

  if (!confirmResult.isConfirmed) {
    return
  }

  const result = await deleteApi('/api/codes/groups/' + groupForm.id)

  if (result.success) {
    resetGroupForm()
    await loadGroups()
    await showAlert('삭제 완료', '그룹코드가 삭제되었습니다.', 'success')
    return
  }

  await showError('삭제 실패', '그룹코드 삭제 중 오류가 발생했습니다.', 'error')
}

const resetGroupForm = () => {
  Object.assign(groupForm, {
    id: null,
    groupCode: '',
    groupName: '',
    description: '',
    active: true
  })
  selectedGroupCode.value = ''
  items.value = []
  closeItemEditor()
}

const newItem = async () => {
  if (!selectedGroupCode.value) {
    await showAlert('그룹코드 선택', '개별코드를 추가할 그룹코드를 먼저 선택해주세요.', 'warning')
    return
  }

  resetItemForm()
  showItemEditor.value = true
  await focusElement(itemCodeInput)
}

const selectItem = async (item) => {
  Object.assign(itemForm, item)
  showItemEditor.value = true
  await focusElement(itemCodeNameInput)
}

const saveItem = async () => {
  if (!itemForm.code) {
    await showAlert('입력 확인', '코드를 입력해주세요.', 'warning')
    await focusElement(itemCodeInput)
    return
  }

  if (!itemForm.codeName) {
    await showAlert('입력 확인', '코드명을 입력해주세요.', 'warning')
    await focusElement(itemCodeNameInput)
    return
  }

  const confirmResult = await showConfirm(
    itemForm.id ? '개별코드 수정' : '개별코드 등록',
    '개별코드 정보를 저장하시겠습니까?'
  )

  if (!confirmResult.isConfirmed) {
    return
  }

  try {
    await postApi('/api/codes/items', { ...itemForm })
    await loadItems()
    closeItemEditor()
    await showAlert('저장 완료', '개별코드가 저장되었습니다.', 'success')
  } catch (error) {
    await showError('저장 실패', getErrorMessage(error, '개별코드 저장 중 오류가 발생했습니다.'), 'error')
  }
}

const deleteItem = async (item) => {
  if (!item?.id) {
    return
  }

  const confirmResult = await showConfirm(
    '개별코드 삭제',
    '개별코드를 삭제하시겠습니까?'
  )

  if (!confirmResult.isConfirmed) {
    return
  }

  const result = await deleteApi('/api/codes/items/' + item.id)

  if (result.success) {
    await loadItems()
    if (itemForm.id === item.id) {
      closeItemEditor()
    }
    await showAlert('삭제 완료', '개별코드가 삭제되었습니다.', 'success')
    return
  }

  await showError('삭제 실패', '개별코드 삭제 중 오류가 발생했습니다.', 'error')
}

const resetItemForm = () => {
  Object.assign(itemForm, {
    id: null,
    groupCode: selectedGroupCode.value,
    code: '',
    codeName: '',
    description: '',
    sortOrder: 0,
    active: true
  })
}

const closeItemEditor = () => {
  resetItemForm()
  showItemEditor.value = false
}

const getErrorMessage = (error, fallback) => {
  return error?.response?.data?.message
    || error?.response?.data
    || fallback
}

const focusElement = async (targetRef) => {
  await nextTick()
  targetRef.value?.focus()
}

onMounted(async () => {
  await loadGroups()
})
</script>
