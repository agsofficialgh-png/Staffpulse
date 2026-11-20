<template>
  <div class="app-shell">
    <aside class="sidebar">
      <RouterLink class="brand" :to="homePath">StaffPulse</RouterLink>

      <nav class="navigation" aria-label="Main navigation">
        <template v-if="activeRole === 'operations-lead'">
          <span class="nav-section">Operations</span>
          <RouterLink to="/overview">Overview</RouterLink>
          <RouterLink to="/task-log">Task log</RouterLink>
          <RouterLink to="/worker-profile">Worker profile</RouterLink>
        </template>
        <template v-else-if="activeRole === 'admin-hr'">
          <span class="nav-section hr-section">HR workspace</span>
          <RouterLink class="hr-dashboard-link" active-class="hr-active" exact-active-class="router-link-exact-active" to="/hr">HR Dashboard</RouterLink>
          <details class="hr-navigation" open>
            <summary>HR records</summary>
            <div class="hr-links">
              <RouterLink to="/hr/people">People</RouterLink>
              <RouterLink to="/hr/hr-records">HR Records</RouterLink>
              <RouterLink to="/hr/administration">Administration</RouterLink>
              <RouterLink to="/hr/activities">Activities</RouterLink>
              <RouterLink to="/hr/issues">Issues</RouterLink>
              <RouterLink to="/hr/training">Training</RouterLink>
              <RouterLink to="/hr/documents">Documents</RouterLink>
              <RouterLink to="/hr/management-actions">Management Actions</RouterLink>
              <RouterLink to="/hr/kpis">HR KPIs</RouterLink>
              <RouterLink to="/hr/deadlines">Deadlines</RouterLink>
            </div>
          </details>
        </template>
        <template v-else-if="activeRole === 'super-admin'">
          <span class="nav-section">Management</span>
          <RouterLink to="/super-admin">Super Admin</RouterLink>
        </template>
        <template v-else-if="activeRole">
          <span class="nav-section">My workspace</span>
          <RouterLink v-if="dashboardPath" :to="dashboardPath">My Dashboard</RouterLink>
          <RouterLink v-else to="/worker-profile">Worker profile</RouterLink>
        </template>
        <template v-if="activeRole">
          <span class="nav-section account-section">Account</span>
          <RouterLink to="/profile">Profile</RouterLink>
          <RouterLink to="/settings">Settings</RouterLink>
        </template>
      </nav>

      <button v-if="activeRole" class="login-link" type="button" @click="logout">Sign out</button>
      <RouterLink v-else class="login-link" to="/login">Login</RouterLink>
    </aside>

    <main class="page-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { activeRole, roleHome, signOut } from '../stores/session'

const router = useRouter()
const homePath = computed(() => activeRole.value ? roleHome(activeRole.value) : '/login')
const dashboardPath = computed(() => activeRole.value ? roleHome(activeRole.value) : '')

function logout() {
  signOut()
  void router.push('/login')
}
</script>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
  background: #f5f7fc;
}

.sidebar {
  display: flex;
  position: sticky;
  top: 0;
  height: 100vh;
  width: 240px;
  flex: 0 0 240px;
  flex-direction: column;
  gap: 2rem;
  padding: 1.5rem 1rem;
  border-right: 1px solid #e8edf5;
  background: #fff;
  box-shadow: 2px 0 16px rgb(23 39 55 / 3%);
  overflow-y: auto;
}

.brand {
  padding: 0.5rem;
  color: var(--color-heading);
  font-size: 1.25rem;
  font-weight: 700;
}

.navigation {
  display: grid;
  gap: 0.2rem;
}

.navigation a,
.login-link {
  display: flex;
  align-items: center;
  border-radius: 0.375rem;
  padding: 0.625rem 0.75rem;
  color: #536273;
  font-size: 0.875rem;
}

button.login-link {
  border: 0;
  background: transparent;
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.navigation a.router-link-active {
  background: #0bb984;
  color: #fff;
  font-weight: 600;
}

.navigation a.hr-active,
.navigation a.router-link-exact-active {
  border-radius: 0.375rem;
  background: #0bb984;
  color: #fff;
  font-weight: 600;
}

.navigation a.hr-dashboard-link.hr-active:not(.router-link-exact-active) {
  background: transparent;
  color: #536273;
  font-weight: normal;
}

.nav-section {
  margin: 0.7rem 0 0.2rem;
  padding: 0 0.75rem;
  color: #8a97a4;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.hr-section {
  border-top: 1px solid #e8edf5;
  padding-top: 0.9rem;
}

.hr-navigation {
  color: #536273;
  font-size: 0.8rem;
}



.hr-navigation summary {
  border-radius: 0.375rem;
  padding: 0.55rem 0.75rem;
  cursor: pointer;
  list-style-position: inside;
}

.hr-navigation summary:hover {
  background: #eff3f9;
}

.hr-links {
  display: grid;
  gap: 0.15rem;
  padding-left: 0.75rem;
}

.hr-links a {
  padding: 0.45rem 0.625rem;
  font-size: 0.78rem;
}

.login-link {
  margin-top: auto;
}

.page-content {
  min-width: 0;
  flex: 1;
}

a {
  text-decoration: none;
}

a:hover {
  background: #eff3f9;
}

.navigation a.router-link-active:hover {
  background: #079f73;
}

@media (max-width: 640px) {
  .app-shell {
    display: block;
  }

  .sidebar {
    display: grid;
    width: auto;
    height: auto;
    grid-template-columns: 1fr auto;
    gap: 0.4rem 0.75rem;
    border-right: 0;
    border-bottom: 1px solid var(--color-border);
    position: static;
    overflow: visible;
    padding: 0.65rem 0.75rem 0.4rem;
    box-shadow: 0 3px 12px rgb(23 39 55 / 5%);
  }

  .brand {
    align-self: center;
  }

  .login-link {
    grid-column: 2;
    grid-row: 1;
    margin: 0;
    justify-self: end;
  }

  .navigation {
    display: flex;
    grid-column: 1 / -1;
    flex-wrap: nowrap;
    gap: 0.2rem;
    overflow-x: auto;
    padding: 0.2rem 0 0.45rem;
    scrollbar-width: thin;
  }

  .navigation > a,
  .navigation details {
    flex: 0 0 auto;
  }

  .navigation > a {
    width: max-content;
  }

  .navigation .nav-section {
    display: none;
  }

  .hr-navigation .hr-links {
    display: flex;
    flex-flow: row nowrap;
    gap: 0.15rem;
    padding-left: 0;
  }

  .hr-links a {
    flex: 0 0 auto;
    width: max-content;
  }
}
</style>
