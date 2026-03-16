import { logoutAction } from './actions'
import { Button } from '@heroui/react'
import { GuruBKNav } from './guru-bk-nav'

export default function GuruBKLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                SMAN 101 Jakarta
              </h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                - Dashboard Guru BK
              </span>
            </div>
            <GuruBKNav />
          </div>
          
          <form action={logoutAction}>
            <Button
              type="submit"
              variant="ghost"
              className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Keluar
            </Button>
          </form>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

