import { defineStore } from 'pinia'
import type { LoginCredentials, RegisterCredentials } from '~/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const router = useRouter()

  // ─── State ────────────────────────────────────────────────────────────────────
  const loading = ref<boolean>(false)
  const authError = ref<string | null>(null)
  const successMessage = ref<string | null>(null)
  const showLogoutModal = ref<boolean>(false)

  // ─── Getters ──────────────────────────────────────────────────────────────────
  const isAuthenticated = computed<boolean>(() => !!user.value)

  const userEmail = computed<string>(() => user.value?.email ?? '')

  const displayName = computed<string>(() => {
    // 1. Coba ambil dari user_metadata (full_name / name)
    const rawName = user.value?.user_metadata?.full_name || user.value?.user_metadata?.name
    if (rawName && typeof rawName === 'string' && rawName.trim()) {
      return rawName.trim()
    }
    // 2. Fallback ke potongan email
    const email = user.value?.email
    if (!email) return 'User'
    const namePart = email.split('@')[0] || 'User'
    return namePart.charAt(0).toUpperCase() + namePart.slice(1)
  })

  const userInitials = computed<string>(() => {
    // 1. Coba ambil inisial dari full_name jika ada
    const rawName = user.value?.user_metadata?.full_name || user.value?.user_metadata?.name
    if (rawName && typeof rawName === 'string' && rawName.trim()) {
      const parts = rawName.trim().split(/\s+/)
      if (parts.length >= 2 && parts[0] && parts[1]) {
        return ((parts[0][0] || '') + (parts[1][0] || '')).toUpperCase()
      }
      return rawName.trim().charAt(0).toUpperCase()
    }
    // 2. Fallback ke huruf awal email
    const email = user.value?.email
    if (!email) return 'U'
    return email.charAt(0).toUpperCase() || 'U'
  })

  // ─── Actions ──────────────────────────────────────────────────────────────────
  function clearMessages(): void {
    authError.value = null
    successMessage.value = null
  }

  /**
   * Masuk menggunakan Email dan Password
   */
  async function signIn(credentials: LoginCredentials): Promise<boolean> {
    loading.value = true
    clearMessages()

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })

      if (error) {
        authError.value = translateAuthError(error.message)
        return false
      }

      if (data?.user) {
        await navigateTo('/', { replace: true })
        return true
      }

      return false
    } catch (err: any) {
      authError.value = err.message || 'Terjadi kesalahan saat masuk.'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Mendaftar akun baru dengan Email, Password, dan Nama Lengkap
   */
  async function signUp(credentials: RegisterCredentials): Promise<boolean> {
    loading.value = true
    clearMessages()

    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.fullName?.trim() || ''
          }
        }
      })

      if (error) {
        authError.value = translateAuthError(error.message)
        return false
      }

      if (data?.user) {
        // Cek apakah Supabase memerlukan konfirmasi email
        if (data.session) {
          // Jika Confirm Email OFF: Akhiri auto-login sesi dan arahkan ke login
          await supabase.auth.signOut()
          await navigateTo('/login?registered=success', { replace: true })
        } else {
          // Jika Confirm Email ON: Arahkan ke login dengan instruksi verifikasi
          await navigateTo('/login?registered=verify', { replace: true })
        }
        return true
      }

      return false
    } catch (err: any) {
      authError.value = err.message || 'Terjadi kesalahan saat pendaftaran.'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Keluar dari sesi (Sign Out)
   */
  async function signOut(): Promise<void> {
    loading.value = true
    try {
      const taskStore = useTaskStore()
      taskStore.resetState()

      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error.message)
      }
      await navigateTo('/login', { replace: true })
    } catch (err) {
      console.error('Sign out error:', err)
      await navigateTo('/login', { replace: true })
    } finally {
      loading.value = false
    }
  }

  /**
   * Mengirim tautan reset password ke email
   */
  async function sendPasswordReset(email: string): Promise<boolean> {
    loading.value = true
    clearMessages()

    try {
      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      })

      if (error) {
        authError.value = translateAuthError(error.message)
        return false
      }

      successMessage.value = 'Tautan reset kata sandi telah dikirim ke email Anda. Silakan periksa kotak masuk (atau spam) email Anda.'
      return true
    } catch (err: any) {
      authError.value = err.message || 'Gagal mengirim email reset kata sandi.'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Menyimpan kata sandi baru (setelah user klik link reset dari email)
   */
  async function updatePassword(newPassword: string): Promise<boolean> {
    loading.value = true
    clearMessages()

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        authError.value = translateAuthError(error.message)
        return false
      }

      // Selesaikan sesi pemulihan dan alihkan ke halaman login
      await supabase.auth.signOut()
      const taskStore = useTaskStore()
      taskStore.resetState()

      await navigateTo('/login?reset=success', { replace: true })
      return true
    } catch (err: any) {
      authError.value = err.message || 'Gagal memperbarui kata sandi.'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Helper untuk menerjemahkan pesan error umum Supabase ke Bahasa Indonesia
   */
  function translateAuthError(msg: string): string {
    const lower = msg.toLowerCase()
    if (lower.includes('invalid login credentials')) {
      return 'Email atau kata sandi tidak valid. Silakan periksa kembali.'
    }
    if (lower.includes('email not confirmed')) {
      return 'Email Anda belum dikonfirmasi. Silakan periksa email verifikasi Anda.'
    }
    if (lower.includes('user already registered')) {
      return 'Email ini sudah terdaftar. Silakan langsung masuk.'
    }
    if (lower.includes('password should be at least')) {
      return 'Kata sandi minimal harus terdiri dari 6 karakter.'
    }
    if (lower.includes('rate limit') || lower.includes('rate_limit')) {
      return 'Batas pengiriman email terlampaui (Email Rate Limit). Silakan matikan "Confirm email" di Supabase Dashboard untuk proses development.'
    }
    if (lower.includes('auth session missing') || lower.includes('session missing') || lower.includes('session_missing')) {
      return 'Sesi pemulihan tidak ditemukan atau tautan reset sudah kedaluwarsa. Silakan minta tautan baru lewat menu Lupa Kata Sandi.'
    }
    return msg
  }

  function openLogoutModal(): void {
    showLogoutModal.value = true
  }

  function closeLogoutModal(): void {
    showLogoutModal.value = false
  }

  return {
    // State
    loading,
    authError,
    successMessage,
    showLogoutModal,

    // Getters
    user,
    isAuthenticated,
    userEmail,
    displayName,
    userInitials,

    // Actions
    signIn,
    signUp,
    signOut,
    sendPasswordReset,
    updatePassword,
    openLogoutModal,
    closeLogoutModal,
    clearMessages
  }
})
