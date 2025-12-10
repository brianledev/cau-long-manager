// components/ui.tsx
import { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TableHTMLAttributes } from 'react'

/** CARD – dùng cho mọi block nội dung */
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}
    >
      {children}
    </section>
  )
}

/** BUTTON CHÍNH */
export function PrimaryButton(
  props: ButtonHTMLAttributes<HTMLButtonElement>
) {
  const { className = '', ...rest } = props
  return (
    <button
      className={`inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...rest}
    />
  )
}

/** INPUT & SELECT – style thống nhất */
export function TextInput(
  props: InputHTMLAttributes<HTMLInputElement>
) {
  const { className = '', ...rest } = props
  return (
    <input
      className={`w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${className}`}
      {...rest}
    />
  )
}

export function Select(
  props: SelectHTMLAttributes<HTMLSelectElement>
) {
  const { className = '', children, ...rest } = props
  return (
    <select
      className={`w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${className}`}
      {...rest}
    >
      {children}
    </select>
  )
}

/** TABLE – style thống nhất cho thống kê / lịch sử */
export function DataTable(
  props: TableHTMLAttributes<HTMLTableElement> & { children: ReactNode }
) {
  const { className = '', children, ...rest } = props
  return (
    <table
      className={`min-w-full border-collapse overflow-hidden rounded-xl border border-slate-200 bg-white text-sm ${className}`}
      {...rest}
    >
      {children}
    </table>
  )
}

export const thClass =
  'bg-slate-50 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 border-b border-slate-200'
export const tdClass =
  'px-3 py-2 border-b border-slate-100 text-sm text-slate-800'
