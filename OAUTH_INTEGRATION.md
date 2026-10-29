/**
 * Integrasi Autentikasi OAuth Google & GitHub dengan Supabase Auth
 * Gunakan ini di komponen/page yang memerlukan login via provider eksternal.
 */

// 1. Di store (authStore.ts) — sudah ada signInWithOAuth
// Buat pastikan method ini tersedia dan di-export:
async function signInWithOAuth(provider: 'google' | 'github'): Promise<boolean> {
  const supabase = useSupabaseClient()
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/dashboard`
    }
  })
  if (error) {
    console.error('[OAuth]', provider, error.message)
    return false
  }
  return true
}

// 2. Di komponen / halaman (Vue 3 + Nuxt, contoh login.vue)
// Template tombol (menggunakan font Outfit, solid, anti-AI-slop):

// <button
//   type="button"
//   class="oauth-btn oauth-google"
//   @click="handleOAuth('google')"
//   :disabled="authStore.loading"
// >
//   <!-- Icon Google SVG -->
//   <span>Masuk dengan Google</span>
// </button>
// <button
//   type="button"
//   class="oauth-btn oauth-github"
//   @click="handleOAuth('github')"
//   :disabled="authStore.loading"
// >
//   <!-- Icon GitHub SVG -->
//   <span>Masuk dengan GitHub</span>
// </button>

// 3. Script handler (di halaman atau store)
const handleOAuth = async (provider: 'google' | 'github') => {
  try {
    const result = await authStore.signInWithOAuth(provider)
    if (!result) {
      // Error sudah ditangani di store (toast + authError)
    }
  } catch (e: any) {
    console.error('OAuth error:', e)
  }
}

// 4. Konfigurasi Supabase (tidak perlu .env, hanya pastikan provider aktif):
// Di Dashboard Supabase → Authentication → Providers → Google / GitHub:
//   - Aktifkan "Enable"
//   - Isi Client ID & Client Secret dari Google OAuth 2.0 / GitHub OAuth App
//   - Pastikan redirect URL: https://<domain>/dashboard (atau localhost jika dev)

// 5. Catatan desain (AGENTS.md / DESIGN_GUIDELINES.md):
//   - Font: Outfit (inherit dari root .landing-page atau set eksplisit)
//   - Tidak boleh ada glow-gradient neon (jangan pakai linear-gradient violet/indigo)
//   - Tidak boleh border-left aksen tebal
//   - Tombol solid dengan border halus, fokus ring 3px rgba(79,70,229,0.35)
//   - Animasi hanya transform/opacity, easing cubic-bezier(0.16, 1, 0.3, 1)

export {}
