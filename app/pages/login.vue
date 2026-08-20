<template>
  <div class="auth-card">
    <div class="auth-card-header">
      <h2 class="auth-card-title">Selamat Datang Kembali</h2>
      <p class="auth-card-desc">Masuk ke akun TaskFlow Anda untuk melanjutkan</p>
    </div>

    <!-- Alert Success setelah Pendaftaran Akun -->
    <div v-if="registeredSuccess" class="auth-alert success">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>Akun Anda berhasil dibuat! Silakan masuk dengan email dan kata sandi Anda.</span>
    </div>

    <!-- Alert Info Verifikasi Email setelah Pendaftaran -->
    <div v-if="verifyRequired" class="auth-alert info">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
      </svg>
      <span>Pendaftaran berhasil! Tautan verifikasi telah dikirimkan ke email Anda. Silakan verifikasi akun Anda sebelum masuk.</span>
    </div>

    <!-- Alert Success setelah Reset Password -->
    <div v-if="resetSuccess" class="auth-alert success">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>Kata sandi Anda berhasil diperbarui! Silakan masuk dengan kata sandi baru Anda.</span>
    </div>

    <!-- Alert Error -->
    <div v-if="authStore.authError" class="auth-alert error">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span>{{ authStore.authError }}</span>
    </div>

    <!-- Login Form -->
    <form @submit.prevent="handleLogin" class="auth-form">
      <!-- Email -->
      <div class="form-group">
        <label class="form-label" for="login-email">Email</label>
        <div class="input-wrap">
          <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <input
            id="login-email"
            v-model="form.email"
            type="email"
            required
            placeholder="Masukkan email"
            class="form-input"
            :disabled="authStore.loading"
          />
        </div>
      </div>

      <!-- Password -->
      <div class="form-group">
        <div class="label-row">
          <label class="form-label" for="login-password">Kata Sandi</label>
          <NuxtLink to="/forgot-password" class="forgot-link">Lupa Kata Sandi?</NuxtLink>
        </div>
        <div class="input-wrap">
          <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <input
            id="login-password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            required
            placeholder="Masukkan kata sandi (Minimal 6 karakter)"
            class="form-input has-toggle"
            :disabled="authStore.loading"
          />
          <button
            type="button"
            class="toggle-pwd-btn"
            @click="showPassword = !showPassword"
            tabindex="-1"
            title="Lihat kata sandi"
          >
            <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Submit Button -->
      <button type="submit" class="auth-submit-btn" :disabled="authStore.loading || !form.email || !form.password">
        <span v-if="authStore.loading" class="spinner"></span>
        <span>{{ authStore.loading ? 'Memuat...' : 'Masuk Sekarang' }}</span>
      </button>
    </form>

    <!-- Switch to Register -->
    <div class="auth-card-footer">
      <p>Belum punya akun? <NuxtLink to="/register" class="auth-link">Daftar Akun Baru</NuxtLink></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/authStore'
import type { LoginCredentials } from '~/types/auth'

definePageMeta({
  layout: 'auth'
})

const route = useRoute()
const authStore = useAuthStore()

const resetSuccess = ref<boolean>(false)
const registeredSuccess = ref<boolean>(false)
const verifyRequired = ref<boolean>(false)

const form = reactive<LoginCredentials>({
  email: '',
  password: ''
})

const showPassword = ref<boolean>(false)

onMounted(() => {
  authStore.clearMessages()
  if (route.query.reset === 'success') {
    resetSuccess.value = true
  }
  if (route.query.registered === 'success') {
    registeredSuccess.value = true
  }
  if (route.query.registered === 'verify') {
    verifyRequired.value = true
  }
})

const handleLogin = async () => {
  if (!form.email || !form.password) return
  await authStore.signIn(form)
}
</script>

<style scoped>
.auth-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 16px;
  padding: 32px 28px;
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(16px);
}

.auth-card-header {
  margin-bottom: 24px;
  text-align: center;
}

.auth-card-title {
  font-size: 20px;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0;
}

.auth-card-desc {
  font-size: 13px;
  color: #94a3b8;
  margin-top: 6px;
  margin-bottom: 0;
}

/* Alert */
.auth-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.4;
  margin-bottom: 20px;
}

.auth-alert.error {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.auth-alert.success {
  background: rgba(34, 197, 94, 0.12);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #4ade80;
}

.auth-alert.info {
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: #a5b4fc;
}

.auth-alert svg {
  flex-shrink: 0;
}

/* Form */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: #cbd5e1;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-link {
  font-size: 12px;
  color: #818cf8;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.15s ease;
}

.forgot-link:hover {
  color: #a5b4fc;
  text-decoration: underline;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: #64748b;
  pointer-events: none;
}

.form-input {
  width: 100%;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 9px;
  padding: 10px 14px 10px 38px;
  color: #f1f5f9;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
  font-family: inherit;
}

.form-input.has-toggle {
  padding-right: 40px;
}

.form-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.form-input::placeholder {
  color: #475569;
}

.toggle-pwd-btn {
  position: absolute;
  right: 10px;
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: color 0.15s ease;
}

.toggle-pwd-btn:hover {
  color: #94a3b8;
}

/* Submit Button */
.auth-submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 11px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  border: none;
  border-radius: 9px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
  margin-top: 6px;
}

.auth-submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #4f46e5, #4338ca);
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(99, 102, 241, 0.45);
}

.auth-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

/* Footer */
.auth-card-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 13px;
  color: #94a3b8;
  border-top: 1px solid #334155;
  padding-top: 18px;
}

.auth-card-footer p {
  margin: 0;
}

.auth-link {
  color: #818cf8;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.15s ease;
}

.auth-link:hover {
  color: #a5b4fc;
  text-decoration: underline;
}
</style>
