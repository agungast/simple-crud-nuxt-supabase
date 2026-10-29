<template>
  <Teleport to="body">
    <Transition name="project-notes">
      <div
        v-if="taskStore.showProjectNotesModal && taskStore.selectedProjectForNotes"
        class="pn-backdrop"
        @click.self="taskStore.closeProjectNotes()"
        role="dialog"
        aria-modal="true"
      >
        <div class="pn-modal">
          <div class="pn-header">
            <div class="pn-title-wrap">
              <span class="pn-icon">{{ taskStore.selectedProjectForNotes.icon }}</span>
              <div>
                <h3 class="pn-title">Wiki & Catatan — {{ taskStore.selectedProjectForNotes.name }}</h3>
                <p class="pn-subtitle">Catatan teknis per ruang kerja (Markdown)</p>
              </div>
            </div>
            <button type="button" class="pn-close" @click="taskStore.closeProjectNotes()" title="Tutup">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="pn-body">
            <div class="pn-sidebar">
              <button type="button" class="pn-new" @click="createNew">+ Catatan Baru</button>
              <div class="pn-list">
                <button
                  v-for="n in taskStore.projectNotes"
                  :key="n.id"
                  type="button"
                  class="pn-item"
                  :class="{ active: activeNoteId === n.id }"
                  @click="selectNote(n)"
                >
                  <div class="pn-item-title">{{ n.title || 'Catatan Tanpa Judul' }}</div>
                  <div class="pn-item-date">{{ formatDate(n.updated_at || n.created_at) }}</div>
                </button>
                <div v-if="taskStore.projectNotes.length === 0 && !taskStore.projectNotesLoading" class="pn-empty">Belum ada catatan.</div>
                <div v-if="taskStore.projectNotesLoading" class="pn-empty">Memuat...</div>
              </div>
            </div>

            <div class="pn-editor">
              <template v-if="activeNote">
                <input v-model="activeNote.title" class="pn-input-title" placeholder="Judul catatan..." @blur="saveActive" />
                <textarea v-model="activeNote.content_markdown" class="pn-textarea" placeholder="Tulis catatan teknis, arsitektur, link referensi... (Markdown)" spellcheck="false" @blur="saveActive"></textarea>
                <div class="pn-editor-footer">
                  <button type="button" class="pn-btn pn-btn-danger" @click="removeActive" :disabled="saving">Hapus</button>
                  <span class="pn-status">{{ saving ? 'Menyimpan...' : 'Otomatis tersimpan saat keluar fokus' }}</span>
                </div>
              </template>
              <template v-else>
                <div class="pn-empty-editor">Pilih atau buat catatan untuk mulai menulis.</div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useTaskStore } from '~/stores/taskStore'
import type { ProjectNote } from '~/types/task'

const taskStore = useTaskStore()
const activeNoteId = ref<string | null>(null)
const activeNote = ref<ProjectNote | null>(null)
const saving = ref(false)

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return d
  }
}

function selectNote(n: ProjectNote) {
  activeNoteId.value = n.id
  activeNote.value = { ...n }
}

async function createNew() {
  const proj = taskStore.selectedProjectForNotes
  if (!proj) return
  const note = await taskStore.createProjectNote({ project_id: proj.id, title: 'Catatan Tanpa Judul', content_markdown: '' })
  if (note) {
    selectNote(note)
  }
}

async function saveActive() {
  if (!activeNote.value || saving.value) return
  saving.value = true
  await taskStore.updateProjectNote(activeNote.value.id, { title: activeNote.value.title, content_markdown: activeNote.value.content_markdown })
  saving.value = false
}

async function removeActive() {
  if (!activeNote.value) return
  if (!confirm('Hapus catatan ini?')) return
  await taskStore.deleteProjectNote(activeNote.value.id)
  activeNoteId.value = null
  activeNote.value = null
}

watch(() => taskStore.projectNotes, (list) => {
  if (activeNoteId.value) {
    const found = list.find(n => n.id === activeNoteId.value)
    if (found && activeNote.value) {
      activeNote.value = { ...found, title: activeNote.value.title, content_markdown: activeNote.value.content_markdown }
    }
  }
}, { deep: true })
</script>

<style scoped>
.pn-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 99999; padding: 16px; font-family: 'Outfit', sans-serif; }
.pn-modal { width: 100%; max-width: 980px; height: 80vh; background: #0f172a; border: 1px solid #1f2a3f; border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
.pn-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid #1f2a3f; }
.pn-title-wrap { display: flex; align-items: center; gap: 10px; }
.pn-icon { font-size: 18px; }
.pn-title { margin: 0; font-size: 14px; font-weight: 600; color: #f1f5f9; }
.pn-subtitle { margin: 0; font-size: 12px; color: #94a3b8; }
.pn-close { width: 32px; height: 32px; border-radius: 8px; border: none; background: transparent; color: #94a3b8; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.pn-close:hover { background: #111726; color: #e2e8f0; }
.pn-body { flex: 1; display: grid; grid-template-columns: 260px 1fr; min-height: 0; }
.pn-sidebar { border-right: 1px solid #1f2a3f; display: flex; flex-direction: column; padding: 10px; gap: 8px; }
.pn-new { padding: 8px 10px; border-radius: 8px; border: 1px solid #1f2a3f; background: #005afb; color: #fff; font-family: inherit; cursor: pointer; font-weight: 600; }
.pn-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; }
.pn-item { text-align: left; padding: 8px 10px; border-radius: 8px; border: 1px solid transparent; background: transparent; color: #cbd5e1; cursor: pointer; font-family: inherit; }
.pn-item.active { background: #172136; border-color: #27354f; color: #f1f5f9; }
.pn-item-title { font-size: 13px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pn-item-date { font-size: 11px; color: #94a3b8; }
.pn-empty { font-size: 12px; color: #94a3b8; padding: 8px; }
.pn-editor { display: flex; flex-direction: column; min-height: 0; }
.pn-input-title { padding: 12px 16px; border: none; border-bottom: 1px solid #1f2a3f; background: transparent; color: #f8fafc; font-size: 18px; font-weight: 700; font-family: inherit; }
.pn-textarea { flex: 1; padding: 14px 16px; border: none; background: transparent; color: #e2e8f0; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13px; line-height: 1.7; resize: none; }
.pn-editor-footer { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; border-top: 1px solid #1f2a3f; }
.pn-btn { padding: 6px 12px; border-radius: 8px; border: 1px solid #1f2a3f; background: transparent; color: #cbd5e1; cursor: pointer; font-family: inherit; }
.pn-btn-danger:hover { color: #f87171; }
.pn-status { font-size: 12px; color: #94a3b8; }
.pn-empty-editor { flex: 1; display: flex; align-items: center; justify-content: center; color: #94a3b8; }
.project-notes-enter-active, .project-notes-leave-active { transition: opacity 0.2s ease; }
.project-notes-enter-active .pn-modal, .project-notes-leave-active .pn-modal { transition: transform 0.25s cubic-bezier(0.16,1,0.3,1), opacity 0.2s ease; }
.project-notes-enter-from, .project-notes-leave-to { opacity: 0; }
.project-notes-enter-from .pn-modal, .project-notes-leave-to .pn-modal { opacity: 0; transform: scale(0.98) translateY(6px); }
</style>
