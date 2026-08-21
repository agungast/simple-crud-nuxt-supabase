// ─── Realtime Collaboration Types ─────────────────────────────────────────────

/**
 * Representasi satu pengguna aktif dalam Realtime Presence room.
 */
export interface OnlineUser {
  id: string
  email: string
  name: string
  avatarUrl?: string | null
  color: string
  onlineAt: string
  currentPage?: string
  lastSeen?: string
}

/**
 * Informasi pengguna yang sedang mengetik (Live Typing Broadcast).
 */
export interface TypingUser {
  userId: string
  userName: string
  userEmail: string
  color: string
  textPreview?: string
  timestamp: number
}

/**
 * Koordinat kursor pengguna lain di layar (Live Remote Cursor Broadcast).
 * Menggunakan persentase (xPercent & yPercent) agar posisi kursor
 * relatif akurat di berbagai resolusi layar.
 */
export interface RemoteCursor {
  userId: string
  userName: string
  userEmail: string
  color: string
  xPercent: number
  yPercent: number
  lastUpdated: number
}

/**
 * Payload Broadcast untuk perpindahan kartu Kanban.
 */
export interface KanbanMovePayload {
  taskId: string | number
  taskName: string
  fromStatus: 'todo' | 'done'
  toStatus: 'todo' | 'done'
  userId: string
  userName: string
  userEmail: string
}

/**
 * Pilihan mode tampilan di Dashboard.
 */
export type DashboardViewMode = 'table' | 'kanban'

/**
 * Definisi kolom Kanban board.
 */
export type KanbanStatus = 'todo' | 'done'

export interface KanbanColumnDef {
  id: KanbanStatus
  title: string
  badgeText: string
  isCompleted: boolean
}
