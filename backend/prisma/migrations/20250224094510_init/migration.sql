-- CreateTable
CREATE TABLE "activites" (
    "id_activite" SERIAL NOT NULL,
    "nom" VARCHAR(50) NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "activites_pkey" PRIMARY KEY ("id_activite")
);

-- CreateTable
CREATE TABLE "aliments" (
    "id_aliment" SERIAL NOT NULL,
    "image" VARCHAR(255),
    "source" VARCHAR(20) NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "id_user" INTEGER,
    "nom" VARCHAR(100) NOT NULL,
    "ingredients" TEXT,
    "description" TEXT,
    "calories" INTEGER NOT NULL,
    "proteines" DECIMAL NOT NULL,
    "glucides" DECIMAL NOT NULL,
    "lipides" DECIMAL NOT NULL,
    "code_barres" VARCHAR(255),
    "temps_preparation" INTEGER NOT NULL,

    CONSTRAINT "aliments_pkey" PRIMARY KEY ("id_aliment")
);

-- CreateTable
CREATE TABLE "aliments_tags" (
    "id_aliment" INTEGER NOT NULL,
    "id_tag" INTEGER NOT NULL,

    CONSTRAINT "aliments_tags_pkey" PRIMARY KEY ("id_aliment","id_tag")
);

-- CreateTable
CREATE TABLE "badges" (
    "id_badge" SERIAL NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "image" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "condition_obtention" TEXT NOT NULL,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id_badge")
);

-- CreateTable
CREATE TABLE "badges_utilisateurs" (
    "id_badge_utilisateur" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_badge" INTEGER NOT NULL,
    "date_obtention" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "badges_utilisateurs_pkey" PRIMARY KEY ("id_badge_utilisateur")
);

-- CreateTable
CREATE TABLE "evaluations_recettes" (
    "id_evaluation_recette" SERIAL NOT NULL,
    "id_aliment" INTEGER NOT NULL,
    "id_user" INTEGER NOT NULL,
    "evaluation" VARCHAR(10) NOT NULL,

    CONSTRAINT "evaluations_recettes_pkey" PRIMARY KEY ("id_evaluation_recette")
);

-- CreateTable
CREATE TABLE "evolutions" (
    "id_evolution" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "poids" DECIMAL NOT NULL,
    "taille" DECIMAL NOT NULL,

    CONSTRAINT "evolutions_pkey" PRIMARY KEY ("id_evolution")
);

-- CreateTable
CREATE TABLE "exercices" (
    "id_exercice" SERIAL NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "gif" VARCHAR(255),
    "description" TEXT NOT NULL,
    "equipement" VARCHAR(255),

    CONSTRAINT "exercices_pkey" PRIMARY KEY ("id_exercice")
);

-- CreateTable
CREATE TABLE "exercices_seances" (
    "id_exercice_seance" SERIAL NOT NULL,
    "id_exercice" INTEGER NOT NULL,
    "id_seance" INTEGER NOT NULL,
    "ordre_exercice" INTEGER NOT NULL,
    "repetitions" INTEGER,
    "series" INTEGER,
    "duree" INTEGER NOT NULL,

    CONSTRAINT "exercices_seances_pkey" PRIMARY KEY ("id_exercice_seance")
);

-- CreateTable
CREATE TABLE "exercices_tags" (
    "id_exercice" INTEGER NOT NULL,
    "id_tag" INTEGER NOT NULL,

    CONSTRAINT "exercices_tags_pkey" PRIMARY KEY ("id_exercice","id_tag")
);

-- CreateTable
CREATE TABLE "niveaux_sedentarites" (
    "id_niveau_sedentarite" SERIAL NOT NULL,
    "nom" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "valeur" DECIMAL NOT NULL,

    CONSTRAINT "niveaux_sedentarites_pkey" PRIMARY KEY ("id_niveau_sedentarite")
);

-- CreateTable
CREATE TABLE "objectifs" (
    "id_objectif" SERIAL NOT NULL,
    "titre" VARCHAR(100) NOT NULL,

    CONSTRAINT "objectifs_pkey" PRIMARY KEY ("id_objectif")
);

-- CreateTable
CREATE TABLE "objectifs_utilisateurs" (
    "id_objectif_utilisateur" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_objectif" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "statut" VARCHAR(10) NOT NULL DEFAULT 'not_done',

    CONSTRAINT "objectifs_utilisateurs_pkey" PRIMARY KEY ("id_objectif_utilisateur")
);

-- CreateTable
CREATE TABLE "preferences" (
    "id_preference" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "objectif_poids" DECIMAL NOT NULL,
    "id_repartition_nutritionnelle" INTEGER NOT NULL,
    "id_regime_alimentaire" INTEGER NOT NULL,
    "id_niveau_sedentarite" INTEGER NOT NULL,
    "seances_par_semaines" INTEGER NOT NULL,
    "bmr" DECIMAL NOT NULL,
    "tdee" DECIMAL NOT NULL,
    "calories_quotidiennes" DECIMAL NOT NULL,
    "duree_objectif_semaines" INTEGER,
    "deficit_surplus_calorique" DECIMAL,

    CONSTRAINT "preferences_pkey" PRIMARY KEY ("id_preference")
);

-- CreateTable
CREATE TABLE "preferences_activites" (
    "id_preference" INTEGER NOT NULL,
    "id_activite" INTEGER NOT NULL,

    CONSTRAINT "preferences_activites_pkey" PRIMARY KEY ("id_preference","id_activite")
);

-- CreateTable
CREATE TABLE "programmes" (
    "id_programme" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "image" VARCHAR(255),
    "duree" INTEGER NOT NULL,

    CONSTRAINT "programmes_pkey" PRIMARY KEY ("id_programme")
);

-- CreateTable
CREATE TABLE "programmes_tags" (
    "id_programme" INTEGER NOT NULL,
    "id_tag" INTEGER NOT NULL,

    CONSTRAINT "programmes_tags_pkey" PRIMARY KEY ("id_programme","id_tag")
);

-- CreateTable
CREATE TABLE "programmes_utilisateurs" (
    "id_programme_utilisateur" SERIAL NOT NULL,
    "id_programme" INTEGER NOT NULL,
    "id_user" INTEGER NOT NULL,
    "date_debut" DATE NOT NULL,
    "date_fin" DATE NOT NULL,

    CONSTRAINT "programmes_utilisateurs_pkey" PRIMARY KEY ("id_programme_utilisateur")
);

-- CreateTable
CREATE TABLE "recettes_du_jour" (
    "id_recette_du_jour" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "id_aliment" INTEGER NOT NULL,

    CONSTRAINT "recettes_du_jour_pkey" PRIMARY KEY ("id_recette_du_jour")
);

-- CreateTable
CREATE TABLE "regimes_alimentaires" (
    "id_regime_alimentaire" SERIAL NOT NULL,
    "nom" VARCHAR(50) NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "regimes_alimentaires_pkey" PRIMARY KEY ("id_regime_alimentaire")
);

-- CreateTable
CREATE TABLE "repartitions_nutritionnelles" (
    "id_repartition_nutritionnelle" SERIAL NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "pourcentage_glucides" DECIMAL NOT NULL,
    "pourcentage_proteines" DECIMAL NOT NULL,
    "pourcentage_lipides" DECIMAL NOT NULL,

    CONSTRAINT "repartitions_nutritionnelles_pkey" PRIMARY KEY ("id_repartition_nutritionnelle")
);

-- CreateTable
CREATE TABLE "seances" (
    "id_seance" SERIAL NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "id_user" INTEGER NOT NULL,

    CONSTRAINT "seances_pkey" PRIMARY KEY ("id_seance")
);

-- CreateTable
CREATE TABLE "seances_programmes" (
    "id_seance_programme" SERIAL NOT NULL,
    "id_seance" INTEGER NOT NULL,
    "id_programme" INTEGER NOT NULL,
    "ordre_seance" INTEGER NOT NULL,

    CONSTRAINT "seances_programmes_pkey" PRIMARY KEY ("id_seance_programme")
);

-- CreateTable
CREATE TABLE "seances_tags" (
    "id_seance" INTEGER NOT NULL,
    "id_tag" INTEGER NOT NULL,

    CONSTRAINT "seances_tags_pkey" PRIMARY KEY ("id_seance","id_tag")
);

-- CreateTable
CREATE TABLE "signalements" (
    "id_signalement" SERIAL NOT NULL,
    "titre" VARCHAR(100) NOT NULL,

    CONSTRAINT "signalements_pkey" PRIMARY KEY ("id_signalement")
);

-- CreateTable
CREATE TABLE "signalements_utilisateurs" (
    "id_signalement_utilisateur" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_signalement" INTEGER NOT NULL,
    "id_aliment" INTEGER NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" VARCHAR(20) NOT NULL DEFAULT 'non_revue',

    CONSTRAINT "signalements_utilisateurs_pkey" PRIMARY KEY ("id_signalement_utilisateur")
);

-- CreateTable
CREATE TABLE "suivis_nutritionnels" (
    "id_suivi_nutritionnel" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_aliment" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "repas" VARCHAR(20) NOT NULL,
    "quantite" INTEGER NOT NULL,

    CONSTRAINT "suivis_nutritionnels_pkey" PRIMARY KEY ("id_suivi_nutritionnel")
);

-- CreateTable
CREATE TABLE "suivis_sportifs" (
    "id_suivi_sportif" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_seance" INTEGER NOT NULL,
    "date" DATE NOT NULL,

    CONSTRAINT "suivis_sportifs_pkey" PRIMARY KEY ("id_suivi_sportif")
);

-- CreateTable
CREATE TABLE "tags" (
    "id_tag" SERIAL NOT NULL,
    "nom" VARCHAR(50) NOT NULL,
    "type" VARCHAR(20) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id_tag")
);

-- CreateTable
CREATE TABLE "users" (
    "id_user" SERIAL NOT NULL,
    "role" VARCHAR(20) NOT NULL DEFAULT 'user',
    "prenom" VARCHAR(50) NOT NULL,
    "nom" VARCHAR(50) NOT NULL,
    "sexe" VARCHAR(2) NOT NULL DEFAULT 'NS',
    "date_de_naissance" DATE NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "mot_de_passe" VARCHAR(255) NOT NULL,
    "cree_a" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mis_a_jour_a" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id_user")
);

-- CreateIndex
CREATE UNIQUE INDEX "activites_nom_key" ON "activites"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "regimes_alimentaires_nom_key" ON "regimes_alimentaires"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "tags_nom_key" ON "tags"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "aliments" ADD CONSTRAINT "fk_user" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "aliments_tags" ADD CONSTRAINT "fk_aliment" FOREIGN KEY ("id_aliment") REFERENCES "aliments"("id_aliment") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "aliments_tags" ADD CONSTRAINT "fk_tag" FOREIGN KEY ("id_tag") REFERENCES "tags"("id_tag") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "badges_utilisateurs" ADD CONSTRAINT "fk_badge" FOREIGN KEY ("id_badge") REFERENCES "badges"("id_badge") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "badges_utilisateurs" ADD CONSTRAINT "fk_user" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "evaluations_recettes" ADD CONSTRAINT "fk_aliment" FOREIGN KEY ("id_aliment") REFERENCES "aliments"("id_aliment") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "evaluations_recettes" ADD CONSTRAINT "fk_user" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "evolutions" ADD CONSTRAINT "fk_user" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "exercices_seances" ADD CONSTRAINT "exercices_seances_id_exercice_fkey" FOREIGN KEY ("id_exercice") REFERENCES "exercices"("id_exercice") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "exercices_seances" ADD CONSTRAINT "exercices_seances_id_seance_fkey" FOREIGN KEY ("id_seance") REFERENCES "seances"("id_seance") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "exercices_tags" ADD CONSTRAINT "fk_exercice" FOREIGN KEY ("id_exercice") REFERENCES "exercices"("id_exercice") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "exercices_tags" ADD CONSTRAINT "fk_tag" FOREIGN KEY ("id_tag") REFERENCES "tags"("id_tag") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "objectifs_utilisateurs" ADD CONSTRAINT "fk_objectif" FOREIGN KEY ("id_objectif") REFERENCES "objectifs"("id_objectif") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "objectifs_utilisateurs" ADD CONSTRAINT "fk_user" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "preferences" ADD CONSTRAINT "fk_niveau_sedentarite" FOREIGN KEY ("id_niveau_sedentarite") REFERENCES "niveaux_sedentarites"("id_niveau_sedentarite") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "preferences" ADD CONSTRAINT "fk_regime_alimentaire" FOREIGN KEY ("id_regime_alimentaire") REFERENCES "regimes_alimentaires"("id_regime_alimentaire") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "preferences" ADD CONSTRAINT "fk_repartition_nutritionnelle" FOREIGN KEY ("id_repartition_nutritionnelle") REFERENCES "repartitions_nutritionnelles"("id_repartition_nutritionnelle") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "preferences" ADD CONSTRAINT "fk_user" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "preferences_activites" ADD CONSTRAINT "fk_activite" FOREIGN KEY ("id_activite") REFERENCES "activites"("id_activite") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "preferences_activites" ADD CONSTRAINT "fk_preference" FOREIGN KEY ("id_preference") REFERENCES "preferences"("id_preference") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "programmes" ADD CONSTRAINT "fk_user" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "programmes_tags" ADD CONSTRAINT "fk_programme" FOREIGN KEY ("id_programme") REFERENCES "programmes"("id_programme") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "programmes_tags" ADD CONSTRAINT "fk_tag" FOREIGN KEY ("id_tag") REFERENCES "tags"("id_tag") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "programmes_utilisateurs" ADD CONSTRAINT "fk_programme" FOREIGN KEY ("id_programme") REFERENCES "programmes"("id_programme") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "programmes_utilisateurs" ADD CONSTRAINT "fk_user" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "recettes_du_jour" ADD CONSTRAINT "fk_recette_du_jour" FOREIGN KEY ("id_recette_du_jour") REFERENCES "aliments"("id_aliment") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "seances" ADD CONSTRAINT "fk_user" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "seances_programmes" ADD CONSTRAINT "fk_programme" FOREIGN KEY ("id_programme") REFERENCES "programmes"("id_programme") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "seances_programmes" ADD CONSTRAINT "fk_seance" FOREIGN KEY ("id_seance") REFERENCES "seances"("id_seance") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "seances_tags" ADD CONSTRAINT "fk_seance" FOREIGN KEY ("id_seance") REFERENCES "seances"("id_seance") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "seances_tags" ADD CONSTRAINT "fk_tag" FOREIGN KEY ("id_tag") REFERENCES "tags"("id_tag") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "signalements_utilisateurs" ADD CONSTRAINT "fk_aliment" FOREIGN KEY ("id_aliment") REFERENCES "aliments"("id_aliment") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "signalements_utilisateurs" ADD CONSTRAINT "fk_signalement" FOREIGN KEY ("id_signalement") REFERENCES "signalements"("id_signalement") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "signalements_utilisateurs" ADD CONSTRAINT "fk_user" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "suivis_nutritionnels" ADD CONSTRAINT "fk_aliment" FOREIGN KEY ("id_aliment") REFERENCES "aliments"("id_aliment") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "suivis_nutritionnels" ADD CONSTRAINT "fk_user" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "suivis_sportifs" ADD CONSTRAINT "fk_seance" FOREIGN KEY ("id_seance") REFERENCES "seances"("id_seance") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "suivis_sportifs" ADD CONSTRAINT "fk_user" FOREIGN KEY ("id_user") REFERENCES "users"("id_user") ON DELETE NO ACTION ON UPDATE NO ACTION;
