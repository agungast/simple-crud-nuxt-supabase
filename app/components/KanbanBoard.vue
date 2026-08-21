<template>
  <div class="kanban-container">
    <!-- Kanban Header Bar -->
    <div class="kanban-toolbar">
      <div class="toolbar-left">
        <span class="kanban-hint">
          💡 <strong>Drag & Drop</strong> kartu tugas untuk mengubah status secara realtime.
        </span>
      </div>
      <div class="toolbar-right">
        <span class="total-badge">{{ tasks.length }} Total Tugas</span>
      </div>
    </div>

    <!-- Kanban Columns Grid -->
    <div class="kanban-grid">
      <!-- ─── KOLOM 1: TO DO (AKTIF) ──────────────────────────────────────── -->
      <div
        class="kanban-column column-todo"
        :class="{ 'is-drop-target': draggingOverColumn === 'todo' }"
        @dragover.prevent="onDragOver('todo')"
        @dragleave="onDragLeave('todo')"
        @drop="onDrop('todo')"
      >
        <div class="column-header">
          <div class="col-title-wrap">
            <span class="col-indicator indicator-todo"></span>
            <h3 class="col-title">To Do (Aktif)</h3>
          </div>
          <span class="col-count-badge badge-todo">{{ todoTasks.length }}</span>
        </div>

        <!-- Card List -->
        <div class="cards-list">
          <div
            v-if="todoTasks.length === 0"
            class="column-empty"
            :class="{ 'drop-active': draggingOverColumn === 'todo' }"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 14 14"></polyline>
            </svg>
            <p class="empty-text">Semua tugas sudah selesai!</p>
            <span class="empty-sub">Tarik tugas ke sini untuk mengaktifkan kembali</span>
          </div>

          <div
            v-for="item in todoTasks"
            :key="item.id"
            class="kanban-card"
            :class="{
              'is-being-dragged': draggedTaskId === item.id,
              'has-recent-update': recentlyUpdatedTaskId === item.id
            }"
            draggable="true"
            @dragstart="onDragStart($event, item)"
            @dragend="onDragEnd"
          >
            <!-- Card Top Row -->
            <div class="card-top">
              <span class="drag-handle" title="Geser kartu">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="9" cy="12" r="1"></circle>
                  <circle cx="9" cy="5" r="1"></circle>
                  <circle cx="9" cy="19" r="1"></circle>
                  <circle cx="15" cy="12" r="1"></circle>
                  <circle cx="15" cy="5" r="1"></circle>
                  <circle cx="15" cy="19" r="1"></circle>
                </svg>
              </span>

              <button
                class="status-toggle-btn"
                @click="handleToggle(item)"
                title="Tandai Selesai"
              >
                <div class="checkbox-circle"></div>
              </button>
            </div>

            <!-- Task Title -->
            <div class="card-body">
              <p class="card-task-title">{{ item.task }}</p>
            </div>

            <!-- Attachments Preview if any -->
            <div
              v-if="item.task_attachments && item.task_attachments.length > 0"
              class="card-attachments-row"
              @click.stop="openAttachmentModal(item)"
            >
              <div class="att-chips">
                <span class="att-chip">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                  </svg>
                  <span>{{ item.task_attachments.length }} File</span>
                </span>
                <span v-if="hasPrivateAttachment(item)" class="private-chip" title="Memuat file privat">
                  🔒
                </span>
              </div>
            </div>

            <!-- Card Footer -->
            <div class="card-footer">
              <span class="card-time">{{ formatTime(item.created_at) }}</span>
              <div class="card-actions">
                <button
                  class="card-action-btn delete-btn"
                  @click.stop="handleDelete(item.id)"
                  title="Hapus tugas"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── KOLOM 2: DONE (SELESAI) ─────────────────────────────────────── -->
      <div
        class="kanban-column column-done"
        :class="{ 'is-drop-target': draggingOverColumn === 'done' }"
        @dragover.prevent="onDragOver('done')"
        @dragleave="onDragLeave('done')"
        @drop="onDrop('done')"
      >
        <div class="column-header">
          <div class="col-title-wrap">
            <span class="col-indicator indicator-done"></span>
            <h3 class="col-title">Done (Selesai)</h3>
          </div>
          <span class="col-count-badge badge-done">{{ doneTasks.length }}</span>
        </div>

        <!-- Card List -->
        <div class="cards-list">
          <div
            v-if="doneTasks.length === 0"
            class="column-empty"
            :class="{ 'drop-active': draggingOverColumn === 'done' }"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <p class="empty-text">Belum ada tugas selesai</p>
            <span class="empty-sub">Tarik tugas ke sini saat sudah selesai dikerjakan</span>
          </div>

          <div
            v-for="item in doneTasks"
            :key="item.id"
            class="kanban-card card-is-done"
            :class="{
              'is-being-dragged': draggedTaskId === item.id,
              'has-recent-update': recentlyUpdatedTaskId === item.id
            }"
            draggable="true"
            @dragstart="onDragStart($event, item)"
            @dragend="onDragEnd"
          >
            <!-- Card Top Row -->
            <div class="card-top">
              <span class="drag-handle" title="Geser kartu">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="9" cy="12" r="1"></circle>
                  <circle cx="9" cy="5" r="1"></circle>
                  <circle cx="9" cy="19" r="1"></circle>
                  <circle cx="15" cy="12" r="1"></circle>
                  <circle cx="15" cy="5" r="1"></circle>
                  <circle cx="15" cy="19" r="1"></circle>
                </svg>
              </span>

              <button
                class="status-toggle-btn done-toggle"
                @click="handleToggle(item)"
                title="Batalkan Selesai"
              >
                <div class="checkbox-circle checked">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </button>
            </div>

            <!-- Task Title -->
            <div class="card-body">
              <p class="card-task-title is-completed">{{ item.task }}</p>
            </div>

            <!-- Attachments Preview if any -->
            <div
              v-if="item.task_attachments && item.task_attachments.length > 0"
              class="card-attachments-row"
              @click.stop="openAttachmentModal(item)"
            >
              <div class="att-chips">
                <span class="att-chip">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                  </svg>
                  <span>{{ item.task_attachments.length }} File</span>
                </span>
                <span v-if="hasPrivateAttachment(item)" class="private-chip" title="Memuat file privat">
                  🔒
                </span>
              </div>
            </div>

            <!-- Card Footer -->
            <div class="card-footer">
              <span class="card-time">{{ formatTime(item.created_at) }}</span>
              <div class="card-actions">
                <button
                  class="card-action-btn delete-btn"
                  @click.stop="handleDelete(item.id)"
                  title="Hapus tugas"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Task } from '~/types/task'
import { useTaskStore } from '~/stores/taskStore'
import { useCollaborationStore } from '~/stores/collaborationStore'

const props = defineProps<{
  tasks: Task[]
  loading?: boolean
}>()

const taskStore = useTaskStore()
const collaborationStore = useCollaborationStore()

// State Drag & Drop
const draggedTaskId = ref<string | number | null>(null)
const draggedTaskObj = ref<Task | null>(null)
const draggingOverColumn = ref<'todo' | 'done' | null>(null)
const recentlyUpdatedTaskId = ref<string | number | null>(null)

// Filter Tugas per Kolom
const todoTasks = computed(() => props.tasks.filter((t) => !t.is_completed))
const doneTasks = computed(() => props.tasks.filter((t) => t.is_completed))

// ─── Drag & Drop Event Handlers ─────────────────────────────────────────────
const onDragStart = (e: DragEvent, task: Task) => {
  draggedTaskId.value = task.id
  draggedTaskObj.value = task
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(task.id))
  }
}

const onDragOver = (column: 'todo' | 'done') => {
  draggingOverColumn.value = column
}

const onDragLeave = (column: 'todo' | 'done') => {
  if (draggingOverColumn.value === column) {
    draggingOverColumn.value = null
  }
}

const onDragEnd = () => {
  draggedTaskId.value = null
  draggedTaskObj.value = null
  draggingOverColumn.value = null
}

const onDrop = async (targetColumn: 'todo' | 'done') => {
  const currentTask = draggedTaskObj.value
  draggingOverColumn.value = null
  draggedTaskId.value = null
  draggedTaskObj.value = null

  if (!currentTask) return

  const targetIsCompleted = targetColumn === 'done'

  // Jika dipindah ke kolom yang sama, tidak perlu update
  if (currentTask.is_completed === targetIsCompleted) return

  // Beri efek highlight pada kartu yang baru dipindahkan
  recentlyUpdatedTaskId.value = currentTask.id
  setTimeout(() => {
    recentlyUpdatedTaskId.value = null
  }, 1200)

  // 1. Broadcast event move ke anggota tim lain
  collaborationStore.broadcastKanbanMove({
    taskId: currentTask.id,
    taskName: currentTask.task,
    fromStatus: currentTask.is_completed ? 'done' : 'todo',
    toStatus: targetColumn
  })

  // 2. Update status di database Supabase via taskStore
  await taskStore.toggleTaskStatus(currentTask)
}

// ─── Direct Actions ────────────────────────────────────────────────────────
const handleToggle = async (task: Task) => {
  recentlyUpdatedTaskId.value = task.id
  setTimeout(() => {
    recentlyUpdatedTaskId.value = null
  }, 1200)

  collaborationStore.broadcastKanbanMove({
    taskId: task.id,
    taskName: task.task,
    fromStatus: task.is_completed ? 'done' : 'todo',
    toStatus: task.is_completed ? 'todo' : 'done'
  })

  await taskStore.toggleTaskStatus(task)
}

const handleDelete = async (id: string | number) => {
  if (confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
    await taskStore.deleteTask(id)
  }
}

const openAttachmentModal = (task: Task) => {
  taskStore.openAttachmentModal(task)
}

const hasPrivateAttachment = (task: Task): boolean => {
  return task.task_attachments?.some((a) => a.is_private) || false
}

const formatTime = (isoString?: string): string => {
  if (!isoString) return ''
  try {
    const d = new Date(isoString)
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return ''
  }
}
</script>

<style scoped>
.kanban-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 480px;
  flex: 1;
}

/* ─── TOOLBAR ─────────────────────────────────────────────────────────────── */
.kanban-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid #334155;
  border-radius: 10px;
}

.kanban-hint {
  font-size: 12px;
  color: #94a3b8;
}

.kanban-hint strong {
  color: #818cf8;
}

.total-badge {
  font-size: 11px;
  font-weight: 600;
  color: #cbd5e1;
  background: #1e293b;
  border: 1px solid #334155;
  padding: 2px 8px;
  border-radius: 6px;
}

/* ─── GRID ────────────────────────────────────────────────────────────────── */
.kanban-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  flex: 1;
}

@media (max-width: 768px) {
  .kanban-grid {
    grid-template-columns: 1fr;
  }
}

/* ─── COLUMN ──────────────────────────────────────────────────────────────── */
.kanban-column {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid #334155;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  padding: 14px;
  transition: all 0.2s ease;
  min-height: 420px;
}

.kanban-column.is-drop-target {
  background: rgba(99, 102, 241, 0.08);
  border-color: #6366f1;
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.25);
  transform: translateY(-2px);
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid #334155;
  margin-bottom: 12px;
}

.col-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.col-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.indicator-todo {
  background: #f59e0b;
  box-shadow: 0 0 8px #f59e0b;
}

.indicator-done {
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
}

.col-title {
  font-size: 14px;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0;
}

.col-count-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
}

.badge-todo {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.badge-done {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

/* ─── CARDS LIST ──────────────────────────────────────────────────────────── */
.cards-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.column-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 16px;
  text-align: center;
  color: #475569;
  border: 2px dashed #334155;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.column-empty.drop-active {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.05);
  color: #818cf8;
}

.empty-text {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  margin: 8px 0 2px 0;
}

.empty-sub {
  font-size: 11px;
  color: #475569;
}

/* ─── KANBAN CARD ─────────────────────────────────────────────────────────── */
.kanban-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 12px;
  cursor: grab;
  transition: all 0.18s ease;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.kanban-card:hover {
  border-color: #475569;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
}

.kanban-card:active {
  cursor: grabbing;
}

.kanban-card.is-being-dragged {
  opacity: 0.4;
  border: 2px dashed #6366f1;
  transform: scale(0.98);
}

.kanban-card.has-recent-update {
  animation: glow-pulse 1.2s ease;
}

@keyframes glow-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.6);
    border-color: #6366f1;
  }
  70% {
    box-shadow: 0 0 0 8px rgba(99, 102, 241, 0);
    border-color: #818cf8;
  }
  100% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
  }
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.drag-handle {
  color: #475569;
  display: flex;
  align-items: center;
}

.kanban-card:hover .drag-handle {
  color: #94a3b8;
}

.status-toggle-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.checkbox-circle {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.checkbox-circle:hover {
  border-color: #22c55e;
}

.checkbox-circle.checked {
  background: #22c55e;
  border-color: #22c55e;
  color: #ffffff;
}

.card-body {
  flex: 1;
}

.card-task-title {
  font-size: 13px;
  font-weight: 500;
  color: #f1f5f9;
  margin: 0;
  line-height: 1.4;
  word-break: break-word;
}

.card-task-title.is-completed {
  color: #64748b;
  text-decoration: line-through;
}

/* Attachments */
.card-attachments-row {
  cursor: pointer;
}

.att-chips {
  display: flex;
  align-items: center;
  gap: 6px;
}

.att-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #818cf8;
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.25);
  padding: 2px 6px;
  border-radius: 5px;
  transition: background 0.15s ease;
}

.att-chip:hover {
  background: rgba(99, 102, 241, 0.22);
}

.private-chip {
  font-size: 11px;
}

/* Footer */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 6px;
  border-top: 1px solid rgba(51, 65, 85, 0.6);
  margin-top: 4px;
}

.card-time {
  font-size: 10px;
  color: #64748b;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-action-btn {
  background: none;
  border: none;
  color: #64748b;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.delete-btn:hover {
  color: #f87171;
  background: rgba(239, 68, 68, 0.1);
}
</style>
