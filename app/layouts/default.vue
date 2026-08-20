<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <!-- Logo -->
      <div class="sidebar-logo">
        <div class="logo-icon-wrap">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 11 12 14 22 4"></polyline>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
        </div>
        <span class="logo-text">TaskFlow</span>
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
          <span>Dashboard</span>
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
          <span>Semua Tugas</span>
          <span class="nav-badge">{{ tasks.length }}</span>
        </div>
        <div class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 11 12 14 22 4"></polyline>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
          <span>Selesai</span>
          <span class="nav-badge success">{{ completedCount }}</span>
        </div>
        <div class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>Aktif</span>
          <span class="nav-badge warning">{{ activeCount }}</span>
        </div>
      </nav>

      <!-- Sidebar Footer (User info & Logout) -->
      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">{{ authStore.userInitials }}</div>
          <div class="user-meta">
            <span class="user-name" :title="authStore.userEmail">{{ authStore.displayName }}</span>
            <span class="user-role">{{ authStore.userEmail || 'Supabase User' }}</span>
          </div>
        </div>
        <button class="logout-btn" @click="handleLogout" :disabled="authStore.loading" title="Keluar">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Keluar</span>
        </button>
      </div>
    </aside>

    <!-- Main Area -->
    <div class="main-area">
      <!-- Topbar -->
      <AppHeader @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed" />

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

    <!-- Modal Konfirmasi Keluar (Logout) -->
    <LogoutModal />
  </div>
</template>

<script setup lang="ts">
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

const handleLogout = () => {
  authStore.openLogoutModal()
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #0f172a;
  color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
}

/* ─── SIDEBAR ─────────────────────────────────────────────────────────────── */
.sidebar {
  width: 240px;
  min-width: 240px;
  background: #1e293b;
  border-right: 1px solid #334155;
  display: flex;
  flex-direction: column;
  transition: width 0.25s ease, min-width 0.25s ease;
  position: sticky;
  top: 0;
  height: 100vh;
  z-index: 200;
  overflow: hidden;
}

.sidebar.sidebar-collapsed {
  width: 64px;
  min-width: 64px;
}

.sidebar.sidebar-collapsed .logo-text,
.sidebar.sidebar-collapsed .nav-label,
.sidebar.sidebar-collapsed .nav-item span,
.sidebar.sidebar-collapsed .nav-badge,
.sidebar.sidebar-collapsed .user-meta,
.sidebar.sidebar-collapsed .logout-btn span {
  display: none;
}

.sidebar.sidebar-collapsed .sidebar-logo {
  justify-content: center;
  padding: 20px 0;
}

.sidebar.sidebar-collapsed .nav-item {
  justify-content: center;
  padding: 10px 0;
}

.sidebar.sidebar-collapsed .user-info {
  justify-content: center;
}

.sidebar.sidebar-collapsed .logout-btn {
  justify-content: center;
  padding: 8px 0;
}

/* Logo */
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 16px;
  border-bottom: 1px solid #334155;
}

.logo-icon-wrap {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  flex-shrink: 0;
  box-shadow: 0 0 12px rgba(99, 102, 241, 0.4);
}

.logo-text {
  font-size: 16px;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: -0.3px;
  white-space: nowrap;
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}

.nav-label {
  font-size: 10px;
  font-weight: 700;
  color: #475569;
  letter-spacing: 0.8px;
  padding: 4px 8px;
  margin: 0;
  white-space: nowrap;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  color: #94a3b8;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
  white-space: nowrap;
  cursor: pointer;
}

.nav-item:hover {
  background: rgba(99, 102, 241, 0.1);
  color: #c7d2fe;
}

.nav-item.active {
  background: rgba(99, 102, 241, 0.15);
  color: #818cf8;
}

.nav-item svg {
  flex-shrink: 0;
}

.nav-badge {
  margin-left: auto;
  background: rgba(99, 102, 241, 0.2);
  color: #818cf8;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 20px;
}

.nav-badge.success {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}

.nav-badge.warning {
  background: rgba(251, 146, 60, 0.15);
  color: #fb923c;
}

/* Sidebar Footer */
.sidebar-footer {
  padding: 16px 12px;
  border-top: 1px solid #334155;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 34px;
  height: 34px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  flex-shrink: 0;
}

.user-meta {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 11px;
  color: #64748b;
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
  border: 1px solid rgba(239, 68, 68, 0.2);
  background: rgba(239, 68, 68, 0.08);
  color: #f87171;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.16);
  border-color: rgba(239, 68, 68, 0.4);
  color: #ef4444;
}

/* ─── MAIN AREA ───────────────────────────────────────────────────────────── */
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow-x: hidden;
}

@media (max-width: 640px) {
  .sidebar {
    display: none;
  }
}
</style>
