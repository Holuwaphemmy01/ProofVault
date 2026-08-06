import { Logo } from './logo'

const links = [
  { label: 'Product', href: '#product' },
  { label: 'Proof Engine', href: '#proof-engine' },
  { label: 'Use Cases', href: '#use-cases' },
  { label: 'Verify', href: '#verify' },
  { label: 'Docs', href: '#docs' },
]

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#verify"
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            Sign in
          </a>
          <a
            href="#create"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-cyan px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Create Proof
          </a>
        </div>
      </div>
    </header>
  )
}
