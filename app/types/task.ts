// ─── Model Data Utama ─────────────────────────────────────────────────────────

/**
 * Representasi satu baris tugas dari tabel `todos` di Supabase.
 */
export interface Task {
  id: number
  task: string
  is_completed: boolean
  image_url: string | null
  created_at: string
}

/**
 * Payload yang dikirim saat membuat tugas baru (INSERT).
 * Field `id` dan `created_at` otomatis di-generate oleh database.
 */
export interface TaskPayload {
  task: string
  is_completed?: boolean
  image_url?: string | null
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
  selectedFile: File | null
}
