import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer id="contact" className="border-t border-border bg-background py-12">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          {/* Logo & Copyright */}
          <div className="flex flex-col items-center gap-2 md:items-start">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden">
                <Image src="/logo.png" alt="HealthyCore Logo" width={32} height={32} className="object-contain" />
              </div>
              <span className="text-lg font-bold text-foreground">HealthyCore</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} HealthyCore. Tous droits réservés.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-6">
            <Link href="/privacy" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Politique de confidentialité
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {"Conditions d'utilisation"}
            </Link>
            <Link
              href="mailto:contact@healthycore.app"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
