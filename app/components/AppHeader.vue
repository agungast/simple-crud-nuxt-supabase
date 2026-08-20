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

    <!-- Right: Search + Actions -->
    <div class="topbar-right">
      <div class="search-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" placeholder="Cari tugas..." class="search-input" />
      </div>


      <div class="topbar-avatar">A</div>
    </div>
  </header>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'toggle-sidebar'): void
}>()
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
  gap: 12px;
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

.icon-btn {
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
  position: relative;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #94a3b8;
}

.notif-dot {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 7px;
  height: 7px;
  background: #6366f1;
  border-radius: 50%;
  border: 2px solid #1e293b;
}

.topbar-avatar {
  width: 34px;
  height: 34px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
  cursor: pointer;
}

@media (max-width: 640px) {
  .search-box {
    display: none;
  }
}
</style>
