<template>
  <header class="topbar">
    <!-- Left: Toggle + Breadcrumb -->
    <div class="topbar-left">
      <button class="toggle-btn" @click="emit('toggle-sidebar')" title="Toggle Sidebar">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      <div class="breadcrumb">
        <span class="breadcrumb-root">TaskFlow</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
        <span class="breadcrumb-current">Dashboard</span>
      </div>
    </div>

    <!-- Right: Search + Collaboration + Cron Indicator + User Menu -->
    <div class="topbar-right">
      <div class="search-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" placeholder="Cari tugas..." class="search-input" />
      </div>

      <!-- Realtime Who's Online Presence -->
      <WhoIsOnline />

      <!-- Live Cursor Visibility Toggle -->
      <button
        class="cursor-toggle-btn"
        :class="{ active: collaborationStore.showRemoteCursors }"
        @click="collaborationStore.toggleRemoteCursors"
        :title="collaborationStore.showRemoteCursors ? 'Sembunyikan Kursor Rekan Tim' : 'Tampilkan Kursor Rekan Tim'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5.65 12.37L.5 16.88V1.2l11.28 11.17H5.65z"></path>
        </svg>
      </button>

      <!-- Auto Cleanup (pg_cron) Status Indicator -->
      <div class="cron-menu-wrap" ref="cronMenuRef">
        <button
          class="cron-indicator-btn"
          @click="showCronPopover = !showCronPopover"
          title="Status Auto-Cleanup Database (pg_cron)"
        >
          <span
            class="status-pulse-dot"
            :class="taskStore.cronStatus ? (taskStore.cronStatus.status === 'succeeded' ? 'ok' : 'error') : 'pending'"
          ></span>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span class="cron-btn-text">pg_cron</span>
        </button>

        <Transition name="fade">
          <div v-if="showCronPopover" class="cron-popover">
            <div class="cron-popover-header">
              <div class="cron-popover-title-row">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>Auto Cleanup (pg_cron)</span>
              </div>
              <span
                class="cron-status-badge"
                :class="taskStore.cronStatus ? (taskStore.cronStatus.status === 'succeeded' ? 'cron-ok' : 'cron-fail') : 'cron-pending'"
              >
                {{ taskStore.cronStatus ? (taskStore.cronStatus.status === 'succeeded' ? '✓ Aktif' : '✗ Error') : '⏳ Standby' }}
              </span>
            </div>

            <div class="cron-popover-body">
              <div class="cron-item">
                <span class="cron-item-label">Fungsi:</span>
                <span class="cron-item-val">Hapus tugas selesai &gt; 30 hari</span>
              </div>
              <div class="cron-item">
                <span class="cron-item-label">Jadwal:</span>
                <span class="cron-item-val mono">{{ taskStore.cronStatus?.schedule ?? '0 17 * * *' }} (00:00 WIB)</span>
              </div>
              <div class="cron-item">
                <span class="cron-item-label">Terakhir:</span>
                <span class="cron-item-val">
                  {{ taskStore.cronStatus?.last_run ? taskStore.formatCronTime(taskStore.cronStatus.last_run) : 'Belum pernah berjalan' }}
                </span>
              </div>
              <div v-if="taskStore.cronStatus?.message" class="cron-message-box">
                {{ taskStore.cronStatus.message }}
              </div>
            </div>

            <div class="cron-popover-footer">
              <button
                class="cron-popover-refresh-btn"
                @click="taskStore.fetchCronStatus"
                :disabled="taskStore.cronLoading"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" :class="{ spinning: taskStore.cronLoading }">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
                <span>{{ taskStore.cronLoading ? 'Memuat...' : 'Refresh Status' }}</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>

      <!-- User Avatar & Dropdown -->
      <div class="user-menu-wrap" ref="menuRef">
        <button class="topbar-avatar" @click="showDropdown = !showDropdown" title="Menu Pengguna">
          {{ authStore.userInitials }}
        </button>

        <Transition name="fade">
          <div v-if="showDropdown" class="user-dropdown">
            <div class="user-dropdown-header">
              <span class="dropdown-name">{{ authStore.displayName }}</span>
              <span class="dropdown-email" :title="authStore.userEmail">{{ authStore.userEmail }}</span>
            </div>
            <div class="user-dropdown-divider"></div>
            <button class="dropdown-item logout" @click="handleLogout">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Keluar (Sign Out)</span>
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/authStore'
import { useTaskStore } from '~/stores/taskStore'
import { useCollaborationStore } from '~/stores/collaborationStore'

const emit = defineEmits<{
  (e: 'toggle-sidebar'): void
}>()

const authStore = useAuthStore()
const taskStore = useTaskStore()
const collaborationStore = useCollaborationStore()

const showDropdown = ref<boolean>(false)
const showCronPopover = ref<boolean>(false)

const menuRef = ref<HTMLDivElement | null>(null)
const cronMenuRef = ref<HTMLDivElement | null>(null)

const handleLogout = () => {
  showDropdown.value = false
  authStore.openLogoutModal()
}

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as Node
  if (menuRef.value && !menuRef.value.contains(target)) {
    showDropdown.value = false
  }
  if (cronMenuRef.value && !cronMenuRef.value.contains(target)) {
    showCronPopover.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  // Inisialisasi Presence & Broadcast channel jika user login
  collaborationStore.initCollaborationChannel()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.topbar {
  height: 60px;
  background: #1e293b;
  border-bottom: 1px solid #334155;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 100;
}

/* Left */
.topbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toggle-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.toggle-btn:hover {
  background: #334155;
  color: #f1f5f9;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #64748b;
}

.breadcrumb-root {
  color: #94a3b8;
  font-weight: 500;
}

.breadcrumb-current {
  color: #f1f5f9;
  font-weight: 600;
}

/* Right */
.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box svg {
  position: absolute;
  left: 10px;
  color: #64748b;
  pointer-events: none;
}

.search-input {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 6px 12px 6px 32px;
  color: #f1f5f9;
  font-size: 13px;
  outline: none;
  width: 180px;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: #6366f1;
  width: 230px;
}

.search-input::placeholder {
  color: #475569;
}

/* Cursor Toggle Button */
.cursor-toggle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid #334155;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cursor-toggle-btn:hover {
  background: #1e293b;
  color: #cbd5e1;
  border-color: #475569;
}

.cursor-toggle-btn.active {
  background: rgba(99, 102, 241, 0.15);
  border-color: #6366f1;
  color: #818cf8;
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.25);
}

/* Cron Indicator & Popover */
.cron-menu-wrap {
  position: relative;
}

.cron-indicator-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.cron-indicator-btn:hover {
  border-color: #6366f1;
  color: #f1f5f9;
  background: rgba(99, 102, 241, 0.08);
}

.status-pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-pulse-dot.ok {
  background: #22c55e;
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.6);
}

.status-pulse-dot.error {
  background: #ef4444;
  box-shadow: 0 0 6px rgba(239, 68, 68, 0.6);
}

.status-pulse-dot.pending {
  background: #f59e0b;
  box-shadow: 0 0 6px rgba(245, 158, 11, 0.6);
}

.cron-popover {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 310px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  box-shadow: 0 15px 30px -8px rgba(0, 0, 0, 0.5);
  padding: 14px;
  z-index: 200;
}

.cron-popover-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10px;
  border-bottom: 1px solid #334155;
}

.cron-popover-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #f1f5f9;
  font-size: 13px;
  font-weight: 600;
}

.cron-status-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 10px;
}

.cron-ok {
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #4ade80;
}

.cron-fail {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.cron-pending {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #fbbf24;
}

.cron-popover-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 0;
}

.cron-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.cron-item-label {
  color: #64748b;
  font-weight: 500;
}

.cron-item-val {
  color: #cbd5e1;
  text-align: right;
}

.cron-item-val.mono {
  font-family: monospace;
  font-size: 11px;
}

.cron-message-box {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 11px;
  color: #94a3b8;
  font-family: monospace;
  word-break: break-all;
}

.cron-popover-footer {
  padding-top: 8px;
  border-top: 1px solid #334155;
}

.cron-popover-refresh-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.cron-popover-refresh-btn:hover:not(:disabled) {
  border-color: #6366f1;
  color: #f1f5f9;
}

.spinning {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

/* User Menu */
.user-menu-wrap {
  position: relative;
}

.topbar-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #818cf8);
  color: #ffffff;
  border: 2px solid #334155;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.topbar-avatar:hover {
  border-color: #6366f1;
  transform: scale(1.05);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 220px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  box-shadow: 0 15px 30px -8px rgba(0, 0, 0, 0.5);
  padding: 8px;
  z-index: 200;
}

.user-dropdown-header {
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dropdown-name {
  font-size: 13px;
  font-weight: 600;
  color: #f1f5f9;
}

.dropdown-email {
  font-size: 11px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-dropdown-divider {
  height: 1px;
  background: #334155;
  margin: 6px 0;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #cbd5e1;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dropdown-item:hover {
  background: #334155;
  color: #f1f5f9;
}

.dropdown-item.logout {
  color: #f87171;
}

.dropdown-item.logout:hover {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}

/* Transition */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 640px) {
  .search-box {
    display: none;
  }
}
</style>
