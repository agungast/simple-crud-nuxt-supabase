import type { Task, TaskAttachment, Subtask } from '~/types/task'
import { useToastStore } from '~/stores/toastStore'

const PUBLIC_BUCKET = 'project-crud'
const PRIVATE_BUCKET = 'project-crud-private'
const SIGNED_URL_TTL_SECONDS = 60 * 60

export function useTaskAttachments(ctx: any) {
  const supabase = ctx.supabase
  const user = ctx.user
  const tasks = ctx.tasks
  const uploading = ctx.uploading
  const activeMenuTaskId = ctx.activeMenuTaskId
  const lightboxItems = ctx.lightboxItems
  const lightboxIndex = ctx.lightboxIndex
  const selectedTaskForAttachments = ctx.selectedTaskForAttachments
  const showAttachmentModal = ctx.showAttachmentModal

  const toast = {
    error: (msg: string, title?: string) => useToastStore().error(msg, title),
    success: (msg: string, title?: string) => useToastStore().success(msg, title),
    info: (msg: string, title?: string) => useToastStore().addToast({ message: msg, type: 'info', title })
  }

  const normalizeStoragePath = (filePathOrUrl: string): string => (filePathOrUrl || '').replace(/^\/+/, '')
  const isPrivatePath = (filePathOrUrl: string): boolean => normalizeStoragePath(filePathOrUrl).startsWith('private/')
  const resolveBucket = (filePathOrUrl: string): string => isPrivatePath(filePathOrUrl) ? PRIVATE_BUCKET : PUBLIC_BUCKET

  const signedUrlCache = ref<Record<string, string>>({})
  const pendingSignedUrls = new Set<string>()

  async function ensureSignedUrl(filePath: string): Promise<string | null> {
    const path = normalizeStoragePath(filePath)
    if (!path) return null
    const cached = signedUrlCache.value[path]
    if (cached) return cached
    if (pendingSignedUrls.has(path)) return null
    pendingSignedUrls.add(path)
    try {
      const { data, error } = await supabase.storage.from(PRIVATE_BUCKET).createSignedUrl(path, SIGNED_URL_TTL_SECONDS)
      if (error) return null
      if (data?.signedUrl) { signedUrlCache.value = { ...signedUrlCache.value, [path]: data.signedUrl }; return data.signedUrl }
      return null
    } finally { pendingSignedUrls.delete(path) }
  }

  function getCachedSignedUrl(filePath: string): string {
    const path = normalizeStoragePath(filePath)
    if (!path) return ''
    const cached = signedUrlCache.value[path]
    if (cached) return cached
    void ensureSignedUrl(path)
    return ''
  }

  async function removeStoragePaths(filePaths: string[]): Promise<void> {
    const byBucket = new Map<string, string[]>()
    for (const rawPath of filePaths) {
      const path = normalizeStoragePath(rawPath)
      if (!path) continue
      const bucket = resolveBucket(path)
      const list = byBucket.get(bucket) ?? []
      list.push(path)
      byBucket.set(bucket, list)
    }
    await Promise.allSettled([...byBucket.entries()].map(([bucket, paths]) => supabase.storage.from(bucket).remove(paths)))
  }

  function getThumbnailUrl(filePathOrUrl: string, width = 120, height = 120): string {
    if (!filePathOrUrl) return ''
    if (filePathOrUrl.startsWith('http')) {
      if (filePathOrUrl.includes('/storage/v1/object/public/')) return filePathOrUrl.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/') + `?width=${width}&height=${height}&resize=cover&quality=80`
      return filePathOrUrl
    }
    const path = normalizeStoragePath(filePathOrUrl)
    if (isPrivatePath(path)) {
      const cached = signedUrlCache.value[path]
      if (cached) return cached
      void ensureSignedUrl(path)
      return ''
    }
    const { data } = supabase.storage.from(PUBLIC_BUCKET).getPublicUrl(path, { transform: { width, height, resize: 'cover', quality: 80 } })
    return data.publicUrl
  }

  function getPublicOriginalUrl(filePath: string): string {
    if (!filePath) return ''
    if (filePath.startsWith('http')) return filePath
    const { data } = supabase.storage.from(PUBLIC_BUCKET).getPublicUrl(normalizeStoragePath(filePath))
    return data.publicUrl
  }

  async function createSignedDownloadUrl(filePath: string, expiresIn = 60): Promise<string | null> {
    const path = normalizeStoragePath(filePath)
    if (!path) return null
    try {
      const { data, error } = await supabase.storage.from(PRIVATE_BUCKET).createSignedUrl(path, expiresIn)
      if (error) return null
      return data?.signedUrl || null
    } catch { return null }
  }

  async function deleteAttachment(attachment: TaskAttachment): Promise<void> {
    try {
      const { error: dbError } = await supabase.from('task_attachments').delete().eq('id', attachment.id)
      if (dbError) { toast.error('Gagal menghapus lampiran dari database: ' + dbError.message); return }
      await supabase.storage.from('project-crud').remove([attachment.file_path])
      const targetIdx = tasks.value.findIndex((t: Task) => t.id === attachment.task_id)
      if (targetIdx !== -1 && tasks.value[targetIdx]?.task_attachments) {
        tasks.value[targetIdx].task_attachments = tasks.value[targetIdx].task_attachments!.filter((a: TaskAttachment) => a.id !== attachment.id)
      }
      if (selectedTaskForAttachments.value && selectedTaskForAttachments.value.id === attachment.task_id && selectedTaskForAttachments.value.task_attachments) {
        selectedTaskForAttachments.value.task_attachments = selectedTaskForAttachments.value.task_attachments.filter((a: TaskAttachment) => a.id !== attachment.id)
      }
      toast.success(`Lampiran '${attachment.file_name}' berhasil dihapus!`)
    } catch (err: any) { console.error('Error deleting attachment:', err); toast.error('Terjadi kesalahan saat menghapus lampiran: ' + err.message) }
  }

  function openLightboxGallery(items: any[], startIndex = 0): void {
    if (items.length === 0) return
    lightboxItems.value = items
    lightboxIndex.value = Math.max(0, Math.min(startIndex, items.length - 1))
  }
  function openLightbox(url: string, title?: string): void { lightboxItems.value = [{ url, title: title || '' }]; lightboxIndex.value = 0 }
  function closeLightbox(): void { lightboxItems.value = []; lightboxIndex.value = 0 }
  function nextLightboxImage(): void { if (lightboxItems.value.length === 0) return; lightboxIndex.value = (lightboxIndex.value + 1) % lightboxItems.value.length }
  function prevLightboxImage(): void { if (lightboxItems.value.length === 0) return; lightboxIndex.value = (lightboxIndex.value - 1 + lightboxItems.value.length) % lightboxItems.value.length }

  function openAttachmentModal(task: Task): void { selectedTaskForAttachments.value = task; showAttachmentModal.value = true }
  function closeAttachmentModal(): void { showAttachmentModal.value = false }

  return {
    getThumbnailUrl, getPublicOriginalUrl, createSignedDownloadUrl, getCachedSignedUrl, ensureSignedUrl, removeStoragePaths,
    deleteAttachment, openLightboxGallery, openLightbox, closeLightbox, nextLightboxImage, prevLightboxImage,
    openAttachmentModal, closeAttachmentModal
  }
}
