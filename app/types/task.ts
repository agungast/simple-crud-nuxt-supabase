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

// ─── Enum Types ───────────────────────────────────────────────────────────────

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE' | 'ARCHIVED'

// ─── Subtask Model ────────────────────────────────────────────────────────────

export interface Subtask {
  id: string
  task_id: string
  title: string
  is_completed: boolean
  created_at: string
}

export interface SubtaskPayload {
  title: string
  is_completed?: boolean
}

// ─── Project / Space Model (Notion-style Spaces) ─────────────────────────────

export interface Project {
  id: string
  user_id?: string
  name: string
  icon: string
  color: string
  created_at?: string
  task_count?: number
}

export interface ProjectPayload {
  name: string
  icon?: string
  color?: string
}

// ─── Main Task Model (Jira + Notion Hybrid) ───────────────────────────────────

/**
 * Representasi satu baris tugas dari tabel `tasks` di Supabase.
 */
export interface Task {
  id: string
  user_id: string
  project_id?: string | null
  title: string
  description_markdown?: string
  status: TaskStatus
  priority: TaskPriority
  tags: string[]
  due_date: string | null
  estimated_hours?: number
  actual_hours?: number
  cover_image_url?: string | null
  created_at: string
  updated_at?: string
  
  // Relational Data (Optional untuk view)
  project?: Project | null
  subtasks?: Subtask[]
  task_attachments?: TaskAttachment[]
}

/**
 * Payload yang dikirim saat membuat tugas baru (INSERT) atau mengedit (UPDATE).
 */
export interface TaskPayload {
  user_id?: string
  project_id?: string | null
  title?: string
  description_markdown?: string
  status?: TaskStatus
  priority?: TaskPriority
  tags?: string[]
  due_date?: string | null
  estimated_hours?: number
  actual_hours?: number
  cover_image_url?: string | null
}

// ─── Form Submit & Edit Payloads ──────────────────────────────────────────────

/**
 * Payload yang dikirim oleh komponen TaskForm saat user menekan tombol submit.
 */
export interface TaskFormSubmitPayload {
  taskText: string
  priority: TaskPriority
  status: TaskStatus
  projectId?: string | null
  dueDate?: string | null
  tags?: string[]
  estimatedHours?: number
  actualHours?: number
  files: SelectedUploadFile[]
}

/**
 * Payload untuk memperbarui atribut tugas dari modal edit.
 */
export interface TaskEditPayload {
  title: string
  priority?: TaskPriority
  status?: TaskStatus
  project_id?: string | null
  due_date?: string | null
  tags?: string[]
  estimated_hours?: number
  actual_hours?: number
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

/**
 * Sprint 3 — Template Tugas (Tabel `task_templates`).
 */
export interface TaskTemplate {
  id: string
  user_id: string
  name: string
  title_template: string
  description_markdown?: string
  priority: TaskPriority
  tags: string[]
  estimated_hours?: number
  subtasks?: string[]
  created_at: string
  updated_at?: string
}
