// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cầu lông nhóm',
  description: 'Quản lý buổi đánh cầu lông cho cả nhóm',
}

const navItems = [
  { href: '/', label: 'Trang chủ', icon: '🏠' },
  { href: '/members', label: 'Thành viên', icon: '👥' },
  { href: '/history', label: 'Lịch sử', icon: '📋' },
  { href: '/stats', label: 'Thống kê', icon: '📊' },
]

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" className="h-full">
      <body className="h-full bg-slate-50 selection:bg-blue-100 selection:text-blue-900">
        <div className="flex min-h-full flex-col">
          {/* Header - Glassmorphism */}
          <header className="sticky top-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur-xl supports-backdrop-filter:bg-white/60 shadow-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                {/* Logo & Brand */}
                <a href="/" className="flex items-center gap-3 transition-all hover:opacity-80 hover:scale-105 active:scale-95">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-blue-600 text-xl shadow-lg shadow-blue-500/30 ring-2 ring-white">
                    🏸
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-sm font-bold text-slate-900">Cầu lông nhóm</div>
                    <div className="text-xs font-medium text-slate-500">Quản lý buổi đánh</div>
                  </div>
                </a>

                {/* Navigation */}
                <nav className="flex items-center gap-1">
                  {navItems.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className="group relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100/80 hover:text-blue-600 active:scale-95"
                    >
                      <span className="text-base transition-transform group-hover:scale-110">{item.icon}</span>
                      <span className="hidden sm:inline">{item.label}</span>
                    </a>
                  ))}
                </nav>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-200/60 bg-white/50 backdrop-blur-sm">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              <div className="text-center text-xs font-medium text-slate-500">
                <p>© 2025 Cầu lông nhóm. Made with ❤️</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
