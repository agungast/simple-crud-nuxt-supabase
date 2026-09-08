<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <!-- Logo -->
      <div class="sidebar-logo">
        <div class="logo-brand-group">
          <div class="logo-icon-wrap" title="TaskFlow">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
          </div>
          <span class="logo-text">TaskFlow</span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <p class="nav-label">MENU</p>
        <NuxtLink to="/" class="nav-item active">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span class="nav-item-text">Dashboard</span>
        </NuxtLink>

        <div class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
          <span class="nav-item-text">Semua Tugas</span>
          <span class="nav-badge">{{ tasks.length }}</span>
        </div>

        <div class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 11 12 14 22 4"></polyline>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
          <span class="nav-item-text">Selesai</span>
          <span class="nav-badge success">{{ completedCount }}</span>
        </div>

        <div class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span class="nav-item-text">Aktif</span>
          <span class="nav-badge warning">{{ activeCount }}</span>
        </div>
      </nav>

      <!-- Sidebar Footer (User info & Logout) -->
      <div class="sidebar-footer">
        <div
          class="user-info clickable"
          @click="authStore.openProfileModal"
          :title="sidebarCollapsed ? `${authStore.displayName} (Klik untuk Edit Profil)` : 'Klik untuk Edit Profil'"
        >
          <div class="user-avatar">
            <img v-if="authStore.avatarUrl" :src="authStore.avatarUrl" alt="Avatar" class="sidebar-avatar-img" />
            <span v-else>{{ authStore.userInitials }}</span>
          </div>
          <div class="user-meta">
            <div class="user-name-row">
              <span class="user-name" :title="authStore.userEmail">{{ authStore.displayName }}</span>
              <svg class="edit-hint-icon" xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </div>
            <span class="user-role">{{ authStore.userEmail || 'Supabase User' }}</span>
          </div>
        </div>
        <button class="logout-btn" @click="handleLogout" :disabled="authStore.loading" :title="sidebarCollapsed ? 'Keluar (Sign Out)' : undefined">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span class="logout-text">Keluar</span>
        </button>
      </div>
    </aside>

    <!-- Main Area -->
    <div class="main-area">
      <!-- Topbar -->
      <AppHeader @toggle-sidebar="toggleSidebar" />

      <!-- Page Content via Slot -->
      <slot />
    </div>

    <!-- Modal Lightbox Galeri Gambar -->
    <ImageLightbox
      :image-url="lightboxImage"
      :items="taskStore.lightboxItems"
      :current-index="taskStore.lightboxIndex"
      @next="taskStore.nextLightboxImage"
      @prev="taskStore.prevLightboxImage"
      @close="taskStore.closeLightbox"
    />

    <!-- Modal Manajemen Lampiran File -->
    <AttachmentModal />

    <!-- Modal Edit Profil Pengguna -->
    <ProfileModal />

    <!-- Modal Konfirmasi Keluar (Logout) -->
    <LogoutModal />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useTaskStore } from '~/stores/taskStore'
import { useAuthStore } from '~/stores/authStore'

const taskStore = useTaskStore()
const authStore = useAuthStore()

const {
  tasks,
  sidebarCollapsed,
  lightboxImage,
  completedCount,
  activeCount
} = storeToRefs(taskStore)

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
  if (import.meta.client) {
    localStorage.setItem('taskflow_sidebar_collapsed', sidebarCollapsed.value ? 'true' : 'false')
  }
}

const handleLogout = () => {
  authStore.openLogoutModal()
}

// Keyboard shortcut: Ctrl + B or Cmd + B to toggle sidebar
const handleKeyDown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
    e.preventDefault()
    toggleSidebar()
  }
}

onMounted(() => {
  if (import.meta.client) {
    const saved = localStorage.getItem('taskflow_sidebar_collapsed')
    if (saved !== null) {
      sidebarCollapsed.value = saved === 'true'
    }
  }
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #090d16;
  color: #f1f5f9;
  font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* ─── SIDEBAR ─────────────────────────────────────────────────────────────── */
.sidebar {
  width: 240px;
  min-width: 240px;
  background: #0f172a;
  border-right: 1px solid #1f2a3f;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  position: sticky;
  top: 0;
  height: 100vh;
  z-index: 200;
}

/* Ketika di-minimize secara default lebarnya 70px */
.sidebar.sidebar-collapsed {
  width: 70px;
  min-width: 70px;
}

/* Saat cursor hover ke sidebar yang ter-minimize: Otomatis maximize ke 240px */
.sidebar.sidebar-collapsed:hover {
  width: 240px;
  min-width: 240px;
  box-shadow: 16px 0 40px rgba(0, 0, 0, 0.7);
}

/* Logo Area */
.sidebar-logo {
  display: flex;
  align-items: center;
  padding: 16px 16px;
  border-bottom: 1px solid #1f2a3f;
  height: 60px;
  box-sizing: border-box;
}

.sidebar.sidebar-collapsed:not(:hover) .sidebar-logo {
  justify-content: center;
  padding: 16px 10px;
}

.logo-brand-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon-wrap {
  width: 32px;
  height: 32px;
  background: #111726;
  border: 1px solid #2d3b55;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f1f5f9;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.logo-text {
  font-size: 16px;
  font-weight: 700;
  color: #f8fafc;
  letter-spacing: -0.3px;
  white-space: nowrap;
}

.sidebar.sidebar-collapsed:not(:hover) .logo-text {
  display: none;
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  padding: 16px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
  overflow-x: hidden;
}

.nav-label {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 0.06em;
  padding: 6px 10px 4px;
  margin: 0;
  white-space: nowrap;
}

.sidebar.sidebar-collapsed:not(:hover) .nav-label {
  display: none;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 8px;
  color: #94a3b8;
  text-decoration: none;
  font-size: 13.5px;
  font-weight: 500;
  border: 1px solid transparent;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  white-space: nowrap;
  cursor: pointer;
}

.nav-item:hover {
  background: #172136;
  color: #f1f5f9;
  border-color: #243048;
}

.nav-item.active {
  background: #1a253c;
  border-color: #2e3e5e;
  color: #ffffff;
  font-weight: 600;
}

.nav-item svg {
  flex-shrink: 0;
}

.nav-badge {
  margin-left: auto;
  background: #111726;
  border: 1px solid #1f2a3f;
  color: #cbd5e1;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 12px;
}

.nav-badge.success {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.25);
  color: #4ade80;
}

.nav-badge.warning {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.25);
  color: #fbbf24;
}

/* Ketika collapsed & TIDAK di-hover: item navigasi terpusat dan teks tersembunyi */
.sidebar.sidebar-collapsed:not(:hover) .nav-item {
  justify-content: center;
  padding: 11px 0;
}

.sidebar.sidebar-collapsed:not(:hover) .nav-item-text,
.sidebar.sidebar-collapsed:not(:hover) .nav-badge {
  display: none;
}

/* Sidebar Footer */
.sidebar-footer {
  padding: 14px 12px;
  border-top: 1px solid #1f2a3f;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #0b1120;
}

.sidebar.sidebar-collapsed:not(:hover) .sidebar-footer {
  padding: 14px 8px;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-info.clickable {
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 8px;
  border: 1px solid transparent;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.user-info.clickable:hover {
  background: #172136;
  border-color: #243048;
}

.user-info.clickable:hover .edit-hint-icon {
  color: #f1f5f9;
  opacity: 1;
}

.sidebar.sidebar-collapsed:not(:hover) .user-info {
  justify-content: center;
  margin: 0;
  padding: 0;
}

.user-avatar {
  width: 34px;
  height: 34px;
  background: #111726;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #f1f5f9;
  flex-shrink: 0;
  overflow: hidden;
  border: 1.5px solid #2d3b55;
  transition: border-color 0.15s ease;
}

.user-info.clickable:hover .user-avatar {
  border-color: #4f46e5;
}

.sidebar-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-meta {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.user-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.edit-hint-icon {
  color: #94a3b8;
  opacity: 0.7;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.sidebar.sidebar-collapsed:not(:hover) .user-meta {
  display: none;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: #f1f5f9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 11px;
  color: #cbd5e1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid rgba(239, 68, 68, 0.25);
  background: rgba(239, 68, 68, 0.06);
  color: #fca5a5;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
  font-family: inherit;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.4);
  color: #f87171;
}

.sidebar.sidebar-collapsed:not(:hover) .logout-btn {
  justify-content: center;
  padding: 8px;
  width: 36px;
  height: 36px;
  margin: 0 auto;
}

.sidebar.sidebar-collapsed:not(:hover) .logout-text {
  display: none;
}

/* ─── MAIN AREA ───────────────────────────────────────────────────────────── */
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow-x: hidden;
  background: #090d16;
}

@media (max-width: 640px) {
  .sidebar {
    display: none;
  }
}
</style>

