<template>
  <tr class="table-row" :class="{ 'row-completed': task.is_completed }">
    <!-- No -->
    <td class="td-no">{{ index }}</td>

    <!-- Tugas -->
    <td class="td-task">
      <span class="task-text" :class="{ 'completed-text': task.is_completed }">
        {{ task.task }}
      </span>
    </td>

    <!-- Status -->
    <td class="td-status">
      <button
        class="status-badge"
        :class="task.is_completed ? 'badge-done' : 'badge-active'"
        @click="emit('toggle', task)"
        :title="task.is_completed ? 'Tandai belum selesai' : 'Tandai selesai'"
      >
        <span class="badge-dot"></span>
        {{ task.is_completed ? 'Selesai' : 'Aktif' }}
      </button>
    </td>

    <!-- Gambar -->
    <td class="td-img">
      <div
        v-if="task.image_url"
        class="thumb-wrap"
        @click="emit('open-lightbox', task.image_url)"
        title="Lihat gambar"
      >
        <img :src="task.image_url" :alt="`Gambar: ${task.task}`" class="thumb-img" />
        <div class="thumb-overlay">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="11" y1="8" x2="11" y2="14"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </div>
      </div>
      <span v-else class="no-img">—</span>
    </td>

    <!-- Aksi -->
    <td class="td-action">
      <div class="action-group">
        <button @click="openEdit" class="edit-btn" title="Edit Nama Tugas">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <button @click="showConfirm = true" class="delete-btn" title="Hapus Tugas">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>
    </td>
  </tr>

  <!-- Modal Konfirmasi Hapus -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="showConfirm" class="modal-backdrop" @click.self="showConfirm = false">
        <div class="modal-box">
          <div class="modal-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </div>
          <h3 class="modal-title">Hapus Tugas</h3>
          <p class="modal-message">Apakah ingin menghapus tugas?</p>
          <p class="modal-task-name">"{{ task.task }}"</p>
          <div class="modal-actions">
            <button class="btn-cancel" @click="showConfirm = false">Batal</button>
            <button class="btn-confirm" @click="confirmDelete">Hapus</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Modal Edit Tugas -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="showEdit" class="modal-backdrop" @click.self="showEdit = false">
        <div class="modal-box">
          <div class="modal-icon edit-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </div>
          <h3 class="modal-title">Edit Nama Tugas</h3>
          <p class="modal-message">Ubah nama tugas di bawah ini</p>
          <form @submit.prevent="confirmEdit" class="edit-form">
            <input
              ref="editInputRef"
              v-model="editText"
              type="text"
              class="edit-input"
              placeholder="Nama tugas..."
              maxlength="255"
            />
            <p v-if="editError" class="edit-error">{{ editError }}</p>
            <div class="modal-actions">
              <button type="button" class="btn-cancel" @click="showEdit = false">Batal</button>
              <button type="submit" class="btn-save" :disabled="!editText.trim() || editText.trim() === task.task">Simpan</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, nextTick } from 'vue'

// Props
const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  }
})

// Emits
const emit = defineEmits(['toggle', 'delete', 'edit', 'open-lightbox'])

// ─── Konfirmasi Hapus ─────────────────────────────────────────────────────────
const showConfirm = ref(false)

const confirmDelete = () => {
  emit('delete', props.task)
  showConfirm.value = false
}

// ─── Edit Nama Tugas ──────────────────────────────────────────────────────────
const showEdit = ref(false)
const editText = ref('')
const editError = ref('')
const editInputRef = ref(null)

const openEdit = async () => {
  editText.value = props.task.task
  editError.value = ''
  showEdit.value = true
  // Fokus ke input setelah modal muncul
  await nextTick()
  editInputRef.value?.focus()
  editInputRef.value?.select()
}

const confirmEdit = () => {
  const trimmed = editText.value.trim()
  if (!trimmed) {
    editError.value = 'Nama tugas tidak boleh kosong.'
    return
  }
  if (trimmed === props.task.task) {
    showEdit.value = false
    return
  }
  emit('edit', { task: props.task, newName: trimmed })
  showEdit.value = false
}
</script>

<style scoped>
/* Table Row */
.table-row {
  border-bottom: 1px solid #1e293b;
  transition: background 0.15s ease;
}

.table-row:hover {
  background: rgba(99, 102, 241, 0.04);
}

.table-row:last-child {
  border-bottom: none;
}

.table-row.row-completed {
  opacity: 0.65;
}

td {
  padding: 13px 16px;
  vertical-align: middle;
}

/* No column */
.td-no {
  color: #475569;
  font-size: 12px;
  font-weight: 600;
  width: 48px;
}

/* Task text */
.td-task {
  max-width: 0;
}

.task-text {
  display: block;
  font-size: 14px;
  color: #e2e8f0;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.completed-text {
  text-decoration: line-through;
  color: #c1c7d3;
}

/* Status Badge */
.td-status {
  width: 110px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.badge-done {
  background: rgba(34, 197, 94, 0.1);
  color: #4ade80;
}

.badge-done:hover {
  background: rgba(34, 197, 94, 0.2);
}

.badge-active {
  background: rgba(251, 146, 60, 0.1);
  color: #fb923c;
}

.badge-active:hover {
  background: rgba(251, 146, 60, 0.2);
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}

/* Image thumbnail */
.td-img {
  width: 80px;
}

.thumb-wrap {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  border: 1px solid #334155;
  transition: all 0.2s ease;
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  color: #fff;
}

.thumb-wrap:hover {
  border-color: #6366f1;
  transform: scale(1.05);
}

.thumb-wrap:hover .thumb-overlay {
  opacity: 1;
}

.no-img {
  color: #334155;
  font-size: 14px;
}

/* Action Buttons */
.td-action {
  width: 100px;
  text-align: center;
}

.action-group {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.edit-btn {
  background: transparent;
  border: 1px solid transparent;
  color: #475569;
  cursor: pointer;
  width: 30px;
  height: 30px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  background: rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.2);
  color: #818cf8;
}

.delete-btn {
  background: transparent;
  border: 1px solid transparent;
  color: #475569;
  cursor: pointer;
  width: 30px;
  height: 30px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

/* ─── Modal ────────────────────────────────────────────────────────────────── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
}

.modal-box {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 16px;
  padding: 32px 28px;
  max-width: 380px;
  width: 100%;
  text-align: center;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
}

.modal-icon {
  width: 56px;
  height: 56px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 18px;
  color: #f87171;
}

.modal-title {
  font-size: 17px;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0 0 8px;
}

.modal-message {
  font-size: 14px;
  color: #94a3b8;
  margin: 0 0 6px;
}

.modal-task-name {
  font-size: 13px;
  color: #818cf8;
  font-style: italic;
  margin: 0 0 24px;
  word-break: break-word;
}

.modal-actions {
  display: flex;
  gap: 10px;
}

.btn-cancel {
  flex: 1;
  padding: 9px 16px;
  border-radius: 8px;
  border: 1px solid #334155;
  background: transparent;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #e2e8f0;
}

.btn-confirm {
  flex: 1;
  padding: 9px 16px;
  border-radius: 8px;
  border: none;
  background: #ef4444;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.btn-confirm:hover {
  background: #dc2626;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

/* Animasi Modal */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .modal-box,
.modal-leave-active .modal-box {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-enter-from .modal-box {
  transform: scale(0.88) translateY(8px);
}
.modal-leave-to .modal-box {
  transform: scale(0.92);
}

/* Edit Modal Overrides */
.edit-icon {
  background: rgba(99, 102, 241, 0.12) !important;
  color: #818cf8 !important;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 4px;
}

.edit-input {
  width: 100%;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 10px 14px;
  color: #e2e8f0;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;
}

.edit-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.edit-error {
  font-size: 12px;
  color: #f87171;
  margin: -6px 0 0;
  text-align: left;
}

.btn-save {
  flex: 1;
  padding: 9px 16px;
  border-radius: 8px;
  border: none;
  background: #6366f1;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.btn-save:hover:not(:disabled) {
  background: #4f46e5;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.btn-save:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
</style>

