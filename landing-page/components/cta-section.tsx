import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import Link from "next/link"
const DOWNLOAD_LINK = "https://drive.google.com/file/d/1bhXCit0iD3TGSZhVlNaYSd6ZTJas1m6q/view?usp=sharing"

export function CTASection() {
  return (
    <section id="download" className="bg-primary py-20 md:py-28">
      <div className="container mx-auto max-w-4xl px-4 text-center">
        <h2 className="text-pretty text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl lg:text-5xl">
          Prêt à transformer votre santé ?
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-primary-foreground/80">
          Rejoignez des milliers d'utilisateurs qui ont déjà changé leur vie avec HealthyCore. Téléchargez gratuitement
          et commencez dès aujourd'hui.
        </p>
        <Button size="lg" variant="secondary" className="mt-8 gap-2 text-lg" asChild>
          <Link href={DOWNLOAD_LINK} download>
            <Download className="h-5 w-5" />
            {"Télécharger l'APK Gratuit"}
          </Link>
        </Button>
        <p className="mt-4 text-sm text-primary-foreground/60">Version 1.0.0 • Android 8.0+ • 45 MB</p>
      </div>
    </section>
  )
}
