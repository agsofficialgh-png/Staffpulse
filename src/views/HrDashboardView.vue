<template>
  <div class="hr-dashboard">
    <DashboardTopbar v-model="search" placeholder="Search HR records, people, or deadlines..." />
    <main class="page-content">
      <header class="dashboard-heading">
        <div>
          <p class="eyebrow"><span></span> ASSOCIATION OF GHANA STARTUPS</p>
          <h1>Admin &amp; HR Master Dashboard</h1>
          <p class="intro">People, administration, operations, and performance at a glance.</p>
        </div>
        <div class="reporting-period">
          <span>REPORTING PERIOD</span>
          <strong>{{ reportingPeriod }}</strong>
        </div>
      </header>

      <div class="privacy-notice">
        <span aria-hidden="true">ⓘ</span>
        HR records are session-only in this prototype. Secure backend storage and authentication are required before entering live employee data.
      </div>

      <section class="summary-grid" aria-label="HR dashboard summary">
        <RouterLink class="summary-card" to="/hr/people">
          <div class="summary-title"><span>Total people</span><span class="summary-icon green">♙</span></div>
          <strong>{{ people.length }}</strong>
          <small>Across all categories</small>
        </RouterLink>
        <RouterLink class="summary-card" to="/hr/hr-records">
          <div class="summary-title"><span>Pending HR tasks</span><span class="summary-icon blue">▤</span></div>
          <strong>{{ pendingHrCount }}</strong>
          <small>HR actions not completed</small>
        </RouterLink>
        <RouterLink class="summary-card" to="/hr/administration">
          <div class="summary-title"><span>Pending admin tasks</span><span class="summary-icon amber">☷</span></div>
          <strong>{{ pendingAdminCount }}</strong>
          <small>Administration items to follow up</small>
        </RouterLink>
        <RouterLink class="summary-card" to="/hr/issues">
          <div class="summary-title"><span>Open issues</span><span class="summary-icon red">!</span></div>
          <strong>{{ openIssueCount }}</strong>
          <small>Issues not yet resolved</small>
        </RouterLink>
        <RouterLink class="summary-card" to="/hr/deadlines">
          <div class="summary-title"><span>Upcoming deadlines</span><span class="summary-icon teal">⌛</span></div>
          <strong>{{ upcomingDeadlines.length }}</strong>
          <small>Due in the next 30 days</small>
        </RouterLink>
      </section>

      <section class="dashboard-grid">
        <article class="panel people-panel">
          <div class="panel-heading">
            <div><h2>People overview</h2><p>Directory by workbook category</p></div>
            <RouterLink to="/hr/people">Open directory →</RouterLink>
          </div>
          <div class="people-total"><strong>{{ activePeople.length }}</strong><span>active people</span></div>
          <ul class="category-list">
            <li v-for="category in peopleCategories" :key="category">
              <span class="category-marker"></span>
              <span>{{ category }}</span>
              <b>{{ countPeople(category) }}</b>
            </li>
          </ul>
          <div class="people-footer">
            <span>On leave</span><b>{{ onLeavePeople.length }}</b>
            <span>Exited</span><b>{{ exitedPeople.length }}</b>
          </div>
        </article>

        <article class="panel action-panel">
          <div class="panel-heading">
            <div><h2>HR actions</h2><p>Contracts, onboarding, leave, performance, welfare, and exits</p></div>
            <span class="count-pill">{{ pendingHrCount }} pending</span>
          </div>
          <ul v-if="visibleHrRecords.length" class="record-list">
            <li v-for="record in visibleHrRecords.slice(0, 5)" :key="record.id">
              <span class="list-marker blue"></span>
              <div><strong>{{ record.actionDocument }}</strong><small>{{ record.person }} · {{ record.hrArea }} · Due {{ record.dueDate || 'not set' }}</small></div>
              <span class="status-text">{{ record.status || 'Pending' }}</span>
            </li>
          </ul>
          <p v-else class="empty-note">{{ search ? 'No HR actions match your search.' : 'No HR actions recorded yet.' }}</p>
          <RouterLink class="panel-link" to="/hr/hr-records">View HR records <span aria-hidden="true">→</span></RouterLink>
        </article>

        <article class="panel deadline-panel">
          <div class="panel-heading">
            <div><h2>Central deadlines</h2><p>Upcoming items from the Deadlines sheet</p></div>
            <RouterLink to="/hr/deadlines">All deadlines →</RouterLink>
          </div>
          <ul v-if="visibleDeadlines.length" class="record-list">
            <li v-for="deadline in visibleDeadlines.slice(0, 5)" :key="deadline.id">
              <span :class="['list-marker', deadline.priority === 'High' ? 'red' : 'green']"></span>
              <div><strong>{{ deadline.activityDeadline }}</strong><small>{{ deadline.category || 'General' }} · {{ deadline.responsible || 'No owner' }}</small></div>
              <span class="date-text">{{ deadline.date || 'No date' }}</span>
            </li>
          </ul>
          <p v-else class="empty-note">{{ search ? 'No deadlines match your search.' : 'No upcoming deadlines recorded.' }}</p>
        </article>

        <article class="panel performance-panel">
          <div class="panel-heading">
            <div><h2>Performance snapshot</h2><p>HR and People KPIs</p></div>
            <RouterLink to="/hr/kpis">View KPIs →</RouterLink>
          </div>
          <div class="kpi-summary">
            <div><span>On track</span><strong class="positive">{{ onTrackKpis }}</strong></div>
            <div><span>At risk</span><strong class="warning">{{ atRiskKpis }}</strong></div>
            <div><span>Off track</span><strong class="negative">{{ offTrackKpis }}</strong></div>
          </div>
          <p v-if="kpis.length === 0" class="empty-note">No KPI results entered yet. Add targets and actuals to begin reporting.</p>
          <RouterLink class="panel-link" to="/hr/kpis">Manage targets and actuals <span aria-hidden="true">→</span></RouterLink>
        </article>

        <article class="panel module-panel">
          <div class="panel-heading">
            <div><h2>HR workspace</h2><p>Workbook sections</p></div>
          </div>
          <div class="module-grid">
            <RouterLink v-for="module in moduleLinks" :key="module.key" :to="`/hr/${module.key}`">
              <span>{{ module.title }}</span><b>{{ getHrRecords(module.key).length }}</b>
            </RouterLink>
          </div>
        </article>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import DashboardTopbar from '../components/DashboardTopbar.vue'
import { hrModules, type HrModule } from '../data/hrModules'
import { getHrRecords } from '../stores/hrWorkspace'

const search = ref('')
const peopleCategories = ['Staff', 'NSP', 'Intern', 'Consultant', 'Volunteer']
const moduleLinks = (Object.keys(hrModules) as HrModule[]).map((key) => ({ key, title: hrModules[key].title }))
const people = computed(() => getHrRecords('people'))
const activePeople = computed(() => people.value.filter((person) => person.status === 'Active'))
const onLeavePeople = computed(() => people.value.filter((person) => person.status === 'On Leave'))
const exitedPeople = computed(() => people.value.filter((person) => person.status === 'Exited'))
const hrRecords = computed(() => getHrRecords('hr-records'))
const adminRecords = computed(() => getHrRecords('administration'))
const issues = computed(() => getHrRecords('issues'))
const kpis = computed(() => getHrRecords('kpis'))
const deadlines = computed(() => getHrRecords('deadlines'))
const pendingHrCount = computed(() => hrRecords.value.filter((record) => record.status !== 'Completed').length)
const pendingAdminCount = computed(() => adminRecords.value.filter((record) => record.status !== 'Completed').length)
const openIssueCount = computed(() => issues.value.filter((record) => record.status !== 'Resolved').length)
const onTrackKpis = computed(() => kpis.value.filter((record) => record.status === 'On Track').length)
const atRiskKpis = computed(() => kpis.value.filter((record) => record.status === 'At Risk').length)
const offTrackKpis = computed(() => kpis.value.filter((record) => record.status === 'Off Track').length)
const reportingPeriod = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(new Date())

const upcomingDeadlines = computed(() =>
  deadlines.value.filter((record) => {
    const days = daysUntil(record.date ?? '')
    return days !== null && days >= 0 && days <= 30 && record.status !== 'Completed'
  }),
)

const visibleHrRecords = computed(() => {
  const query = search.value.trim().toLocaleLowerCase()
  return hrRecords.value.filter((record) =>
    !query || Object.values(record).some((value) => value.toLocaleLowerCase().includes(query)),
  )
})

const visibleDeadlines = computed(() => {
  const query = search.value.trim().toLocaleLowerCase()
  return upcomingDeadlines.value.filter((record) =>
    !query || Object.values(record).some((value) => value.toLocaleLowerCase().includes(query)),
  )
})

function countPeople(category: string) {
  return people.value.filter((person) => person.category === category).length
}

function daysUntil(value: string) {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return null
  const deadline = Date.UTC(year, month - 1, day)
  const today = new Date()
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  return Math.round((deadline - todayUtc) / 86_400_000)
}
</script>

<style scoped>
.hr-dashboard {
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

.dashboard-heading,
.panel-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
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
  font-size: 0.875rem;
  font-weight: 700;
}

.intro,
.panel-heading p {
  margin-top: 4px;
  color: #6d7b8a;
  font-size: 0.8125rem;
}

.reporting-period {
  display: grid;
  gap: 4px;
  border-radius: 6px;
  padding: 9px 12px;
  background: #eaf0ff;
}

.reporting-period span {
  color: #718094;
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.reporting-period strong {
  color: #26394b;
  font-size: 0.8125rem;
  font-weight: 600;
}

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

.privacy-notice span {
  color: #b38325;
  font-size: 0.875rem;
  line-height: 1;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}

.summary-card,
.panel {
  border: 1px solid #edf0f6;
  border-radius: 9px;
  background: #fff;
  box-shadow: 0 2px 6px rgb(23 39 55 / 3%);
}

.summary-card {
  display: block;
  min-width: 0;
  min-height: 94px;
  padding: 12px;
  text-decoration: none;
}

.summary-card:hover { border-color: #cbeedd; }

.summary-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
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
.summary-icon.amber { background: #fff5e7; color: #a76d17; }
.summary-icon.red { background: #fff0ef; color: #c64343; }
.summary-icon.teal { background: #e5faf8; color: #087c78; }

.summary-card > strong {
  display: block;
  margin-top: 5px;
  color: #17283a;
  font-size: 1.5625rem;
  font-weight: 700;
  line-height: 1;
}

.summary-card > small {
  display: block;
  margin-top: 6px;
  color: #748292;
  font-size: 0.8125rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(210px, 0.8fr) minmax(0, 1.35fr) minmax(0, 1.35fr);
  gap: 11px;
  align-items: start;
}

.panel {
  min-width: 0;
  padding: 13px;
}

.panel-heading {
  align-items: center;
}

.panel-heading > a,
.panel-link {
  color: #07875d;
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
}

.panel-heading > a:hover,
.panel-link:hover { text-decoration: underline; }

.people-total {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-top: 17px;
}

.people-total strong {
  color: #17283a;
  font-size: 1.6875rem;
  font-weight: 700;
}

.people-total span {
  color: #6f7e8d;
  font-size: 0.8125rem;
}

.category-list,
.record-list {
  display: grid;
  margin: 9px 0 0;
  padding: 0;
  list-style: none;
}

.category-list li {
  display: grid;
  grid-template-columns: 7px 1fr auto;
  align-items: center;
  gap: 7px;
  border-top: 1px solid #f0f2f6;
  padding: 8px 0;
  color: #506174;
  font-size: 0.8125rem;
}

.category-marker {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #0bb984;
}

.category-list li b {
  color: #24384b;
  font-size: 0.8125rem;
}

.people-footer {
  display: flex;
  gap: 6px;
  margin-top: 4px;
  border-radius: 5px;
  padding: 7px 8px;
  background: #f1f5fc;
  color: #627285;
  font-size: 0.8125rem;
}

.people-footer b { margin-right: auto; color: #26394b; }

.count-pill {
  border-radius: 999px;
  padding: 4px 7px;
  background: #fff5e7;
  color: #966617;
  font-size: 0.8125rem;
  font-weight: 600;
  white-space: nowrap;
}

.record-list {
  margin-top: 10px;
}

.record-list li {
  display: flex;
  align-items: center;
  gap: 7px;
  border-top: 1px solid #f0f2f6;
  padding: 8px 0;
}

.list-marker {
  width: 6px;
  height: 6px;
  flex: 0 0 auto;
  border-radius: 50%;
}

.list-marker.blue { background: #647fae; }
.list-marker.red { background: #df4444; }
.list-marker.green { background: #0bb984; }

.record-list li div {
  min-width: 0;
  flex: 1;
}

.record-list strong,
.record-list small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.record-list strong {
  color: #32465a;
  font-size: 0.8125rem;
  font-weight: 600;
}

.record-list small {
  margin-top: 3px;
  color: #7a8796;
  font-size: 0.8125rem;
}

.status-text,
.date-text {
  color: #6e7c8b;
  font-size: 0.8125rem;
  white-space: nowrap;
}

.empty-note {
  padding: 15px 4px;
  color: #7a8796;
  font-size: 0.8125rem;
}

.panel-link {
  display: inline-block;
  margin-top: 7px;
}

.performance-panel {
  grid-column: span 2;
}

.kpi-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 14px;
}

.kpi-summary div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border-radius: 5px;
  padding: 9px;
  background: #f4f7fc;
  color: #596a7b;
  font-size: 0.8125rem;
}

.kpi-summary strong { font-size: 0.9375rem; font-weight: 700; }
.positive { color: #07875d; }
.warning { color: #aa741b; }
.negative { color: #c64343; }

.module-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 6px;
  margin-top: 11px;
}

.module-grid a {
  display: flex;
  min-height: 40px;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  border-radius: 5px;
  padding: 6px 7px;
  background: #f2f6fd;
  color: #526273;
  font-size: 0.8125rem;
  text-decoration: none;
}

.module-grid a:hover { background: #e5f7ef; color: #087c5a; }
.module-grid b { color: #26394b; font-size: 0.8125rem; }

@media (max-width: 1100px) {
  .page-content { padding-right: 18px; padding-left: 18px; }
  .summary-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .dashboard-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .people-panel { grid-row: span 2; }
  .performance-panel { grid-column: auto; }
}

@media (max-width: 650px) {
  .page-content { padding: 15px 13px 22px; }
  .dashboard-heading { align-items: flex-start; flex-direction: column; }
  .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .dashboard-grid { grid-template-columns: 1fr; }
  .people-panel { grid-row: auto; }
  .module-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
