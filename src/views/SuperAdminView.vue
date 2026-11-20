<template>
  <div class="admin-page">
    <DashboardTopbar v-model="search" placeholder="Search KPI, role, or task..." />
    <main class="page-content">
      <header class="page-heading">
        <div>
          <p class="eyebrow"><span></span> WORKSPACE MANAGEMENT</p>
          <h1>Super Admin CMS</h1>
          <p class="intro">Assign accounts, configure dashboard access, and review every role workspace.</p>
          <div class="heading-tags">
            <span>{{ accountRows.length }} accounts</span>
            <span>{{ roleOptions.length }} roles</span>
            <span>{{ tasks.length }} logged tasks</span>
          </div>
        </div>
        <button class="export-button" type="button" @click="exportReport">
          <span aria-hidden="true">↓</span> Export KPI report
        </button>
      </header>

      <section class="management-grid" aria-label="Workspace management">
        <article class="panel management-panel">
          <div class="panel-heading">
            <div><h2>Account assignments</h2><p>Choose the workspace role assigned to each demo account.</p></div>
            <span class="management-count">{{ accountRows.length }}</span>
          </div>
          <form class="assignment-form" @submit.prevent="addAccount">
            <label>
              <span>New @ags email</span>
              <input v-model.trim="newAccountEmail" type="text" placeholder="name@ags" required />
            </label>
            <label>
              <span>Assign role</span>
              <select v-model="newAccountRole">
                <option v-for="role in roleOptions" :key="role.id" :value="role.id">{{ role.label }}</option>
              </select>
            </label>
            <button type="submit">Add account</button>
          </form>
          <p v-if="assignmentMessage" class="management-message" role="status">{{ assignmentMessage }}</p>
          <div class="management-table-wrap">
            <table class="management-table">
              <thead><tr><th scope="col">Email</th><th scope="col">Assigned role</th></tr></thead>
              <tbody>
                <tr v-for="account in accountRows" :key="account.email">
                  <td>{{ account.email }}<small v-if="account.email === 'super@ags'">Primary admin account</small></td>
                  <td>
                    <select
                      :aria-label="`Role for ${account.email}`"
                      :value="account.role"
                      :disabled="account.email === 'super@ags'"
                      @change="changeAccountRole(account.email, $event)"
                    >
                      <option v-for="role in roleOptions" :key="role.id" :value="role.id">{{ role.label }}</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <article class="panel management-panel permissions-panel">
          <div class="panel-heading">
            <div><h2>Dashboard permissions</h2><p>Choose which pages each role can open.</p></div>
          </div>
          <label class="permission-role">
            <span>Role to manage</span>
            <select v-model="permissionRole">
              <option v-for="role in manageableRoles" :key="role.id" :value="role.id">{{ role.label }}</option>
            </select>
          </label>
          <p class="permissions-note">Profile and Settings stay available to every signed-in role. Super Admin access is reserved.</p>
          <div class="permission-list">
            <label v-for="permission in routePermissions" :key="permission.name" class="permission-item">
              <input
                type="checkbox"
                :checked="selectedRolePermissions.has(permission.name)"
                @change="togglePermission(permission.name, $event)"
              />
              <span><strong>{{ permission.label }}</strong><small>{{ permission.group }}</small></span>
            </label>
          </div>
        </article>

        <article class="panel management-panel role-overview-panel">
          <div class="panel-heading">
            <div><h2>All role workspaces</h2><p>View each dashboard and its current account assignment count.</p></div>
          </div>
          <div class="role-overview-grid">
            <article v-for="role in roleCards" :key="role.id" class="role-overview-card">
              <div>
                <h3>{{ role.label }}</h3>
                <p>{{ role.accountCount }} assigned account{{ role.accountCount === 1 ? '' : 's' }}</p>
              </div>
              <span class="role-access-count">{{ role.id === 'super-admin' ? 'Full access' : `${role.permissionCount} pages` }}</span>
              <RouterLink :to="role.home">View workspace <span aria-hidden="true">→</span></RouterLink>
            </article>
          </div>
        </article>
      </section>

      <section class="summary-grid" aria-label="KPI and operations summary">
        <article class="summary-card">
          <div class="summary-top"><span>Role KPIs</span><span class="summary-icon green">▤</span></div>
          <strong>{{ kpiDefinitions.length }}</strong>
          <small>Across four workbook roles</small>
        </article>
        <article class="summary-card">
          <div class="summary-top"><span>{{ selectedMonth }} actuals entered</span><span class="summary-icon blue">◷</span></div>
          <strong>{{ enteredKpiActualCount(selectedMonth) }}<small> / {{ kpiDefinitions.length }}</small></strong>
          <small>Monthly KPI tracker progress</small>
        </article>
        <article class="summary-card">
          <div class="summary-top"><span>Blocked tasks</span><span class="summary-icon red">!</span></div>
          <strong>{{ blockedTasks.length }}</strong>
          <small>Raise these at the weekly meeting</small>
        </article>
        <article class="summary-card">
          <div class="summary-top"><span>Overdue tasks</span><span class="summary-icon amber">⌛</span></div>
          <strong>{{ overdueTasks.length }}</strong>
          <small>Open tasks past their due date</small>
        </article>
      </section>

      <section class="workspace-grid">
        <article class="panel kpi-panel">
          <div class="panel-heading">
            <div><h2>KPI tracker {{ currentYear }}</h2><p>Set annual targets and record actual results for each month.</p></div>
            <label class="month-picker">
              <span>Actual month</span>
              <select v-model="selectedMonth">
                <option v-for="month in kpiMonths" :key="month" :value="month">{{ month }}</option>
              </select>
            </label>
          </div>

          <nav class="role-filters" aria-label="Filter KPIs by role">
            <button
              v-for="role in roleFilters"
              :key="role"
              type="button"
              :class="{ active: selectedRole === role }"
              @click="selectedRole = role"
            >
              {{ role }} <span>{{ role === 'All roles' ? kpiDefinitions.length : countForRole(role) }}</span>
            </button>
          </nav>

          <div v-if="visibleKpis.length" class="kpi-table-wrap">
            <table class="kpi-table">
              <thead>
                <tr>
                  <th scope="col">Role / KPI</th>
                  <th scope="col">Frequency &amp; measurement</th>
                  <th scope="col">Annual target</th>
                  <th scope="col">{{ selectedMonth }} actual</th>
                  <th scope="col">Total / latest</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="kpi in visibleKpis" :key="kpi.id">
                  <td class="kpi-name-cell">
                    <span class="role-label">{{ kpi.role }}</span>
                    <strong>{{ kpi.name }}</strong>
                  </td>
                  <td class="measurement-cell">
                    <span>{{ kpi.frequency }}</span>
                    <small>{{ kpi.measurement }}</small>
                  </td>
                  <td>
                    <label class="sr-only" :for="`target-${kpi.id}`">Annual target for {{ kpi.name }}</label>
                    <input
                      :id="`target-${kpi.id}`"
                      class="number-input"
                      type="number"
                      min="0"
                      step="any"
                      :value="annualTarget(kpi.id)"
                      placeholder="Set target"
                      @change="updateAnnualTarget(kpi.id, inputValue($event))"
                    />
                  </td>
                  <td>
                    <label class="sr-only" :for="`actual-${kpi.id}`">{{ selectedMonth }} actual for {{ kpi.name }}</label>
                    <input
                      :id="`actual-${kpi.id}`"
                      class="number-input actual-input"
                      type="number"
                      min="0"
                      step="any"
                      :value="monthlyActual(kpi.id, selectedMonth)"
                      placeholder="Enter"
                      @change="updateMonthlyActual(kpi.id, selectedMonth, inputValue($event))"
                    />
                  </td>
                  <td class="rollup-cell">{{ kpiRollup(kpi) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="empty-note">No KPIs match your search.</p>
        </article>

        <aside class="right-column">
          <section class="panel role-summary">
            <div class="panel-heading">
              <div><h2>Task status by role</h2><p>Live from the Task Log</p></div>
            </div>
            <ul>
              <li v-for="summary in taskSummaries" :key="summary.role">
                <span>{{ summary.role }}</span>
                <span class="role-counts">
                  <b>{{ summary.open }} open</b>
                  <b v-if="summary.blocked" class="blocked-text">{{ summary.blocked }} blocked</b>
                </span>
              </li>
            </ul>
          </section>

          <section class="panel review-panel">
            <div class="panel-heading">
              <div><h2>Needs review</h2><p>Blocked and overdue work</p></div>
              <span class="review-count">{{ reviewTasks.length }}</span>
            </div>
            <ul v-if="reviewTasks.length" class="review-list">
              <li v-for="task in reviewTasks.slice(0, 6)" :key="task.id">
                <span :class="['review-dot', isOverdue(task) ? 'red' : 'amber']"></span>
                <div><strong>{{ task.task }}</strong><small>{{ task.ownerRole }} · {{ task.id }}</small></div>
                <span class="review-tag">{{ isOverdue(task) ? 'Overdue' : 'Blocked' }}</span>
              </li>
            </ul>
            <p v-else class="empty-note">No blocked or overdue tasks.</p>
          </section>
        </aside>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import DashboardTopbar from '../components/DashboardTopbar.vue'
import { isOverdue, taskRoles, tasks } from '../stores/taskLog'
import {
  accountAssignments,
  addAccountAssignment,
  getRolePermissions,
  roleOptions,
  routePermissions,
  setAccountRole,
  setRolePermissions,
  type UserRole,
} from '../stores/session'
import {
  annualTarget,
  enteredKpiActualCount,
  kpiDefinitions,
  kpiMonths,
  kpiRollup,
  monthlyActual,
  updateAnnualTarget,
  updateMonthlyActual,
  type KpiDefinition,
} from '../stores/kpiTracker'

const search = ref('')
const selectedRole = ref('All roles')
const selectedMonth = ref(kpiMonths[new Date().getMonth()] ?? 'Jan')
const currentYear = 2027
const roleFilters = ['All roles', ...taskRoles]
const manageableRoles = roleOptions.filter((role) => role.id !== 'super-admin')
const permissionRole = ref<UserRole>('operations-lead')
const newAccountEmail = ref('')
const newAccountRole = ref<UserRole>('operations-lead')
const assignmentMessage = ref('')

const accountRows = computed(() =>
  Object.entries(accountAssignments.value)
    .map(([email, role]) => ({ email, role }))
    .sort((a, b) => a.email.localeCompare(b.email)),
)

const selectedRolePermissions = computed(() => new Set(getRolePermissions(permissionRole.value)))

const roleCards = computed(() =>
  roleOptions.map((role) => ({
    ...role,
    accountCount: accountRows.value.filter((account) => account.role === role.id).length,
    permissionCount: getRolePermissions(role.id).length,
  })),
)

function addAccount() {
  const email = newAccountEmail.value.trim().toLocaleLowerCase()
  if (!/^[^@\s]+@ags$/.test(email)) {
    assignmentMessage.value = 'Enter an account email using the @ags demo domain.'
    return
  }
  if (accountAssignments.value[email]) {
    assignmentMessage.value = 'That email is already assigned. Change its role in the account list.'
    return
  }

  addAccountAssignment(email, newAccountRole.value)
  assignmentMessage.value = `${email} was added as ${roleOptions.find((role) => role.id === newAccountRole.value)?.label}.`
  newAccountEmail.value = ''
}

function changeAccountRole(email: string, event: Event) {
  const nextRole = roleOptions.find((role) => role.id === (event.target as HTMLSelectElement).value)
  if (!nextRole) throw new Error('Select a valid StaffPulse role.')

  setAccountRole(email, nextRole.id)
  assignmentMessage.value = `${email} is now assigned to ${nextRole.label}.`
}

function togglePermission(permission: string, event: Event) {
  const nextPermissions = new Set(getRolePermissions(permissionRole.value))
  if ((event.target as HTMLInputElement).checked) nextPermissions.add(permission)
  else nextPermissions.delete(permission)

  setRolePermissions(permissionRole.value, [...nextPermissions])
}

const visibleKpis = computed(() => {
  const query = search.value.trim().toLocaleLowerCase()
  return kpiDefinitions.filter((kpi) => {
    const matchesRole = selectedRole.value === 'All roles' || kpi.role === selectedRole.value
    const matchesSearch = !query || [kpi.role, kpi.name, kpi.measurement, kpi.frequency]
      .some((value) => value.toLocaleLowerCase().includes(query))
    return matchesRole && matchesSearch
  })
})

const blockedTasks = computed(() => tasks.filter((task) => task.status === 'Blocked'))
const overdueTasks = computed(() => tasks.filter((task) => isOverdue(task)))
const reviewTasks = computed(() =>
  tasks
    .filter((task) => task.status === 'Blocked' || isOverdue(task))
    .sort((a, b) => Number(isOverdue(b)) - Number(isOverdue(a))),
)

const taskSummaries = computed(() =>
  taskRoles.map((role) => {
    const roleTasks = tasks.filter((task) => task.ownerRole === role)
    return {
      role,
      open: roleTasks.filter((task) => task.status !== 'Done').length,
      blocked: roleTasks.filter((task) => task.status === 'Blocked').length,
    }
  }),
)

function countForRole(role: string) {
  return kpiDefinitions.filter((kpi) => kpi.role === role).length
}

function inputValue(event: Event) {
  return (event.target as HTMLInputElement).value
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`
}

function exportReport() {
  const headers = ['Role', 'KPI', 'How measured', 'Frequency', 'Annual target', ...kpiMonths, 'Total / latest']
  const rows = visibleKpis.value.map((kpi: KpiDefinition) => [
    kpi.role,
    kpi.name,
    kpi.measurement,
    kpi.frequency,
    annualTarget(kpi.id),
    ...kpiMonths.map((month) => monthlyActual(kpi.id, month)),
    kpiRollup(kpi),
  ])
  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `staffpulse-kpi-tracker-${currentYear}.csv`
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: #f5f7fc;
  color: #17283a;
}

.page-content {
  display: grid;
  max-width: 1600px;
  align-content: start;
  gap: 16px;
  margin: 0 auto;
  padding: 21px 26px 30px;
}

.page-heading,
.panel-heading {
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

.eyebrow span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #0cba83;
}

h1 {
  margin-top: 4px;
  color: #15283b;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.3px;
}

h2 {
  color: #1d3043;
  font-size: 0.9375rem;
  font-weight: 700;
}

.intro,
.panel-heading p {
  margin-top: 4px;
  color: #6a7888;
  font-size: 0.8125rem;
}

.heading-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.heading-tags span {
  border-radius: 999px;
  padding: 4px 8px;
  background: #e4fbf2;
  color: #087c5a;
  font-size: 0.8125rem;
  font-weight: 600;
}

.export-button {
  display: inline-flex;
  min-height: 31px;
  align-items: center;
  gap: 6px;
  border: 0;
  border-radius: 5px;
  padding: 0 11px;
  background: #eaf0ff;
  color: #354c6d;
  cursor: pointer;
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
}

.export-button:hover { background: #dce6fc; }

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 11px;
}

.management-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: start;
  gap: 12px;
}

.management-panel {
  display: grid;
  gap: 13px;
}

.management-count,
.role-access-count {
  border-radius: 999px;
  padding: 4px 8px;
  background: #e4fbf2;
  color: #087c5a;
  font-size: 0.8125rem;
  font-weight: 700;
  white-space: nowrap;
}

.assignment-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
  align-items: end;
  gap: 8px;
}

.assignment-form label,
.permission-role {
  display: grid;
  min-width: 0;
  gap: 5px;
  color: #647381;
  font-size: 0.8125rem;
  font-weight: 600;
}

.assignment-form input,
.assignment-form select,
.permission-role select,
.management-table select {
  width: 100%;
  min-width: 0;
  height: 31px;
  border: 1px solid #dfe6f0;
  border-radius: 5px;
  padding: 0 8px;
  background: #fff;
  color: #24374a;
  font: inherit;
  font-size: 0.8125rem;
}

.assignment-form button {
  min-height: 31px;
  border: 0;
  border-radius: 5px;
  padding: 0 10px;
  background: #0bb984;
  color: #fff;
  cursor: pointer;
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
  white-space: nowrap;
}

.management-message {
  margin: 0;
  color: #087c5a;
  font-size: 0.8125rem;
}

.management-table-wrap {
  max-height: 245px;
  overflow: auto;
}

.management-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.management-table th,
.management-table td {
  border-bottom: 1px solid #eef1f6;
  padding: 7px 5px;
  color: #4b5c6e;
  font-size: 0.8125rem;
}

.management-table th {
  position: sticky;
  top: 0;
  background: #f0f4fc;
  color: #627285;
  text-transform: uppercase;
}

.management-table td small {
  display: block;
  margin-top: 3px;
  color: #087c5a;
  font-size: 0.8125rem;
}

.management-table select:disabled {
  background: #f4f6fa;
  color: #788697;
}

.permission-role {
  max-width: 280px;
}

.permissions-note {
  margin: 0;
  color: #788697;
  font-size: 0.8125rem;
  line-height: 1.5;
}

.permission-list {
  display: grid;
  max-height: 365px;
  gap: 2px;
  overflow-y: auto;
}

.permission-item {
  display: flex;
  align-items: center;
  gap: 8px;
  border-top: 1px solid #f0f2f6;
  padding: 7px 3px;
  cursor: pointer;
}

.permission-item input {
  accent-color: #0bb984;
}

.permission-item strong,
.permission-item small {
  display: block;
}

.permission-item strong {
  color: #33475b;
  font-size: 0.8125rem;
  font-weight: 600;
}

.permission-item small {
  margin-top: 2px;
  color: #788697;
  font-size: 0.8125rem;
}

.role-overview-panel {
  grid-column: 1 / -1;
}

.role-overview-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.role-overview-card {
  display: grid;
  gap: 9px;
  border: 1px solid #edf0f6;
  border-radius: 7px;
  padding: 11px;
}

.role-overview-card h3 {
  margin: 0;
  color: #26394b;
  font-size: 0.8125rem;
}

.role-overview-card p {
  margin: 4px 0 0;
  color: #788697;
  font-size: 0.8125rem;
}

.role-overview-card a {
  color: #07875d;
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
}

.role-overview-card a:hover {
  text-decoration: underline;
}

.summary-card,
.panel {
  border: 1px solid #edf0f6;
  border-radius: 9px;
  background: #fff;
  box-shadow: 0 2px 6px rgb(23 39 55 / 3%);
}

.summary-card {
  min-height: 105px;
  padding: 13px;
}

.summary-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #526170;
  font-size: 0.8125rem;
}

.summary-icon {
  display: grid;
  width: 22px;
  height: 22px;
  place-items: center;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 700;
}

.summary-icon.green { background: #e4fbf2; color: #087c5a; }
.summary-icon.blue { background: #eaf0ff; color: #536f9c; }
.summary-icon.red { background: #fff0ef; color: #c64343; }
.summary-icon.amber { background: #fff5e7; color: #a76d17; }

.summary-card > strong {
  display: block;
  margin-top: 6px;
  color: #17283a;
  font-size: 1.625rem;
  font-weight: 700;
  line-height: 1;
}

.summary-card > strong small {
  color: #748292;
  font-size: 0.875rem;
  font-weight: 500;
}

.summary-card > small {
  display: block;
  margin-top: 7px;
  color: #718091;
  font-size: 0.8125rem;
}

.workspace-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(235px, 0.8fr);
  align-items: start;
  gap: 12px;
}

.panel {
  min-width: 0;
  padding: 14px;
}

.month-picker {
  display: grid;
  gap: 3px;
  color: #738092;
  font-size: 0.8125rem;
}

.month-picker select {
  height: 29px;
  border: 1px solid #e0e6f0;
  border-radius: 5px;
  padding: 0 8px;
  background: #f8faff;
  color: #24374a;
  font: inherit;
  font-size: 0.8125rem;
}

.role-filters {
  display: flex;
  gap: 5px;
  margin: 13px -2px 10px;
  overflow-x: auto;
  border-bottom: 1px solid #edf0f6;
}

.role-filters button {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 5px;
  border: 0;
  border-bottom: 2px solid transparent;
  padding: 7px 8px;
  background: transparent;
  color: #5d6d7b;
  cursor: pointer;
  font: inherit;
  font-size: 0.8125rem;
}

.role-filters button.active {
  border-bottom-color: #0bb984;
  color: #087c5a;
  font-weight: 700;
}

.role-filters button span {
  border-radius: 999px;
  padding: 2px 5px;
  background: #eff3fb;
  font-size: 0.8125rem;
}

.kpi-table-wrap {
  max-height: 550px;
  overflow: auto;
  contain: paint;
}

.kpi-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.kpi-table thead {
  position: sticky;
  z-index: 1;
  top: 0;
  background: #f0f4fc;
}

.kpi-table th,
.kpi-table td {
  padding: 8px;
  border-bottom: 1px solid #eef1f6;
  color: #4b5c6e;
  font-size: 0.8125rem;
  vertical-align: middle;
}

.kpi-table thead th {
  color: #627285;
  font-size: 0.8125rem;
  font-weight: 700;
  white-space: nowrap;
}

.kpi-name-cell {
  min-width: 180px;
}

.kpi-name-cell strong,
.measurement-cell span,
.measurement-cell small {
  display: block;
}

.kpi-name-cell strong {
  margin-top: 4px;
  color: #26394b;
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1.4;
}

.role-label {
  color: #07875d;
  font-size: 0.8125rem;
  font-weight: 600;
}

.measurement-cell {
  min-width: 145px;
}

.measurement-cell span {
  color: #32465a;
  font-weight: 600;
}

.measurement-cell small {
  max-width: 170px;
  margin-top: 3px;
  color: #7a8796;
  line-height: 1.4;
}

.number-input {
  width: 78px;
  height: 28px;
  border: 1px solid #dfe6f0;
  border-radius: 4px;
  padding: 0 6px;
  color: #26394b;
  font: inherit;
  font-size: 0.8125rem;
}

.number-input:focus {
  border-color: #0bb984;
  outline: 2px solid rgb(11 185 132 / 16%);
}

.actual-input {
  border-color: #cceee1;
  background: #f5fcf9;
}

.rollup-cell {
  color: #26394b !important;
  font-weight: 700;
}

.empty-note {
  padding: 14px 4px;
  color: #758293;
  font-size: 0.8125rem;
}

.right-column {
  display: grid;
  gap: 12px;
}

.role-summary ul,
.review-list {
  display: grid;
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
}

.role-summary li {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  border-top: 1px solid #f0f2f6;
  padding: 9px 0;
  color: #33475b;
  font-size: 0.8125rem;
}

.role-counts {
  display: grid;
  justify-items: end;
  gap: 3px;
  color: #647381;
}

.role-counts b { font-weight: 500; }
.role-counts .blocked-text { color: #c64343; }

.panel-heading > a {
  color: #07875d;
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
}

.review-count {
  border-radius: 999px;
  padding: 3px 7px;
  background: #fff0ef;
  color: #c64343;
  font-size: 0.8125rem;
  font-weight: 700;
}

.review-list li {
  display: flex;
  align-items: center;
  gap: 7px;
  border-top: 1px solid #f0f2f6;
  padding: 9px 0;
}

.review-dot {
  width: 6px;
  height: 6px;
  flex: 0 0 auto;
  border-radius: 50%;
}

.review-dot.red { background: #dc4444; }
.review-dot.amber { background: #e89a35; }

.review-list li div {
  min-width: 0;
  flex: 1;
}

.review-list strong,
.review-list small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.review-list strong {
  color: #33475b;
  font-size: 0.8125rem;
  font-weight: 600;
}

.review-list small {
  margin-top: 3px;
  color: #788697;
  font-size: 0.8125rem;
}

.review-tag {
  color: #c64343;
  font-size: 0.8125rem;
  font-weight: 600;
  white-space: nowrap;
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

@media (max-width: 1100px) {
  .page-content { padding-right: 18px; padding-left: 18px; }
  .workspace-grid { grid-template-columns: minmax(0, 1.5fr) minmax(210px, 0.8fr); }
  .management-grid { grid-template-columns: 1fr; }
  .role-overview-panel { grid-column: auto; }
}

@media (max-width: 780px) {
  .workspace-grid { grid-template-columns: 1fr; }
  .right-column { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .role-overview-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 560px) {
  .page-content { padding: 16px 13px 24px; }
  .page-heading { flex-direction: column; }
  .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .right-column { grid-template-columns: 1fr; }
  .assignment-form { grid-template-columns: 1fr 1fr; }
  .assignment-form button { grid-column: 1 / -1; }
  .role-overview-grid { grid-template-columns: 1fr; }
  .panel { padding: 11px; }
}
</style>
