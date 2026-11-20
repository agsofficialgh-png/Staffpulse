<template>
  <div class="hr-records-page">
    <DashboardTopbar v-model="search" :placeholder="`Search ${moduleDefinition.title.toLowerCase()}...`" />
    <main class="page-content">
      <header class="page-heading">
        <div>
          <p class="eyebrow"><span></span> HR WORKSPACE <span class="separator">/</span> {{ moduleDefinition.workbookSheet.toUpperCase() }}</p>
          <h1>{{ moduleDefinition.title }}</h1>
          <p class="intro">{{ moduleDefinition.description }}</p>
        </div>
        <button class="primary-button" type="button" @click="startNewRecord">+ Add record</button>
      </header>

      <div class="privacy-notice">
        <span aria-hidden="true">ⓘ</span>
        HR records are held in memory for this prototype and clear when the page reloads. Connect secure storage and authentication before using live personnel data.
      </div>

      <section v-if="showForm" class="panel form-panel">
        <div class="form-heading">
          <div><h2>{{ editingId ? `Edit ${moduleDefinition.title} record` : `Add ${moduleDefinition.title} record` }}</h2><p>Workbook sheet: {{ moduleDefinition.workbookSheet }}</p></div>
          <button class="close-button" type="button" aria-label="Close form" @click="cancelForm">×</button>
        </div>
        <form class="record-form" @submit.prevent="saveRecord">
          <label v-for="field in moduleDefinition.fields" :key="field.key" class="field" :class="{ 'wide-field': field.type === 'textarea' }">
            <span>{{ field.label }}<b v-if="field.required"> *</b></span>
            <input
              v-if="field.readOnly"
              :id="`hr-${field.key}`"
              :value="field.key === 'variance' ? variancePreview : form[field.key] ?? ''"
              readonly
            />
            <textarea
              v-else-if="field.type === 'textarea'"
              :id="`hr-${field.key}`"
              v-model="form[field.key]"
              rows="2"
              :required="field.required"
            ></textarea>
            <select
              v-else-if="field.type === 'select'"
              :id="`hr-${field.key}`"
              v-model="form[field.key]"
              :required="field.required"
            >
              <option value="">Select...</option>
              <option v-for="option in field.options" :key="option" :value="option">{{ option }}</option>
            </select>
            <input
              v-else
              :id="`hr-${field.key}`"
              v-model="form[field.key]"
              :type="field.type"
              :required="field.required"
              :step="field.type === 'number' ? 'any' : undefined"
            />
          </label>
          <div class="form-actions">
            <button class="secondary-button" type="button" @click="cancelForm">Cancel</button>
            <button class="primary-button" type="submit">{{ editingId ? 'Save changes' : 'Add record' }}</button>
          </div>
        </form>
      </section>

      <section class="panel records-panel">
        <div class="records-heading">
          <div><h2>{{ moduleDefinition.workbookSheet }} records</h2><p>{{ visibleRecords.length }} shown · {{ records.length }} in this session</p></div>
          <label class="filter-box">
            <span class="sr-only">Filter records</span>
            <input v-model="search" type="search" :placeholder="`Filter ${moduleDefinition.title.toLowerCase()}...`" />
          </label>
        </div>

        <div v-if="visibleRecords.length" class="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th v-for="field in moduleDefinition.fields" :key="field.key" scope="col">{{ field.label }}</th>
                <th scope="col"><span class="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in visibleRecords" :key="record.id">
                <th scope="row" class="record-id">{{ record.id }}</th>
                <td v-for="field in moduleDefinition.fields" :key="field.key" :class="{ 'long-value': field.type === 'textarea' }">
                  <span v-if="field.key === 'status'" :class="['status-badge', statusClass(record[field.key] ?? '')]">{{ record[field.key] || '—' }}</span>
                  <span v-else>{{ record[field.key] || '—' }}</span>
                </td>
                <td class="row-actions">
                  <button type="button" :aria-label="`Edit ${record.id}`" @click="editRecord(record)">Edit</button>
                  <button class="delete-button" type="button" :aria-label="`Delete ${record.id}`" @click="removeRecord(record.id)">×</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="empty-state">
          <strong>{{ search ? 'No matching records' : `No ${moduleDefinition.title.toLowerCase()} records yet` }}</strong>
          <span>{{ search ? 'Try another search.' : 'Add a record to start filling this workbook section.' }}</span>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import DashboardTopbar from '../components/DashboardTopbar.vue'
import { hrModules, type HrModule } from '../data/hrModules'
import { addHrRecord, deleteHrRecord, getHrRecords, updateHrRecord, type HrRecord } from '../stores/hrWorkspace'

const props = defineProps<{ module: HrModule }>()
const search = ref('')
const showForm = ref(false)
const editingId = ref<string | null>(null)
const form = reactive<Record<string, string>>({})

const moduleDefinition = computed(() => hrModules[props.module])
const records = computed(() => getHrRecords(props.module))
const visibleRecords = computed(() => {
  const query = search.value.trim().toLocaleLowerCase()
  if (!query) return records.value
  return records.value.filter((record) =>
    Object.values(record).some((value) => value.toLocaleLowerCase().includes(query)),
  )
})

const variancePreview = computed(() => {
  const actual = Number(form.actual)
  const target = Number(form.target)
  if (form.actual === '' || form.target === '' || !Number.isFinite(actual) || !Number.isFinite(target)) return ''
  return String(Number((actual - target).toFixed(4)))
})

watch(
  () => props.module,
  () => {
    search.value = ''
    cancelForm()
  },
  { immediate: true },
)

function resetForm() {
  for (const field of moduleDefinition.value.fields) form[field.key] = ''
}

function startNewRecord() {
  editingId.value = null
  resetForm()
  showForm.value = true
}

function editRecord(record: HrRecord) {
  resetForm()
  for (const field of moduleDefinition.value.fields) form[field.key] = record[field.key] ?? ''
  editingId.value = record.id
  showForm.value = true
}

function cancelForm() {
  showForm.value = false
  editingId.value = null
  resetForm()
}

function saveRecord() {
  const values: Record<string, string> = {}
  for (const field of moduleDefinition.value.fields) {
    if (!field.readOnly) values[field.key] = String(form[field.key] ?? '').trim()
  }

  if (editingId.value) updateHrRecord(props.module, editingId.value, values)
  else addHrRecord(props.module, values)
  cancelForm()
}

function removeRecord(id: string) {
  if (window.confirm(`Delete ${id} from ${moduleDefinition.value.title}?`)) {
    deleteHrRecord(props.module, id)
  }
}

function statusClass(status: string) {
  const normalized = status.toLocaleLowerCase()
  if (['completed', 'active', 'on track', 'current', 'resolved', 'submitted'].includes(normalized)) return 'positive'
  if (['open', 'at risk', 'review due', 'in progress', 'pending', 'planned'].includes(normalized)) return 'pending'
  if (['off track', 'expired', 'exited', 'cancelled'].includes(normalized)) return 'negative'
  return 'neutral'
}
</script>

<style scoped>
.hr-records-page {
  min-height: 100vh;
  background: #f5f7fc;
  color: #17283a;
}

.page-content {
  display: grid;
  max-width: 1600px;
  align-content: start;
  gap: 14px;
  margin: 0 auto;
  padding: 20px 26px 30px;
}

.page-heading,
.form-heading,
.records-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.eyebrow {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #07875d;
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.eyebrow > span:first-child {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #0cba83;
}

.separator { color: #a0aab6; }

h1 {
  margin-top: 4px;
  color: #15283b;
  font-size: 1.4375rem;
  font-weight: 700;
}

h2 {
  color: #1d3043;
  font-size: 0.9375rem;
  font-weight: 700;
}

.intro,
.form-heading p,
.records-heading p {
  margin-top: 4px;
  color: #6d7b8a;
  font-size: 0.8125rem;
}

.primary-button,
.secondary-button {
  display: inline-flex;
  min-height: 31px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 0;
  border-radius: 5px;
  padding: 0 11px;
  cursor: pointer;
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
  white-space: nowrap;
}

.primary-button { background: #0bb984; color: #fff; }
.primary-button:hover { background: #079f73; }
.secondary-button { background: #eff3fb; color: #506075; }
.secondary-button:hover { background: #e4eaf5; }

.privacy-notice {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  border: 1px solid #f1dfb2;
  border-radius: 6px;
  padding: 9px 11px;
  background: #fff9eb;
  color: #775a20;
  font-size: 0.8125rem;
  line-height: 1.5;
}

.privacy-notice > span {
  color: #b38325;
  font-size: 0.875rem;
  line-height: 1;
}

.panel {
  min-width: 0;
  border: 1px solid #edf0f6;
  border-radius: 9px;
  padding: 14px;
  background: #fff;
  box-shadow: 0 2px 6px rgb(23 39 55 / 3%);
}

.close-button {
  width: 25px;
  height: 25px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: #738092;
  cursor: pointer;
  font-size: 1.125rem;
}

.record-form {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 13px;
}

.field {
  display: grid;
  align-content: start;
  gap: 4px;
  color: #4b5c6e;
  font-size: 0.8125rem;
  font-weight: 600;
}

.field > span b { color: #d34a4a; }

.field input,
.field select,
.field textarea {
  width: 100%;
  min-width: 0;
  min-height: 31px;
  border: 1px solid #dfe6f0;
  border-radius: 5px;
  padding: 6px 8px;
  background: #f8faff;
  color: #25384a;
  font: inherit;
  font-size: 0.8125rem;
}

.field textarea {
  min-height: 48px;
  resize: vertical;
}

.field input:focus,
.field select:focus,
.field textarea:focus,
.filter-box input:focus {
  border-color: #0bb984;
  outline: 2px solid rgb(11 185 132 / 16%);
}

.wide-field { grid-column: span 2; }

.form-actions {
  display: flex;
  align-items: end;
  justify-content: flex-end;
  gap: 7px;
  grid-column: 1 / -1;
}

.records-panel { padding-bottom: 4px; }

.filter-box input {
  width: 210px;
  height: 30px;
  border: 1px solid #e0e6f0;
  border-radius: 5px;
  padding: 0 8px;
  font: inherit;
  font-size: 0.8125rem;
}

.table-wrap {
  margin: 13px -14px 0;
  overflow: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  white-space: nowrap;
}

thead { background: #f0f4fc; }

th,
td {
  padding: 9px 8px;
  border-bottom: 1px solid #eef1f6;
  color: #4b5c6e;
  font-size: 0.8125rem;
  vertical-align: middle;
}

thead th {
  color: #627285;
  font-size: 0.8125rem;
  font-weight: 700;
}

.record-id {
  color: #087c5a;
  font-weight: 700;
}

.long-value {
  max-width: 210px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-badge {
  display: inline-block;
  border-radius: 999px;
  padding: 3px 7px;
  font-size: 0.8125rem;
  font-weight: 600;
}

.status-badge.positive { background: #e2f8ef; color: #087c5a; }
.status-badge.pending { background: #fff5e7; color: #956719; }
.status-badge.negative { background: #fff0ef; color: #bd4141; }
.status-badge.neutral { background: #edf2fb; color: #596e94; }

.row-actions {
  display: flex;
  align-items: center;
  gap: 5px;
}

.row-actions button {
  border: 0;
  border-radius: 4px;
  padding: 4px 6px;
  background: #edf7f3;
  color: #087c5a;
  cursor: pointer;
  font: inherit;
  font-size: 0.8125rem;
}

.row-actions .delete-button {
  width: 22px;
  height: 22px;
  padding: 0;
  background: transparent;
  color: #8995a2;
  font-size: 0.9375rem;
}

.row-actions .delete-button:hover { background: #fff0ef; color: #bd4141; }

.empty-state {
  display: grid;
  gap: 5px;
  justify-items: center;
  padding: 34px 12px;
  color: #788697;
  font-size: 0.8125rem;
  text-align: center;
}

.empty-state strong {
  color: #26394b;
  font-size: 0.875rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  clip-path: inset(50%);
}

@media (max-width: 900px) {
  .page-content { padding-right: 18px; padding-left: 18px; }
  .record-form { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 560px) {
  .page-content { padding: 15px 13px 22px; }
  .page-heading,
  .records-heading { align-items: flex-start; flex-direction: column; }
  .record-form { grid-template-columns: 1fr 1fr; }
  .wide-field { grid-column: span 2; }
  .filter-box,
  .filter-box input { width: 100%; }
  .panel { padding: 11px; }
  .table-wrap { margin-right: -11px; margin-left: -11px; }
}
</style>
