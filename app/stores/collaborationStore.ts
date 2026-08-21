import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type {
  OnlineUser,
  TypingUser,
  RemoteCursor,
  KanbanMovePayload,
  DashboardViewMode
} from '~/types/collaboration'

const COLOR_PALETTE = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#3b82f6', // Blue
  '#14b8a6', // Teal
  '#f43f5e', // Rose
  '#a855f7'  // Purple
]

/**
 * Menghasilkan warna konsisten dan deterministik berdasarkan ID/Email pengguna
 */
export function getDeterministicColor(str?: string | null): string {
  if (!str) return COLOR_PALETTE[0]
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  const index = Math.abs(hash) % COLOR_PALETTE.length
  return COLOR_PALETTE[index]
}

export const useCollaborationStore = defineStore('collaboration', () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  // ─── State ────────────────────────────────────────────────────────────────
  const onlineUsers = ref<OnlineUser[]>([])
  const typingUsers = ref<TypingUser[]>([])
  const remoteCursors = ref<Record<string, RemoteCursor>>({})
  const showRemoteCursors = ref<boolean>(true)
  const viewMode = ref<DashboardViewMode>('table')
  const isSubscribed = ref<boolean>(false)
  const channel = ref<RealtimeChannel | null>(null)

  // Timer interval untuk membersihkan cursor & typing yang sudah tidak aktif
  let cleanupInterval: NodeJS.Timeout | null = null
  let lastCursorBroadcastTime = 0

  // ─── Getters ──────────────────────────────────────────────────────────────
  const onlineCount = computed<number>(() => onlineUsers.value.length)

  const activeTypers = computed<TypingUser[]>(() => {
    const currentUserId = user.value?.id
    return typingUsers.value.filter((t) => t.userId !== currentUserId)
  })

  const otherCursors = computed<RemoteCursor[]>(() => {
    const currentUserId = user.value?.id
    return Object.values(remoteCursors.value).filter((c) => c.userId !== currentUserId)
  })

  const myColor = computed<string>(() => {
    return getDeterministicColor(user.value?.id || user.value?.email)
  })

  const myDisplayName = computed<string>(() => {
    if (!user.value) return 'Tamu'
    const metaName = user.value.user_metadata?.full_name || user.value.user_metadata?.name
    if (metaName) return metaName
    return user.value.email?.split('@')[0] || 'User'
  })

  // ─── Inisialisasi Channel Realtime Collaboration ───────────────────────────
  const initCollaborationChannel = () => {
    if (!user.value || channel.value) return

    const userId = user.value.id
    const userEmail = user.value.email || 'user@example.com'
    const userName = myDisplayName.value
    const userColor = myColor.value
    const avatarUrl = user.value.user_metadata?.avatar_url || null

    // Buat room channel kolaborasi
    const collabChannel = supabase.channel('dashboard-collaboration-room', {
      config: {
        presence: {
          key: userId
        },
        broadcast: {
          self: false
        }
      }
    })

    // 1. Presence Sync & Updates
    collabChannel
      .on('presence', { event: 'sync' }, () => {
        const state = collabChannel.presenceState<OnlineUser>()
        const users: OnlineUser[] = []

        Object.keys(state).forEach((key) => {
          const presences = state[key]
          if (presences && presences.length > 0) {
            // Ambil state presensi terbaru dari key ini
            const latest = presences[presences.length - 1]
            users.push({
              id: latest.id || key,
              email: latest.email,
              name: latest.name,
              avatarUrl: latest.avatarUrl,
              color: latest.color || getDeterministicColor(key),
              onlineAt: latest.onlineAt || new Date().toISOString(),
              currentPage: latest.currentPage || 'Dashboard'
            })
          }
        })

        // Urutkan: User yang sedang aktif sekarang ditaruh paling depan
        users.sort((a, b) => {
          if (a.id === userId) return -1
          if (b.id === userId) return 1
          return a.name.localeCompare(b.name)
        })

        onlineUsers.value = users
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        // Event user baru bergabung
        console.log('[Presence] User bergabung:', newPresences)
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        // Event user keluar
        console.log('[Presence] User keluar:', leftPresences)
      })

    // 2. Broadcast: Live Typing
    collabChannel.on('broadcast', { event: 'typing' }, ({ payload }) => {
      if (!payload || payload.userId === userId) return
      const typer: TypingUser = {
        userId: payload.userId,
        userName: payload.userName,
        userEmail: payload.userEmail,
        color: payload.color || getDeterministicColor(payload.userId),
        textPreview: payload.textPreview,
        timestamp: Date.now()
      }

      if (payload.isTyping) {
        // Tambahkan atau update user typing
        const existingIndex = typingUsers.value.findIndex((t) => t.userId === typer.userId)
        if (existingIndex >= 0) {
          typingUsers.value[existingIndex] = typer
        } else {
          typingUsers.value.push(typer)
        }
      } else {
        // Hapus dari list typing
        typingUsers.value = typingUsers.value.filter((t) => t.userId !== typer.userId)
      }
    })

    // 3. Broadcast: Live Cursor Move
    collabChannel.on('broadcast', { event: 'cursor-move' }, ({ payload }) => {
      if (!payload || payload.userId === userId) return
      remoteCursors.value[payload.userId] = {
        userId: payload.userId,
        userName: payload.userName,
        userEmail: payload.userEmail,
        color: payload.color || getDeterministicColor(payload.userId),
        xPercent: payload.xPercent,
        yPercent: payload.yPercent,
        lastUpdated: Date.now()
      }
    })

    // 4. Broadcast: Kanban Drag & Drop
    collabChannel.on('broadcast', { event: 'kanban-move' }, ({ payload }) => {
      if (!payload || payload.userId === userId) return
      console.log('[Kanban Realtime Move]', payload)
    })

    // Subscribe channel & kirim initial Presence track
    collabChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        isSubscribed.value = true
        channel.value = collabChannel

        await collabChannel.track({
          id: userId,
          email: userEmail,
          name: userName,
          avatarUrl,
          color: userColor,
          onlineAt: new Date().toISOString(),
          currentPage: 'Dashboard'
        })
      }
    })

    // Jalankan interval pembersih kursor dan typing kadaluarsa (setiap 1 detik)
    if (!cleanupInterval) {
      cleanupInterval = setInterval(() => {
        const now = Date.now()

        // Hapus typing yang sudah lebih dari 3 detik tidak aktif
        typingUsers.value = typingUsers.value.filter((t) => now - t.timestamp < 3500)

        // Hapus kursor yang sudah lebih dari 4 detik tidak bergerak
        Object.keys(remoteCursors.value).forEach((key) => {
          if (now - remoteCursors.value[key].lastUpdated > 4000) {
            delete remoteCursors.value[key]
          }
        })
      }, 1000)
    }
  }

  // ─── Broadcast Emitters ───────────────────────────────────────────────────

  /**
   * Mengirim broadcast typing status ke pengguna lain
   */
  const broadcastTyping = async (isTyping: boolean, textPreview?: string) => {
    if (!channel.value || !isSubscribed.value || !user.value) return

    try {
      await channel.value.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          userId: user.value.id,
          userName: myDisplayName.value,
          userEmail: user.value.email,
          color: myColor.value,
          isTyping,
          textPreview: textPreview ? textPreview.slice(0, 30) : undefined
        }
      })
    } catch (err) {
      console.error('[Broadcast Typing Error]', err)
    }
  }

  /**
   * Mengirim broadcast koordinat kursor ke pengguna lain (dibatasi 30-40ms throttling)
   */
  const broadcastCursor = async (xPercent: number, yPercent: number) => {
    if (!channel.value || !isSubscribed.value || !user.value) return

    const now = Date.now()
    if (now - lastCursorBroadcastTime < 35) return // Throttling ~28fps
    lastCursorBroadcastTime = now

    try {
      await channel.value.send({
        type: 'broadcast',
        event: 'cursor-move',
        payload: {
          userId: user.value.id,
          userName: myDisplayName.value,
          userEmail: user.value.email,
          color: myColor.value,
          xPercent: Math.min(100, Math.max(0, xPercent)),
          yPercent: Math.min(100, Math.max(0, yPercent))
        }
      })
    } catch (err) {
      // Abaikan minor network frame error
    }
  }

  /**
   * Mengirim broadcast saat ada perpindahan kartu Kanban
   */
  const broadcastKanbanMove = async (payload: Omit<KanbanMovePayload, 'userId' | 'userName' | 'userEmail'>) => {
    if (!channel.value || !isSubscribed.value || !user.value) return

    try {
      await channel.value.send({
        type: 'broadcast',
        event: 'kanban-move',
        payload: {
          ...payload,
          userId: user.value.id,
          userName: myDisplayName.value,
          userEmail: user.value.email
        }
      })
    } catch (err) {
      console.error('[Broadcast Kanban Move Error]', err)
    }
  }

  /**
   * Toggle visualisasi kursor rekan tim di layar
   */
  const toggleRemoteCursors = () => {
    showRemoteCursors.value = !showRemoteCursors.value
  }

  /**
   * Mengganti mode tampilan Dashboard (Tabel / Kanban)
   */
  const setViewMode = (mode: DashboardViewMode) => {
    viewMode.value = mode
  }

  /**
   * Membersihkan channel & subscription saat logout / unmount
   */
  const cleanup = async () => {
    if (cleanupInterval) {
      clearInterval(cleanupInterval)
      cleanupInterval = null
    }

    if (channel.value) {
      try {
        await channel.value.untrack()
        await supabase.removeChannel(channel.value)
      } catch (err) {
        console.error('[Collaboration Cleanup Error]', err)
      }
      channel.value = null
    }

    isSubscribed.value = false
    onlineUsers.value = []
    typingUsers.value = []
    remoteCursors.value = {}
  }

  return {
    // State & Getters
    onlineUsers,
    typingUsers,
    remoteCursors,
    showRemoteCursors,
    viewMode,
    isSubscribed,
    onlineCount,
    activeTypers,
    otherCursors,
    myColor,
    myDisplayName,

    // Actions
    initCollaborationChannel,
    broadcastTyping,
    broadcastCursor,
    broadcastKanbanMove,
    toggleRemoteCursors,
    setViewMode,
    cleanup
  }
})
