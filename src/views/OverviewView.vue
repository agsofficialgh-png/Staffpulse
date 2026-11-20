<template>
  <div class="overview">
    <header class="topbar">
      <label class="search-box">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="10.8" cy="10.8" r="6.8" />
          <path d="m16 16 5 5" />
        </svg>
        <input v-model="search" type="search" placeholder="Search tasks or roles..." aria-label="Search tasks or roles" />
      </label>
      <RouterLink class="log-task-button" to="/task-log"><span aria-hidden="true">+</span> Log Task</RouterLink>
      <div class="account">
        <span class="account-mark" aria-hidden="true">OP</span>
        <span><strong>Operations Lead</strong><small>StaffPulse workspace</small></span>
      </div>
      <div></div>
    </header>

    <div class="dashboard-content">
      <section class="welcome-row">
        <div>
          <p class="eyebrow"><span></span> LIVE OPERATIONS</p>
          <h1>Operations overview</h1>
          <p class="welcome-copy">Track work, progress, and priorities across the team.</p>
        </div>
        <div class="date-card">
          <span class="date-icon" aria-hidden="true">◷</span>
          <span><small>REPORTING DATE</small><strong>{{ todayLabel }}</strong></span>
        </div>
      </section>

      <section class="metric-grid" aria-label="Task log summary">
        <article class="metric-card">
          <div class="metric-heading"><span>Total tasks</span><span class="metric-icon mint" aria-hidden="true">▤</span></div>
          <strong class="metric-value">{{ filteredTasks.length }}</strong>
          <small>Recorded in the task log</small>
        </article>
        <article class="metric-card">
          <div class="metric-heading"><span>Completion rate</span><span class="metric-icon green" aria-hidden="true">✓</span></div>
          <strong class="metric-value">{{ completionRate }}<span class="metric-unit">%</span></strong>
          <small>{{ countByStatus('Done') }} of {{ filteredTasks.length }} tasks complete</small>
        </article>
        <article class="metric-card">
          <div class="metric-heading"><span>Overdue tasks</span><span class="metric-icon red" aria-hidden="true">!</span></div>
          <strong class="metric-value">{{ overdueCount }}</strong>
          <small>Open tasks past their due date</small>
        </article>
        <article class="metric-card">
          <div class="metric-heading"><span>High priority open</span><span class="metric-icon blue" aria-hidden="true">↗</span></div>
          <strong class="metric-value">{{ highPriorityOpenCount }}</strong>
          <small>High priority and not done</small>
        </article>
      </section>

      <section class="status-section">
        <div class="section-heading">
          <div><h2>Task status distribution</h2><span class="section-subtitle">From the current task log</span></div>
          <RouterLink to="/task-log">Detailed log <span aria-hidden="true">→</span></RouterLink>
        </div>
        <div class="status-grid">
          <article v-for="status in statusCards" :key="status.name" class="status-card">
            <div class="status-title">
              <span :class="['status-dot', status.tone]"></span>
              <span>{{ status.name }}</span>
              <span class="status-share">{{ statusPercentage(status.name) }}%</span>
            </div>
            <strong>{{ countByStatus(status.name) }}</strong>
            <div class="status-bar"><span :class="status.tone" :style="{ width: `${statusPercentage(status.name)}%` }"></span></div>
          </article>
        </div>
      </section>

      <section class="lower-grid">
        <article class="panel role-panel">
          <div class="section-heading">
            <div><h2>Weekly summary by role</h2><span class="section-subtitle">Live counts calculated from the task log</span></div>
            <span class="record-count">{{ filteredTasks.length }} tasks</span>
          </div>
          <div class="table-scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">Role</th>
                  <th scope="col">Not started</th>
                  <th scope="col">In progress</th>
                  <th scope="col">Blocked</th>
                  <th scope="col">Done</th>
                  <th scope="col">Total</th>
                  <th scope="col">Overdue</th>
                  <th scope="col">High priority open</th>
                  <th scope="col">% done</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in roleSummary" :key="row.role" :class="{ 'all-roles': row.role === 'All roles' }">
                  <th scope="row">{{ row.role }}</th>
                  <td>{{ row.notStarted }}</td>
                  <td>{{ row.inProgress }}</td>
                  <td><span :class="{ 'attention-number': row.blocked > 0 }">{{ row.blocked }}</span></td>
                  <td>{{ row.done }}</td>
                  <td>{{ row.total }}</td>
                  <td><span :class="{ 'attention-number': row.overdue > 0 }">{{ row.overdue }}</span></td>
                  <td>{{ row.highPriorityOpen }}</td>
                  <td>{{ row.percentDone }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-if="search && filteredTasks.length === 0" class="empty-note">No tasks match “{{ search }}”.</p>
          <p v-else-if="taskRecords.length === 0" class="empty-note">No tasks logged yet. Add a task to start your weekly summary.</p>
        </article>

        <aside class="side-panels">
          <section class="panel attention-panel">
            <div class="section-heading">
              <div><h2>Needs attention</h2><span class="section-subtitle">Blocked, overdue, or high priority</span></div>
              <span class="attention-count">{{ focusTasks.length }}</span>
            </div>
            <ul v-if="focusTasks.length" class="focus-list">
              <li v-for="task in focusTasks.slice(0, 5)" :key="task.id">
                <span :class="['focus-marker', isOverdue(task) ? 'red' : task.status === 'Blocked' ? 'amber' : 'blue']"></span>
                <div class="focus-content">
                  <strong>{{ task.task }}</strong>
                  <small>{{ task.ownerRole }} · {{ task.id }}</small>
                </div>
                <span v-if="isOverdue(task)" class="focus-label overdue-label">Overdue</span>
                <span v-else-if="task.status === 'Blocked'" class="focus-label blocked-label">Blocked</span>
                <span v-else class="focus-label priority-label">High</span>
              </li>
            </ul>
            <p v-else class="calm-message">Nothing needs attention right now.</p>
          </section>

          <section class="panel cadence-panel">
            <h2>Workbook review cadence</h2>
            <ul>
              <li><span>Daily</span><p>Update the status of tasks you worked on.</p></li>
              <li><span>Weekly</span><p>Log new work and raise blocked tasks in the operations meeting.</p></li>
              <li><span>Monthly</span><p>Update KPI actuals and share the task summary.</p></li>
              <li><span>Quarterly</span><p>Review and update growth plans.</p></li>
            </ul>
          </section>
        </aside>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { isOverdue, taskRoles, tasks as taskRecords, type TaskRecord, type TaskRole, type TaskStatus } from '../stores/taskLog'

const search = ref('')
const todayLabel = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
}).format(new Date())

const statusCards = [
  { name: 'Done', tone: 'green' },
  { name: 'In progress', tone: 'teal' },
  { name: 'Blocked', tone: 'red' },
  { name: 'Not started', tone: 'slate' },
] as const

const filteredTasks = computed(() => {
  const query = search.value.trim().toLocaleLowerCase()
  if (!query) return [...taskRecords]
  return taskRecords.filter((task) =>
    [task.id, task.ownerRole, task.task, task.category, task.priority, task.status, task.outcome]
      .some((value) => value.toLocaleLowerCase().includes(query)),
  )
})

function countByStatus(status: TaskStatus) {
  return filteredTasks.value.filter((task) => task.status === status).length
}

function statusPercentage(status: TaskStatus) {
  if (!filteredTasks.value.length) return 0
  return Math.round((countByStatus(status) / filteredTasks.value.length) * 100)
}

const completionRate = computed(() => statusPercentage('Done'))
const overdueCount = computed(() => filteredTasks.value.filter((task) => isOverdue(task)).length)
const highPriorityOpenCount = computed(() =>
  filteredTasks.value.filter((task) => task.priority === 'High' && task.status !== 'Done').length,
)

interface RoleSummary {
  role: string
  notStarted: number
  inProgress: number
  blocked: number
  done: number
  total: number
  overdue: number
  highPriorityOpen: number
  percentDone: number
}

function summarizeRole(role: TaskRole | null, list: TaskRecord[]): RoleSummary {
  const roleTasks = role === null ? list : list.filter((task) => task.ownerRole === role)
  const notStarted = roleTasks.filter((task) => task.status === 'Not started').length
  const inProgress = roleTasks.filter((task) => task.status === 'In progress').length
  const blocked = roleTasks.filter((task) => task.status === 'Blocked').length
  const done = roleTasks.filter((task) => task.status === 'Done').length
  return {
    role: role ?? 'All roles',
    notStarted,
    inProgress,
    blocked,
    done,
    total: roleTasks.length,
    overdue: roleTasks.filter((task) => isOverdue(task)).length,
    highPriorityOpen: roleTasks.filter((task) => task.priority === 'High' && task.status !== 'Done').length,
    percentDone: roleTasks.length ? Math.round((done / roleTasks.length) * 100) : 0,
  }
}

const roleSummary = computed(() => [
  ...taskRoles.map((role) => summarizeRole(role, filteredTasks.value)),
  summarizeRole(null, filteredTasks.value),
])

const focusTasks = computed(() =>
  filteredTasks.value
    .filter((task) => isOverdue(task) || task.status === 'Blocked' || (task.priority === 'High' && task.status !== 'Done'))
    .sort((a, b) => Number(isOverdue(b)) - Number(isOverdue(a))),
)

</script>

<style scoped>
.overview {
  min-height: 100vh;
  background: #f5f7fc;
  color: #17283a;
}

.topbar {
  display: flex;
  height: 58px;
  align-items: center;
  gap: 18px;
  border-bottom: 1px solid #e8edf5;
  padding: 0 26px;
  background: #fff;
}

.search-box {
  display: flex;
  width: min(390px, 42vw);
  height: 34px;
  align-items: center;
  gap: 8px;
  border-radius: 6px;
  padding: 0 10px;
  background: #f0f3fb;
}

.search-box svg {
  width: 14px;
  fill: none;
  stroke: #718094;
  stroke-linecap: round;
  stroke-width: 1.8;
}

.search-box input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #213247;
  font: inherit;
  font-size: 0.875rem;
}

.search-box input::placeholder {
  color: #8290a1;
}

.log-task-button {
  display: inline-flex;
  min-height: 30px;
  align-items: center;
  gap: 5px;
  margin-left: auto;
  border-radius: 6px;
  padding: 0 12px;
  background: #0bb984;
  color: #fff;
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
}

.log-task-button:hover {
  background: #079f73;
}

.log-task-button span {
  font-size: 1.125rem;
  line-height: 1;
}

.account {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8125rem;
}

.account strong,
.account small {
  display: block;
}

.account strong {
  font-size: 0.8125rem;
  font-weight: 600;
}

.account small {
  color: #718094;
  font-size: 0.8125rem;
}

.account-mark {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border-radius: 50%;
  background: #087c5a;
  color: #fff;
  font-size: 0.8125rem;
  font-weight: 600;
}

.dashboard-content {
  display: grid;
  max-width: 1600px;
  gap: 17px;
  margin: 0 auto;
  padding: 22px 26px 30px;
}

.welcome-row {
  display: flex;
  min-height: 82px;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
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
  margin-top: 3px;
  color: #15283b;
  font-size: 1.5625rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.welcome-copy {
  margin-top: 5px;
  color: #607080;
  font-size: 0.875rem;
}

.date-card {
  display: flex;
  min-width: 190px;
  align-items: center;
  gap: 11px;
  border-radius: 9px;
  padding: 12px 14px;
  background: #eaf0ff;
}

.date-icon {
  display: grid;
  width: 31px;
  height: 31px;
  place-items: center;
  border-radius: 50%;
  background: #c9f8e6;
  color: #07875d;
  font-size: 1.25rem;
}

.date-card small,
.date-card strong {
  display: block;
}

.date-card small {
  color: #617185;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.date-card strong {
  margin-top: 3px;
  color: #1b3341;
  font-size: 0.875rem;
  font-weight: 600;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.metric-card,
.status-card,
.panel {
  border: 1px solid #edf0f6;
  border-radius: 9px;
  background: #fff;
  box-shadow: 0 2px 6px rgb(23 39 55 / 3%);
}

.metric-card {
  min-height: 105px;
  padding: 13px 14px;
}

.metric-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #526170;
  font-size: 0.8125rem;
}

.metric-icon {
  display: grid;
  width: 23px;
  height: 23px;
  place-items: center;
  border-radius: 7px;
  font-size: 0.875rem;
  font-weight: 700;
}

.metric-icon.mint { background: #e6fbf3; color: #07875d; }
.metric-icon.green { background: #b7f4d8; color: #087c5a; }
.metric-icon.red { background: #fff0ef; color: #d14343; }
.metric-icon.blue { background: #eaf0ff; color: #536f9c; }

.metric-value {
  display: block;
  margin-top: 5px;
  color: #15283b;
  font-size: 1.6875rem;
  font-weight: 700;
  letter-spacing: -0.8px;
  line-height: 1.15;
}

.metric-unit {
  margin-left: 2px;
  font-size: 1rem;
}

.metric-card > small {
  display: block;
  margin-top: 4px;
  color: #647381;
  font-size: 0.8125rem;
}

.status-section,
.lower-grid {
  display: grid;
  gap: 10px;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

h2 {
  color: #1d3043;
  font-size: 0.9375rem;
  font-weight: 700;
}

.section-subtitle {
  display: block;
  margin-top: 3px;
  color: #758293;
  font-size: 0.8125rem;
}

.section-heading > a,
.cadence-panel > a {
  color: #07875d;
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
}

.section-heading > a:hover,
.cadence-panel > a:hover {
  text-decoration: underline;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.status-card {
  min-height: 96px;
  padding: 12px 13px;
}

.status-title {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #4e5e6f;
  font-size: 0.8125rem;
  font-weight: 600;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-dot.green,
.status-bar .green { background: #08b980; }
.status-dot.teal,
.status-bar .teal { background: #087c5a; }
.status-dot.red,
.status-bar .red { background: #dc4444; }
.status-dot.slate,
.status-bar .slate { background: #82908c; }

.status-share {
  margin-left: auto;
  border-radius: 999px;
  padding: 2px 6px;
  background: #edf2fb;
  color: #54647a;
  font-size: 0.8125rem;
}

.status-card > strong {
  display: block;
  margin-top: 8px;
  color: #17283a;
  font-size: 1.375rem;
  font-weight: 700;
  line-height: 1.1;
}

.status-bar {
  height: 4px;
  margin-top: 10px;
  overflow: hidden;
  border-radius: 4px;
  background: #edf1f7;
}

.status-bar span {
  display: block;
  height: 100%;
  min-width: 0;
  border-radius: inherit;
}

.lower-grid {
  grid-template-columns: minmax(0, 1.8fr) minmax(235px, 0.8fr);
  align-items: start;
  gap: 12px;
}

.panel {
  min-width: 0;
  padding: 14px;
}

.role-panel {
  padding-bottom: 11px;
}

.record-count,
.attention-count {
  border-radius: 999px;
  padding: 4px 8px;
  background: #e4fbf2;
  color: #07875d;
  font-size: 0.8125rem;
  font-weight: 600;
  white-space: nowrap;
}

.table-scroll {
  margin: 12px -14px 0;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  white-space: nowrap;
}

thead {
  background: #f0f4fc;
}

th,
td {
  padding: 9px 10px;
  color: #465769;
  font-size: 0.8125rem;
}

thead th {
  color: #607082;
  font-size: 0.8125rem;
  font-weight: 700;
}

tbody th {
  color: #24374a;
  font-weight: 600;
}

tbody tr + tr {
  border-top: 1px solid #f0f2f6;
}

tbody tr.all-roles {
  border-top: 1px solid #dfe6f0;
  background: #f8faff;
}

.attention-number {
  color: #cf3939;
  font-weight: 700;
}

.empty-note {
  padding: 14px 10px 4px;
  color: #758293;
  font-size: 0.8125rem;
}

.side-panels {
  display: grid;
  gap: 12px;
}

.attention-panel {
  min-height: 190px;
}

.attention-count {
  background: #fff0ef;
  color: #c64343;
}

.focus-list,
.cadence-panel ul {
  display: grid;
  gap: 0;
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
}

.focus-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  border-top: 1px solid #f0f2f6;
  padding: 9px 0;
}

.focus-marker {
  width: 7px;
  height: 7px;
  flex: 0 0 auto;
  border-radius: 50%;
}

.focus-marker.red { background: #dc4444; }
.focus-marker.amber { background: #e89a35; }
.focus-marker.blue { background: #7189b4; }

.focus-content {
  min-width: 0;
  flex: 1;
}

.focus-content strong,
.focus-content small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.focus-content strong {
  color: #27394b;
  font-size: 0.8125rem;
  font-weight: 600;
}

.focus-content small {
  margin-top: 2px;
  color: #7a8795;
  font-size: 0.8125rem;
}

.focus-label {
  border-radius: 999px;
  padding: 3px 6px;
  font-size: 0.8125rem;
  font-weight: 600;
}

.overdue-label { background: #fff0ef; color: #c64343; }
.blocked-label { background: #fff5e7; color: #9c671b; }
.priority-label { background: #eef2fb; color: #596e94; }

.calm-message {
  margin-top: 18px;
  color: #758293;
  font-size: 0.8125rem;
}

.cadence-panel h2 {
  margin-bottom: 8px;
}

.cadence-panel li {
  display: grid;
  grid-template-columns: 58px 1fr;
  gap: 8px;
  border-top: 1px solid #f0f2f6;
  padding: 8px 0;
}

.cadence-panel li > span {
  color: #07875d;
  font-size: 0.8125rem;
  font-weight: 700;
}

.cadence-panel li p {
  color: #5e6d7a;
  font-size: 0.8125rem;
  line-height: 1.45;
}

.cadence-panel > a {
  display: inline-block;
  margin-top: 5px;
}

@media (max-width: 1100px) {
  .dashboard-content {
    padding-right: 18px;
    padding-left: 18px;
  }

  .metric-grid,
  .status-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 780px) {
  .lower-grid {
    grid-template-columns: 1fr;
  }

  .side-panels {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .topbar {
    height: auto;
    flex-wrap: wrap;
    gap: 10px;
    padding: 12px 14px;
  }

  .search-box {
    width: 100%;
    order: 1;
  }

  .log-task-button {
    margin-left: 0;
  }

  .dashboard-content {
    gap: 14px;
    padding: 16px 13px 24px;
  }

  .welcome-row {
    align-items: flex-start;
  }

  .date-card {
    min-width: 0;
    padding: 9px;
  }

  .date-icon {
    display: none;
  }

  h1 {
    font-size: 1.3125rem;
  }

  .metric-grid,
  .status-grid,
  .side-panels {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .metric-card {
    padding: 11px;
  }

  .panel {
    padding: 11px;
  }

  .table-scroll {
    margin-right: -11px;
    margin-left: -11px;
  }
}
</style>
