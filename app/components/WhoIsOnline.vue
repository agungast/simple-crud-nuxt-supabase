<template>
  <div class="online-presence-container" ref="containerRef">
    <!-- Trigger Button (Avatar Stack + Online Counter) -->
    <button
      class="presence-trigger-btn"
      :class="{ 'is-open': isOpen }"
      @click="toggleDropdown"
      :title="`Lihat siapa yang sedang online (${collaborationStore.onlineCount} aktif)`"
    >
      <!-- Avatar Stack -->
      <div class="avatar-stack">
        <div
          v-for="(u, idx) in visibleAvatars"
          :key="u.id"
          class="stack-avatar"
          :style="{
            borderColor: u.color,
            backgroundColor: `${u.color}25`,
            zIndex: 10 - idx
          }"
        >
          <img v-if="u.avatarUrl" :src="u.avatarUrl" :alt="u.name" class="avatar-img" />
          <span v-else class="avatar-initials" :style="{ color: u.color }">
            {{ getInitials(u.name) }}
          </span>
          <span class="online-dot" :style="{ backgroundColor: u.color }"></span>
        </div>

        <!-- Overflow Count (+2, +3, dst.) -->
        <div v-if="remainingCount > 0" class="stack-avatar overflow-avatar">
          +{{ remainingCount }}
        </div>
      </div>

      <!-- Online Count Text Pill -->
      <div class="online-pill">
        <span class="live-pulse-dot"></span>
        <span class="online-text">
          <span class="count-num">{{ collaborationStore.onlineCount }}</span> Online
        </span>
      </div>

      <svg class="chevron-icon" :class="{ rotated: isOpen }" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>

    <!-- Dropdown Detail Popover -->
    <Transition name="fade-scale">
      <div v-if="isOpen" class="presence-popover">
        <div class="popover-header">
          <div class="header-left">
            <span class="live-radar-dot"></span>
            <h3 class="popover-title">Siapa yang Online</h3>
          </div>
          <span class="popover-badge">{{ collaborationStore.onlineCount }} Aktif</span>
        </div>

        <div class="popover-body">
          <div v-if="collaborationStore.onlineUsers.length === 0" class="presence-empty">
            <span>Menghubungkan ke room...</span>
          </div>

          <div v-else class="user-list">
            <div
              v-for="u in collaborationStore.onlineUsers"
              :key="u.id"
              class="user-item"
              :class="{ 'is-me': u.id === currentUser?.id }"
            >
              <!-- Avatar -->
              <div
                class="user-avatar-wrap"
                :style="{
                  borderColor: u.color,
                  backgroundColor: `${u.color}20`
                }"
              >
                <img v-if="u.avatarUrl" :src="u.avatarUrl" :alt="u.name" class="user-img" />
                <span v-else class="user-initials" :style="{ color: u.color }">
                  {{ getInitials(u.name) }}
                </span>
                <span class="status-indicator" :style="{ backgroundColor: u.color }"></span>
              </div>

              <!-- User Info -->
              <div class="user-info">
                <div class="user-name-row">
                  <span class="user-name">{{ u.name }}</span>
                  <span v-if="u.id === currentUser?.id" class="me-tag">Anda</span>
                </div>
                <span class="user-email">{{ u.email }}</span>
                <div class="user-activity">
                  <span class="activity-page">📍 {{ u.currentPage || 'Dashboard' }}</span>
                  <span class="online-since">{{ formatSinceTime(u.onlineAt) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Popover Footer -->
        <div class="popover-footer">
          <span class="footer-hint">Realtime Presence didukung oleh Supabase Channel</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCollaborationStore } from '~/stores/collaborationStore'

const collaborationStore = useCollaborationStore()
const currentUser = useSupabaseUser()

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)

// Maksimal 3 avatar bertumpuk yang ditampilkan di tombol
const visibleAvatars = computed(() => collaborationStore.onlineUsers.slice(0, 3))
const remainingCount = computed(() => Math.max(0, collaborationStore.onlineCount - 3))

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const getInitials = (name?: string): string => {
  if (!name) return 'U'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

const formatSinceTime = (isoString?: string): string => {
  if (!isoString) return 'Baru saja'
  try {
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000)
    if (diff < 60) return 'Baru saja bergabung'
    const mins = Math.floor(diff / 60)
    if (mins < 60) return `Aktif ${mins}m lalu`
    const hours = Math.floor(mins / 60)
    return `Aktif ${hours}j lalu`
  } catch {
    return 'Online'
  }
}

// Tutup popover jika user mengklik di luar komponen
const handleClickOutside = (e: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.online-presence-container {
  position: relative;
  display: inline-flex;
  align-items: center;
}

/* ─── TRIGGER BUTTON ──────────────────────────────────────────────────────── */
.presence-trigger-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid #334155;
  padding: 4px 10px 4px 6px;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
}

.presence-trigger-btn:hover,
.presence-trigger-btn.is-open {
  background: rgba(30, 41, 59, 0.95);
  border-color: #6366f1;
  box-shadow: 0 0 16px rgba(99, 102, 241, 0.25);
}

/* Avatar Stack */
.avatar-stack {
  display: flex;
  align-items: center;
}

.stack-avatar {
  position: relative;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: -8px;
  font-size: 11px;
  font-weight: 700;
  overflow: visible;
  transition: transform 0.15s ease;
}

.stack-avatar:first-child {
  margin-left: 0;
}

.presence-trigger-btn:hover .stack-avatar {
  transform: translateY(-1px);
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.online-dot {
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  border: 1.5px solid #0f172a;
}

.overflow-avatar {
  background: #334155;
  color: #f1f5f9;
  border-color: #1e293b;
  font-size: 10px;
  z-index: 1;
}

/* Online Pill */
.online-pill {
  display: flex;
  align-items: center;
  gap: 6px;
}

.live-pulse-dot {
  width: 7px;
  height: 7px;
  background-color: #22c55e;
  border-radius: 50%;
  box-shadow: 0 0 8px #22c55e;
  animation: pulse-green 1.8s infinite;
}

@keyframes pulse-green {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.6;
  }
}

.online-text {
  font-size: 12px;
  font-weight: 600;
  color: #e2e8f0;
}

.count-num {
  color: #4ade80;
  font-weight: 700;
}

.chevron-icon {
  color: #64748b;
  transition: transform 0.2s ease;
}

.chevron-icon.rotated {
  transform: rotate(180deg);
  color: #818cf8;
}

/* ─── POPOVER ─────────────────────────────────────────────────────────────── */
.presence-popover {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 310px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 14px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(99, 102, 241, 0.15);
  z-index: 100;
  overflow: hidden;
}

.popover-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(15, 23, 42, 0.6);
  border-bottom: 1px solid #334155;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.live-radar-dot {
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
  box-shadow: 0 0 8px #22c55e;
}

.popover-title {
  font-size: 13px;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0;
}

.popover-badge {
  font-size: 11px;
  font-weight: 600;
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
  border: 1px solid rgba(34, 197, 94, 0.25);
  padding: 2px 8px;
  border-radius: 12px;
}

.popover-body {
  padding: 10px;
  max-height: 280px;
  overflow-y: auto;
}

.presence-empty {
  padding: 20px;
  text-align: center;
  font-size: 12px;
  color: #64748b;
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  border-radius: 9px;
  transition: background 0.15s ease;
  background: rgba(15, 23, 42, 0.2);
}

.user-item:hover {
  background: rgba(99, 102, 241, 0.1);
}

.user-item.is-me {
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.user-avatar-wrap {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.user-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.status-indicator {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  border: 2px solid #1e293b;
}

.user-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: #f1f5f9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.me-tag {
  font-size: 10px;
  font-weight: 700;
  color: #818cf8;
  background: rgba(99, 102, 241, 0.2);
  padding: 1px 5px;
  border-radius: 4px;
}

.user-email {
  font-size: 11px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-activity {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-top: 2px;
}

.activity-page {
  font-size: 10px;
  color: #94a3b8;
}

.online-since {
  font-size: 10px;
  color: #64748b;
}

.popover-footer {
  padding: 8px 14px;
  background: rgba(15, 23, 42, 0.4);
  border-top: 1px solid #334155;
  text-align: center;
}

.footer-hint {
  font-size: 10px;
  color: #475569;
}

/* ─── ANIMATION ───────────────────────────────────────────────────────────── */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}
</style>
