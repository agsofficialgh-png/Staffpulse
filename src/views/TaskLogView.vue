<template>
  <div class="task-log-page">
    <DashboardTopbar v-model="search" placeholder="Search task, category, or role..." />
    <main class="page-content">
      <header class="page-heading">
        <div>
          <p class="eyebrow"><span></span> TASK &amp; ACTIVITY TRACKING</p>
          <h1>Daily Task Log &amp; Work Tracker</h1>
          <p class="intro">Log operational work, update progress, and flag items that need attention.</p>
        </div>
        <button class="new-task-button" type="button" @click="showEntryForm = !showEntryForm">
          <span aria-hidden="true">{{ showEntryForm ? '−' : '+' }}</span>
          {{ showEntryForm ? 'Close entry' : 'Log new task' }}
        </button>
      </header>

      <section v-if="showEntryForm" class="panel entry-panel">
        <div class="entry-heading">
          <div class="entry-mark" aria-hidden="true">✦</div>
          <div><h2>Quick task entry</h2><p>Record a new task or update active work.</p></div>
        </div>
        <form class="task-form" @submit.prevent="submitTask">
          <label class="field task-field">
            <span>Task / activity</span>
            <input v-model.trim="form.task" required maxlength="160" placeholder="Describe the work to be done" />
          </label>
          <label class="field role-field">
            <span>Owner (role)</span>
            <select v-model="form.ownerRole" required>
              <option v-for="role in taskRoles" :key="role" :value="role">{{ role }}</option>
            </select>
          </label>
          <label class="field">
            <span>Category</span>
            <input v-model.trim="form.category" maxlength="80" placeholder="Category" />
          </label>
          <label class="field">
            <span>Priority</span>
            <select v-model="form.priority">
              <option v-for="priority in taskPriorities" :key="priority" :value="priority">{{ priority }}</option>
            </select>
          </label>
          <label class="field">
            <span>Start date</span>
            <input v-model="form.startDate" type="date" />
          </label>
          <label class="field">
            <span>Due date</span>
            <input v-model="form.dueDate" type="date" />
          </label>
          <label class="field">
            <span>Task status</span>
            <select v-model="form.status">
              <option v-for="status in taskStatuses" :key="status" :value="status">{{ status }}</option>
            </select>
          </label>
          <label class="field outcome-field">
            <span>Outcome / evidence</span>
            <input v-model.trim="form.outcome" maxlength="240" placeholder="Optional result, link, or note" />
          </label>
          <button class="primary-button" type="submit">Add task entry <span aria-hidden="true">→</span></button>
        </form>
      </section>

      <section class="workspace-grid">
        <article class="panel task-list-panel">
          <div class="list-heading">
            <div><h2>Logged tasks</h2><p>{{ visibleTasks.length }} shown · {{ tasks.length }} total records</p></div>
            <label class="role-filter">
              <span class="sr-only">Filter by role</span>
              <select v-model="selectedRole">
                <option value="All roles">All roles</option>
                <option v-for="role in taskRoles" :key="role" :value="role">{{ role }}</option>
              </select>
            </label>
          </div>

          <nav class="status-filters" aria-label="Filter tasks by status">
            <button
              v-for="status in statusFilters"
              :key="status"
              type="button"
              :class="{ active: selectedStatus === status }"
              @click="selectedStatus = status"
            >
              <span v-if="status !== 'All'" :class="['status-dot', `dot-${status.toLowerCase().replace(' ', '-')}`]"></span>
              {{ status }} <b>{{ countForStatus(status) }}</b>
            </button>
          </nav>

          <div v-if="visibleTasks.length" class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Task / activity</th>
                  <th scope="col">Owner (role)</th>
                  <th scope="col">Priority</th>
                  <th scope="col">Start / due</th>
                  <th scope="col">Status</th>
                  <th scope="col">Days left</th>
                  <th scope="col">Overdue?</th>
                  <th scope="col"><span class="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="task in visibleTasks" :key="task.id">
                  <td class="task-cell">
                    <strong>{{ task.task }}</strong>
                    <small>{{ task.id }} · {{ task.category || 'General' }} · Logged {{ task.dateLogged }}</small>
                    <details>
                      <summary>Outcome &amp; record details</summary>
                      <dl>
                        <div><dt>Category</dt><dd>{{ task.category || '—' }}</dd></div>
                        <div><dt>Date completed</dt><dd>{{ task.dateCompleted || '—' }}</dd></div>
                        <div><dt>Outcome / evidence</dt><dd>{{ task.outcome || '—' }}</dd></div>
                        <div><dt>Week starting</dt><dd>{{ weekStarting(task.dateLogged) }}</dd></div>
                      </dl>
                    </details>
                  </td>
                  <td>{{ task.ownerRole }}</td>
                  <td><span :class="['priority-tag', `priority-${task.priority.toLowerCase()}`]">{{ task.priority }}</span></td>
                  <td class="date-cell"><span>{{ task.startDate || '—' }}</span><small>Due {{ task.dueDate || 'not set' }}</small></td>
                  <td>
                    <select
                      class="status-select"
                      :class="`status-${task.status.toLowerCase().replace(' ', '-')}`"
                      :aria-label="`Status for ${task.id}`"
                      :value="task.status"
                      @change="changeStatus(task.id, $event)"
                    >
                      <option v-for="status in taskStatuses" :key="status" :value="status">{{ status }}</option>
                    </select>
                  </td>
                  <td>{{ formatDaysLeft(task) }}</td>
                  <td><span v-if="isOverdue(task)" class="overdue-tag">Yes</span><span v-else>—</span></td>
                  <td><button class="delete-button" type="button" :aria-label="`Delete ${task.id}`" @click="removeTask(task.id)">×</button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else-if="search || selectedRole !== 'All roles' || selectedStatus !== 'All'" class="empty-state">No tasks match these filters.</p>
          <p v-else class="empty-state">No tasks logged yet. Add the first task to populate the work tracker.</p>
        </article>

        <aside class="right-column">
          <section class="panel summary-panel">
            <div class="side-heading">
              <div><h2>Task log summary</h2><p>Week starting {{ currentWeek }}</p></div>
              <span class="active-pill"><i></i> Live</span>
            </div>
            <div class="week-stat">
              <div><span>Tasks logged this week</span><strong>{{ thisWeekCount }} <small>tasks</small></strong></div>
              <div class="week-progress"><span :style="{ width: `${weekCompletionRate}%` }"></span></div>
              <small>{{ weekCompletionRate }}% completed · {{ Math.max(thisWeekCount - thisWeekDone, 0) }} open</small>
            </div>
            <div class="summary-tiles">
              <div><span>Done</span><strong>{{ countForStatus('Done') }}</strong></div>
              <div class="blocked-tile"><span>Blocked</span><strong>{{ countForStatus('Blocked') }}</strong></div>
            </div>
            <div class="side-heading attention-heading"><div><h3>Attention queue</h3><p>Blocked and overdue tasks</p></div><b>{{ attentionTasks.length }}</b></div>
            <ul v-if="attentionTasks.length" class="attention-list">
              <li v-for="task in attentionTasks.slice(0, 4)" :key="task.id">
                <span :class="['attention-dot', isOverdue(task) ? 'red' : 'amber']"></span>
                <div><strong>{{ task.task }}</strong><small>{{ task.id }} · {{ task.ownerRole }}</small></div>
                <span class="attention-label">{{ isOverdue(task) ? 'Overdue' : 'Blocked' }}</span>
              </li>
            </ul>
            <p v-else class="quiet-note">No blocked or overdue tasks.</p>
          </section>

          <section class="panel role-panel">
            <div class="side-heading"><div><h2>Work by role</h2><p>Open tasks in the tracker</p></div></div>
            <ul>
              <li v-for="item in roleSummary" :key="item.role">
                <span>{{ item.role }}</span><b>{{ item.open }}</b>
              </li>
            </ul>
          </section>
          <RouterLink class="overview-link" to="/overview">View weekly overview <span aria-hidden="true">→</span></RouterLink>
        </aside>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import DashboardTopbar from '../components/DashboardTopbar.vue'
import {
  addTask,
  daysLeft,
  deleteTask,
  isOverdue,
  taskPriorities,
  taskRoles,
  taskStatuses,
  tasks,
  updateTaskStatus,
  weekStarting,
  type NewTask,
} from '../stores/taskLog'

const form = reactive<NewTask>({
  ownerRole: taskRoles[0],
  task: '',
  category: '',
  priority: 'Medium',
  startDate: '',
  dueDate: '',
  status: 'Not started',
  outcome: '',
})
const search = ref('')
const selectedRole = ref('All roles')
const selectedStatus = ref<'All' | (typeof taskStatuses)[number]>('All')
const showEntryForm = ref(true)
const statusFilters = ['All', ...taskStatuses] as const
const today = new Date()
const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
const currentWeek = weekStarting(todayIso)

const visibleTasks = computed(() => {
  const query = search.value.trim().toLocaleLowerCase()
  return tasks.filter((task) => {
    const matchesSearch = !query || [task.id, task.ownerRole, task.task, task.category, task.priority, task.status, task.outcome]
      .some((value) => value.toLocaleLowerCase().includes(query))
    const matchesRole = selectedRole.value === 'All roles' || task.ownerRole === selectedRole.value
    const matchesStatus = selectedStatus.value === 'All' || task.status === selectedStatus.value
    return matchesSearch && matchesRole && matchesStatus
  })
})

const thisWeekTasks = computed(() => tasks.filter((task) => weekStarting(task.dateLogged) === currentWeek))
const thisWeekCount = computed(() => thisWeekTasks.value.length)
const thisWeekDone = computed(() => thisWeekTasks.value.filter((task) => task.status === 'Done').length)
const weekCompletionRate = computed(() => thisWeekCount.value ? Math.round((thisWeekDone.value / thisWeekCount.value) * 100) : 0)
const attentionTasks = computed(() =>
  tasks
    .filter((task) => task.status === 'Blocked' || isOverdue(task))
    .sort((a, b) => Number(isOverdue(b)) - Number(isOverdue(a))),
)
const roleSummary = computed(() =>
  taskRoles.map((role) => ({
    role,
    open: tasks.filter((task) => task.ownerRole === role && task.status !== 'Done').length,
  })),
)

function countForStatus(status: 'All' | (typeof taskStatuses)[number]) {
  return status === 'All' ? tasks.length : tasks.filter((task) => task.status === status).length
}

function submitTask() {
  addTask({ ...form })
  form.task = ''
  form.category = ''
  form.priority = 'Medium'
  form.startDate = ''
  form.dueDate = ''
  form.status = 'Not started'
  form.outcome = ''
}

function changeStatus(id: string, event: Event) {
  const value = (event.target as HTMLSelectElement).value
  const status = taskStatuses.find((option) => option === value)
  if (status) updateTaskStatus(id, status)
}

function removeTask(id: string) {
  if (window.confirm(`Delete ${id} from the task log?`)) deleteTask(id)
}

function formatDaysLeft(task: (typeof tasks)[number]) {
  const days = daysLeft(task)
  if (days === null) return '—'
  if (days < 0) return `${Math.abs(days)} overdue`
  if (days === 0) return 'Today'
  return `${days} days`
}
</script>

<style scoped>
.task-log-page {
  min-height: 100vh;
  background: #f5f7fc;
  color: #17283a;
}

.page-content {
  display: grid;
  max-width: 1600px;
  align-content: start;
  gap: 15px;
  margin: 0 auto;
  padding: 18px 26px 30px;
}

.page-heading,
.list-heading,
.side-heading,
.entry-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
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

.eyebrow span,
.active-pill i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #0cba83;
}

h1 {
  margin-top: 3px;
  color: #15283b;
  font-size: 1.4375rem;
  font-weight: 700;
  letter-spacing: -0.3px;
}

h2 {
  color: #1d3043;
  font-size: 0.875rem;
  font-weight: 700;
}

h3 {
  color: #25384a;
  font-size: 0.8125rem;
  font-weight: 700;
}

.intro,
.entry-heading p,
.list-heading p,
.side-heading p {
  margin-top: 3px;
  color: #718091;
  font-size: 0.8125rem;
}

.new-task-button,
.primary-button {
  display: inline-flex;
  min-height: 31px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 0;
  border-radius: 5px;
  padding: 0 11px;
  background: #0bb984;
  color: #fff;
  cursor: pointer;
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
  white-space: nowrap;
}

.new-task-button:hover,
.primary-button:hover { background: #079f73; }
.new-task-button span { font-size: 0.9375rem; }

.panel {
  min-width: 0;
  border: 1px solid #edf0f6;
  border-radius: 9px;
  padding: 14px;
  background: #fff;
  box-shadow: 0 2px 6px rgb(23 39 55 / 3%);
}

.entry-panel {
  border-top: 2px solid #0bb984;
}

.entry-heading {
  justify-content: flex-start;
}

.entry-mark {
  display: grid;
  width: 27px;
  height: 27px;
  place-items: center;
  border-radius: 7px;
  background: #dcf8ec;
  color: #07875d;
  font-size: 0.9375rem;
}

.task-form {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.field {
  display: grid;
  align-content: start;
  gap: 4px;
  color: #465769;
  font-size: 0.8125rem;
  font-weight: 600;
}

.field input,
.field select {
  width: 100%;
  min-width: 0;
  height: 32px;
  border: 1px solid #e0e6f0;
  border-radius: 5px;
  padding: 0 8px;
  background: #f8faff;
  color: #25384a;
  font: inherit;
  font-size: 0.8125rem;
}

.field input:focus,
.field select:focus,
.role-filter select:focus {
  border-color: #0bb984;
  outline: 2px solid rgb(11 185 132 / 16%);
}

.task-field { grid-column: span 2; }
.outcome-field { grid-column: span 3; }
.primary-button { align-self: end; }

.workspace-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(220px, 0.75fr);
  align-items: start;
  gap: 12px;
}

.task-list-panel { padding-bottom: 5px; }

.role-filter select {
  height: 29px;
  border: 1px solid #e0e6f0;
  border-radius: 5px;
  padding: 0 8px;
  background: #f7f9fd;
  color: #405268;
  font: inherit;
  font-size: 0.8125rem;
}

.status-filters {
  display: flex;
  gap: 5px;
  margin: 11px -2px 9px;
  overflow-x: auto;
  border-bottom: 1px solid #edf0f6;
}

.status-filters button {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 5px;
  border: 0;
  border-bottom: 2px solid transparent;
  padding: 7px 8px;
  background: transparent;
  color: #647284;
  cursor: pointer;
  font: inherit;
  font-size: 0.8125rem;
  white-space: nowrap;
}

.status-filters button.active {
  border-bottom-color: #0bb984;
  color: #087c5a;
  font-weight: 700;
}

.status-filters b {
  border-radius: 999px;
  padding: 2px 5px;
  background: #eff3fb;
  color: #526170;
  font-size: 0.8125rem;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.dot-not-started { background: #84908f; }
.dot-in-progress { background: #097d5a; }
.dot-blocked { background: #d84040; }
.dot-done { background: #08b980; }

.table-wrap {
  margin: 0 -14px;
  overflow: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
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
  white-space: nowrap;
}

.task-cell { min-width: 190px; }
.task-cell > strong,
.task-cell > small { display: block; }
.task-cell > strong { color: #2b3f53; font-size: 0.8125rem; font-weight: 600; }
.task-cell > small { margin-top: 3px; color: #7b8998; font-size: 0.8125rem; }

.task-cell details { margin-top: 4px; }
.task-cell summary { color: #07875d; cursor: pointer; font-size: 0.8125rem; }
.task-cell dl { display: grid; gap: 3px; margin: 5px 0 0; white-space: normal; }
.task-cell dl div { display: flex; gap: 5px; }
.task-cell dt { color: #778596; }
.task-cell dd { color: #435568; }

.date-cell span,
.date-cell small { display: block; white-space: nowrap; }
.date-cell small { margin-top: 3px; color: #7b8998; font-size: 0.8125rem; }

.priority-tag,
.overdue-tag {
  display: inline-block;
  border-radius: 999px;
  padding: 3px 6px;
  font-size: 0.8125rem;
  font-weight: 600;
}

.priority-high,
.overdue-tag { background: #fff0ef; color: #c64343; }
.priority-medium { background: #fff5e7; color: #986919; }
.priority-low { background: #eef2fb; color: #596e94; }

.status-select {
  max-width: 105px;
  height: 23px;
  border: 0;
  border-radius: 999px;
  padding: 0 6px;
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
}

.status-not-started { background: #edf1f5; color: #55616e; }
.status-in-progress { background: #e4faf1; color: #087c5a; }
.status-blocked { background: #fff0ef; color: #c64343; }
.status-done { background: #d7f8e9; color: #087c5a; }

.delete-button {
  width: 22px;
  height: 22px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: #8995a2;
  cursor: pointer;
  font-size: 1rem;
}

.delete-button:hover { background: #fff0ef; color: #c64343; }

.empty-state {
  padding: 24px 12px;
  color: #788697;
  font-size: 0.8125rem;
  text-align: center;
}

.right-column { display: grid; gap: 11px; }
.side-heading { align-items: flex-start; }

.active-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 999px;
  padding: 4px 7px;
  background: #e4fbf2;
  color: #087c5a;
  font-size: 0.8125rem;
  font-weight: 600;
}

.active-pill i { width: 5px; height: 5px; }

.week-stat {
  margin-top: 12px;
  border-radius: 7px;
  padding: 11px;
  background: #f0f4fc;
}

.week-stat > div:first-child {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 7px;
  color: #5f6e7c;
  font-size: 0.8125rem;
}

.week-stat strong { color: #23374b; font-size: 0.9375rem; font-weight: 700; white-space: nowrap; }
.week-stat strong small { font-size: 0.8125rem; font-weight: 500; }
.week-progress { height: 5px; margin-top: 8px; overflow: hidden; border-radius: 5px; background: #dbe3f1; }
.week-progress span { display: block; height: 100%; border-radius: inherit; background: #0bb984; }
.week-stat > small { display: block; margin-top: 5px; color: #687889; font-size: 0.8125rem; }

.summary-tiles {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px;
  margin-top: 8px;
}

.summary-tiles div { display: flex; flex-direction: column; gap: 4px; border-radius: 6px; padding: 10px; background: #eff8f4; color: #547064; font-size: 0.8125rem; }
.summary-tiles strong { color: #20394c; font-size: 1.25rem; font-weight: 700; }
.summary-tiles .blocked-tile { background: #fff2f1; color: #a45b59; }

.attention-heading { margin-top: 15px; }
.attention-heading > b { color: #c64343; font-size: 0.8125rem; }
.attention-list,
.role-panel ul { display: grid; margin: 9px 0 0; padding: 0; list-style: none; }
.attention-list li { display: flex; align-items: center; gap: 7px; border-top: 1px solid #f0f2f6; padding: 8px 0; }
.attention-dot { width: 6px; height: 6px; flex: 0 0 auto; border-radius: 50%; }
.attention-dot.red { background: #dc4444; }
.attention-dot.amber { background: #e89a35; }
.attention-list li div { min-width: 0; flex: 1; }
.attention-list strong,
.attention-list small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.attention-list strong { color: #35495d; font-size: 0.8125rem; font-weight: 600; }
.attention-list small { margin-top: 2px; color: #7a8796; font-size: 0.8125rem; }
.attention-label { color: #c64343; font-size: 0.8125rem; font-weight: 600; }
.quiet-note { margin-top: 11px; color: #758293; font-size: 0.8125rem; }

.role-panel li { display: flex; justify-content: space-between; gap: 8px; border-top: 1px solid #f0f2f6; padding: 8px 0; color: #516173; font-size: 0.8125rem; }
.role-panel li b { color: #26394b; font-size: 0.8125rem; }
.overview-link { justify-self: end; color: #07875d; font-size: 0.8125rem; font-weight: 600; text-decoration: none; }

.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; clip-path: inset(50%); }

@media (max-width: 1050px) {
  .page-content { padding-right: 18px; padding-left: 18px; }
  .workspace-grid { grid-template-columns: minmax(0, 1.5fr) minmax(200px, 0.8fr); }
  .task-form { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .outcome-field { grid-column: auto; }
}

@media (max-width: 780px) {
  .workspace-grid { grid-template-columns: 1fr; }
  .right-column { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 560px) {
  .page-content { padding: 15px 13px 22px; }
  .page-heading { align-items: flex-start; flex-direction: column; }
  .task-form { grid-template-columns: 1fr 1fr; }
  .task-field,
  .outcome-field { grid-column: span 2; }
  .right-column { grid-template-columns: 1fr; }
  .panel { padding: 11px; }
  .table-wrap { margin-right: -11px; margin-left: -11px; }
}
</style>
