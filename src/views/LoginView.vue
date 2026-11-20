<template>
  <main class="login-page">
    <section class="login-card" aria-labelledby="login-title">
      <header class="login-header">
        <div class="brand-mark" aria-hidden="true"></div>
        <span class="workspace-badge"><span></span> Workspace Portal</span>
        <h1 id="login-title">Welcome to StaffPulse</h1>
        <p>Sign in with your StaffPulse work email to open your workspace.</p>
      </header>

      <form class="login-form" @submit.prevent="signIn">
        <label class="field-label" for="email">Work Email</label>
        <div class="input-wrap">
          <span class="input-icon" aria-hidden="true">✉</span>
          <input
            id="email"
            v-model="email"
            type="text"
            autocomplete="username"
            placeholder="ops@ags"
            required
          />
        </div>

        <div class="password-label">
          <label class="field-label" for="password">Password</label>
          <button class="text-button" type="button" @click="showHelp('For password assistance, contact your IT Support Desk.')">
            Forgot password?
          </button>
        </div>
        <div class="input-wrap">
          <span class="input-icon" aria-hidden="true">♙</span>
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            placeholder="Enter your password"
            required
          />
          <button
            class="visibility-button"
            type="button"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
            :aria-pressed="showPassword"
            @click="showPassword = !showPassword"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M2.5 12s3.2-6 9.5-6 9.5 6 9.5 6-3.2 6-9.5 6-9.5-6-9.5-6Z" />
              <circle cx="12" cy="12" r="2.5" />
            </svg>
          </button>
        </div>

        <div class="form-options">
          <label class="remember-option">
            <input v-model="rememberDevice" type="checkbox" />
            <span>Remember this device</span>
          </label>
          <span class="connection-status"><span></span> Cloud SSO</span>
        </div>

        <button class="submit-button" type="submit">Sign in to Workspace <span aria-hidden="true">→</span></button>
      </form>

      <div class="divider"><span>OR SINGLE SIGN-ON</span></div>
      <div class="sso-buttons">
        <button type="button" @click="showHelp('Google SSO is not configured yet.')">
          <span class="google-mark" aria-hidden="true">G</span> Google SSO
        </button>
        <button type="button" @click="showHelp('Microsoft 365 sign-in is not configured yet.')">
          <span class="microsoft-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
          Microsoft 365
        </button>
      </div>

      <p v-if="message" class="form-message" role="status">{{ message }}</p>
      <footer class="login-footer">
        <p>Need assistance? <button class="text-button" type="button" @click="showHelp('Please contact your IT Support Desk for assistance.')">Contact IT Support Desk</button></p>
      </footer>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { roleDetails, roleForEmail, signInAs } from '../stores/session'

const router = useRouter()
const email = ref('')
const password = ref('')
const rememberDevice = ref(false)
const showPassword = ref(false)
const message = ref('')

function showHelp(text: string) {
  message.value = text
}

function signIn() {
  const role = roleForEmail(email.value)
  if (!role) {
    message.value = 'Email not recognized. Use ops@ags, fin@ags, hr@ags, it@ags, mark@ags, med@ags, or super@ags.'
    return
  }

  signInAs(role, email.value)
  void router.push(roleDetails(role).home)
}
</script>

<style scoped>
.login-page {
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 2rem 1rem;
  background:
    radial-gradient(ellipse at 29% 42%, rgb(200 255 238 / 46%), transparent 34%),
    radial-gradient(ellipse at 72% 68%, rgb(207 255 242 / 45%), transparent 30%),
    #f7f8ff;
  color: #142638;
}

.login-card {
  width: min(100%, 380px);
  padding: 28px 27px 24px;
  border: 1px solid rgb(20 38 56 / 4%);
  border-radius: 11px;
  background: #fff;
  box-shadow: 0 14px 28px rgb(23 39 55 / 12%), 0 3px 8px rgb(23 39 55 / 5%);
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.brand-mark {
  width: 33px;
  height: 33px;
  margin-bottom: 6px;
  border-radius: 9px;
  background: #c9f8e6;
}

.workspace-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border-radius: 999px;
  padding: 2px 8px;
  background: #d7f9ec;
  color: #07875d;
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1.4;
}

.workspace-badge span,
.connection-status span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #0cba83;
}

h1 {
  margin-top: 7px;
  color: #142638;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  line-height: 1.3;
}

.login-header p {
  max-width: 290px;
  margin-top: 4px;
  color: #586860;
  font-size: 0.8125rem;
  line-height: 1.5;
}

.login-form {
  display: grid;
  gap: 8px;
}

.field-label,
.password-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #1d2b37;
  font-size: 0.8125rem;
  font-weight: 600;
}

.password-label {
  margin-top: 2px;
}

.field-badge {
  border-radius: 999px;
  padding: 2px 7px;
  background: #d9faee;
  color: #07875d;
  font-size: 0.8125rem;
  font-weight: 600;
}

.input-wrap {
  display: flex;
  height: 36px;
  align-items: center;
  gap: 9px;
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 0 10px;
  background: #eff3ff;
  color: #61716f;
}

.input-wrap:focus-within {
  border-color: #08b984;
  box-shadow: 0 0 0 2px rgb(8 185 132 / 12%);
}

.input-icon {
  flex: 0 0 auto;
  font-size: 0.875rem;
}

.input-wrap input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #253641;
  font: inherit;
  font-size: 0.8125rem;
}

.input-wrap input::placeholder {
  color: #74818b;
  opacity: 1;
}

.visibility-button {
  display: grid;
  width: 22px;
  height: 24px;
  flex: 0 0 auto;
  place-items: center;
  border: 0;
  background: transparent;
  color: #71807e;
  cursor: pointer;
}

.visibility-button svg {
  width: 14px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.6;
}

.text-button {
  border: 0;
  padding: 0;
  background: transparent;
  color: #07875d;
  cursor: pointer;
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
}

.text-button:hover {
  text-decoration: underline;
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 2px 0 6px;
}

.remember-option,
.connection-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #53625d;
  font-size: 0.8125rem;
}

.remember-option input {
  width: 12px;
  height: 12px;
  margin: 0;
  accent-color: #0cba83;
}

.connection-status {
  gap: 4px;
  font-size: 0.8125rem;
}

.submit-button {
  display: flex;
  min-height: 37px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border: 0;
  border-radius: 6px;
  background: #0db987;
  box-shadow: 0 2px 3px rgb(0 95 70 / 18%);
  color: #fff;
  cursor: pointer;
  font: inherit;
  font-size: 0.875rem;
  font-weight: 600;
}

.submit-button:hover {
  background: #079f73;
}

.divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 15px 0 12px;
  color: #6a7973;
  font-size: 0.8125rem;
  white-space: nowrap;
}

.divider::before,
.divider::after {
  height: 1px;
  flex: 1;
  background: #e8edf0;
  content: '';
}

.sso-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px;
}

.sso-buttons button {
  display: flex;
  min-height: 31px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 0;
  border-radius: 6px;
  background: #eff3ff;
  color: #293743;
  cursor: pointer;
  font: inherit;
  font-size: 0.8125rem;
}

.sso-buttons button:hover {
  background: #e5ebfa;
}

.google-mark {
  color: #4285f4;
  font-size: 0.9375rem;
  font-weight: 700;
}

.microsoft-mark {
  display: grid;
  width: 11px;
  height: 11px;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
}

.microsoft-mark i:nth-child(1) { background: #f35325; }
.microsoft-mark i:nth-child(2) { background: #81bc06; }
.microsoft-mark i:nth-child(3) { background: #05a6f0; }
.microsoft-mark i:nth-child(4) { background: #ffba08; }

.form-message {
  margin-top: 10px;
  border-radius: 5px;
  padding: 7px 9px;
  background: #f0faf6;
  color: #087c59;
  font-size: 0.8125rem;
  text-align: center;
}

.login-footer {
  margin-top: 20px;
  color: #718078;
  font-size: 0.8125rem;
  text-align: center;
}

.login-footer .text-button {
  font-size: inherit;
}

button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 2px solid #07875d;
  outline-offset: 2px;
}

@media (max-width: 420px) {
  .login-page {
    padding: 1rem;
  }

  .login-card {
    padding: 24px 20px 20px;
  }
}
</style>
