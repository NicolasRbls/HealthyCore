import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Play, ShieldCheck } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Content */}
          <div className="flex flex-col items-start gap-6">
            <Badge variant="secondary" className="gap-2 px-3 py-1">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Version 1.0.0 • Scanné & Sécurisé</span>
            </Badge>

            <h1 className="text-pretty text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Votre santé, <span className="text-primary">votre performance</span>
            </h1>

            <p className="max-w-lg text-lg leading-relaxed text-muted-foreground md:text-xl">
              HealthyCore vous accompagne au quotidien avec un suivi nutritionnel intelligent, des programmes sportifs
              personnalisés et des statistiques de santé en temps réel.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" asChild className="gap-2">
                <Link href="#download">
                  <Download className="h-5 w-5" />
                  {"Télécharger l'APK"}
                </Link>
              </Button>
            </div>
          </div>

          {/* Phone Mockup */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              {/* Phone Frame */}
              <div className="relative h-[500px] w-[250px] overflow-hidden rounded-[3rem] border-8 border-foreground/10 bg-card shadow-2xl md:h-[600px] md:w-[300px]">
                <img
                  src="/mobile-fitness-app-dashboard-with-health-stats-and.jpg"
                  alt="HealthyCore App Interface"
                  className="h-full w-full object-cover"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
              <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-accent/20 blur-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
