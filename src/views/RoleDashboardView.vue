<template>
  <div class="role-dashboard">
    <DashboardTopbar v-model="search" placeholder="Search role tasks or KPIs..." />
    <main class="page-content">
      <header class="page-heading">
        <div>
          <p class="eyebrow"><span></span> ROLE WORKSPACE</p>
          <h1>{{ dashboard.title }}</h1>
          <p class="intro">{{ dashboard.description }}</p>
          <p class="source-note">{{ dashboard.dataSource }}</p>
        </div>
        <div class="date-card">
          <span class="date-icon" aria-hidden="true">◷</span>
          <span><small>REPORTING DATE</small><strong>{{ todayLabel }}</strong></span>
        </div>
      </header>

      <section class="summary-grid" aria-label="Role task summary">
        <article class="summary-card">
          <div class="summary-top"><span>Assigned tasks</span><span class="summary-icon green">▤</span></div>
          <strong>{{ visibleTasks.length }}</strong>
          <small>Recorded in the Task Log</small>
        </article>
        <article class="summary-card">
          <div class="summary-top"><span>Completion rate</span><span class="summary-icon mint">✓</span></div>
          <strong>{{ completionRate }}<small class="metric-unit">%</small></strong>
          <small>{{ countByStatus('Done') }} of {{ visibleTasks.length }} tasks complete</small>
        </article>
        <article class="summary-card">
          <div class="summary-top"><span>Overdue tasks</span><span class="summary-icon red">!</span></div>
          <strong>{{ overdueCount }}</strong>
          <small>Open tasks past their due date</small>
        </article>
        <article class="summary-card">
          <div class="summary-top"><span>High priority open</span><span class="summary-icon blue">↗</span></div>
          <strong>{{ highPriorityOpenCount }}</strong>
          <small>High priority and not done</small>
        </article>
      </section>

      <section class="overview-grid">
        <article class="panel status-panel">
          <div class="panel-heading">
            <div><h2>Task status</h2><p>Live distribution from the Task Log</p></div>
            <RouterLink v-if="activeRole === 'operations-lead'" to="/task-log">Open Task Log →</RouterLink>
          </div>
          <div class="status-list">
            <div v-for="status in statusCards" :key="status.name" class="status-item">
              <div class="status-label">
                <span :class="['status-dot', status.tone]"></span>
                <span>{{ status.name }}</span>
                <strong>{{ countByStatus(status.name) }}</strong>
                <small>{{ statusPercentage(status.name) }}%</small>
              </div>
              <div class="status-track"><span :class="status.tone" :style="{ width: `${statusPercentage(status.name)}%` }"></span></div>
            </div>
          </div>
        </article>

        <article class="panel attention-panel">
          <div class="panel-heading">
            <div><h2>Needs attention</h2><p>Blocked, overdue, or high priority</p></div>
            <span class="attention-count">{{ attentionTasks.length }}</span>
          </div>
          <ul v-if="attentionTasks.length" class="attention-list">
            <li v-for="task in attentionTasks.slice(0, 5)" :key="task.id">
              <span :class="['attention-dot', isOverdue(task) ? 'red' : task.status === 'Blocked' ? 'amber' : 'blue']"></span>
              <div class="attention-content">
                <strong>{{ task.task }}</strong>
                <small>{{ task.ownerRole }} · {{ task.id }}</small>
              </div>
              <span class="attention-tag">{{ isOverdue(task) ? 'Overdue' : task.status === 'Blocked' ? 'Blocked' : 'High' }}</span>
            </li>
          </ul>
          <p v-else class="empty-note">Nothing needs attention right now.</p>
        </article>
      </section>

      <section class="panel tasks-panel">
        <div class="panel-heading">
          <div><h2>Recent tasks</h2><p>{{ visibleTasks.length }} shown · latest 8 displayed</p></div>
          <RouterLink v-if="activeRole === 'operations-lead'" to="/task-log">Manage tasks →</RouterLink>
        </div>
        <div v-if="recentTasks.length" class="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Task / activity</th>
                <th scope="col">Task category</th>
                <th scope="col">Priority</th>
                <th scope="col">Due date</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="task in recentTasks" :key="task.id">
                <td><strong>{{ task.task }}</strong><small>{{ task.id }} · {{ task.ownerRole }}</small></td>
                <td>{{ task.category || 'General' }}</td>
                <td><span :class="['priority-tag', `priority-${task.priority.toLowerCase()}`]">{{ task.priority }}</span></td>
                <td>{{ task.dueDate || 'Not set' }}</td>
                <td><span :class="['task-status', `status-${task.status.toLowerCase().replace(' ', '-')}`]">{{ task.status }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="empty-note">{{ search ? 'No tasks match your search.' : 'No tasks logged for this dashboard yet. Add a task to populate these metrics.' }}</p>
      </section>

      <section class="panel kpi-panel">
        <div class="panel-heading">
          <div><h2>Role KPIs</h2><p>Targets and actuals from the shared KPI tracker</p></div>
        </div>
        <div v-if="visibleKpis.length" class="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">KPI</th>
                <th scope="col">Frequency</th>
                <th scope="col">Annual target</th>
                <th scope="col">Total / latest</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="kpi in visibleKpis" :key="kpi.id">
                <td><strong>{{ kpi.name }}</strong><small>{{ kpi.measurement }}</small></td>
                <td>{{ kpi.frequency }}</td>
                <td>{{ annualTarget(kpi.id) || 'Not set' }}</td>
                <td>{{ kpiRollup(kpi) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else-if="dashboard.kpiRoles.length === 0" class="empty-note">Finance KPIs are not defined in the current KPI tracker. This dashboard reports task metrics only.</p>
        <p v-else class="empty-note">No KPIs match your search.</p>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import DashboardTopbar from '../components/DashboardTopbar.vue'
import { isOverdue, tasks, type TaskRole, type TaskStatus } from '../stores/taskLog'
import { annualTarget, kpiDefinitions, kpiRollup } from '../stores/kpiTracker'
import { activeRole } from '../stores/session'

const dashboardDefinitions = {
  'it-support': {
    title: 'I.T. Support Dashboard',
    description: 'Track service requests, technical work, and support priorities.',
    dataSource: 'Task and KPI data uses the existing I.T. Support workbook category.',
    taskRoles: ['I.T. Support'],
    kpiRoles: ['I.T. Support'],
  },
  finance: {
    title: 'Finance Dashboard',
    description: 'Monitor finance work, delivery progress, and items needing attention.',
    dataSource: 'Finance task metrics are available; Finance KPIs are not defined in the current tracker.',
    taskRoles: ['Finance'],
    kpiRoles: [],
  },
  'resource-mobilisation-marketing': {
    title: 'Resource Mobilisation and Marketing Associate Dashboard',
    description: 'Review resource mobilisation, partnerships, marketing work, and results.',
    dataSource: 'Combines existing Marketer and Partnerships tasks and KPIs to preserve workbook data.',
    taskRoles: ['Marketer', 'Partnerships'],
    kpiRoles: ['Marketer', 'Partnerships'],
  },
  'media-communications': {
    title: 'Media and Communications Associate Dashboard',
    description: 'Track media coverage, publishing, campaigns, and communication priorities.',
    dataSource: 'Uses the existing PR / Media & Comms task and KPI categories.',
    taskRoles: ['PR / Media & Comms'],
    kpiRoles: ['PR / Media & Comms'],
  },
} satisfies Record<string, {
  title: string
  description: string
  dataSource: string
  taskRoles: readonly TaskRole[]
  kpiRoles: readonly string[]
}>

type DashboardId = keyof typeof dashboardDefinitions

const props = defineProps<{ dashboardId: DashboardId }>()
const dashboard = computed(() => dashboardDefinitions[props.dashboardId])
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

const visibleTasks = computed(() => {
  const query = search.value.trim().toLocaleLowerCase()
  return tasks.filter((task) => {
    const matchesRole = hasTaskRole(dashboard.value.taskRoles, task.ownerRole)
    const matchesSearch = !query || [task.id, task.ownerRole, task.task, task.category, task.priority, task.status, task.outcome]
      .some((value) => value.toLocaleLowerCase().includes(query))
    return matchesRole && matchesSearch
  })
})

const visibleKpis = computed(() => {
  const query = search.value.trim().toLocaleLowerCase()
  return kpiDefinitions.filter((kpi) => {
    const matchesRole = hasKpiRole(dashboard.value.kpiRoles, kpi.role)
    const matchesSearch = !query || [kpi.role, kpi.name, kpi.measurement, kpi.frequency]
      .some((value) => value.toLocaleLowerCase().includes(query))
    return matchesRole && matchesSearch
  })
})

function countByStatus(status: TaskStatus) {
  return visibleTasks.value.filter((task) => task.status === status).length
}

function statusPercentage(status: TaskStatus) {
  return visibleTasks.value.length ? Math.round((countByStatus(status) / visibleTasks.value.length) * 100) : 0
}

const completionRate = computed(() => statusPercentage('Done'))
const overdueCount = computed(() => visibleTasks.value.filter((task) => isOverdue(task)).length)
const highPriorityOpenCount = computed(() =>
  visibleTasks.value.filter((task) => task.priority === 'High' && task.status !== 'Done').length,
)

function hasTaskRole(roles: readonly TaskRole[], role: TaskRole) {
  return roles.some((item) => item === role)
}

function hasKpiRole(roles: readonly string[], role: string) {
  return roles.some((item) => item === role)
}

const attentionTasks = computed(() =>
  visibleTasks.value
    .filter((task) => isOverdue(task) || task.status === 'Blocked' || (task.priority === 'High' && task.status !== 'Done'))
    .sort((a, b) => Number(isOverdue(b)) - Number(isOverdue(a))),
)

const recentTasks = computed(() =>
  [...visibleTasks.value]
    .sort((a, b) => b.dateLogged.localeCompare(a.dateLogged) || b.id.localeCompare(a.id))
    .slice(0, 8),
)

</script>

<style scoped>
.role-dashboard {
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
  padding: 22px 26px 30px;
}

.page-heading,
.panel-heading,
.summary-top,
.status-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.page-heading {
  min-height: 82px;
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
  font-size: 1.5625rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.intro,
.source-note {
  margin-top: 5px;
  color: #607080;
  font-size: 0.875rem;
}

.source-note {
  color: #718094;
  font-size: 0.8125rem;
}

.date-card,
.summary-card,
.panel {
  border: 1px solid #edf0f6;
  border-radius: 9px;
  background: #fff;
  box-shadow: 0 2px 6px rgb(23 39 55 / 3%);
}

.date-card {
  display: flex;
  min-width: 190px;
  align-items: center;
  gap: 11px;
  border: 0;
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

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.summary-card {
  min-height: 104px;
  padding: 13px 14px;
}

.summary-top {
  color: #526170;
  font-size: 0.8125rem;
}

.summary-icon {
  display: grid;
  width: 23px;
  height: 23px;
  place-items: center;
  border-radius: 7px;
  font-size: 0.875rem;
  font-weight: 700;
}

.summary-icon.green { background: #b7f4d8; color: #087c5a; }
.summary-icon.mint { background: #e6fbf3; color: #07875d; }
.summary-icon.red { background: #fff0ef; color: #d14343; }
.summary-icon.blue { background: #eaf0ff; color: #536f9c; }

.summary-card > strong {
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

.summary-card > small {
  display: block;
  margin-top: 4px;
  color: #647381;
  font-size: 0.8125rem;
}

.overview-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 0.85fr);
  gap: 12px;
}

.panel {
  min-width: 0;
  padding: 15px;
}

h2 {
  color: #1d3043;
  font-size: 0.9375rem;
  font-weight: 700;
}

.panel-heading p {
  margin-top: 3px;
  color: #758293;
  font-size: 0.8125rem;
}

.panel-heading > a {
  color: #07875d;
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
}

.panel-heading > a:hover {
  text-decoration: underline;
}

.status-list {
  display: grid;
  gap: 16px;
  margin-top: 19px;
}

.status-label {
  justify-content: flex-start;
  color: #4e5e6f;
  font-size: 0.8125rem;
  font-weight: 600;
}

.status-label strong {
  margin-left: auto;
  color: #17283a;
  font-size: 0.8125rem;
}

.status-label small {
  min-width: 28px;
  color: #718094;
  text-align: right;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.status-dot.green,
.status-track .green { background: #08b980; }
.status-dot.teal,
.status-track .teal { background: #087c5a; }
.status-dot.red,
.status-track .red { background: #dc4444; }
.status-dot.slate,
.status-track .slate { background: #82908c; }

.status-track {
  height: 5px;
  margin-top: 7px;
  overflow: hidden;
  border-radius: 5px;
  background: #edf1f7;
}

.status-track span {
  display: block;
  height: 100%;
  border-radius: inherit;
}

.attention-count {
  min-width: 26px;
  border-radius: 999px;
  padding: 4px 8px;
  background: #fff0ef;
  color: #c64343;
  font-size: 0.8125rem;
  font-weight: 600;
  text-align: center;
}

.attention-list {
  display: grid;
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
}

.attention-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  border-top: 1px solid #f0f2f6;
  padding: 9px 0;
}

.attention-dot {
  width: 7px;
  height: 7px;
  flex: 0 0 auto;
  border-radius: 50%;
}

.attention-dot.red { background: #dc4444; }
.attention-dot.amber { background: #e89a35; }
.attention-dot.blue { background: #7189b4; }

.attention-content {
  min-width: 0;
  flex: 1;
}

.attention-content strong,
.attention-content small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attention-content strong {
  color: #27394b;
  font-size: 0.8125rem;
  font-weight: 600;
}

.attention-content small {
  margin-top: 2px;
  color: #7a8795;
  font-size: 0.8125rem;
}

.attention-tag,
.priority-tag,
.task-status {
  border-radius: 999px;
  padding: 3px 6px;
  font-size: 0.8125rem;
  font-weight: 600;
  white-space: nowrap;
}

.attention-tag { background: #fff0ef; color: #c64343; }
.empty-note {
  padding: 17px 4px 3px;
  color: #758293;
  font-size: 0.8125rem;
  line-height: 1.5;
}

.table-wrap {
  margin: 12px -15px -4px;
  overflow-x: auto;
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
  padding: 9px 11px;
  color: #465769;
  font-size: 0.8125rem;
}

thead th {
  color: #607082;
  font-size: 0.8125rem;
  font-weight: 700;
}

tbody tr + tr { border-top: 1px solid #f0f2f6; }

td strong,
td small {
  display: block;
}

td strong {
  max-width: 370px;
  overflow: hidden;
  color: #27394b;
  font-size: 0.8125rem;
  font-weight: 600;
  text-overflow: ellipsis;
}

td small {
  margin-top: 3px;
  color: #7a8795;
  font-size: 0.8125rem;
}

.priority-high { background: #fff0ef; color: #c64343; }
.priority-medium { background: #fff5e7; color: #9c671b; }
.priority-low { background: #eef2fb; color: #596e94; }

.status-done { background: #e6fbf3; color: #07875d; }
.status-in-progress { background: #eaf0ff; color: #536f9c; }
.status-blocked { background: #fff0ef; color: #c64343; }
.status-not-started { background: #edf1f7; color: #607082; }

@media (max-width: 1000px) {
  .overview-grid { grid-template-columns: 1fr; }
}

@media (max-width: 780px) {
  .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 560px) {
  .page-content { gap: 12px; padding: 16px 13px 24px; }
  .page-heading { align-items: flex-start; flex-direction: column; }
  .date-card { width: 100%; min-width: 0; padding: 9px; }
  .date-icon { display: none; }
  h1 { font-size: 1.3125rem; }
  .panel { padding: 11px; }
  .table-wrap { margin-right: -11px; margin-left: -11px; }
}
</style>
