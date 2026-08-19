<template>
  <form @submit.prevent="handleSubmit" class="task-form">
    <!-- Input Teks Tugas -->
    <div class="form-field">
      <label class="form-label">Nama Tugas <span class="required">*</span></label>
      <div class="input-wrapper">
        <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
        <input
          v-model="localTaskText"
          type="text"
          placeholder="Deskripsikan tugas Anda..."
          required
          class="text-input"
          :disabled="uploading"
        />
      </div>
    </div>

    <!-- File Uploader -->
    <div class="form-field">
      <label class="form-label">Lampiran Gambar <span class="optional">(Opsional)</span></label>
      <label v-if="!previewUrl" class="upload-area">
        <input
          type="file"
          accept="image/*"
          class="hidden-file-input"
          @change="onFileChange"
          :disabled="uploading"
        />
        <div class="upload-inner">
          <div class="upload-icon-wrap">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="16 16 12 12 8 16"></polyline>
              <line x1="12" y1="12" x2="12" y2="21"></line>
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
            </svg>
          </div>
          <div>
            <p class="upload-title">Klik untuk upload gambar</p>
            <p class="upload-hint">PNG, JPG, GIF hingga 10MB</p>
          </div>
        </div>
      </label>

      <div v-else class="upload-preview-container">
        <img :src="previewUrl" alt="Preview Gambar" class="upload-preview" />
        <div class="upload-preview-info">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <span class="upload-filename">{{ selectedFile?.name }}</span>
        </div>
        <button type="button" class="remove-file-btn" @click="removeFile" :disabled="uploading" title="Hapus Gambar">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>

    <!-- Divider -->
    <div class="form-divider"></div>

    <!-- Tombol Submit -->
    <button type="submit" class="submit-btn" :disabled="uploading || !localTaskText.trim()">
      <span v-if="uploading" class="spinner-container">
        <span class="spinner"></span>
        Menyimpan...
      </span>
      <span v-else class="btn-content">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
        Tambah Tugas
      </span>
    </button>
  </form>
</template>

<script setup>
import { ref } from 'vue'

// Props
const props = defineProps({
  uploading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['submit'])

// State lokal form
const localTaskText = ref('')
const selectedFile = ref(null)
const previewUrl = ref(null)

// Handle pilihan file gambar
const onFileChange = (event) => {
  const file = event.target.files[0]
  if (!file) return

  selectedFile.value = file

  // Hapus preview URL lama untuk mencegah memory leak
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
  previewUrl.value = URL.createObjectURL(file)
}

// Hapus file gambar yang terpilih
const removeFile = () => {
  selectedFile.value = null
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
  previewUrl.value = null
}

// Reset form setelah submit berhasil (dipanggil dari parent via expose)
const resetForm = () => {
  localTaskText.value = ''
  removeFile()
}

// Handle submit: emit data ke parent
const handleSubmit = () => {
  if (!localTaskText.value.trim()) return
  emit('submit', {
    taskText: localTaskText.value,
    selectedFile: selectedFile.value
  })
}

// Expose resetForm agar bisa dipanggil dari parent
defineExpose({ resetForm })
</script>

<style scoped>
.task-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* Form Field */
.form-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 5px;
}

.required {
  color: #f87171;
}

.optional {
  font-weight: 400;
  color: #475569;
  font-size: 11px;
}

/* Input */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: #475569;
  pointer-events: none;
}

.text-input {
  width: 100%;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 10px 14px 10px 36px;
  color: #e2e8f0;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s ease;
  outline: none;
}

.text-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.text-input::placeholder {
  color: #475569;
}

.text-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Upload Area */
.upload-area {
  display: block;
  border: 1.5px dashed #334155;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #0f172a;
}

.upload-area:hover {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.04);
}

.hidden-file-input {
  display: none;
}

.upload-inner {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
}

.upload-icon-wrap {
  width: 40px;
  height: 40px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #818cf8;
  flex-shrink: 0;
}

.upload-title {
  font-size: 13px;
  font-weight: 500;
  color: #94a3b8;
  margin: 0 0 3px;
}

.upload-hint {
  font-size: 11px;
  color: #475569;
  margin: 0;
}

/* Preview */
.upload-preview-container {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
}

.upload-preview {
  height: 40px;
  width: 40px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #334155;
  flex-shrink: 0;
}

.upload-preview-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  color: #64748b;
}

.upload-filename {
  font-size: 12px;
  color: #94a3b8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-file-btn {
  background: rgba(239, 68, 68, 0.1);
  border: none;
  color: #f87171;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.remove-file-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.2);
}

/* Divider */
.form-divider {
  height: 1px;
  background: #334155;
  margin: 2px 0;
}

/* Submit Button */
.submit-btn {
  background: #6366f1;
  border: none;
  border-radius: 8px;
  padding: 10px 18px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.submit-btn:hover:not(:disabled) {
  background: #4f46e5;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.submit-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.submit-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Loading Spinner */
.spinner-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner {
  width: 15px;
  height: 15px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
