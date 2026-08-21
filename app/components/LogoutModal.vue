<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="authStore.showLogoutModal"
        class="modal-backdrop"
        @click.self="authStore.closeLogoutModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-modal-title"
      >
        <div class="modal-card">
          <!-- Icon Banner -->
          <div class="modal-icon-wrapper">
            <div class="modal-icon-glow"></div>
            <div class="modal-icon-circle">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </div>
          </div>

          <!-- Text Content -->
          <div class="modal-content">
            <h3 id="logout-modal-title" class="modal-title">Konfirmasi Keluar</h3>
            <p class="modal-desc">
              Apakah Anda yakin ingin keluar dari sesi akun
              <strong class="user-highlight">{{ authStore.displayName }}</strong>?
            </p>
          </div>

          <!-- Actions (2 Buttons) -->
          <div class="modal-actions">
            <button
              type="button"
              class="btn-cancel"
              @click="authStore.closeLogoutModal"
              :disabled="authStore.loading"
            >
              Batal
            </button>
            <button
              type="button"
              class="btn-confirm-logout"
              @click="handleConfirmLogout"
              :disabled="authStore.loading"
            >
              <span v-if="authStore.loading" class="spinner"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>{{ authStore.loading ? 'Sedang Keluar...' : 'Ya, Keluar' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/authStore'

const authStore = useAuthStore()

const handleConfirmLogout = async () => {
  await authStore.signOut()
  authStore.closeLogoutModal()
}

// Tutup modal jika tombol ESC ditekan
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && authStore.showLogoutModal) {
    authStore.closeLogoutModal()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* Backdrop */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  padding: 16px;
}

/* Card */
.modal-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 18px;
  padding: 28px 24px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 25px 60px -10px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
}

/* Icon */
.modal-icon-wrapper {
  position: relative;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-icon-glow {
  position: absolute;
  width: 60px;
  height: 60px;
  background: rgba(239, 68, 68, 0.35);
  border-radius: 50%;
  filter: blur(16px);
}

.modal-icon-circle {
  position: relative;
  width: 58px;
  height: 58px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.1));
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f87171;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

/* Content */
.modal-content {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.modal-title {
  font-size: 19px;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0;
  letter-spacing: -0.3px;
}

.modal-desc {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
  line-height: 1.5;
}

.user-highlight {
  color: #e2e8f0;
  font-weight: 600;
}

.user-email-badge {
  font-size: 12px;
  color: #64748b;
  background: rgba(15, 23, 42, 0.6);
  padding: 3px 10px;
  border-radius: 20px;
  border: 1px solid #334155;
}

/* Actions (2 Buttons) */
.modal-actions {
  display: flex;
  gap: 12px;
  width: 100%;
}

.btn-cancel {
  flex: 1;
  padding: 11px 16px;
  background: rgba(51, 65, 85, 0.6);
  border: 1px solid #475569;
  border-radius: 10px;
  color: #cbd5e1;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover:not(:disabled) {
  background: #334155;
  color: #ffffff;
  border-color: #64748b;
}

.btn-confirm-logout {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 16px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border: 1px solid rgba(239, 68, 68, 0.6);
  border-radius: 10px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
}

.btn-confirm-logout:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(239, 68, 68, 0.5);
}

.btn-confirm-logout:disabled, .btn-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Spinner */
.spinner {
  width: 15px;
  height: 15px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

/* Transition Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-active .modal-card,
.modal-fade-leave-active .modal-card {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-card,
.modal-fade-leave-to .modal-card {
  opacity: 0;
  transform: scale(0.92) translateY(8px);
}
</style>
