<template>
  <header class="topbar">
    <!-- Left: Toggle + Breadcrumb -->
    <div class="topbar-left">
      <button class="toggle-btn" @click="emit('toggle-sidebar')" title="Toggle Sidebar">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      <div class="breadcrumb">
        <span class="breadcrumb-root">TaskFlow</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
        <span class="breadcrumb-current">Dashboard</span>
      </div>
    </div>

    <!-- Right: Search + Cron Indicator + User Menu -->
    <div class="topbar-right">
      <div class="search-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" placeholder="Cari tugas..." class="search-input" />
      </div>

      <!-- User Avatar & Dropdown -->
      <div class="user-menu-wrap" ref="menuRef">
        <button class="topbar-avatar" @click="showDropdown = !showDropdown" title="Menu Pengguna">
          <img v-if="authStore.avatarUrl" :src="authStore.avatarUrl" alt="Avatar" class="avatar-header-img" />
          <span v-else>{{ authStore.userInitials }}</span>
        </button>

        <Transition name="fade">
          <div v-if="showDropdown" class="user-dropdown">
            <div class="user-dropdown-header">
              <span class="dropdown-name">{{ authStore.displayName }}</span>
              <span class="dropdown-email" :title="authStore.userEmail">{{ authStore.userEmail }}</span>
            </div>
            <div class="user-dropdown-divider"></div>
            <!-- Edit Profile Button -->
            <button class="dropdown-item" @click="handleOpenProfile">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>Edit Profil</span>
            </button>
            <button class="dropdown-item logout" @click="handleLogout">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Keluar (Sign Out)</span>
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/authStore'
import { useTaskStore } from '~/stores/taskStore'

const emit = defineEmits<{
  (e: 'toggle-sidebar'): void
}>()

const authStore = useAuthStore()
const taskStore = useTaskStore()

const showDropdown = ref<boolean>(false)
const menuRef = ref<HTMLDivElement | null>(null)

const handleOpenProfile = () => {
  showDropdown.value = false
  authStore.openProfileModal()
}

const handleLogout = () => {
  showDropdown.value = false
  authStore.openLogoutModal()
}

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as Node
  if (menuRef.value && !menuRef.value.contains(target)) {
    showDropdown.value = false
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
.topbar {
  height: 60px;
  background: #1e293b;
  border-bottom: 1px solid #334155;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 100;
}

/* Left */
.topbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toggle-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.toggle-btn:hover {
  background: #334155;
  color: #f1f5f9;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #64748b;
}

.breadcrumb-root {
  color: #94a3b8;
  font-weight: 500;
}

.breadcrumb-current {
  color: #f1f5f9;
  font-weight: 600;
}

/* Right */
.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box svg {
  position: absolute;
  left: 10px;
  color: #64748b;
  pointer-events: none;
}

.search-input {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 6px 12px 6px 32px;
  color: #f1f5f9;
  font-size: 13px;
  outline: none;
  width: 180px;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: #6366f1;
  width: 230px;
}

.search-input::placeholder {
  color: #475569;
}

/* User Menu */
.user-menu-wrap {
  position: relative;
}

.topbar-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #818cf8);
  color: #ffffff;
  border: 2px solid #334155;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  overflow: hidden;
  padding: 0;
}

.avatar-header-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.topbar-avatar:hover {
  border-color: #6366f1;
  transform: scale(1.05);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 220px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  box-shadow: 0 15px 30px -8px rgba(0, 0, 0, 0.5);
  padding: 8px;
  z-index: 200;
}

.user-dropdown-header {
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dropdown-name {
  font-size: 13px;
  font-weight: 600;
  color: #f1f5f9;
}

.dropdown-email {
  font-size: 11px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-dropdown-divider {
  height: 1px;
  background: #334155;
  margin: 6px 0;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #cbd5e1;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dropdown-item:hover {
  background: #334155;
  color: #f1f5f9;
}

.dropdown-item.logout {
  color: #f87171;
}

.dropdown-item.logout:hover {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}

/* Transition */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 640px) {
  .search-box {
    display: none;
  }
}
</style>
