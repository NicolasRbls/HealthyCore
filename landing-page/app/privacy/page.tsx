import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPolicy() {
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

        <h1 className="mb-8 text-4xl font-bold text-foreground">Politique de Confidentialité</h1>
        
        <div className="space-y-8 text-muted-foreground">
          <section>
            <p className="mb-4 text-sm">
              <strong>Dernière mise à jour :</strong> 17 décembre 2025
            </p>
            <p className="leading-relaxed">
              HealthyCore s'engage à protéger la vie privée de ses utilisateurs. Cette politique de confidentialité
              explique comment nous collectons, utilisons, divulguons et protégeons vos informations personnelles
              conformément au Règlement Général sur la Protection des Données (RGPD).
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">1. Responsable du traitement</h2>
            <p className="leading-relaxed">
              HealthyCore est le responsable du traitement de vos données personnelles.
            </p>
            <p className="mt-2 leading-relaxed">
              <strong>Contact :</strong> contact@healthycore.app
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">2. Données collectées</h2>
            <p className="mb-4 leading-relaxed">
              Nous collectons les données suivantes pour vous fournir nos services :
            </p>
            <ul className="ml-6 space-y-2 list-disc">
              <li><strong>Données d'identification :</strong> nom, prénom, adresse email</li>
              <li><strong>Données de santé :</strong> poids, taille, objectifs de santé, activité physique</li>
              <li><strong>Données nutritionnelles :</strong> historique alimentaire, préférences nutritionnelles</li>
              <li><strong>Données d'activité :</strong> programmes d'entraînement suivis, sessions d'exercices</li>
              <li><strong>Données techniques :</strong> adresse IP, type d'appareil, système d'exploitation</li>
              <li><strong>Données de connexion :</strong> données d'authentification, historique de connexion</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">3. Base légale et finalités du traitement</h2>
            <p className="mb-4 leading-relaxed">
              Nous traitons vos données sur les bases légales suivantes :
            </p>
            <ul className="ml-6 space-y-3 list-disc">
              <li>
                <strong>Exécution du contrat :</strong> pour vous fournir l'accès à l'application et ses fonctionnalités
              </li>
              <li>
                <strong>Consentement explicite :</strong> pour le traitement de vos données de santé (article 9 RGPD)
              </li>
              <li>
                <strong>Intérêt légitime :</strong> pour améliorer nos services et assurer la sécurité de l'application
              </li>
              <li>
                <strong>Obligation légale :</strong> pour respecter nos obligations légales et réglementaires
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">4. Durée de conservation</h2>
            <p className="leading-relaxed">
              Vos données sont conservées pendant la durée de votre utilisation active de l'application, puis :
            </p>
            <ul className="ml-6 mt-4 space-y-2 list-disc">
              <li><strong>Données de santé :</strong> supprimées immédiatement après la fermeture de votre compte</li>
              <li><strong>Données d'identification :</strong> conservées 3 ans après votre dernière activité</li>
              <li><strong>Données de connexion :</strong> conservées 1 an pour des raisons de sécurité</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">5. Destinataires des données</h2>
            <p className="leading-relaxed">
              Vos données peuvent être partagées avec :
            </p>
            <ul className="ml-6 mt-4 space-y-2 list-disc">
              <li><strong>Prestataires techniques :</strong> hébergement cloud sécurisé (conformes RGPD)</li>
              <li><strong>Services d'authentification :</strong> pour sécuriser votre compte</li>
              <li><strong>Services d'analyse :</strong> uniquement avec des données anonymisées</li>
            </ul>
            <p className="mt-4 leading-relaxed">
              Nous ne vendons jamais vos données personnelles à des tiers.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">6. Transferts de données hors UE</h2>
            <p className="leading-relaxed">
              Si vos données sont transférées hors de l'Union Européenne, nous garantissons un niveau de protection
              adéquat par le biais de clauses contractuelles types approuvées par la Commission Européenne ou de
              certifications appropriées (Privacy Shield, etc.).
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">7. Vos droits (RGPD)</h2>
            <p className="mb-4 leading-relaxed">
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="ml-6 space-y-2 list-disc">
              <li><strong>Droit d'accès :</strong> obtenir une copie de vos données personnelles</li>
              <li><strong>Droit de rectification :</strong> corriger vos données inexactes ou incomplètes</li>
              <li><strong>Droit à l'effacement :</strong> supprimer vos données dans certaines conditions</li>
              <li><strong>Droit à la limitation :</strong> limiter le traitement de vos données</li>
              <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
              <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
              <li><strong>Droit de retirer votre consentement :</strong> à tout moment pour les données de santé</li>
            </ul>
            <p className="mt-4 leading-relaxed">
              Pour exercer ces droits, contactez-nous à : <strong>contact@healthycore.app</strong>
            </p>
            <p className="mt-2 leading-relaxed">
              Vous disposez également du droit d'introduire une réclamation auprès de la CNIL (Commission Nationale
              de l'Informatique et des Libertés).
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">8. Sécurité des données</h2>
            <p className="leading-relaxed">
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger
              vos données contre tout accès non autorisé, perte, destruction ou altération :
            </p>
            <ul className="ml-6 mt-4 space-y-2 list-disc">
              <li>Chiffrement des données en transit (TLS/SSL) et au repos</li>
              <li>Authentification sécurisée et gestion des accès</li>
              <li>Surveillance et audits de sécurité réguliers</li>
              <li>Pseudonymisation et minimisation des données</li>
              <li>Sauvegardes régulières et plan de reprise d'activité</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">9. Cookies et technologies similaires</h2>
            <p className="leading-relaxed">
              L'application utilise des technologies de stockage local pour améliorer votre expérience. Vous pouvez
              contrôler ces préférences dans les paramètres de votre appareil. Consultez notre politique de cookies
              pour plus d'informations.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">10. Mineurs</h2>
            <p className="leading-relaxed">
              Notre service n'est pas destiné aux personnes de moins de 16 ans. Si vous avez connaissance qu'un mineur
              nous a fourni des données personnelles, veuillez nous contacter immédiatement.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">11. Modifications</h2>
            <p className="leading-relaxed">
              Nous pouvons modifier cette politique de confidentialité à tout moment. Les modifications substantielles
              vous seront notifiées par email ou via l'application. La date de dernière mise à jour est indiquée en
              haut de cette page.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">12. Contact</h2>
            <p className="leading-relaxed">
              Pour toute question concernant cette politique de confidentialité ou vos données personnelles,
              contactez-nous :
            </p>
            <p className="mt-4 leading-relaxed">
              <strong>Email :</strong> contact@healthycore.app<br />
              <strong>Adresse :</strong> [À compléter]
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
