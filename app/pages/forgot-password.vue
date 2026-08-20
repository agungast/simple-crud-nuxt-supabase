<template>
  <div class="auth-card">
    <div class="auth-card-header">
      <div class="header-icon-wrap">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          <circle cx="12" cy="16" r="1"></circle>
        </svg>
      </div>
      <h2 class="auth-card-title">Lupa Kata Sandi?</h2>
      <p class="auth-card-desc">
        Masukkan alamat email yang terdaftar. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.
      </p>
    </div>

    <!-- Alert Error / Success -->
    <div v-if="authStore.authError" class="auth-alert error">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span>{{ authStore.authError }}</span>
    </div>

    <div v-if="authStore.successMessage" class="auth-alert success">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>{{ authStore.successMessage }}</span>
    </div>

    <!-- Forgot Password Form -->
    <form @submit.prevent="handleSubmit" class="auth-form">
      <div class="form-group">
        <label class="form-label" for="forgot-email">Alamat Email</label>
        <div class="input-wrap">
          <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <input
            id="forgot-email"
            v-model="email"
            type="email"
            required
            placeholder="Masukkan email terdaftar"
            class="form-input"
            :disabled="authStore.loading"
          />
        </div>
      </div>

      <!-- Submit Button -->
      <button type="submit" class="auth-submit-btn" :disabled="authStore.loading || !email">
        <span v-if="authStore.loading" class="spinner"></span>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
        <span>{{ authStore.loading ? 'Mengirim Tautan...' : 'Kirim Tautan Reset' }}</span>
      </button>
    </form>

    <!-- Back to Login Link -->
    <div class="auth-card-footer">
      <NuxtLink to="/login" class="back-link">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span>Kembali ke Halaman Masuk</span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/authStore'

definePageMeta({
  layout: 'auth'
})

const authStore = useAuthStore()
const email = ref<string>('')

onMounted(() => {
  authStore.clearMessages()
})

const handleSubmit = async () => {
  if (!email.value) return
  await authStore.sendPasswordReset(email.value.trim())
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
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header-icon-wrap {
  width: 48px;
  height: 48px;
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #818cf8;
  margin-bottom: 12px;
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
  line-height: 1.5;
}

/* Alert */
.auth-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
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

.form-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.form-input::placeholder {
  color: #475569;
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
  border-top: 1px solid #334155;
  padding-top: 18px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #818cf8;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.15s ease;
}

.back-link:hover {
  color: #a5b4fc;
}
</style>
