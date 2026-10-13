import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden transition-all ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  description,
  children,
  className = '',
}: {
  title?: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div className={`p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-4 ${className}`}>
      {(title || description) && (
        <div>
          {title && <h3 className="text-sm sm:text-base font-semibold text-slate-900">{title}</h3>}
          {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
      )}
      {children}
    </div>
  )
}

export function CardContent({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={`p-4 sm:p-5 ${className}`}>{children}</div>
}

export function CardFooter({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3 ${className}`}>
      {children}
    </div>
  )
}
