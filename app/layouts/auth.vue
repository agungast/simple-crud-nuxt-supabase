<template>
  <div class="auth-layout">
    <!-- Background Decor (Glow gradient blobs) -->
    <div class="glow-circle top-left"></div>
    <div class="glow-circle bottom-right"></div>

    <div class="auth-container">
      <!-- App Header / Logo -->
      <div class="auth-header">
        <div class="auth-logo-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 11 12 14 22 4"></polyline>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
        </div>
        <h1 class="auth-brand-name">TaskFlow</h1>
        <p class="auth-brand-subtitle">Modern Task Management with Nuxt & Supabase</p>
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
  background: #0f172a;
  color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  position: relative;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
}

/* Glow Decor */
.glow-circle {
  position: absolute;
  width: 450px;
  height: 450px;
  border-radius: 50%;
  filter: blur(120px);
  pointer-events: none;
  opacity: 0.25;
}

.glow-circle.top-left {
  top: -100px;
  left: -100px;
  background: #6366f1;
}

.glow-circle.bottom-right {
  bottom: -100px;
  right: -100px;
  background: #8b5cf6;
}

/* Container */
.auth-container {
  width: 100%;
  max-width: 440px;
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Header */
.auth-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.auth-logo-icon {
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  margin-bottom: 12px;
  box-shadow: 0 0 24px rgba(99, 102, 241, 0.45);
}

.auth-brand-name {
  font-size: 24px;
  font-weight: 800;
  color: #f1f5f9;
  letter-spacing: -0.5px;
  margin: 0;
}

.auth-brand-subtitle {
  font-size: 13px;
  color: #94a3b8;
  margin-top: 4px;
  margin-bottom: 0;
}

.auth-content {
  width: 100%;
}

.auth-footer {
  text-align: center;
  font-size: 12px;
  color: #64748b;
}
</style>
