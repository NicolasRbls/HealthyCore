import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Settings, Smartphone, ShieldCheck } from "lucide-react"

const steps = [
  {
    id: "step-1",
    icon: Download,
    title: "Téléchargez le fichier APK",
    content:
      "Cliquez sur le bouton de téléchargement ci-dessous pour obtenir le fichier HealthyCore.apk sur votre appareil Android.",
  },
  {
    id: "step-2",
    icon: Settings,
    title: "Autorisez les sources inconnues",
    content:
      "Allez dans Paramètres > Sécurité > Sources inconnues et activez l'option pour votre navigateur ou gestionnaire de fichiers. Cette étape est nécessaire pour installer des applications en dehors du Play Store.",
  },
  {
    id: "step-3",
    icon: Smartphone,
    title: "Installez et profitez",
    content:
      "Ouvrez le fichier APK téléchargé et suivez les instructions d'installation. Une fois terminé, lancez HealthyCore et commencez votre transformation !",
  },
]

export function InstallationSection() {
  return (
    <section id="installation" className="py-20 md:py-28">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="mb-12 text-center">
          <h2 className="text-pretty text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Comment installer HealthyCore
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            {"L'installation est simple et ne prend que quelques minutes. Suivez ces étapes :"}
          </p>
        </div>

        <Accordion type="single" collapsible defaultValue="step-1" className="w-full">
          {steps.map((step, index) => (
            <AccordionItem key={step.id} value={step.id} className="border-border/50">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {index + 1}
                  </div>
                  <span className="text-left font-semibold">{step.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-14 text-muted-foreground">{step.content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <Alert className="mt-8 border-primary/20 bg-primary/5">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <AlertDescription className="ml-2 text-foreground">
            <strong>Note de sécurité :</strong> HealthyCore respecte votre vie privée. Nous ne collectons pas vos
            données personnelles et toutes les informations restent stockées localement sur votre appareil.
          </AlertDescription>
        </Alert>
      </div>
    </section>
  )
}
