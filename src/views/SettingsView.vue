<template>
  <main class="settings-page">
    <header class="page-heading">
      <p class="eyebrow">ACCOUNT</p>
      <h1>Settings</h1>
      <p>Review your current workspace and access level.</p>
    </header>

    <section class="settings-card">
      <div>
        <h2>Workspace access</h2>
        <p>Your dashboard access is determined by the work email used to sign in.</p>
      </div>
      <dl>
        <div>
          <dt>Signed-in email</dt>
          <dd>{{ activeEmail || 'Not available' }}</dd>
        </div>
        <div>
          <dt>Workspace</dt>
          <dd>{{ role.label }}</dd>
        </div>
      </dl>
    </section>

    <p class="notice">StaffPulse is using demo email-based access. Secure account and permission settings require a connected authentication service.</p>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { activeEmail, activeRole, roleDetails } from '../stores/session'

const role = computed(() => roleDetails(activeRole.value ?? 'operations-lead'))
</script>

<style scoped>
.settings-page {
  display: grid;
  max-width: 1000px;
  align-content: start;
  gap: 20px;
  margin: 0 auto;
  padding: 32px;
  color: #17283a;
}

.page-heading p,
.settings-card p,
.notice {
  color: #647381;
  font-size: 0.9375rem;
}

.eyebrow {
  color: #07875d !important;
  font-size: 0.8125rem !important;
  font-weight: 700;
  letter-spacing: 0.08em;
}

h1 {
  margin: 5px 0;
  font-size: 1.625rem;
}

.settings-card {
  display: grid;
  gap: 20px;
  border: 1px solid #edf0f6;
  border-radius: 10px;
  padding: 24px;
  background: #fff;
}

h2 {
  margin: 0;
  color: #243648;
  font-size: 1rem;
}

.settings-card p {
  margin: 5px 0 0;
}

dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin: 0;
}

dt {
  color: #718094;
  font-size: 0.875rem;
}

dd {
  margin: 4px 0 0;
  color: #243648;
  font-size: 1rem;
  font-weight: 600;
}

.notice {
  margin: 0;
  border-radius: 8px;
  padding: 14px 16px;
  background: #fff9eb;
}

@media (max-width: 640px) {
  .settings-page { padding: 20px 14px; }
  .settings-card { padding: 18px; }
  dl { grid-template-columns: 1fr; }
}
</style>
