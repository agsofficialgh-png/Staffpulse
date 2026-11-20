<template>
  <header class="topbar">
    <label class="search-box">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path d="m16 16 5 5" />
      </svg>
      <input
        :value="modelValue"
        type="search"
        :placeholder="placeholder"
        aria-label="Search"
        @input="updateSearch"
      />
    </label>
    <RouterLink v-if="activeRole === 'operations-lead'" class="log-task-button" to="/task-log"><span aria-hidden="true">+</span> Log Task</RouterLink>
    <div class="account">
      <span class="account-mark" aria-hidden="true">{{ role.initials }}</span>
      <span><strong>{{ role.label }}</strong><small>StaffPulse workspace</small></span>
    </div>
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { computed } from 'vue'
import { activeRole, roleDetails } from '../stores/session'

const role = computed(() => roleDetails(activeRole.value ?? 'operations-lead'))

withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
  }>(),
  {
    placeholder: 'Search tasks, goals, or roles...',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function updateSearch(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<style scoped>
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
  flex: 0 0 auto;
  fill: none;
  stroke: #718094;
  stroke-linecap: round;
  stroke-width: 1.8;
}

.search-box input {
  width: 100%;
  min-width: 0;
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
  white-space: nowrap;
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
  white-space: nowrap;
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
}
</style>
