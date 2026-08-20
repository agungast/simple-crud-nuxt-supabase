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

    <!-- Right: Search + User Menu -->
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
          {{ authStore.userInitials }}
        </button>

        <Transition name="fade">
          <div v-if="showDropdown" class="user-dropdown">
            <div class="user-dropdown-header">
              <span class="dropdown-name">{{ authStore.displayName }}</span>
              <span class="dropdown-email" :title="authStore.userEmail">{{ authStore.userEmail }}</span>
            </div>
            <div class="user-dropdown-divider"></div>
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

const emit = defineEmits<{
  (e: 'toggle-sidebar'): void
}>()

const authStore = useAuthStore()
const showDropdown = ref<boolean>(false)
const menuRef = ref<HTMLDivElement | null>(null)

const handleLogout = () => {
  showDropdown.value = false
  authStore.openLogoutModal()
}

const handleClickOutside = (e: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
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
  color: #64748b;
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #94a3b8;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.breadcrumb-root {
  color: #475569;
  font-weight: 500;
}

.breadcrumb svg {
  color: #334155;
}

.breadcrumb-current {
  color: #e2e8f0;
  font-weight: 600;
}

/* Right */
.topbar-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 7px 12px;
  color: #475569;
  transition: all 0.2s ease;
}

.search-box:focus-within {
  border-color: #6366f1;
  color: #94a3b8;
}

.search-input {
  background: transparent;
  border: none;
  outline: none;
  color: #94a3b8;
  font-size: 13px;
  width: 160px;
  font-family: inherit;
}

.search-input::placeholder {
  color: #475569;
}

/* User Menu & Dropdown */
.user-menu-wrap {
  position: relative;
}

.topbar-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
}

.topbar-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 0 14px rgba(99, 102, 241, 0.5);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 220px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
  z-index: 100;
  overflow: hidden;
}

.user-dropdown-header {
  padding: 12px 14px;
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
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.dropdown-item.logout {
  color: #f87171;
}

.dropdown-item.logout:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 640px) {
  .search-box {
    display: none;
  }
}
</style>
