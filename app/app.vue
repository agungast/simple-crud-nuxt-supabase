<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <!-- Logo -->
      <div class="sidebar-logo">
        <div class="logo-icon-wrap">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 11 12 14 22 4"></polyline>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
        </div>
        <span class="logo-text">TaskFlow</span>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <p class="nav-label">MENU</p>
        <a href="#" class="nav-item active">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span>Dashboard</span>
        </a>
        <a href="#" class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
          <span>Semua Tugas</span>
          <span class="nav-badge">{{ tasks.length }}</span>
        </a>
        <a href="#" class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 11 12 14 22 4"></polyline>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
          <span>Selesai</span>
          <span class="nav-badge success">{{ completedCount }}</span>
        </a>
        <a href="#" class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>Aktif</span>
          <span class="nav-badge warning">{{ activeCount }}</span>
        </a>
      </nav>

      <!-- Sidebar Footer -->
      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">A</div>
          <div class="user-meta">
            <span class="user-name">Admin</span>
            <span class="user-role">Supabase User</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Area -->
    <div class="main-area">
      <!-- Topbar -->
      <AppHeader @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed" />

      <!-- Page Content -->
      <main class="page-content">
        <!-- Stat Cards -->
        <div class="stat-cards">
          <div class="stat-card">
            <div class="stat-icon blue">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-label">Total Tugas</span>
              <span class="stat-value">{{ tasks.length }}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon green">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-label">Selesai</span>
              <span class="stat-value">{{ completedCount }}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon orange">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-label">Aktif</span>
              <span class="stat-value">{{ activeCount }}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon purple">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-label">Progress</span>
              <span class="stat-value">{{ progressPercent }}%</span>
            </div>
          </div>
        </div>

        <!-- Form + Task List -->
        <div class="content-grid">
          <!-- Card: Tambah Tugas -->
          <div class="content-card form-card">
            <div class="card-header">
              <div class="card-title-group">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                <h2 class="card-title">Tambah Tugas Baru</h2>
              </div>
            </div>
            <div class="card-body">
              <TaskForm ref="taskFormRef" :uploading="uploading" @submit="handleFormSubmit" />
            </div>
          </div>

          <!-- Card: Daftar Tugas -->
          <div class="content-card table-card">
            <div class="card-header">
              <div class="card-title-group">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="3" y1="15" x2="21" y2="15"></line>
                  <line x1="9" y1="9" x2="9" y2="21"></line>
                </svg>
                <h2 class="card-title">Daftar Tugas</h2>
              </div>
              <div class="card-header-actions">
                <span class="card-badge">{{ tasks.length }} tugas</span>
                <!-- Tombol Download Backup -->
                <div class="backup-menu-wrap" ref="backupMenuRef">
                  <button
                    class="backup-btn"
                    @click="taskStore.toggleBackupMenu"
                    :disabled="backupLoading"
                    title="Download Backup CSV"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    {{ backupLoading ? 'Memuat...' : 'Backup' }}
                  </button>

                  <!-- Dropdown daftar backup -->
                  <div v-if="showBackupMenu" class="backup-dropdown">
                    <div class="backup-dropdown-header">File Backup Tersedia</div>
                    <div v-if="backupLoading" class="backup-loading">
                      <span class="pulse-dot"></span> Memuat daftar...
                    </div>
                    <div v-else-if="latestBackups.length === 0" class="backup-empty">
                      Belum ada file backup.<br/>
                      <span class="backup-hint">Jalankan Edge Function terlebih dahulu.</span>
                    </div>
                    <ul v-else class="backup-list">
                      <li
                        v-for="file in latestBackups"
                        :key="file.name"
                        class="backup-item"
                        @click="taskStore.downloadBackup(file.name)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                        <div class="backup-item-info">
                          <span class="backup-item-name">{{ file.name }}</span>
                          <span class="backup-item-meta">{{ taskStore.formatBackupDate(file.created_at) }} · {{ taskStore.formatFileSize(file.size_bytes) }}</span>
                        </div>
                        <svg class="backup-item-dl" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div class="card-body no-padding">
              <TaskList
                :tasks="tasks"
                :pending="pending"
                @toggle="handleToggleTask"
                @delete="handleDeleteTask"
                @edit="handleEditTask"
                @open-lightbox="taskStore.openLightbox"
              />
            </div>
          </div>
        </div>

        <!-- Activity Log Card -->
        <div class="content-card activity-card">
          <div class="card-header">
            <div class="card-title-group">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <h2 class="card-title">Realtime Activity Log</h2>
            </div>
            <span class="realtime-dot" :class="{ connected: isRealtimeConnected }" :title="isRealtimeConnected ? 'Terhubung' : 'Menghubungkan...'"></span>
          </div>
          <div class="card-body activity-body">
            <div v-if="activityLogs.length === 0" class="log-empty">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <p>Menunggu aktivitas realtime...</p>
            </div>
            <TransitionGroup name="log-list" tag="ul" class="log-list">
              <li v-for="log in activityLogs" :key="log.id" class="log-item">
                <span class="log-badge" :class="log.type">
                  {{ log.type === 'INSERT' ? 'BARU' : log.type === 'DELETE' ? 'HAPUS' : 'UPDATE' }}
                </span>
                <div class="log-content">
                  <span class="log-task">{{ log.task }}</span>
                  <span class="log-time">{{ log.time }}</span>
                </div>
              </li>
            </TransitionGroup>
          </div>
        </div>

        <!-- Cron Job Status Card -->
        <div class="content-card cron-card">
          <div class="card-header">
            <div class="card-title-group">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <h2 class="card-title">Auto Cleanup (pg_cron)</h2>
            </div>
            <span
              class="cron-status-badge"
              :class="cronStatus ? (cronStatus.status === 'succeeded' ? 'cron-ok' : 'cron-fail') : 'cron-pending'"
            >
              {{ cronStatus ? (cronStatus.status === 'succeeded' ? '✓ Aktif' : '✗ Error') : '⏳ Belum berjalan' }}
            </span>
          </div>
          <div class="card-body">
            <div class="cron-info-grid">
              <div class="cron-info-item">
                <span class="cron-info-label">Fungsi</span>
                <span class="cron-info-value">Hapus tugas selesai &gt; 30 hari</span>
              </div>
              <div class="cron-info-item">
                <span class="cron-info-label">Jadwal</span>
                <span class="cron-info-value mono">{{ cronStatus?.schedule ?? '0 17 * * *' }} <span class="cron-tz">(UTC)</span></span>
              </div>
              <div class="cron-info-item">
                <span class="cron-info-label">Setara WIB</span>
                <span class="cron-info-value">Setiap hari pukul 00:00</span>
              </div>
              <div class="cron-info-item">
                <span class="cron-info-label">Terakhir berjalan</span>
                <span class="cron-info-value">
                  {{ cronStatus?.last_run ? taskStore.formatCronTime(cronStatus.last_run) : 'Belum pernah berjalan' }}
                </span>
              </div>
              <div v-if="cronStatus?.message" class="cron-info-item cron-info-full">
                <span class="cron-info-label">Pesan</span>
                <span class="cron-info-value mono cron-message">{{ cronStatus.message }}</span>
              </div>
            </div>
            <button class="cron-refresh-btn" @click="taskStore.fetchCronStatus" :disabled="cronLoading">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" :class="{ spinning: cronLoading }">
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
              {{ cronLoading ? 'Memuat...' : 'Refresh Status' }}
            </button>
          </div>
        </div>
      </main>
    </div>

    <!-- Modal Lightbox Gambar -->
    <ImageLightbox :image-url="lightboxImage" @close="taskStore.closeLightbox" />
  </div>
</template>

<script setup lang="ts">
import { useTaskStore } from '~/stores/taskStore'
import type { Task, TaskFormSubmitPayload } from '~/types/task'

// ─── Pinia Store ────────────────────────────────────────────────────────────
const taskStore = useTaskStore()
const {
  tasks,
  pending,
  uploading,
  sidebarCollapsed,
  lightboxImage,
  latestBackups,
  backupLoading,
  showBackupMenu,
  activityLogs,
  isRealtimeConnected,
  cronStatus,
  cronLoading,
  completedCount,
  activeCount,
  progressPercent
} = storeToRefs(taskStore)

// ─── Template Refs ──────────────────────────────────────────────────────────
const taskFormRef = ref<{ resetForm: () => void } | null>(null)
const backupMenuRef = ref<HTMLDivElement | null>(null)

// ─── Event Handlers (delegasi ke store) ─────────────────────────────────────
const handleFormSubmit = async (payload: TaskFormSubmitPayload): Promise<void> => {
  await taskStore.addTask(payload.taskText, payload.selectedFile)
  // Reset form jika berhasil (uploading sudah false = tidak ada error)
  if (!taskStore.uploading) {
    taskFormRef.value?.resetForm()
  }
}

const handleToggleTask = (task: Task): void => {
  taskStore.toggleTask(task)
}

const handleEditTask = ({ task, newName }: { task: Task; newName: string }): void => {
  taskStore.editTask(task, newName)
}

const handleDeleteTask = (task: Task): void => {
  taskStore.deleteTask(task)
}

// ─── Tutup dropdown backup jika klik di luar ───────────────────────────────
const handleOutsideClick = (e: MouseEvent): void => {
  if (backupMenuRef.value && !backupMenuRef.value.contains(e.target as Node)) {
    taskStore.closeBackupMenu()
  }
}

// ─── Lifecycle ──────────────────────────────────────────────────────────────
onMounted(async () => {
  // 1. Ambil data awal
  await taskStore.fetchTasks()

  // 2. Ambil status cron job
  await taskStore.fetchCronStatus()

  // 3. Listener tutup dropdown backup
  document.addEventListener('click', handleOutsideClick)

  // 4. Buat koneksi Realtime
  taskStore.initRealtime()
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
  taskStore.cleanupRealtime()
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #0f172a;
  color: #f1f5f9;
}
</style>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #0f172a;
}

/* ─── SIDEBAR ─────────────────────────────────────────────────────────────── */
.sidebar {
  width: 240px;
  min-height: 100vh;
  background: #1e293b;
  border-right: 1px solid #334155;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: sticky;
  top: 0;
  height: 100vh;
}

.sidebar-collapsed {
  width: 68px;
}

.sidebar-collapsed .logo-text,
.sidebar-collapsed .nav-item span,
.sidebar-collapsed .nav-badge,
.sidebar-collapsed .nav-label,
.sidebar-collapsed .user-meta {
  display: none;
}

/* Logo */
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 18px;
  border-bottom: 1px solid #334155;
}

.logo-icon-wrap {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  flex-shrink: 0;
}

.logo-text {
  font-size: 17px;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: -0.3px;
  white-space: nowrap;
}

/* Nav */
.sidebar-nav {
  flex: 1;
  padding: 16px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
  overflow-x: hidden;
}

.nav-label {
  font-size: 10px;
  font-weight: 600;
  color: #475569;
  letter-spacing: 0.08em;
  padding: 8px 8px 4px;
  margin: 0;
  white-space: nowrap;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  color: #94a3b8;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
  white-space: nowrap;
}

.nav-item:hover {
  background: rgba(99, 102, 241, 0.1);
  color: #c7d2fe;
}

.nav-item.active {
  background: rgba(99, 102, 241, 0.15);
  color: #818cf8;
}

.nav-item svg {
  flex-shrink: 0;
}

.nav-badge {
  margin-left: auto;
  background: rgba(99, 102, 241, 0.2);
  color: #818cf8;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 20px;
}

.nav-badge.success {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}

.nav-badge.warning {
  background: rgba(251, 146, 60, 0.15);
  color: #fb923c;
}

/* Sidebar Footer */
.sidebar-footer {
  padding: 16px 12px;
  border-top: 1px solid #334155;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 34px;
  height: 34px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  flex-shrink: 0;
}

.user-meta {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
  white-space: nowrap;
}

.user-role {
  font-size: 11px;
  color: #64748b;
  white-space: nowrap;
}

/* ─── MAIN AREA ───────────────────────────────────────────────────────────── */
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow-x: hidden;
}

/* ─── PAGE CONTENT ────────────────────────────────────────────────────────── */
.page-content {
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ─── STAT CARDS ──────────────────────────────────────────────────────────── */
.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: #475569;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon.blue   { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
.stat-icon.green  { background: rgba(34, 197, 94, 0.15);  color: #4ade80; }
.stat-icon.orange { background: rgba(251, 146, 60, 0.15); color: #fb923c; }
.stat-icon.purple { background: rgba(168, 85, 247, 0.15); color: #c084fc; }

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #f1f5f9;
  line-height: 1;
}

/* ─── CONTENT GRID ────────────────────────────────────────────────────────── */
.content-grid {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 20px;
  align-items: start;
}

/* ─── CARD ────────────────────────────────────────────────────────────────── */
.content-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 14px;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid #334155;
}

.card-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #94a3b8;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #e2e8f0;
  margin: 0;
}

.card-badge {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  background: rgba(100, 116, 139, 0.1);
  border: 1px solid #334155;
  padding: 3px 10px;
  border-radius: 20px;
}

.card-body {
  padding: 20px;
}

.card-body.no-padding {
  padding: 0;
}

/* ─── RESPONSIVE ──────────────────────────────────────────────────────────── */
@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .stat-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .sidebar {
    display: none;
  }

  .page-content {
    padding: 16px;
  }

  .stat-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
}

/* ─── ACTIVITY LOG ────────────────────────────────────────────────────────── */
.activity-card {
  margin-top: 0;
}

.realtime-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #334155;
  border: 2px solid #475569;
  flex-shrink: 0;
  transition: all 0.4s ease;
}

.realtime-dot.connected {
  background: #4ade80;
  border-color: #22c55e;
  box-shadow: 0 0 8px rgba(74, 222, 128, 0.5);
  animation: pulse-green 2s ease infinite;
}

@keyframes pulse-green {
  0%, 100% { box-shadow: 0 0 6px rgba(74, 222, 128, 0.5); }
  50%       { box-shadow: 0 0 14px rgba(74, 222, 128, 0.8); }
}

.activity-body {
  padding: 0 !important;
  max-height: 320px;
  overflow-y: auto;
}

.activity-body::-webkit-scrollbar {
  width: 4px;
}

.activity-body::-webkit-scrollbar-track {
  background: transparent;
}

.activity-body::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 4px;
}

.log-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px 20px;
  color: #334155;
  font-size: 13px;
  text-align: center;
}

.log-empty svg {
  stroke: #334155;
}

.log-empty p {
  margin: 0;
  color: #475569;
}

.log-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.log-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 16px;
  border-bottom: 1px solid rgba(51, 65, 85, 0.5);
  transition: background 0.15s ease;
}

.log-item:last-child {
  border-bottom: none;
}

.log-item:hover {
  background: rgba(99, 102, 241, 0.04);
}

.log-badge {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 3px 8px;
  border-radius: 4px;
  flex-shrink: 0;
  min-width: 46px;
  text-align: center;
}

.log-badge.INSERT {
  background: rgba(34, 197, 94, 0.12);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.log-badge.DELETE {
  background: rgba(239, 68, 68, 0.12);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.log-badge.UPDATE {
  background: rgba(251, 146, 60, 0.12);
  color: #fb923c;
  border: 1px solid rgba(251, 146, 60, 0.2);
}

.log-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.log-task {
  font-size: 13px;
  color: #cbd5e1;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.log-time {
  font-size: 11px;
  color: #475569;
}

/* TransitionGroup animasi log baru masuk */
.log-list-enter-active {
  transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.log-list-leave-active {
  transition: all 0.2s ease;
  position: absolute;
}

.log-list-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.log-list-leave-to {
  opacity: 0;
}

.log-list-move {
  transition: transform 0.3s ease;
}

/* ─── CRON STATUS CARD ────────────────────────────────────────────────────── */
.cron-status-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  letter-spacing: 0.03em;
}

.cron-ok {
  background: rgba(34, 197, 94, 0.12);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.cron-fail {
  background: rgba(239, 68, 68, 0.12);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.cron-pending {
  background: rgba(100, 116, 139, 0.12);
  color: #94a3b8;
  border: 1px solid #334155;
}

.cron-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 20px;
  margin-bottom: 16px;
}

.cron-info-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.cron-info-full {
  grid-column: 1 / -1;
}

.cron-info-label {
  font-size: 11px;
  font-weight: 600;
  color: #475569;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.cron-info-value {
  font-size: 13px;
  color: #cbd5e1;
  font-weight: 500;
}

.cron-info-value.mono {
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  color: #818cf8;
}

.cron-tz {
  font-size: 10px;
  color: #475569;
}

.cron-message {
  font-size: 11px !important;
  color: #64748b !important;
  word-break: break-all;
}

.cron-refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 14px;
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 7px;
  color: #818cf8;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.cron-refresh-btn:hover:not(:disabled) {
  background: rgba(99, 102, 241, 0.15);
  border-color: rgba(99, 102, 241, 0.35);
}

.cron-refresh-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.spinning {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ─── BACKUP DOWNLOAD ─────────────────────────────────────────────────────── */
.card-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.backup-menu-wrap {
  position: relative;
}

.backup-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: 7px;
  color: #818cf8;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  white-space: nowrap;
}

.backup-btn:hover:not(:disabled) {
  background: rgba(99, 102, 241, 0.15);
  border-color: rgba(99, 102, 241, 0.4);
}

.backup-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Dropdown */
.backup-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 300px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
  z-index: 500;
  overflow: hidden;
}

.backup-dropdown-header {
  padding: 11px 14px;
  font-size: 11px;
  font-weight: 700;
  color: #475569;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  border-bottom: 1px solid #334155;
  background: rgba(15, 23, 42, 0.3);
}

.backup-loading,
.backup-empty {
  padding: 20px 14px;
  font-size: 13px;
  color: #64748b;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.backup-empty {
  flex-direction: column;
  gap: 6px;
  line-height: 1.6;
}

.backup-hint {
  font-size: 11px;
  color: #475569;
}

.pulse-dot {
  width: 7px;
  height: 7px;
  background: #6366f1;
  border-radius: 50%;
  animation: pulse 1.2s ease infinite;
  flex-shrink: 0;
}

.backup-list {
  list-style: none;
  padding: 6px 0;
  margin: 0;
  max-height: 240px;
  overflow-y: auto;
}

.backup-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.15s ease;
  color: #94a3b8;
}

.backup-item:hover {
  background: rgba(99, 102, 241, 0.06);
  color: #c7d2fe;
}

.backup-item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.backup-item-name {
  font-size: 13px;
  font-weight: 500;
  color: #e2e8f0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.backup-item-meta {
  font-size: 11px;
  color: #475569;
}

.backup-item-dl {
  color: #475569;
  flex-shrink: 0;
  transition: color 0.15s ease;
}

.backup-item:hover .backup-item-dl {
  color: #818cf8;
}
</style>