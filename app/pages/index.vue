<template>
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
            <h2 class="card-title">Daftar Tugas Anda</h2>
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

// ─── Event Handlers ─────────────────────────────────────────────────────────
const handleFormSubmit = async (payload: TaskFormSubmitPayload): Promise<void> => {
  await taskStore.addTask(payload.taskText, payload.files)
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

const handleOutsideClick = (e: MouseEvent): void => {
  if (backupMenuRef.value && !backupMenuRef.value.contains(e.target as Node)) {
    taskStore.closeBackupMenu()
  }
}

// ─── Lifecycle ──────────────────────────────────────────────────────────────
onMounted(async () => {
  await taskStore.fetchTasks()
  await taskStore.fetchCronStatus()
  document.addEventListener('click', handleOutsideClick)
  taskStore.initRealtime()
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<style scoped>
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

.card-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
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

/* ─── BACKUP MENU ─────────────────────────────────────────────────────────── */
.backup-menu-wrap {
  position: relative;
}

.backup-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 7px;
  border: 1px solid #334155;
  background: rgba(99, 102, 241, 0.1);
  color: #818cf8;
  cursor: pointer;
  transition: all 0.2s ease;
}

.backup-btn:hover:not(:disabled) {
  background: rgba(99, 102, 241, 0.2);
  border-color: #6366f1;
}

.backup-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.backup-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  width: 260px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
  z-index: 50;
  overflow: hidden;
}

.backup-dropdown-header {
  padding: 10px 14px;
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #334155;
}

.backup-loading, .backup-empty {
  padding: 16px 14px;
  font-size: 12px;
  color: #94a3b8;
  text-align: center;
}

.backup-hint {
  font-size: 11px;
  color: #64748b;
  margin-top: 4px;
  display: block;
}

.backup-list {
  list-style: none;
  margin: 0;
  padding: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.backup-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  color: #cbd5e1;
  transition: background 0.15s ease;
}

.backup-item:hover {
  background: rgba(99, 102, 241, 0.12);
  color: #f1f5f9;
}

.backup-item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.backup-item-name {
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.backup-item-meta {
  font-size: 10px;
  color: #64748b;
}

.backup-item-dl {
  color: #6366f1;
  opacity: 0.7;
}

.backup-item:hover .backup-item-dl {
  opacity: 1;
}

/* ─── ACTIVITY LOG ────────────────────────────────────────────────────────── */
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

.log-empty {
  padding: 32px 16px;
  text-align: center;
  color: #64748b;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.log-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.log-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(51, 65, 85, 0.5);
  transition: background 0.15s ease;
}

.log-item:hover {
  background: rgba(255, 255, 255, 0.02);
}

.log-item:last-child {
  border-bottom: none;
}

.log-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 5px;
  letter-spacing: 0.5px;
}

.log-badge.INSERT { background: rgba(34, 197, 94, 0.15); color: #4ade80; }
.log-badge.UPDATE { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
.log-badge.DELETE { background: rgba(239, 68, 68, 0.15); color: #f87171; }

.log-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 0;
}

.log-task {
  font-size: 13px;
  color: #cbd5e1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 70%;
}

.log-time {
  font-size: 11px;
  color: #64748b;
  white-space: nowrap;
}

/* ─── CRON CARD ───────────────────────────────────────────────────────────── */
.cron-status-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
}

.cron-ok { background: rgba(34, 197, 94, 0.15); color: #4ade80; }
.cron-fail { background: rgba(239, 68, 68, 0.15); color: #f87171; }
.cron-pending { background: rgba(251, 146, 60, 0.15); color: #fb923c; }

.cron-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.cron-info-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.cron-info-item.cron-info-full {
  grid-column: span 2;
}

.cron-info-label {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
}

.cron-info-value {
  font-size: 13px;
  color: #cbd5e1;
  font-weight: 500;
}

.cron-info-value.mono {
  font-family: monospace;
}

.cron-tz {
  font-size: 10px;
  color: #64748b;
}

.cron-message {
  color: #94a3b8;
  font-size: 12px;
  background: rgba(15, 23, 42, 0.5);
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #334155;
}

.cron-refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 8px;
  border: 1px solid #334155;
  background: rgba(15, 23, 42, 0.6);
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cron-refresh-btn:hover:not(:disabled) {
  background: #1e293b;
  border-color: #6366f1;
  color: #f1f5f9;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
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
  .page-content {
    padding: 16px;
  }

  .stat-cards {
    grid-template-columns: 1fr;
  }

  .cron-info-grid {
    grid-template-columns: 1fr;
  }

  .cron-info-item.cron-info-full {
    grid-column: span 1;
  }
}
</style>
