export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()

  const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password']
  const isPublicRoute = publicRoutes.includes(to.path)

  let isAuthenticated = !!user.value
  if (!isAuthenticated) {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      isAuthenticated = true
      ;(user as any).value = session.user
    }
  }

  // 1. Jika belum login dan mencoba akses route yang diproteksi (misal /dashboard) -> arahkan ke /login
  if (!isAuthenticated && !isPublicRoute) {
    return navigateTo('/login')
  }

  // 2. Jika sudah login dan mencoba akses /login, /register, /forgot-password -> arahkan ke /dashboard
  // Catatan: Halaman /reset-password dikecualikan karena butuh sesi recovery user
  const authOnlyPages = ['/login', '/register', '/forgot-password']
  if (isAuthenticated && authOnlyPages.includes(to.path)) {
    return navigateTo('/dashboard')
  }
})
