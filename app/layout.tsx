// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cầu lông nhóm',
  description: 'Quản lý buổi đánh cầu lông cho cả nhóm',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      {/* body đã có nền & font trong globals.css */}
      <body>
        {/* NAVBAR */}
        <header className="navbar">
          <div className="navbar-inner">
            {/* Logo + tên app */}
            <a href="/" className="navbar-brand">
              <div className="navbar-logo">🏸</div>
              <div>
                <div className="navbar-title">Cầu lông nhóm</div>
                <div className="navbar-subtitle">
                  Quản lý buổi đánh cho cả team
                </div>
              </div>
            </a>

            {/* Tabs điều hướng */}
            <nav className="navbar-tabs">
              <a href="/" className="navbar-tab">
                Trang chủ
              </a>
              <a href="/members" className="navbar-tab">
                Thành viên
              </a>
              <a href="/history" className="navbar-tab">
                Lịch sử
              </a>
              <a href="/stats" className="navbar-tab">
                Thống kê
              </a>
            </nav>
          </div>
        </header>

        {/* Nội dung các page – bên trong đã dùng .main-container rồi */}
        <main>{children}</main>
      </body>
    </html>
  )
}
