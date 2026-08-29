<template>
  <div class="auth-layout">
    <div class="auth-container">
      <!-- App Header / Logo -->
      <div class="auth-header">
        <NuxtLink to="/" class="auth-brand">
          <div class="auth-logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
          </div>
          <span class="auth-brand-name">TaskFlow</span>
        </NuxtLink>
        <p class="auth-brand-subtitle">Personal Task & Knowledge Management</p>
      </div>

      <!-- Page Content (Login / Register Card) -->
      <main class="auth-content">
        <slot />
      </main>

      <!-- Footer -->
      <footer class="auth-footer">
        <p>&copy; 2026 TaskFlow. Protected with Supabase Row Level Security.</p>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  background: #090d16;
  color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  position: relative;
  font-family: 'Outfit', sans-serif;
}

/* Container */
.auth-container {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Header */
.auth-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.auth-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: inherit;
  transition: opacity 0.15s ease;
}

.auth-brand:hover {
  opacity: 0.9;
}

.auth-logo-icon {
  width: 36px;
  height: 36px;
  background: #4f46e5;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.auth-brand-name {
  font-size: 22px;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: -0.3px;
}

.auth-brand-subtitle {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}

.auth-content {
  width: 100%;
}

.auth-footer {
  text-align: center;
  font-size: 12px;
  color: #94a3b8;
}

.auth-footer p {
  margin: 0;
}
</style>
