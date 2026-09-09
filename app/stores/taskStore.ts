import { defineStore } from 'pinia'
import type {
  Task,
  TaskPayload,
  TaskPriority,
  TaskStatus,
  TaskAttachment,
  SelectedUploadFile,
  TaskFormSubmitPayload,
  TaskEditPayload,
  LightboxMediaItem,
  ActivityLog,
  RealtimeEventType,
  CronStatus,
  BackupFile
} from '~/types/task'

export const useTaskStore = defineStore('task', () => {
  // ─── Supabase Client & User ──────────────────────────────────────────────────
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  // ─── State ────────────────────────────────────────────────────────────────────
  const tasks = ref<Task[]>([])
  const pending = ref<boolean>(false)
  const uploading = ref<boolean>(false)

  // Sidebar
  const sidebarCollapsed = ref<boolean>(false)

  // Lightbox (Mendukung Galeri Multi-Gambar)
  const lightboxItems = ref<LightboxMediaItem[]>([])
  const lightboxIndex = ref<number>(0)
  const lightboxImage = computed<string | null>(() => {
    if (lightboxItems.value.length === 0) return null
    return lightboxItems.value[lightboxIndex.value]?.url ?? null
  })

  // Attachment Modal
  const selectedTaskForAttachments = ref<Task | null>(null)
  const showAttachmentModal = ref<boolean>(false)

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

  // View Mode ('table' | 'kanban')
  const viewMode = ref<'table' | 'kanban'>('table')

  // Search Filter Query
  const searchQuery = ref<string>('')

  // Inisialisasi preferensi view mode dari localStorage di sisi client
  if (import.meta.client) {
    const savedView = localStorage.getItem('soloflow_view_mode')
    if (savedView === 'table' || savedView === 'kanban') {
      viewMode.value = savedView
    }
  }

  function setViewMode(mode: 'table' | 'kanban'): void {
    viewMode.value = mode
    if (import.meta.client) {
      localStorage.setItem('soloflow_view_mode', mode)
    }
  }

  // Helper parsing tags agar selalu berupa string[]
  function parseTags(rawTags: any): string[] {
    if (!rawTags) return []
    if (Array.isArray(rawTags)) return rawTags.map(t => String(t).trim()).filter(Boolean)
    if (typeof rawTags === 'string') {
      return rawTags
        .replace(/^\{|\}$/g, '')
        .split(',')
        .map(t => t.replace(/["']/g, '').trim())
        .filter(Boolean)
    }
    return []
  }

  // ─── Getters (Computed) ───────────────────────────────────────────────────────
  const filteredTasks = computed<Task[]>(() => {
    const list = Array.isArray(tasks.value) ? tasks.value : []
    const q = searchQuery.value.trim().toLowerCase()
    if (!q) return list
    return list.filter((t: Task) => {
      if (!t) return false
      const name = (t.title || t.task || '').toLowerCase()
      const matchesName = name.includes(q)
      const matchesPriority = (t.priority || '').toLowerCase().includes(q)
      const matchesStatus = (t.status || '').toLowerCase().includes(q)
      const tagsArray = parseTags(t.tags)
      const matchesTags = tagsArray.some(tag => tag.toLowerCase().includes(q))
      return matchesName || matchesPriority || matchesStatus || matchesTags
    })
  })

  const tasksByStatus = computed<Record<TaskStatus, Task[]>>(() => {
    const groups: Record<TaskStatus, Task[]> = {
      BACKLOG: [],
      TODO: [],
      IN_PROGRESS: [],
      DONE: [],
      ARCHIVED: []
    }
    const list = Array.isArray(filteredTasks.value) ? filteredTasks.value : []
    list.forEach(task => {
      if (!task) return
      const s = task.status || (task.is_completed ? 'DONE' : 'TODO')
      if (groups[s]) {
        groups[s].push(task)
      } else {
        groups.TODO.push(task)
      }
    })
    return groups
  })

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

  // ─── READ (Initial Fetch with Attachments) ────────────────────────────────────
  async function fetchTasks(): Promise<void> {
    pending.value = true
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*, task_attachments(*)')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching tasks:', error)
      } else {
        tasks.value = (data ?? []).map((t: any) => {
          const rawAtts: TaskAttachment[] = t.task_attachments ?? []
          const seen = new Set<string | number>()
          const uniqueAtts = rawAtts.filter(a => {
            if (seen.has(a.id)) return false
            seen.add(a.id)
            return true
          })
          const taskName = t.title || t.task || ''
          return {
            ...t,
            title: taskName,
            task: taskName,
            priority: t.priority || 'MEDIUM',
            status: t.status || (t.is_completed ? 'DONE' : 'TODO'),
            tags: parseTags(t.tags),
            estimated_hours: t.estimated_hours || 0,
            due_date: t.due_date || null,
            cover_image_url: t.cover_image_url || t.image_url || null,
            image_url: t.image_url || t.cover_image_url || null,
            task_attachments: uniqueAtts
          }
        }) as Task[]
      }
    } catch (err) {
      console.error('Unexpected error fetching tasks:', err)
    } finally {
      pending.value = false
    }
  }

  // ─── STORAGE V2 HELPERS ───────────────────────────────────────────────────────

  /**
   * Supabase Image Transformation:
   * Mengembalikan URL thumbnail yang ringan dan cepat (default 120x120 px).
   */
  function getThumbnailUrl(filePathOrUrl: string, width = 120, height = 120): string {
    if (!filePathOrUrl) return ''

    // Jika sudah merupakan URL penuh
    if (filePathOrUrl.startsWith('http')) {
      if (filePathOrUrl.includes('/storage/v1/object/public/')) {
        return filePathOrUrl.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/') + `?width=${width}&height=${height}&resize=cover&quality=80`
      }
      return filePathOrUrl
    }

    // Jika berupa file_path (misal: "public/1234_abc.jpg")
    const { data } = supabase.storage
      .from('project-crud')
      .getPublicUrl(filePathOrUrl, {
        transform: {
          width,
          height,
          resize: 'cover',
          quality: 80
        }
      })

    return data.publicUrl
  }

  /**
   * Mengembalikan URL asli/penuh untuk file publik.
   */
  function getPublicOriginalUrl(filePath: string): string {
    if (!filePath) return ''
    if (filePath.startsWith('http')) return filePath
    const { data } = supabase.storage.from('project-crud').getPublicUrl(filePath)
    return data.publicUrl
  }

  /**
   * Supabase Storage Signed URLs:
   * Menghasilkan URL bertanda tangan yang kedaluwarsa untuk file privat.
   */
  async function createSignedDownloadUrl(filePath: string, expiresIn = 60): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from('project-crud')
        .createSignedUrl(filePath, expiresIn)

      if (error) {
        console.error('Error creating signed URL:', error.message)
        return null
      }
      return data.signedUrl
    } catch (err) {
      console.error('Signed URL exception:', err)
      return null
    }
  }

  /**
   * Mengunduh atau membuka lampiran (otomatis generate signed URL jika privat).
   */
  async function downloadAttachment(attachment: TaskAttachment): Promise<void> {
    try {
      let downloadUrl: string | null = null

      if (attachment.is_private) {
        downloadUrl = await createSignedDownloadUrl(attachment.file_path, 120)
        if (!downloadUrl) {
          alert('Gagal membuat tautan unduh privat (Signed URL). Pastikan Anda memiliki izin akses.')
          return
        }
      } else {
        downloadUrl = getPublicOriginalUrl(attachment.file_path)
      }

      // Buka tab baru / download
      window.open(downloadUrl, '_blank')
    } catch (err: any) {
      alert('Gagal mengunduh file: ' + err.message)
    }
  }

  /**
   * Upload single file ke folder public/ atau private/ di bucket 'project-crud'.
   */
  async function uploadSingleFile(
    fileItem: SelectedUploadFile
  ): Promise<{ fileName: string; filePath: string; fileType: string; fileSize: number; isPrivate: boolean; publicUrl?: string } | null> {
    const file = fileItem.file
    const fileExt = file.name.split('.').pop() || 'bin'
    const randomName = Math.random().toString(36).substring(2, 10)
    const folder = fileItem.isPrivate ? 'private' : 'public'
    const fileName = `${Date.now()}_${randomName}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    const { error } = await supabase.storage
      .from('project-crud')
      .upload(filePath, file, {
        cacheControl: fileItem.isPrivate ? 'no-cache' : '3600',
        upsert: false
      })

    if (error) {
      console.error('Error uploading file to storage:', error)
      throw error
    }

    let publicUrl: string | undefined
    if (!fileItem.isPrivate) {
      publicUrl = getPublicOriginalUrl(filePath)
    }

    return {
      fileName: file.name,
      filePath,
      fileType: file.type || 'application/octet-stream',
      fileSize: file.size,
      isPrivate: fileItem.isPrivate,
      publicUrl
    }
  }

  // ─── CREATE (Task + Multiple Attachments) ─────────────────────────────────────
  async function addTask(
    payloadOrText: TaskFormSubmitPayload | string,
    filesOrUndefined: SelectedUploadFile[] = []
  ): Promise<void> {
    uploading.value = true

    try {
      const isObject = typeof payloadOrText === 'object'
      const taskText = isObject ? payloadOrText.taskText : payloadOrText
      const files = isObject ? payloadOrText.files : filesOrUndefined
      const priority: TaskPriority = isObject ? (payloadOrText.priority ?? 'MEDIUM') : 'MEDIUM'
      const status: TaskStatus = isObject ? (payloadOrText.status ?? 'TODO') : 'TODO'
      const dueDate: string | null = isObject ? (payloadOrText.dueDate ?? null) : null
      const estimatedHours: number = isObject ? (payloadOrText.estimatedHours ?? 0) : 0
      const tags: string[] = isObject ? (payloadOrText.tags ?? []) : []

      // 1. Dapatkan user_id sesi aktif
      let currentUserId = user.value?.id
      if (!currentUserId) {
        const { data: userData } = await supabase.auth.getUser()
        currentUserId = userData?.user?.id
      }

      // 2. Upload semua file ke storage terlebih dahulu
      const uploadedResults = []
      let primaryImageUrl: string | null = null

      for (const f of files) {
        const uploaded = await uploadSingleFile(f)
        if (uploaded) {
          uploadedResults.push(uploaded)
          // Set primary image jika berupa gambar publik pertama
          if (!primaryImageUrl && !uploaded.isPrivate && uploaded.fileType.startsWith('image/')) {
            primaryImageUrl = uploaded.publicUrl ?? null
          }
        }
      }

      // 3. Simpan tugas ke tabel `todos`
      // Kolom bawaan tabel todos adalah `task`, sedangkan PRD SoloFlow menggunakan `title`.
      // Kita kirim keduanya agar kompatibel 100% baik sebelum maupun sesudah migrasi SQL dijalankan.
      const payload: any = {
        task: taskText,
        title: taskText,
        priority,
        status,
        due_date: dueDate,
        estimated_hours: estimatedHours,
        tags,
        is_completed: status === 'DONE'
      }

      if (primaryImageUrl) {
        payload.image_url = primaryImageUrl
        payload.cover_image_url = primaryImageUrl
      }

      if (currentUserId) {
        payload.user_id = currentUserId
      }

      let { data: taskData, error: taskError } = await (supabase
        .from('todos') as any)
        .insert([payload])
        .select()
        .single()

      // Resilient fallback jika kolom alur kerja SoloFlow (priority, status, dll.) belum dieksekusi di database
      if (taskError && (taskError.message?.includes('column') || taskError.code === 'PGRST204' || taskError.message?.includes('schema cache'))) {
        console.warn('Kolom alur kerja SoloFlow belum ada di database Supabase. Menggunakan fallback kolom `task` bawaan:', taskError.message)
        const minimalPayload: any = {
          task: taskText,
          is_completed: status === 'DONE'
        }
        if (primaryImageUrl) minimalPayload.image_url = primaryImageUrl
        if (currentUserId) minimalPayload.user_id = currentUserId

        const fallbackResult = await (supabase.from('todos') as any)
          .insert([minimalPayload])
          .select()
          .single()

        taskData = fallbackResult.data
        taskError = fallbackResult.error
      }

      if (taskError) {
        console.error('Error inserting task:', taskError)
        alert('Gagal menambahkan tugas: ' + taskError.message)
        return
      }

      const taskTitle = taskData.title || taskData.task || taskText
      const newTask = {
        ...taskData,
        title: taskTitle,
        task: taskTitle,
        priority: taskData.priority || priority,
        status: taskData.status || status,
        due_date: taskData.due_date || dueDate,
        estimated_hours: taskData.estimated_hours || estimatedHours,
        tags: taskData.tags || tags,
        cover_image_url: taskData.cover_image_url || taskData.image_url || primaryImageUrl,
        image_url: taskData.image_url || taskData.cover_image_url || primaryImageUrl,
        is_completed: taskData.is_completed ?? (status === 'DONE')
      } as Task
      newTask.task_attachments = []

      // 4. Simpan relasi lampiran ke tabel `task_attachments`
      if (uploadedResults.length > 0) {
        const attachmentsPayload = uploadedResults.map(r => ({
          task_id: newTask.id,
          user_id: currentUserId,
          file_name: r.fileName,
          file_path: r.filePath,
          file_type: r.fileType,
          file_size: r.fileSize,
          is_private: r.isPrivate
        }))

        const { data: attData, error: attError } = await (supabase
          .from('task_attachments') as any)
          .insert(attachmentsPayload)
          .select()

        if (!attError && attData) {
          newTask.task_attachments = attData as TaskAttachment[]
        } else if (attError) {
          console.warn('Gagal menyimpan lampiran metadata:', attError.message)
        }
      }

      // 5. Update state lokal secara instan
      if (!tasks.value.some(t => t.id === newTask.id)) {
        tasks.value.unshift(newTask)
        addLog('INSERT', newTask.title)
      }
    } catch (err: any) {
      console.error('Unexpected error adding task:', err)
      alert('Terjadi kesalahan saat menambahkan tugas: ' + (err.message || err))
    } finally {
      uploading.value = false
    }
  }

  // ─── ADD ATTACHMENTS TO EXISTING TASK ─────────────────────────────────────────
  async function addAttachmentsToTask(taskId: string | number, files: SelectedUploadFile[]): Promise<boolean> {
    if (files.length === 0) return true
    uploading.value = true

    try {
      let currentUserId = user.value?.id
      if (!currentUserId) {
        const { data: userData } = await supabase.auth.getUser()
        currentUserId = userData?.user?.id
      }

      const uploadedResults = []
      for (const f of files) {
        const uploaded = await uploadSingleFile(f)
        if (uploaded) uploadedResults.push(uploaded)
      }

      const attachmentsPayload = uploadedResults.map(r => ({
        task_id: taskId,
        user_id: currentUserId,
        file_name: r.fileName,
        file_path: r.filePath,
        file_type: r.fileType,
        file_size: r.fileSize,
        is_private: r.isPrivate
      }))

      const { data: attData, error: attError } = await (supabase
        .from('task_attachments') as any)
        .insert(attachmentsPayload)
        .select()

      if (attError) {
        alert('Gagal menambahkan lampiran: ' + attError.message)
        return false
      }

      // Update state lokal secara aman (deduplikasi ID & shared reference fix)
      const insertedAttachments = (attData as TaskAttachment[]) || []
      const targetIdx = tasks.value.findIndex(t => t.id === taskId)
      if (targetIdx !== -1 && tasks.value[targetIdx]) {
        const existing = tasks.value[targetIdx].task_attachments || []
        const existingIds = new Set(existing.map(a => a.id))
        const uniqueNew = insertedAttachments.filter(a => !existingIds.has(a.id))
        tasks.value[targetIdx].task_attachments = [...existing, ...uniqueNew]

        if (selectedTaskForAttachments.value && selectedTaskForAttachments.value.id === taskId) {
          selectedTaskForAttachments.value.task_attachments = tasks.value[targetIdx].task_attachments
        }
      } else if (selectedTaskForAttachments.value && selectedTaskForAttachments.value.id === taskId) {
        const existing = selectedTaskForAttachments.value.task_attachments || []
        const existingIds = new Set(existing.map(a => a.id))
        const uniqueNew = insertedAttachments.filter(a => !existingIds.has(a.id))
        selectedTaskForAttachments.value.task_attachments = [...existing, ...uniqueNew]
      }

      // Tambahkan ke Activity Log
      const targetTask = tasks.value.find(t => t.id === taskId)
      const taskName = targetTask?.title || 'Tugas'
      addLog('UPDATE', `${taskName} (+${files.length} lampiran)`)

      return true
    } catch (err: any) {
      alert('Gagal mengunggah lampiran: ' + err.message)
      return false
    } finally {
      uploading.value = false
    }
  }

  // ─── DELETE ATTACHMENT ────────────────────────────────────────────────────────
  async function deleteAttachment(attachment: TaskAttachment): Promise<void> {
    try {
      // 1. Hapus dari database task_attachments
      const { error: dbError } = await supabase
        .from('task_attachments')
        .delete()
        .eq('id', attachment.id)

      if (dbError) {
        alert('Gagal menghapus lampiran dari database: ' + dbError.message)
        return
      }

      // 2. Hapus file dari Storage bucket
      await supabase.storage
        .from('project-crud')
        .remove([attachment.file_path])

      // 3. Update state lokal
      const targetIdx = tasks.value.findIndex(t => t.id === attachment.task_id)
      let taskName = 'Tugas'
      if (targetIdx !== -1 && tasks.value[targetIdx]?.task_attachments) {
        taskName = tasks.value[targetIdx].title
        tasks.value[targetIdx].task_attachments = tasks.value[targetIdx].task_attachments!.filter(
          a => a.id !== attachment.id
        )
      }

      if (selectedTaskForAttachments.value && selectedTaskForAttachments.value.id === attachment.task_id) {
        if (targetIdx !== -1 && tasks.value[targetIdx]?.task_attachments) {
          selectedTaskForAttachments.value.task_attachments = tasks.value[targetIdx].task_attachments
        } else if (selectedTaskForAttachments.value.task_attachments) {
          selectedTaskForAttachments.value.task_attachments = selectedTaskForAttachments.value.task_attachments.filter(
            a => a.id !== attachment.id
          )
        }
      }

      // Tambahkan ke Activity Log
      addLog('UPDATE', `${taskName} (hapus ${attachment.file_name})`)
    } catch (err: any) {
      console.error('Error deleting attachment:', err)
      alert('Terjadi kesalahan saat menghapus lampiran: ' + err.message)
    }
  }

  // ─── UPDATE (toggle status) ───────────────────────────────────────────────────
  async function toggleTask(task: Task): Promise<void> {
    const previousCompleted = task.is_completed
    const newCompleted = !previousCompleted
    const newStatus: TaskStatus = newCompleted ? 'DONE' : 'TODO'
    const targetIdx = tasks.value.findIndex(t => t.id === task.id)
    if (targetIdx !== -1 && tasks.value[targetIdx]) {
      tasks.value[targetIdx].is_completed = newCompleted
      tasks.value[targetIdx].status = newStatus
    }

    const { error } = await (supabase
      .from('todos') as any)
      .update({ is_completed: newCompleted, status: newStatus })
      .eq('id', task.id)

    if (error) {
      console.error('Error toggling task:', error)
      if (targetIdx !== -1 && tasks.value[targetIdx]) {
        tasks.value[targetIdx].is_completed = previousCompleted
        tasks.value[targetIdx].status = task.status
      }
    } else {
      addLog('UPDATE', `${task.title} (${newStatus})`)
    }
  }

  // ─── UPDATE (update status langsung) ───────────────────────────────────────────
  async function updateTaskStatus(task: Task, newStatus: TaskStatus): Promise<void> {
    const oldStatus = task.status
    const oldCompleted = task.is_completed
    const newCompleted = newStatus === 'DONE'
    const targetIdx = tasks.value.findIndex(t => t.id === task.id)
    if (targetIdx !== -1 && tasks.value[targetIdx]) {
      tasks.value[targetIdx].status = newStatus
      tasks.value[targetIdx].is_completed = newCompleted
    }

    let { error } = await (supabase
      .from('todos') as any)
      .update({ status: newStatus, is_completed: newCompleted })
      .eq('id', task.id)

    if (error && (error.message?.includes('column') || error.code === 'PGRST204' || error.message?.includes('schema cache'))) {
      console.warn('Kolom status belum ada di database Supabase. Menggunakan fallback status penyelesaian.')
      const fallback = await (supabase.from('todos') as any)
        .update({ is_completed: newCompleted })
        .eq('id', task.id)
      error = fallback.error
    }

    if (error) {
      console.error('Error updating status:', error)
      if (targetIdx !== -1 && tasks.value[targetIdx]) {
        tasks.value[targetIdx].status = oldStatus
        tasks.value[targetIdx].is_completed = oldCompleted
      }
    } else {
      addLog('UPDATE', `${task.title} ➔ ${newStatus}`)
    }
  }

  // ─── UPDATE (edit atribut tugas) ──────────────────────────────────────────────
  async function editTask(
    task: Task,
    payload: string | TaskEditPayload
  ): Promise<void> {
    const targetIdx = tasks.value.findIndex(t => t.id === task.id)
    const oldTask = { ...task }
    const editData: TaskEditPayload = typeof payload === 'string' ? { title: payload } : payload
    const newTitle = editData.title.trim()
    const newStatus = editData.status ?? task.status
    const newCompleted = newStatus === 'DONE'

    if (targetIdx !== -1 && tasks.value[targetIdx]) {
      tasks.value[targetIdx].title = newTitle
      tasks.value[targetIdx].task = newTitle
      if (editData.priority) tasks.value[targetIdx].priority = editData.priority
      if (editData.status) {
        tasks.value[targetIdx].status = editData.status
        tasks.value[targetIdx].is_completed = newCompleted
      }
      if (editData.due_date !== undefined) tasks.value[targetIdx].due_date = editData.due_date
      if (editData.estimated_hours !== undefined) tasks.value[targetIdx].estimated_hours = editData.estimated_hours
      if (editData.tags !== undefined) tasks.value[targetIdx].tags = editData.tags
    }

    const updatePayload: any = {
      task: newTitle,
      title: newTitle,
      ...(editData.priority ? { priority: editData.priority } : {}),
      ...(editData.status ? { status: editData.status, is_completed: newCompleted } : {}),
      ...(editData.due_date !== undefined ? { due_date: editData.due_date } : {}),
      ...(editData.estimated_hours !== undefined ? { estimated_hours: editData.estimated_hours } : {}),
      ...(editData.tags !== undefined ? { tags: editData.tags } : {})
    }

    let { error } = await (supabase
      .from('todos') as any)
      .update(updatePayload)
      .eq('id', task.id)

    if (error && (error.message?.includes('column') || error.code === 'PGRST204' || error.message?.includes('schema cache'))) {
      console.warn('Kolom atribut SoloFlow belum ada di database Supabase. Menggunakan fallback pembaruan kolom task bawaan.')
      const fallback = await (supabase.from('todos') as any)
        .update({ task: newTitle, is_completed: newCompleted })
        .eq('id', task.id)
      error = fallback.error
    }

    if (error) {
      console.error('Error editing task:', error)
      alert('Gagal mengubah tugas: ' + error.message)
      if (targetIdx !== -1 && tasks.value[targetIdx]) {
        Object.assign(tasks.value[targetIdx], oldTask)
      }
    } else {
      addLog('UPDATE', newTitle)
    }
  }

  // ─── DELETE TASK ──────────────────────────────────────────────────────────────
  async function deleteTask(task: Task): Promise<void> {
    const oldTasks = [...tasks.value]
    tasks.value = tasks.value.filter(t => t.id !== task.id)

    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', task.id)

    if (error) {
      console.error('Error deleting task:', error)
      alert('Gagal menghapus tugas: ' + error.message)
      tasks.value = oldTasks
      return
    }

    addLog('DELETE', task.title)

    // Hapus semua file lampiran terkait dari Storage jika ada
    if (task.task_attachments && task.task_attachments.length > 0) {
      const paths = task.task_attachments.map(a => a.file_path)
      try {
        await supabase.storage.from('project-crud').remove(paths)
      } catch (err) {
        console.warn('Error batch deleting storage files:', err)
      }
    } else if (task.cover_image_url) {
      // Legacy cleanup
      try {
        const parts = task.cover_image_url.split('/')
        const fileName = parts[parts.length - 1]
        await supabase.storage.from('project-crud').remove([`public/${fileName}`])
      } catch (err) {
        console.error('Error parsing image URL:', err)
      }
    }
  }

  // ─── REALTIME SUBSCRIPTION ────────────────────────────────────────────────────
  function initRealtime(): void {
    cleanupRealtime()

    realtimeChannel = supabase
      .channel('pantau-tugas-v2')
      .on(
        'postgres_changes' as any,
        { event: '*', schema: 'public', table: 'todos' },
        (payload: any) => {
          const currentUserId = user.value?.id

          if (payload.eventType === 'INSERT') {
            const raw = payload.new as any
            const taskName = raw.title || raw.task || 'Tugas'
            const newTask = {
              ...raw,
              title: taskName,
              task: taskName,
              priority: raw.priority || 'MEDIUM',
              status: raw.status || (raw.is_completed ? 'DONE' : 'TODO'),
              tags: raw.tags || [],
              estimated_hours: raw.estimated_hours || 0,
              due_date: raw.due_date || null,
              cover_image_url: raw.cover_image_url || raw.image_url || null,
              image_url: raw.image_url || raw.cover_image_url || null,
              task_attachments: []
            } as Task

            if (!newTask.user_id || newTask.user_id === currentUserId) {
              if (!tasks.value.some(t => t.id === newTask.id)) {
                tasks.value.unshift(newTask)
                addLog('INSERT', taskName)
              }
            }
          } else if (payload.eventType === 'DELETE') {
            const taskName = payload.old.title ?? payload.old.task ?? 'Tugas dihapus'
            const alreadyRemoved = !tasks.value.some(t => t.id === payload.old.id)
            tasks.value = tasks.value.filter((t: Task) => t.id !== payload.old.id)
            if (!alreadyRemoved) {
              addLog('DELETE', taskName)
            }
          } else if (payload.eventType === 'UPDATE') {
            const raw = payload.new as any
            const taskName = raw.title || raw.task || ''
            const idx = tasks.value.findIndex((t: Task) => t.id === raw.id)
            if (idx !== -1 && tasks.value[idx]) {
              const oldTask = tasks.value[idx]
              const existingAttachments = oldTask.task_attachments || []
              tasks.value[idx] = {
                ...raw,
                title: taskName,
                task: taskName,
                priority: raw.priority || oldTask.priority || 'MEDIUM',
                status: raw.status || (raw.is_completed ? 'DONE' : 'TODO'),
                tags: raw.tags || oldTask.tags || [],
                estimated_hours: raw.estimated_hours || oldTask.estimated_hours || 0,
                due_date: raw.due_date || oldTask.due_date || null,
                cover_image_url: raw.cover_image_url || raw.image_url || oldTask.cover_image_url || null,
                image_url: raw.image_url || raw.cover_image_url || oldTask.image_url || null,
                task_attachments: existingAttachments
              }
              if (oldTask.is_completed !== raw.is_completed || (oldTask.title !== taskName && oldTask.task !== taskName)) {
                addLog('UPDATE', taskName)
              }
            }
          }
        }
      )
      .on(
        'postgres_changes' as any,
        { event: '*', schema: 'public', table: 'task_attachments' },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            const newAtt = payload.new as TaskAttachment
            const targetIdx = tasks.value.findIndex(t => t.id === newAtt.task_id)
            if (targetIdx !== -1 && tasks.value[targetIdx]) {
              const existing = tasks.value[targetIdx].task_attachments || []
              if (!existing.some(a => a.id === newAtt.id)) {
                tasks.value[targetIdx].task_attachments = [...existing, newAtt]
                addLog('UPDATE', `${tasks.value[targetIdx].title} (+1 lampiran)`)
              }
            }
          } else if (payload.eventType === 'DELETE') {
            const oldAtt = payload.old as TaskAttachment
            const targetIdx = tasks.value.findIndex(t => t.id === oldAtt.task_id)
            if (targetIdx !== -1 && tasks.value[targetIdx]?.task_attachments) {
              tasks.value[targetIdx].task_attachments = tasks.value[targetIdx].task_attachments!.filter(
                a => a.id !== oldAtt.id
              )
              addLog('UPDATE', `${tasks.value[targetIdx].title} (lampiran dihapus)`)
            }
          }
        }
      )
      .subscribe((status: string) => {
        isRealtimeConnected.value = status === 'SUBSCRIBED'
      })
  }

  function cleanupRealtime(): void {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel)
      realtimeChannel = null
    }
  }

  // ─── RESET STATE (LOGOUT) ─────────────────────────────────────────────────────
  function resetState(): void {
    cleanupRealtime()
    tasks.value = []
    activityLogs.value = []
    cronStatus.value = null
    latestBackups.value = []
    showBackupMenu.value = false
    lightboxItems.value = []
    lightboxIndex.value = 0
    selectedTaskForAttachments.value = null
    showAttachmentModal.value = false
    isRealtimeConnected.value = false
  }

  // ─── ATTACHMENT MODAL HANDLERS ────────────────────────────────────────────────
  function openAttachmentModal(task: Task): void {
    selectedTaskForAttachments.value = task
    showAttachmentModal.value = true
  }

  function closeAttachmentModal(): void {
    selectedTaskForAttachments.value = null
    showAttachmentModal.value = false
  }

  // ─── LIGHTBOX GALERI ──────────────────────────────────────────────────────────
  function openLightboxGallery(items: LightboxMediaItem[], startIndex = 0): void {
    if (items.length === 0) return
    lightboxItems.value = items
    lightboxIndex.value = Math.max(0, Math.min(startIndex, items.length - 1))
  }

  function openLightbox(url: string, title?: string): void {
    openLightboxGallery([{ url, title }])
  }

  function closeLightbox(): void {
    lightboxItems.value = []
    lightboxIndex.value = 0
  }

  function nextLightboxImage(): void {
    if (lightboxItems.value.length <= 1) return
    lightboxIndex.value = (lightboxIndex.value + 1) % lightboxItems.value.length
  }

  function prevLightboxImage(): void {
    if (lightboxItems.value.length <= 1) return
    lightboxIndex.value =
      (lightboxIndex.value - 1 + lightboxItems.value.length) % lightboxItems.value.length
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
    if (!bytes || bytes === 0) return '0 B'
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
    lightboxItems,
    lightboxIndex,
    lightboxImage,
    selectedTaskForAttachments,
    showAttachmentModal,
    latestBackups,
    backupLoading,
    showBackupMenu,
    activityLogs,
    isRealtimeConnected,
    cronStatus,
    cronLoading,

    // View & Filter State
    viewMode,
    searchQuery,
    setViewMode,

    // Getters
    filteredTasks,
    tasksByStatus,
    completedCount,
    activeCount,
    progressPercent,

    // Actions — Storage v2 & CRUD
    fetchTasks,
    addTask,
    addAttachmentsToTask,
    deleteAttachment,
    toggleTask,
    updateTaskStatus,
    editTask,
    deleteTask,
    getThumbnailUrl,
    getPublicOriginalUrl,
    createSignedDownloadUrl,
    downloadAttachment,

    // Actions — Attachment Modal
    openAttachmentModal,
    closeAttachmentModal,

    // Actions — Realtime & Lifecycle
    initRealtime,
    cleanupRealtime,
    resetState,

    // Actions — Backup
    fetchLatestBackups,
    toggleBackupMenu,
    downloadBackup,
    closeBackupMenu,

    // Actions — Cron
    fetchCronStatus,

    // Actions — Lightbox Galeri
    openLightboxGallery,
    openLightbox,
    closeLightbox,
    nextLightboxImage,
    prevLightboxImage,

    // Actions — Format Helpers
    formatBackupDate,
    formatFileSize,
    formatCronTime
  }
})
