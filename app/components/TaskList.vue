<template>
  <!-- Loading State -->
  <div v-if="pending" class="table-status">
    <span class="pulse-spinner"></span>
    Memuat data tugas...
  </div>

  <!-- Empty State -->
  <div v-else-if="tasks.length === 0" class="empty-state">
    <div class="empty-icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="3" y1="9" x2="21" y2="9"></line>
        <line x1="3" y1="15" x2="21" y2="15"></line>
        <line x1="9" y1="9" x2="9" y2="21"></line>
      </svg>
    </div>
    <p class="empty-title">Belum ada tugas</p>
    <p class="empty-desc">Tambahkan tugas pertama Anda menggunakan form di samping.</p>
  </div>

  <!-- Daftar Tugas -->
  <div v-else class="table-wrapper">
    <table class="data-table">
      <thead>
        <tr>
          <th class="col-no">#</th>
          <th class="col-task">Tugas</th>
          <th class="col-status">Status</th>
          <th class="col-img">Gambar</th>
          <th class="col-action">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <TaskItem
          v-for="(task, index) in tasks"
          :key="task.id"
          :task="task"
          :index="index + 1"
          @toggle="emit('toggle', $event)"
          @delete="emit('delete', $event)"
          @edit="emit('edit', $event)"
          @open-lightbox="emit('open-lightbox', $event)"
        />
      </tbody>
    </table>

    <!-- Table Footer -->
    <div class="table-footer">
      <span class="footer-info">
        Menampilkan {{ tasks.length }} dari {{ tasks.length }} tugas
      </span>
      <div class="footer-stats">
        <span class="stat-pill done">{{ completedCount }} Selesai</span>
        <span class="stat-pill active">{{ activeCount }} Aktif</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  tasks: {
    type: Array,
    required: true,
    default: () => []
  },
  pending: {
    type: Boolean,
    default: false
  }
})

// Emits — diteruskan dari TaskItem ke parent (app.vue)
const emit = defineEmits(['toggle', 'delete', 'edit', 'open-lightbox'])

// Computed stats
const completedCount = computed(() => props.tasks.filter(t => t.is_completed).length)
const activeCount = computed(() => props.tasks.filter(t => !t.is_completed).length)
</script>

<style scoped>
/* Loading */
.table-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #64748b;
  font-size: 14px;
  padding: 48px 24px;
}

.pulse-spinner {
  width: 8px;
  height: 8px;
  background: #6366f1;
  border-radius: 50%;
  animation: pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.4); }
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px;
  text-align: center;
  gap: 8px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  background: rgba(99, 102, 241, 0.08);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  margin-bottom: 8px;
}

.empty-title {
  font-size: 15px;
  font-weight: 600;
  color: #64748b;
  margin: 0;
}

.empty-desc {
  font-size: 13px;
  color: #475569;
  margin: 0;
  max-width: 260px;
}

/* Table */
.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table thead tr {
  border-bottom: 1px solid #334155;
}

.data-table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  white-space: nowrap;
  background: rgba(15, 23, 42, 0.3);
}

.col-no     { width: 48px; }
.col-task   { min-width: 180px; }
.col-status { width: 110px; }
.col-img    { width: 80px; }
.col-action { width: 80px; text-align: center; }

/* Table Footer */
.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid #334155;
  background: rgba(15, 23, 42, 0.2);
}

.footer-info {
  font-size: 12px;
  color: #475569;
}

.footer-stats {
  display: flex;
  gap: 8px;
}

.stat-pill {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
}

.stat-pill.done {
  background: rgba(34, 197, 94, 0.1);
  color: #4ade80;
}

.stat-pill.active {
  background: rgba(251, 146, 60, 0.1);
  color: #fb923c;
}
</style>
