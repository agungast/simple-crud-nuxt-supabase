<template>
  <tr class="table-row" :class="{ 'row-completed': task.is_completed }">
    <!-- No -->
    <td class="td-no">{{ index }}</td>

    <!-- Tugas -->
    <td class="td-task">
      <span class="task-text" :class="{ 'completed-text': task.is_completed }">
        {{ task.title }}
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

    <!-- Lampiran (Gambar & Dokumen) -->
    <td class="td-img">
      <div v-if="hasAttachments || task.cover_image_url" class="attachments-cell">
        <!-- Thumbnail Gambar Pertama (Image Transformation) -->
        <div
          v-if="primaryImage"
          class="thumb-wrap"
          @click="openGallery"
          :title="`Lihat ${imageCount} gambar`"
        >
          <img
            :src="taskStore.getThumbnailUrl(primaryImage.file_path || task.cover_image_url || '', 80, 80)"
            :alt="task.title"
            class="thumb-img"
            loading="lazy"
          />
          <div class="thumb-overlay">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span v-if="imageCount > 1" class="more-count">+{{ imageCount - 1 }}</span>
          </div>
        </div>

        <!-- Tombol / Badge Manajemen Semua Lampiran -->
        <button
          class="attachment-trigger-btn"
          @click="taskStore.openAttachmentModal(task)"
          :title="`${totalAttachments} Lampiran — Klik untuk kelola`"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
          </svg>
          <span class="att-count">{{ totalAttachments }}</span>
          <span v-if="hasPrivateAttachments" class="lock-dot" title="Memiliki file privat"></span>
        </button>
      </div>

      <!-- Tombol Tambah Lampiran Cepat jika Kosong -->
      <button
        v-else
        class="add-att-quick-btn"
        @click="taskStore.openAttachmentModal(task)"
        title="Tambah Lampiran"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span>File</span>
      </button>
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
          <p class="modal-task-name">"{{ task.title }}"</p>
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
              <button type="submit" class="btn-save" :disabled="!editText.trim() || editText.trim() === task.title">Simpan</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useTaskStore } from '~/stores/taskStore'
import type { Task, LightboxMediaItem } from '~/types/task'

const taskStore = useTaskStore()

// Props
const props = defineProps<{
  task: Task
  index: number
}>()

// Emits
const emit = defineEmits<{
  (e: 'toggle', task: Task): void
  (e: 'delete', task: Task): void
  (e: 'edit', payload: { task: Task; newName: string }): void
  (e: 'open-lightbox', url: string): void
}>()

// ─── Attachments Computed ──────────────────────────────────────────────────
const attachments = computed(() => props.task.task_attachments || [])

const totalAttachments = computed(() => {
  if (attachments.value.length > 0) return attachments.value.length
  return props.task.cover_image_url ? 1 : 0
})

const hasAttachments = computed(() => totalAttachments.value > 0)

const isImage = (mimeType: string) => mimeType ? mimeType.startsWith('image/') : false

const imageAttachments = computed(() => {
  return attachments.value.filter(a => isImage(a.file_type))
})

const imageCount = computed(() => {
  if (imageAttachments.value.length > 0) return imageAttachments.value.length
  return props.task.cover_image_url ? 1 : 0
})

const primaryImage = computed(() => {
  if (imageAttachments.value.length > 0) return imageAttachments.value[0]
  if (props.task.cover_image_url) {
    return { file_path: props.task.cover_image_url, file_name: props.task.title }
  }
  return null
})

const hasPrivateAttachments = computed(() => {
  return attachments.value.some(a => a.is_private)
})

const openGallery = () => {
  if (imageAttachments.value.length > 0) {
    const items: LightboxMediaItem[] = imageAttachments.value.map(a => ({
      url: a.is_private ? a.file_path : taskStore.getPublicOriginalUrl(a.file_path),
      title: `${props.task.title} — ${a.file_name}`,
      fileName: a.file_name,
      isPrivate: a.is_private
    }))
    taskStore.openLightboxGallery(items, 0)
  } else if (props.task.cover_image_url) {
    taskStore.openLightbox(props.task.cover_image_url, props.task.title)
  }
}

// ─── Konfirmasi Hapus ─────────────────────────────────────────────────────────
const showConfirm = ref<boolean>(false)

const confirmDelete = (): void => {
  emit('delete', props.task)
  showConfirm.value = false
}

// ─── Edit Nama Tugas ──────────────────────────────────────────────────────────
const showEdit = ref<boolean>(false)
const editText = ref<string>('')
const editError = ref<string>('')
const editInputRef = ref<HTMLInputElement | null>(null)

const openEdit = async (): Promise<void> => {
  editText.value = props.task.title
  editError.value = ''
  showEdit.value = true
  // Fokus ke input setelah modal muncul
  await nextTick()
  editInputRef.value?.focus()
  editInputRef.value?.select()
}

const confirmEdit = (): void => {
  const trimmed = editText.value.trim()
  if (!trimmed) {
    editError.value = 'Nama tugas tidak boleh kosong.'
    return
  }
  if (trimmed === props.task.title) {
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
  border-bottom: 1px solid #1c273c;
  transition: background 0.15s ease;
}

.table-row:hover {
  background: rgba(255, 255, 255, 0.02);
}

.table-row:last-child {
  border-bottom: none;
}

.table-row.row-completed {
  opacity: 0.6;
}

td {
  padding: 12px 16px;
  vertical-align: middle;
}

/* No column */
.td-no {
  color: #64748b;
  font-size: 11.5px;
  font-weight: 600;
  width: 48px;
}

/* Task text */
.td-task {
  max-width: 0;
}

.task-text {
  display: block;
  font-size: 13.5px;
  color: #f1f5f9;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.completed-text {
  text-decoration: line-through;
  color: #64748b;
}

/* Status Badge */
.td-status {
  width: 110px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  font-family: inherit;
}

.badge-done {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.2);
  color: #4ade80;
}

.badge-done:hover {
  background: rgba(34, 197, 94, 0.18);
}

.badge-active {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
}

.badge-active:hover {
  background: rgba(245, 158, 11, 0.18);
}

.badge-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}

/* Image / Attachments cell */
.td-img {
  width: 110px;
}

.attachments-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.thumb-wrap {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  border: 1px solid #1f2a3f;
  transition: border-color 0.15s ease;
  flex-shrink: 0;
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s ease;
  color: #fff;
}

.more-count {
  font-size: 8px;
  font-weight: 800;
  line-height: 1;
  margin-top: 1px;
}

.thumb-wrap:hover {
  border-color: #4f46e5;
}

.thumb-wrap:hover .thumb-overlay {
  opacity: 1;
}

.attachment-trigger-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 7px;
  border-radius: 6px;
  background: rgba(79, 70, 229, 0.08);
  border: 1px solid rgba(79, 70, 229, 0.2);
  color: #818cf8;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.attachment-trigger-btn:hover {
  background: rgba(79, 70, 229, 0.16);
  border-color: #4f46e5;
}

.lock-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #f59e0b;
}

.add-att-quick-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 7px;
  border-radius: 6px;
  background: transparent;
  border: 1px dashed #232f48;
  color: #64748b;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.add-att-quick-btn:hover {
  border-color: #818cf8;
  color: #818cf8;
  background: rgba(79, 70, 229, 0.06);
}

.no-img {
  color: #334155;
  font-size: 14px;
}

/* Action Buttons */
.td-action {
  width: 90px;
  text-align: center;
}

.action-group {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.edit-btn {
  background: transparent;
  border: 1px solid transparent;
  color: #64748b;
  cursor: pointer;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.edit-btn:hover {
  background: rgba(79, 70, 229, 0.1);
  border-color: rgba(79, 70, 229, 0.2);
  color: #818cf8;
}

.delete-btn {
  background: transparent;
  border: 1px solid transparent;
  color: #64748b;
  cursor: pointer;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
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
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
}

.modal-box {
  background: #111726;
  border: 1px solid #1f2a3f;
  border-radius: 12px;
  padding: 28px 24px;
  max-width: 380px;
  width: 100%;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
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
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
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

