import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l'accueil
        </Link>

        <h1 className="mb-8 text-4xl font-bold text-foreground">Conditions Générales d'Utilisation</h1>
        
        <div className="space-y-8 text-muted-foreground">
          <section>
            <p className="mb-4 text-sm">
              <strong>Dernière mise à jour :</strong> 17 décembre 2025
            </p>
            <p className="leading-relaxed">
              Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de l'application mobile
              HealthyCore. En utilisant notre application, vous acceptez sans réserve les présentes conditions.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">1. Objet</h2>
            <p className="leading-relaxed">
              HealthyCore est une application mobile de suivi de santé et de fitness qui permet aux utilisateurs de :
            </p>
            <ul className="ml-6 mt-4 space-y-2 list-disc">
              <li>Suivre leur alimentation et leurs apports nutritionnels</li>
              <li>Accéder à des programmes d'entraînement personnalisés</li>
              <li>Monitorer leurs statistiques de santé et leur progression</li>
              <li>Se fixer des objectifs de santé et de fitness</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">2. Acceptation des conditions</h2>
            <p className="leading-relaxed">
              L'utilisation de l'application implique l'acceptation pleine et entière des présentes CGU. Si vous
              n'acceptez pas ces conditions, veuillez ne pas utiliser l'application.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">3. Inscription et compte utilisateur</h2>
            <h3 className="mb-3 mt-4 text-xl font-semibold text-foreground">3.1 Création de compte</h3>
            <p className="leading-relaxed">
              Pour utiliser l'application, vous devez créer un compte en fournissant des informations exactes,
              complètes et à jour. Vous êtes responsable de la confidentialité de vos identifiants de connexion.
            </p>
            
            <h3 className="mb-3 mt-4 text-xl font-semibold text-foreground">3.2 Âge minimum</h3>
            <p className="leading-relaxed">
              Vous devez avoir au moins 16 ans pour utiliser l'application. Si vous avez entre 16 et 18 ans,
              l'autorisation d'un parent ou tuteur légal est requise.
            </p>

            <h3 className="mb-3 mt-4 text-xl font-semibold text-foreground">3.3 Responsabilité du compte</h3>
            <p className="leading-relaxed">
              Vous êtes responsable de toutes les activités effectuées depuis votre compte. En cas d'utilisation non
              autorisée, vous devez nous en informer immédiatement.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">4. Utilisation de l'application</h2>
            <h3 className="mb-3 mt-4 text-xl font-semibold text-foreground">4.1 Licence d'utilisation</h3>
            <p className="leading-relaxed">
              Nous vous accordons une licence personnelle, non exclusive, non transférable et révocable pour utiliser
              l'application conformément aux présentes CGU.
            </p>

            <h3 className="mb-3 mt-4 text-xl font-semibold text-foreground">4.2 Restrictions</h3>
            <p className="mb-2 leading-relaxed">Vous vous engagez à ne pas :</p>
            <ul className="ml-6 space-y-2 list-disc">
              <li>Utiliser l'application à des fins illégales ou non autorisées</li>
              <li>Tenter d'accéder à des parties non autorisées de l'application</li>
              <li>Décompiler, désassembler ou tenter d'extraire le code source</li>
              <li>Utiliser l'application pour transmettre des virus ou codes malveillants</li>
              <li>Collecter des données d'autres utilisateurs sans leur consentement</li>
              <li>Créer de faux comptes ou usurper l'identité d'autrui</li>
              <li>Surcharger ou perturber le fonctionnement de l'application</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">5. Contenu et données de santé</h2>
            <h3 className="mb-3 mt-4 text-xl font-semibold text-foreground">5.1 Vos données</h3>
            <p className="leading-relaxed">
              Vous conservez tous les droits sur les données que vous saisissez dans l'application. En utilisant
              l'application, vous nous accordez une licence pour traiter ces données afin de vous fournir nos services.
            </p>

            <h3 className="mb-3 mt-4 text-xl font-semibold text-foreground">5.2 Exactitude des informations</h3>
            <p className="leading-relaxed">
              Vous êtes responsable de l'exactitude des informations que vous saisissez. Nous ne vérifions pas
              l'exactitude des données saisies par les utilisateurs.
            </p>

            <h3 className="mb-3 mt-4 text-xl font-semibold text-foreground">5.3 Données de santé</h3>
            <p className="leading-relaxed">
              Le traitement de vos données de santé est effectué avec votre consentement explicite conformément au
              RGPD. Vous pouvez retirer ce consentement à tout moment dans les paramètres de l'application.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">6. Avertissements médicaux</h2>
            <div className="rounded-lg border-2 border-amber-500/50 bg-amber-500/10 p-4 my-4">
              <p className="font-semibold text-amber-600 dark:text-amber-400 mb-2">⚠️ IMPORTANT</p>
              <ul className="ml-6 space-y-2 list-disc text-foreground">
                <li>L'application HealthyCore est un outil de suivi et ne remplace pas l'avis d'un professionnel de santé</li>
                <li>Consultez toujours un médecin avant de commencer un nouveau programme d'exercice ou de nutrition</li>
                <li>Les informations fournies sont à titre indicatif et ne constituent pas un avis médical</li>
                <li>En cas de problème de santé, consultez immédiatement un professionnel qualifié</li>
                <li>Nous ne sommes pas responsables des décisions prises sur la base des informations de l'application</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">7. Propriété intellectuelle</h2>
            <p className="leading-relaxed">
              L'application, son contenu, ses fonctionnalités et tous les droits de propriété intellectuelle associés
              sont et restent la propriété exclusive de HealthyCore. Aucune partie de l'application ne peut être
              reproduite, dupliquée, copiée ou exploitée sans notre autorisation écrite préalable.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">8. Disponibilité du service</h2>
            <p className="leading-relaxed">
              Nous nous efforçons de maintenir l'application accessible 24h/24 et 7j/7, mais nous ne pouvons garantir
              une disponibilité ininterrompue. Des interruptions peuvent survenir pour maintenance, mises à jour ou en
              cas de force majeure.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">9. Modifications de l'application</h2>
            <p className="leading-relaxed">
              Nous nous réservons le droit de modifier, suspendre ou interrompre tout ou partie de l'application à
              tout moment, avec ou sans préavis. Nous ne serons pas responsables envers vous ou tout tiers pour toute
              modification, suspension ou interruption.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">10. Tarification et paiements</h2>
            <h3 className="mb-3 mt-4 text-xl font-semibold text-foreground">10.1 Services gratuits et payants</h3>
            <p className="leading-relaxed">
              L'application propose des fonctionnalités gratuites et des fonctionnalités premium payantes. Les tarifs
              sont affichés dans l'application et peuvent être modifiés à tout moment.
            </p>

            <h3 className="mb-3 mt-4 text-xl font-semibold text-foreground">10.2 Abonnements</h3>
            <p className="leading-relaxed">
              Les abonnements sont renouvelés automatiquement sauf annulation avant la date de renouvellement. Vous
              pouvez annuler votre abonnement à tout moment dans les paramètres de votre compte.
            </p>

            <h3 className="mb-3 mt-4 text-xl font-semibold text-foreground">10.3 Remboursements</h3>
            <p className="leading-relaxed">
              Conformément à la législation européenne, vous disposez d'un droit de rétractation de 14 jours. Passé ce
              délai, aucun remboursement ne sera effectué sauf en cas d'erreur avérée de notre part.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">11. Résiliation</h2>
            <h3 className="mb-3 mt-4 text-xl font-semibold text-foreground">11.1 Par l'utilisateur</h3>
            <p className="leading-relaxed">
              Vous pouvez supprimer votre compte à tout moment depuis les paramètres de l'application. La suppression
              est définitive et entraîne la perte de toutes vos données.
            </p>

            <h3 className="mb-3 mt-4 text-xl font-semibold text-foreground">11.2 Par HealthyCore</h3>
            <p className="leading-relaxed">
              Nous nous réservons le droit de suspendre ou résilier votre compte en cas de violation des présentes CGU,
              d'utilisation frauduleuse ou de comportement inapproprié.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">12. Limitation de responsabilité</h2>
            <p className="leading-relaxed">
              Dans les limites autorisées par la loi applicable :
            </p>
            <ul className="ml-6 mt-4 space-y-2 list-disc">
              <li>L'application est fournie "en l'état" sans garantie d'aucune sorte</li>
              <li>Nous ne garantissons pas que l'application sera exempte d'erreurs ou de bugs</li>
              <li>Nous ne sommes pas responsables des dommages directs ou indirects résultant de l'utilisation</li>
              <li>Notre responsabilité est limitée au montant payé pour l'utilisation de l'application</li>
              <li>Nous ne sommes pas responsables des décisions prises sur la base des informations fournies</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">13. Indemnisation</h2>
            <p className="leading-relaxed">
              Vous acceptez d'indemniser et de dégager HealthyCore de toute responsabilité en cas de réclamation
              résultant de votre utilisation de l'application ou de votre violation des présentes CGU.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">14. Droit applicable et juridiction</h2>
            <p className="leading-relaxed">
              Les présentes CGU sont régies par le droit français et européen. Tout litige relatif à l'interprétation
              ou l'exécution des présentes sera soumis à la compétence exclusive des tribunaux français, sauf
              dispositions impératives contraires.
            </p>
            <p className="mt-4 leading-relaxed">
              Conformément à la réglementation européenne, vous pouvez également recourir à la plateforme de règlement
              en ligne des litiges mise en place par la Commission Européenne :
              <a href="https://ec.europa.eu/consumers/odr/" className="text-primary hover:underline ml-1" target="_blank" rel="noopener noreferrer">
                https://ec.europa.eu/consumers/odr/
              </a>
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">15. Dispositions générales</h2>
            <h3 className="mb-3 mt-4 text-xl font-semibold text-foreground">15.1 Intégralité de l'accord</h3>
            <p className="leading-relaxed">
              Les présentes CGU constituent l'intégralité de l'accord entre vous et HealthyCore concernant
              l'utilisation de l'application.
            </p>

            <h3 className="mb-3 mt-4 text-xl font-semibold text-foreground">15.2 Divisibilité</h3>
            <p className="leading-relaxed">
              Si une disposition des présentes CGU est jugée invalide ou inapplicable, les autres dispositions
              resteront en vigueur.
            </p>

            <h3 className="mb-3 mt-4 text-xl font-semibold text-foreground">15.3 Modifications des CGU</h3>
            <p className="leading-relaxed">
              Nous pouvons modifier les présentes CGU à tout moment. Les modifications substantielles vous seront
              notifiées par email ou via l'application. La poursuite de l'utilisation après notification vaut
              acceptation des nouvelles conditions.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">16. Contact</h2>
            <p className="leading-relaxed">
              Pour toute question concernant ces Conditions Générales d'Utilisation, contactez-nous :
            </p>
            <p className="mt-4 leading-relaxed">
              <strong>Email :</strong> contact@healthycore.app<br />
              <strong>Adresse :</strong> [À compléter]
            </p>
          </section>

          <section className="rounded-lg border border-border bg-muted/50 p-6">
            <p className="text-sm leading-relaxed">
              <strong>Note importante :</strong> En utilisant l'application HealthyCore, vous reconnaissez avoir lu,
              compris et accepté les présentes Conditions Générales d'Utilisation ainsi que notre Politique de
              Confidentialité. Ces documents forment un ensemble contractuel indissociable.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
