import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Apple, Dumbbell, Activity, Gamepad} from "lucide-react"

const features = [
  {
    icon: Apple,
    title: "Suivi Nutritionnel",
    description:
      "Scannez vos aliments et suivez vos macros en temps réel. Atteignez vos objectifs nutritionnels facilement.",
  },
  {
    icon: Dumbbell,
    title: "Programmes Sportifs",
    description: "Des entraînements personnalisés adaptés à votre niveau et vos objectifs, avec suivi de progression.",
  },
  {
    icon: Activity,
    title: "Statistiques Santé",
    description: "Visualisez vos progrès avec des graphiques détaillés : poids, activité physique, calories et plus.",
  },
  {
    icon: Gamepad,
    title: "Gamification",
    description: "Restez motivé grâce à des défis, badges et récompenses pour chaque étape franchie dans votre parcours santé.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="bg-muted/50 py-20 md:py-28">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center md:mb-16">
          <h2 className="text-pretty text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Tout ce dont vous avez besoin
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Une application complète pour transformer votre santé et atteindre vos objectifs fitness.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border/50 bg-card transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
