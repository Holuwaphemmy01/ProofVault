import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span className="relative flex h-8 w-8 items-center justify-center">
        <svg
          viewBox="0 0 32 32"
          fill="none"
          className="h-8 w-8"
          aria-hidden="true"
        >
          <path
            d="M16 2.5 27 7v9c0 6.9-4.6 11.7-11 13.5C9.6 27.7 5 22.9 5 16V7l11-4.5Z"
            fill="#101827"
            stroke="#243044"
            strokeWidth="1.25"
          />
          <path
            d="M16 6.5 23 9.4v6.2c0 4.6-3 7.8-7 9.1-4-1.3-7-4.5-7-9.1V9.4l7-2.9Z"
            stroke="#22D3EE"
            strokeWidth="1.25"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="m12.4 16.2 2.6 2.6 4.6-5"
            stroke="#22D3EE"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="font-heading text-lg font-bold tracking-tight text-foreground">
        Proof<span className="text-cyan">Vault</span>
      </span>
    </div>
  )
}
