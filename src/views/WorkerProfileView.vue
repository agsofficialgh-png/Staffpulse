<template>
  <div class="profile-page">
    <DashboardTopbar v-model="search" placeholder="Search goals, tasks, or evidence..." />
    <main class="page-content">
      <section class="profile-hero">
        <div class="hero-banner"></div>
        <div class="hero-main">
          <div class="role-avatar" aria-hidden="true">{{ roleInitials }}</div>
          <div class="role-identity">
            <span class="eyebrow">ROLE PROFILE</span>
            <h1>{{ selectedRole }}</h1>
            <p>Growth plan, active tasks, and role-based KPI records</p>
          </div>
          <label class="role-picker">
            <span>Workbook role</span>
            <select v-model="selectedRole">
              <option v-for="role in taskRoles" :key="role" :value="role">{{ role }}</option>
            </select>
          </label>
        </div>
      </section>

      <section class="profile-metrics" aria-label="Role summary">
        <article class="metric-card">
          <span>Assigned tasks</span><strong>{{ roleTasks.length }}</strong><small>From the Task Log</small>
        </article>
        <article class="metric-card">
          <span>Tasks completed</span><strong>{{ completedTaskCount }}</strong><small>{{ roleTasks.length ? Math.round((completedTaskCount / roleTasks.length) * 100) : 0 }}% of assigned tasks</small>
        </article>
        <article class="metric-card">
          <span>Growth goals</span><strong>{{ roleGoals.length }}</strong><small>{{ completedGoalCount }} completed</small>
        </article>
        <article class="metric-card">
          <span>Role KPIs</span><strong>{{ roleKpis.length }}</strong><small>Defined in the KPI tracker</small>
        </article>
      </section>

      <section class="content-grid">
        <div class="main-column">
          <section class="panel growth-panel">
            <div class="section-heading">
              <div><h2>Growth plan</h2><p>Review goals quarterly with the Operations Manager.</p></div>
              <span class="goal-count">{{ roleGoals.length }} goal{{ roleGoals.length === 1 ? '' : 's' }}</span>
            </div>

            <form class="goal-form" @submit.prevent="submitGoal">
              <label class="field goal-field">
                <span>Growth area / goal</span>
                <input v-model.trim="form.goal" required maxlength="140" placeholder="What skill or capability will you develop?" />
              </label>
              <label class="field action-field">
                <span>Action (course, mentor, project)</span>
                <input v-model.trim="form.action" required maxlength="220" placeholder="How will you work toward this goal?" />
              </label>
              <label class="field">
                <span>Target date</span>
                <input v-model="form.targetDate" type="date" />
              </label>
              <label class="field">
                <span>Status</span>
                <select v-model="form.status">
                  <option v-for="status in growthStatuses" :key="status" :value="status">{{ status }}</option>
                </select>
              </label>
              <label class="field evidence-field">
                <span>Evidence or outcome</span>
                <input v-model.trim="form.evidence" maxlength="220" placeholder="Add a result or supporting link" />
              </label>
              <button class="primary-button" type="submit">Add growth goal <span aria-hidden="true">+</span></button>
            </form>

            <div v-if="visibleGoals.length" class="goal-list">
              <article v-for="goal in visibleGoals" :key="goal.id" class="goal-card">
                <div class="goal-icon" aria-hidden="true">✦</div>
                <div class="goal-main">
                  <div class="goal-heading">
                    <div><span class="goal-id">{{ goal.id }}</span><h3>{{ goal.goal }}</h3></div>
                    <select
                      :aria-label="`Status for ${goal.goal}`"
                      :value="goal.status"
                      :class="['goal-status', `goal-${goal.status.toLowerCase().replace(' ', '-')}`]"
                      @change="changeGoalStatus(goal.id, $event)"
                    >
                      <option v-for="status in growthStatuses" :key="status" :value="status">{{ status }}</option>
                    </select>
                  </div>
                  <p class="goal-action">{{ goal.action }}</p>
                  <div class="goal-meta">
                    <span><b>Target</b> {{ goal.targetDate || 'Not set' }}</span>
                    <span><b>Last reviewed</b> {{ goal.lastReviewed || 'Not reviewed' }}</span>
                  </div>
                  <p v-if="goal.evidence" class="goal-evidence"><b>Evidence:</b> {{ goal.evidence }}</p>
                </div>
                <div class="goal-actions">
                  <button type="button" @click="markGrowthGoalReviewed(goal.id)">Mark reviewed</button>
                  <button class="delete-goal" type="button" :aria-label="`Delete ${goal.goal}`" @click="removeGoal(goal.id)">×</button>
                </div>
              </article>
            </div>
            <p v-else-if="search" class="empty-state">No growth goals match “{{ search }}”.</p>
            <p v-else class="empty-state">No growth goals for this role yet. Add a goal above to start the quarterly plan.</p>
          </section>

          <section class="panel tasks-panel">
            <div class="section-heading">
              <div><h2>Assigned tasks &amp; workload</h2><p>Current work recorded for {{ selectedRole }}.</p></div>
              <RouterLink v-if="activeRole === 'operations-lead'" to="/task-log">Open task log →</RouterLink>
            </div>
            <ul v-if="visibleRoleTasks.length" class="task-list">
              <li v-for="task in visibleRoleTasks.slice(0, 6)" :key="task.id">
                <div class="task-state" :class="`state-${task.status.toLowerCase().replace(' ', '-')}`">
                  {{ task.status === 'Done' ? '✓' : task.status === 'Blocked' ? '!' : '↗' }}
                </div>
                <div class="task-info">
                  <strong>{{ task.task }}</strong>
                  <small>{{ task.id }} · {{ task.category || 'General' }} · {{ task.priority }} priority</small>
                </div>
                <span class="task-due">{{ task.dueDate || 'No due date' }}</span>
              </li>
            </ul>
            <p v-else class="empty-state">No tasks match this role and search.</p>
          </section>
        </div>

        <aside class="right-column">
          <section class="panel role-details">
            <div class="details-icon" aria-hidden="true">{{ roleInitials }}</div>
            <h2>{{ selectedRole }}</h2>
            <p>Role-based worker record</p>
            <div class="detail-note">The workbook tracks work and development by role. Individual contact and attendance records are not included.</div>
            <dl>
              <div><dt>Active tasks</dt><dd>{{ activeTaskCount }}</dd></div>
              <div><dt>Blocked tasks</dt><dd :class="{ 'blocked-text': blockedTaskCount > 0 }">{{ blockedTaskCount }}</dd></div>
              <div><dt>Growth plan reviewed</dt><dd>{{ reviewedGoalCount }} / {{ roleGoals.length }}</dd></div>
            </dl>
          </section>

          <section class="panel kpi-panel">
            <div class="section-heading">
              <div><h2>Role KPIs</h2><p>Annual totals or latest rate</p></div>
            </div>
            <ul>
              <li v-for="kpi in roleKpis" :key="kpi.id">
                <span>{{ kpi.name }}</span><strong>{{ kpiRollup(kpi) }}</strong>
              </li>
            </ul>
          </section>
        </aside>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import DashboardTopbar from '../components/DashboardTopbar.vue'
import { growthGoals, growthStatuses, addGrowthGoal, deleteGrowthGoal, markGrowthGoalReviewed, updateGrowthStatus, type NewGrowthGoal } from '../stores/growthPlans'
import { taskRoles, tasks } from '../stores/taskLog'
import { kpiDefinitions, kpiRollup } from '../stores/kpiTracker'
import { activeRole } from '../stores/session'

const search = ref('')
const selectedRole = ref<(typeof taskRoles)[number]>(taskRoles[0])
const form = reactive<NewGrowthGoal>({
  role: selectedRole.value,
  goal: '',
  action: '',
  targetDate: '',
  status: 'Not started',
  evidence: '',
})

const roleInitials = computed(() => selectedRole.value.split(/[\s/]+/).filter(Boolean).map((part) => part[0]).slice(0, 2).join('').toUpperCase())
const roleTasks = computed(() => tasks.filter((task) => task.ownerRole === selectedRole.value))
const roleGoals = computed(() => growthGoals.filter((goal) => goal.role === selectedRole.value))
const roleKpis = computed(() => kpiDefinitions.filter((kpi) => kpi.role === selectedRole.value))
const completedTaskCount = computed(() => roleTasks.value.filter((task) => task.status === 'Done').length)
const activeTaskCount = computed(() => roleTasks.value.filter((task) => task.status === 'In progress').length)
const blockedTaskCount = computed(() => roleTasks.value.filter((task) => task.status === 'Blocked').length)
const completedGoalCount = computed(() => roleGoals.value.filter((goal) => goal.status === 'Done').length)
const reviewedGoalCount = computed(() => roleGoals.value.filter((goal) => goal.lastReviewed !== '').length)

const visibleGoals = computed(() => {
  const query = search.value.trim().toLocaleLowerCase()
  return roleGoals.value.filter((goal) =>
    !query || [goal.goal, goal.action, goal.status, goal.evidence]
      .some((value) => value.toLocaleLowerCase().includes(query)),
  )
})

const visibleRoleTasks = computed(() => {
  const query = search.value.trim().toLocaleLowerCase()
  return roleTasks.value.filter((task) =>
    !query || [task.task, task.category, task.priority, task.status, task.outcome, task.id]
      .some((value) => value.toLocaleLowerCase().includes(query)),
  )
})

function submitGoal() {
  addGrowthGoal({ ...form, role: selectedRole.value })
  form.goal = ''
  form.action = ''
  form.targetDate = ''
  form.status = 'Not started'
  form.evidence = ''
}

function changeGoalStatus(id: string, event: Event) {
  const value = (event.target as HTMLSelectElement).value
  const status = growthStatuses.find((option) => option === value)
  if (status) updateGrowthStatus(id, status)
}

function removeGoal(id: string) {
  if (window.confirm(`Delete growth goal ${id}?`)) deleteGrowthGoal(id)
}
</script>

<style scoped>
.profile-page {
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
  padding: 18px 26px 30px;
}

.profile-hero,
.panel,
.metric-card {
  border: 1px solid #edf0f6;
  border-radius: 9px;
  background: #fff;
  box-shadow: 0 2px 6px rgb(23 39 55 / 3%);
}

.profile-hero {
  overflow: hidden;
}

.hero-banner {
  height: 66px;
  background: linear-gradient(100deg, #baf3df, #e2fbf4);
}

.hero-main {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 0 17px 15px;
}

.role-avatar {
  display: grid;
  width: 72px;
  height: 72px;
  flex: 0 0 auto;
  place-items: center;
  margin-top: -28px;
  border: 4px solid #fff;
  border-radius: 50%;
  background: #e7f8f2;
  color: #087c5a;
  font-size: 1.25rem;
  font-weight: 700;
}

.role-identity {
  min-width: 0;
  flex: 1;
  padding-top: 5px;
}

.eyebrow {
  color: #07875d;
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.06em;
}

h1 {
  margin-top: 3px;
  color: #15283b;
  font-size: 1.3125rem;
  font-weight: 700;
}

.role-identity p {
  margin-top: 3px;
  color: #5f6f7d;
  font-size: 0.8125rem;
}

.role-picker {
  display: grid;
  gap: 4px;
  color: #637284;
  font-size: 0.8125rem;
}

.role-picker select {
  min-width: 160px;
  height: 31px;
  border: 1px solid #dfe6f0;
  border-radius: 5px;
  padding: 0 8px;
  background: #fff;
  color: #25384a;
  font: inherit;
  font-size: 0.8125rem;
}

.profile-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.metric-card {
  display: grid;
  min-height: 87px;
  grid-template-columns: 1fr auto;
  align-content: start;
  gap: 3px 8px;
  padding: 12px;
}

.metric-card > span {
  color: #526170;
  font-size: 0.8125rem;
}

.metric-card strong {
  grid-column: 1 / -1;
  color: #17283a;
  font-size: 1.4375rem;
  font-weight: 700;
  line-height: 1;
}

.metric-card small {
  grid-column: 1 / -1;
  color: #748292;
  font-size: 0.8125rem;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(225px, 0.8fr);
  align-items: start;
  gap: 12px;
}

.main-column,
.right-column {
  display: grid;
  gap: 12px;
}

.panel {
  min-width: 0;
  padding: 14px;
}

h2 {
  color: #1d3043;
  font-size: 0.9375rem;
  font-weight: 700;
}

.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.section-heading p {
  margin-top: 3px;
  color: #758293;
  font-size: 0.8125rem;
}

.goal-count {
  border-radius: 999px;
  padding: 4px 8px;
  background: #e4fbf2;
  color: #087c5a;
  font-size: 0.8125rem;
  font-weight: 600;
}

.goal-form {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 9px;
  margin-top: 13px;
  border-top: 1px solid #eff2f7;
  padding-top: 12px;
}

.field {
  display: grid;
  gap: 4px;
  color: #536273;
  font-size: 0.8125rem;
  font-weight: 600;
}

.field input,
.field select {
  width: 100%;
  min-width: 0;
  height: 31px;
  border: 1px solid #dfe6f0;
  border-radius: 5px;
  padding: 0 7px;
  background: #fff;
  color: #25384a;
  font: inherit;
  font-size: 0.8125rem;
}

.goal-field,
.action-field {
  grid-column: span 2;
}

.evidence-field {
  grid-column: span 3;
}

.primary-button {
  align-self: end;
  min-height: 31px;
  border: 0;
  border-radius: 5px;
  background: #0bb984;
  color: #fff;
  cursor: pointer;
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
}

.goal-list {
  display: grid;
  gap: 8px;
  margin-top: 14px;
}

.goal-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  border-radius: 7px;
  padding: 11px;
  background: #f2f6fd;
}

.goal-icon,
.details-icon {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 7px;
  background: #fff;
  color: #09835e;
  font-size: 0.9375rem;
  font-weight: 700;
}

.goal-icon {
  width: 28px;
  height: 28px;
}

.goal-main {
  min-width: 0;
  flex: 1;
}

.goal-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.goal-id {
  color: #07875d;
  font-size: 0.8125rem;
  font-weight: 600;
}

h3 {
  margin-top: 2px;
  color: #25384a;
  font-size: 0.8125rem;
  font-weight: 700;
}

.goal-action {
  margin-top: 4px;
  color: #627181;
  font-size: 0.8125rem;
  line-height: 1.45;
}

.goal-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  margin-top: 7px;
  color: #708092;
  font-size: 0.8125rem;
}

.goal-meta b,
.goal-evidence b {
  color: #4a5b6d;
  font-weight: 700;
}

.goal-evidence {
  margin-top: 5px;
  color: #617182;
  font-size: 0.8125rem;
}

.goal-status {
  max-width: 100px;
  height: 24px;
  border: 0;
  border-radius: 999px;
  padding: 0 6px;
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
}

.goal-not-started { background: #e8edf4; color: #55616e; }
.goal-in-progress { background: #dff8ef; color: #087c5a; }
.goal-done { background: #c9f3dd; color: #087c5a; }

.goal-actions {
  display: grid;
  justify-items: end;
  gap: 6px;
}

.goal-actions button {
  border: 0;
  padding: 2px;
  background: transparent;
  color: #07875d;
  cursor: pointer;
  font: inherit;
  font-size: 0.8125rem;
  white-space: nowrap;
}

.goal-actions .delete-goal {
  color: #8a96a4;
  font-size: 1rem;
}

.empty-state {
  padding: 22px 10px 12px;
  color: #788697;
  font-size: 0.8125rem;
  text-align: center;
}

.tasks-panel .section-heading > a,
.kpi-panel > a {
  color: #07875d;
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
}

.task-list,
.kpi-panel ul {
  display: grid;
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
}

.task-list li {
  display: flex;
  align-items: center;
  gap: 9px;
  border-top: 1px solid #f0f2f6;
  padding: 9px 0;
}

.task-state {
  display: grid;
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 6px;
  background: #edf2fb;
  color: #64799e;
  font-size: 0.8125rem;
  font-weight: 700;
}

.state-done { background: #dff8ef; color: #087c5a; }
.state-blocked { background: #fff0ef; color: #c64343; }
.state-in-progress { background: #eaf0ff; color: #546d96; }

.task-info {
  min-width: 0;
  flex: 1;
}

.task-info strong,
.task-info small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-info strong {
  color: #33475b;
  font-size: 0.8125rem;
  font-weight: 600;
}

.task-info small {
  margin-top: 3px;
  color: #7a8796;
  font-size: 0.8125rem;
}

.task-due {
  color: #69798a;
  font-size: 0.8125rem;
  white-space: nowrap;
}

.role-details {
  text-align: center;
}

.details-icon {
  width: 56px;
  height: 56px;
  margin: 1px auto 8px;
  border: 3px solid #e5fbf2;
  border-radius: 50%;
  background: #f1fbf7;
  font-size: 1rem;
}

.role-details > h2 {
  font-size: 0.875rem;
}

.role-details > p {
  margin-top: 3px;
  color: #758293;
  font-size: 0.8125rem;
}

.detail-note {
  margin-top: 12px;
  border-radius: 6px;
  padding: 9px;
  background: #f2f6fd;
  color: #617182;
  font-size: 0.8125rem;
  line-height: 1.5;
  text-align: left;
}

.role-details dl {
  margin: 10px 0 0;
  text-align: left;
}

.role-details dl div {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #f0f2f6;
  padding: 8px 0;
  font-size: 0.8125rem;
}

.role-details dt { color: #657587; }
.role-details dd { color: #26394b; font-weight: 600; }
.role-details dd.blocked-text { color: #c64343; }

.kpi-panel ul {
  gap: 0;
  margin-top: 8px;
}

.kpi-panel li {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  border-top: 1px solid #f0f2f6;
  padding: 8px 0;
  color: #526273;
  font-size: 0.8125rem;
}

.kpi-panel li strong {
  color: #26394b;
  font-size: 0.8125rem;
  white-space: nowrap;
}

.kpi-panel > a {
  display: inline-block;
  margin-top: 7px;
}

@media (max-width: 1100px) {
  .page-content { padding-right: 18px; padding-left: 18px; }
  .content-grid { grid-template-columns: minmax(0, 1.5fr) minmax(205px, 0.8fr); }
}

@media (max-width: 780px) {
  .content-grid { grid-template-columns: 1fr; }
  .right-column { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 560px) {
  .page-content { padding: 14px 13px 22px; }
  .hero-main { align-items: flex-start; flex-wrap: wrap; padding-bottom: 12px; }
  .role-identity { padding-top: 4px; }
  .role-picker { width: 100%; margin-top: 2px; }
  .role-picker select { width: 100%; }
  .profile-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .right-column { grid-template-columns: 1fr; }
  .goal-form { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .goal-field,
  .action-field { grid-column: span 2; }
  .evidence-field { grid-column: span 2; }
  .panel { padding: 11px; }
}
</style>
