import { defineStore } from 'pinia'
import type {
  Task,
  TaskPayload,
  ActivityLog,
  RealtimeEventType,
  CronStatus,
  BackupFile
} from '~/types/task'

export const useTaskStore = defineStore('task', () => {
  // ─── Supabase Client ──────────────────────────────────────────────────────────
  const supabase = useSupabaseClient()

  // ─── State ────────────────────────────────────────────────────────────────────
  const tasks = ref<Task[]>([])
  const pending = ref<boolean>(false)
  const uploading = ref<boolean>(false)

  // Sidebar
  const sidebarCollapsed = ref<boolean>(false)

  // Lightbox
  const lightboxImage = ref<string | null>(null)

  // Backup
  const latestBackups = ref<BackupFile[]>([])
  const backupLoading = ref<boolean>(false)
  const showBackupMenu = ref<boolean>(false)

  // Activity Log (Realtime)
  const activityLogs = ref<ActivityLog[]>([])
  const isRealtimeConnected = ref<boolean>(false)
  let logIdCounter: number = 0

  // Cron Job Status
  const cronStatus = ref<CronStatus | null>(null)
  const cronLoading = ref<boolean>(false)

  // Realtime channel reference (tidak perlu reaktif)
  let realtimeChannel: ReturnType<typeof supabase.channel> | null = null

  // ─── Getters (Computed) ───────────────────────────────────────────────────────
  const completedCount = computed<number>(() =>
    tasks.value.filter((t: Task) => t.is_completed).length
  )

  const activeCount = computed<number>(() =>
    tasks.value.filter((t: Task) => !t.is_completed).length
  )

  const progressPercent = computed<number>(() => {
    if (tasks.value.length === 0) return 0
    return Math.round((completedCount.value / tasks.value.length) * 100)
  })

  // ─── Activity Log Helper ──────────────────────────────────────────────────────
  function addLog(eventType: RealtimeEventType, taskName: string): void {
    const now = new Date()
    const time = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    activityLogs.value.unshift({
      id: ++logIdCounter,
      type: eventType,
      task: taskName,
      time
    })
    // Batasi log hanya 20 entri terakhir
    if (activityLogs.value.length > 20) {
      activityLogs.value.pop()
    }
  }

  // ─── READ (Initial Fetch) ─────────────────────────────────────────────────────
  async function fetchTasks(): Promise<void> {
    pending.value = true
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tasks:', error)
    } else {
      tasks.value = (data ?? []) as Task[]
    }
    pending.value = false
  }

  // ─── UPLOAD GAMBAR ────────────────────────────────────────────────────────────
  async function uploadImage(file: File): Promise<{ url?: string; fileName?: string; error?: any }> {
    const fileExt = file.name.split('.').pop()
    const randomName = Math.random().toString(36).substring(2, 10)
    const fileName = `${Date.now()}_${randomName}.${fileExt}`

    const { error } = await supabase.storage
      .from('project-crud')
      .upload(`public/${fileName}`, file, { cacheControl: '3600', upsert: false })

    if (error) {
      console.error('Error uploading image:', error)
      return { error }
    }

    const { data: publicUrlData } = supabase.storage
      .from('project-crud')
      .getPublicUrl(`public/${fileName}`)

    return { url: publicUrlData.publicUrl, fileName }
  }

  // ─── CREATE ───────────────────────────────────────────────────────────────────
  // Realtime INSERT event akan memperbarui tasks[] secara otomatis
  async function addTask(taskText: string, selectedFile: File | null): Promise<void> {
    uploading.value = true
    let imageUrl: string | null = null

    try {
      if (selectedFile) {
        const { url, error } = await uploadImage(selectedFile)
        if (error) {
          alert('Gagal mengunggah gambar: ' + error.message)
          return
        }
        imageUrl = url ?? null
      }

      const payload: TaskPayload = {
        task: taskText,
        is_completed: false,
        image_url: imageUrl
      }

      const { error } = await (supabase
        .from('todos') as any)
        .insert([payload])

      if (error) {
        console.error('Error inserting task:', error)
        alert('Gagal menambahkan tugas: ' + error.message)
      }
      // Tidak perlu fetchTasks() — Realtime INSERT akan update tasks[]
    } catch (err) {
      console.error('Unexpected error:', err)
    } finally {
      uploading.value = false
    }
  }

  // ─── UPDATE (toggle status) ───────────────────────────────────────────────────
  // Realtime UPDATE event akan memperbarui tasks[] secara otomatis
  async function toggleTask(task: Task): Promise<void> {
    const { error } = await (supabase
      .from('todos') as any)
      .update({ is_completed: !task.is_completed })
      .eq('id', task.id)

    if (error) console.error('Error toggling task:', error)
    // Tidak perlu fetchTasks() — Realtime UPDATE akan update tasks[]
  }

  // ─── UPDATE (edit nama) ───────────────────────────────────────────────────────
  // Realtime UPDATE event akan memperbarui tasks[] secara otomatis
  async function editTask(task: Task, newName: string): Promise<void> {
    const { error } = await (supabase
      .from('todos') as any)
      .update({ task: newName })
      .eq('id', task.id)

    if (error) {
      console.error('Error editing task:', error)
      alert('Gagal mengubah nama tugas: ' + error.message)
    }
    // Tidak perlu fetchTasks() — Realtime UPDATE akan update tasks[]
  }

  // ─── DELETE ───────────────────────────────────────────────────────────────────
  // Realtime DELETE event akan memperbarui tasks[] secara otomatis
  async function deleteTask(task: Task): Promise<void> {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', task.id)

    if (error) {
      console.error('Error deleting task:', error)
      alert('Gagal menghapus tugas: ' + error.message)
      return
    }

    // Hapus file gambar dari Storage jika ada
    if (task.image_url) {
      try {
        const parts = task.image_url.split('/')
        const fileName = parts[parts.length - 1]
        const { error: storageError } = await supabase.storage
          .from('project-crud')
          .remove([`public/${fileName}`])

        if (storageError) console.error('Error deleting image from storage:', storageError)
      } catch (err) {
        console.error('Error parsing image URL:', err)
      }
    }
    // Tidak perlu fetchTasks() — Realtime DELETE akan update tasks[]
  }

  // ─── REALTIME SUBSCRIPTION ────────────────────────────────────────────────────
  function initRealtime(): void {
    realtimeChannel = supabase
      .channel('pantau-tugas')
      .on(
        'postgres_changes' as any,
        { event: '*', schema: 'public', table: 'todos' },
        (payload: any) => {
          console.log('[Realtime] Event:', payload.eventType, payload)

          if (payload.eventType === 'INSERT') {
            tasks.value.unshift(payload.new as Task)
            addLog('INSERT', (payload.new as Task).task)
          } else if (payload.eventType === 'DELETE') {
            tasks.value = tasks.value.filter((t: Task) => t.id !== payload.old.id)
            addLog('DELETE', payload.old.task ?? 'Tugas dihapus')
          } else if (payload.eventType === 'UPDATE') {
            const idx = tasks.value.findIndex((t: Task) => t.id === payload.new.id)
            if (idx !== -1) {
              tasks.value[idx] = payload.new as Task
            }
            addLog('UPDATE', (payload.new as Task).task)
          }
        }
      )
      .subscribe((status: string) => {
        isRealtimeConnected.value = status === 'SUBSCRIBED'
        console.log('[Realtime] Status:', status)
      })
  }

  function cleanupRealtime(): void {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel)
      realtimeChannel = null
    }
  }

  // ─── BACKUP ───────────────────────────────────────────────────────────────────
  async function fetchLatestBackups(): Promise<void> {
    backupLoading.value = true
    try {
      const { data, error } = await supabase.rpc('list_backup_files')
      if (!error && data) {
        latestBackups.value = data as BackupFile[]
      } else if (error) {
        console.warn('[Backup] list_backup_files belum tersedia:', error.message)
      }
    } catch (err) {
      console.warn('[Backup] Gagal memuat daftar backup:', err)
    } finally {
      backupLoading.value = false
    }
  }

  async function toggleBackupMenu(): Promise<void> {
    showBackupMenu.value = !showBackupMenu.value
    if (showBackupMenu.value) {
      await fetchLatestBackups()
    }
  }

  async function downloadBackup(fileName: string): Promise<void> {
    const { data, error } = await supabase.storage
      .from('backups')
      .download(fileName)

    if (error) {
      alert('Gagal mengunduh file: ' + error.message)
      return
    }

    // Trigger download di browser
    const url = URL.createObjectURL(data as Blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
    showBackupMenu.value = false
  }

  function closeBackupMenu(): void {
    showBackupMenu.value = false
  }

  // ─── CRON JOB STATUS ──────────────────────────────────────────────────────────
  async function fetchCronStatus(): Promise<void> {
    cronLoading.value = true
    try {
      const { data, error } = await supabase.rpc('get_cron_status')
      if (error) {
        // RPC belum ada (SQL belum dijalankan) — abaikan tanpa crash
        console.warn('[Cron] get_cron_status belum tersedia:', error.message)
      } else if (data && (data as CronStatus[]).length > 0) {
        cronStatus.value = (data as CronStatus[])[0] ?? null
      }
    } catch (err) {
      console.warn('[Cron] Gagal mengambil status:', err)
    } finally {
      cronLoading.value = false
    }
  }

  // ─── LIGHTBOX ─────────────────────────────────────────────────────────────────
  function openLightbox(url: string): void {
    lightboxImage.value = url
  }

  function closeLightbox(): void {
    lightboxImage.value = null
  }

  // ─── FORMAT HELPERS ───────────────────────────────────────────────────────────
  function formatBackupDate(iso: string | null): string {
    if (!iso) return '-'
    return new Date(iso).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  function formatFileSize(bytes: number | null): string {
    if (!bytes) return '-'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  function formatCronTime(isoString: string | null): string {
    if (!isoString) return '-'
    return new Date(isoString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  // ─── RETURN ───────────────────────────────────────────────────────────────────
  return {
    // State
    tasks,
    pending,
    uploading,
    sidebarCollapsed,
    lightboxImage,
    latestBackups,
    backupLoading,
    showBackupMenu,
    activityLogs,
    isRealtimeConnected,
    cronStatus,
    cronLoading,

    // Getters
    completedCount,
    activeCount,
    progressPercent,

    // Actions — CRUD
    fetchTasks,
    addTask,
    toggleTask,
    editTask,
    deleteTask,

    // Actions — Realtime
    initRealtime,
    cleanupRealtime,

    // Actions — Backup
    fetchLatestBackups,
    toggleBackupMenu,
    downloadBackup,
    closeBackupMenu,

    // Actions — Cron
    fetchCronStatus,

    // Actions — Lightbox
    openLightbox,
    closeLightbox,

    // Actions — Format Helpers
    formatBackupDate,
    formatFileSize,
    formatCronTime
  }
})
