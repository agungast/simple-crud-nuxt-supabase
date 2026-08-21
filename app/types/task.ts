// ─── Model Data Utama ─────────────────────────────────────────────────────────

/**
 * Representasi satu lampiran file dari tabel `task_attachments`.
 */
export interface TaskAttachment {
  id: string
  task_id: string | number
  user_id?: string | null
  file_name: string
  file_path: string
  file_type: string
  file_size: number
  is_private: boolean
  created_at: string
  // Virtual / helper URL fields untuk kemudahan render di UI
  url?: string
  thumbnail_url?: string
}

/**
 * Representasi file yang dipilih di form sebelum di-upload.
 */
export interface SelectedUploadFile {
  id: string
  file: File
  name: string
  size: number
  type: string
  previewUrl?: string
  isPrivate: boolean
}

/**
 * Representasi satu baris tugas dari tabel `todos` di Supabase.
 */
export interface Task {
  id: string | number
  task: string
  is_completed: boolean
  image_url: string | null
  created_at: string
  user_id?: string | null
  task_attachments?: TaskAttachment[]
}

/**
 * Payload yang dikirim saat membuat tugas baru (INSERT).
 * Field `id` dan `created_at` otomatis di-generate oleh database.
 */
export interface TaskPayload {
  task: string
  is_completed?: boolean
  image_url?: string | null
  user_id?: string | null
}

// ─── Activity Log (Realtime) ──────────────────────────────────────────────────

/**
 * Tipe event yang dikirim oleh Supabase Realtime Postgres Changes.
 */
export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE'

/**
 * Satu entri log aktivitas yang ditampilkan di panel Activity Log.
 */
export interface ActivityLog {
  id: number
  type: RealtimeEventType
  task: string
  time: string
}

// ─── Cron Job Status ──────────────────────────────────────────────────────────

/**
 * Representasi status cron job yang dikembalikan oleh RPC `get_cron_status`.
 */
export interface CronStatus {
  jobid?: number
  schedule?: string
  command?: string
  nodename?: string
  nodeport?: number
  database?: string
  username?: string
  active?: boolean
  status?: string
  last_run?: string
  message?: string
}

// ─── Backup File ──────────────────────────────────────────────────────────────

/**
 * Metadata file backup yang dikembalikan oleh RPC `list_backup_files`.
 */
export interface BackupFile {
  name: string
  created_at: string
  size_bytes: number
}

// ─── Form Submit Payload ──────────────────────────────────────────────────────

/**
 * Payload yang dikirim oleh komponen TaskForm saat user menekan tombol submit.
 */
export interface TaskFormSubmitPayload {
  taskText: string
  files: SelectedUploadFile[]
}

/**
 * Tipe item yang ditampilkan dalam Galeri Lightbox.
 */
export interface LightboxMediaItem {
  url: string
  title?: string
  fileName?: string
  isPrivate?: boolean
}
