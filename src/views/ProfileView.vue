<template>
  <main class="account-page">
    <header class="page-heading">
      <p class="eyebrow">ACCOUNT</p>
      <h1>Profile</h1>
      <p>View the account currently signed in to StaffPulse.</p>
    </header>

    <section class="account-card" aria-label="Profile details">
      <div class="avatar" aria-hidden="true">{{ role.initials }}</div>
      <dl>
        <div>
          <dt>Work email</dt>
          <dd>{{ activeEmail || 'Not available' }}</dd>
        </div>
        <div>
          <dt>Workspace role</dt>
          <dd>{{ role.label }}</dd>
        </div>
      </dl>
      <p class="notice">This demo does not store individual employee profile details.</p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { activeEmail, activeRole, roleDetails } from '../stores/session'

const role = computed(() => roleDetails(activeRole.value ?? 'operations-lead'))
</script>

<style scoped>
.account-page {
  display: grid;
  max-width: 1000px;
  gap: 20px;
  margin: 0 auto;
  padding: 32px;
  color: #17283a;
}

.page-heading p,
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

.account-card {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 20px;
  align-items: start;
  border: 1px solid #edf0f6;
  border-radius: 10px;
  padding: 24px;
  background: #fff;
}

.avatar {
  display: grid;
  width: 52px;
  height: 52px;
  place-items: center;
  border-radius: 50%;
  background: #d7f9ec;
  color: #07875d;
  font-weight: 700;
}

dl {
  display: grid;
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
  grid-column: 1 / -1;
  margin: 0;
  border-top: 1px solid #edf0f6;
  padding-top: 16px;
}

@media (max-width: 640px) {
  .account-page { padding: 20px 14px; }
  .account-card { padding: 18px; }
}
</style>
