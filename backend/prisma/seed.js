require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  // Ajout de l'admin
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
  const admin = await prisma.users.create({
    data: {
      role: "admin",
      prenom: process.env.ADMIN_PRENOM,
      nom: process.env.ADMIN_NOM,
      sexe: process.env.ADMIN_SEXE,
      date_de_naissance: new Date(process.env.ADMIN_DATE_DE_NAISSANCE),
      email: process.env.ADMIN_EMAIL,
      mot_de_passe: hashedPassword,
    },
  });

  // Ajout des badges
  // TO DO : Ajouter des images pour les badges
  const badges = [
    {
      nom: "Premier Aliment",
      image: "https://www.google.com",
      description: "Obtenu après avoir ajouté le premier aliment à son suivi.",
      condition_obtention: "ADD_FIRST_FOOD",
    },
    {
      nom: "Première Séance",
      image: "https://www.google.com",
      description: "Obtenu après avoir effectué une première séance.",
      condition_obtention: "DO_FIRST_SESSION",
    },
    {
      nom: "1er Jour",
      image: "https://www.google.com",
      description:
        "Obtenu après avoir complété tous les objectifs du premier jour.",
      condition_obtention: "FIRST_DAY_COMPLETED",
    },
    {
      nom: "7 Jours",
      image: "https://www.google.com",
      description:
        "Obtenu après avoir complété tous les objectifs des 7 premiers jours.",
      condition_obtention: "SEVEN_DAYS_COMPLETED",
    },
  ];
  await prisma.badges.createMany({ data: badges });

  // Ajout des objectifs
  const objectifs = [
    {
      titre: "Ajouter un aliment à son suivi quotidien",
    },
    {
      titre: "Effectuer la séance du jour",
    },
  ];
  await prisma.objectifs.createMany({ data: objectifs });

  // Ajout des niveaux de sédentarité
  const niveauxSedentarites = [
    {
      nom: "Très faible",
      description: "Travail de bureau, peu de mouvement",
      valeur: 1.2,
    },
    {
      nom: "Faible",
      description: "Activité légère, marche occasionnelle",
      valeur: 1.375,
    },
    {
      nom: "Modéré",
      description: "Actif au quotidien, marche régulière",
      valeur: 1.55,
    },
    {
      nom: "Élevé",
      description: "Travail physique intense, sport régulier",
      valeur: 1.725,
    },
    {
      nom: "Super actif",
      description: "Très actif, sport quotidien intense",
      valeur: 1.9,
    },
  ];
  await prisma.niveaux_sedentarites.createMany({ data: niveauxSedentarites });

  // Ajout des repartitions nutritionnelles
  const repartitionsPerteDePoids = [
    {
      nom: "Cardio",
      description:
        "Ce plan est conçu pour ceux qui pratiquent régulièrement des activités cardio comme la course, le vélo ou la natation. L’accent est mis sur un apport plus élevé en glucides pour fournir de l’énergie rapide nécessaire à l’endurance, tout en maintenant un apport adéquat en protéines pour préserver la masse musculaire.",
      type: "perte_de_poids",
      pourcentage_glucides: 60,
      pourcentage_proteines: 20,
      pourcentage_lipides: 20,
    },
    {
      nom: "Athlète",
      description:
        "Adapté aux athlètes qui souhaitent optimiser leurs performances sportives tout en perdant du poids. La combinaison de glucides pour l’énergie, de protéines pour la réparation musculaire, et de graisses saines pour la récupération permet une approche équilibrée.",
      type: "perte_de_poids",
      pourcentage_glucides: 55,
      pourcentage_proteines: 20,
      pourcentage_lipides: 25,
    },
    {
      nom: "Durable",
      description:
        "Ce plan favorise une approche progressive et durable de la perte de poids. Il est idéal pour ceux qui souhaitent maigrir sans sacrifier l’équilibre nutritionnel. Les protéines sont légèrement réduites, tandis que l'apport en graisses reste relativement élevé pour favoriser la satiété et un bon métabolisme lipidique.",
      type: "perte_de_poids",
      pourcentage_glucides: 55,
      pourcentage_proteines: 15,
      pourcentage_lipides: 30,
    },
  ];
  const repartitionsPriseDePoids = [
    {
      nom: "Cardio",
      description:
        "Ce plan est destiné aux sportifs qui combinent cardio et musculation légère. L'apport élevé en glucides soutient les performances pendant les séances d’entraînement cardio, tandis que les protéines permettent une légère augmentation musculaire.",
      type: "prise_de_poids",
      pourcentage_glucides: 60,
      pourcentage_proteines: 20,
      pourcentage_lipides: 20,
    },
    {
      nom: "Athlète",
      description:
        "Ce programme a été conçu pour les athlètes qui souhaitent développer leur masse musculaire tout en maintenant un niveau de performance élevé. Un apport équilibré entre glucides, protéines et graisses soutient à la fois la récupération musculaire et les besoins énergétiques élevés.",
      type: "prise_de_poids",
      pourcentage_glucides: 55,
      pourcentage_proteines: 20,
      pourcentage_lipides: 25,
    },
    {
      nom: "Se muscler",
      description:
        "Ce plan est idéal pour les adeptes de musculation cherchant à augmenter leur masse musculaire. L'apport en protéines est ici maximisé (25 %) pour favoriser la synthèse musculaire, tandis que l’apport équilibré en glucides et graisses garantit l’énergie nécessaire pour les entraînements intensifs.",
      type: "prise_de_poids",
      pourcentage_glucides: 50,
      pourcentage_proteines: 25,
      pourcentage_lipides: 25,
    },
  ];
  const repartitionsMaintien = [
    {
      nom: "Cardio",
      description:
        "Plan nutritionnel adapté aux personnes pratiquant des exercices cardio réguliers. L'accent est mis sur un équilibre entre glucides, protéines et graisses pour maintenir une bonne forme physique.",
      type: "maintien",
      pourcentage_glucides: 60,
      pourcentage_proteines: 20,
      pourcentage_lipides: 20,
    },
    {
      nom: "Durable",
      description:
        "Un plan équilibré qui peut être maintenu sur le long terme, avec un apport suffisant en glucides pour l'énergie, des protéines pour le maintien musculaire et des graisses pour une bonne santé générale.",
      type: "maintien",
      pourcentage_glucides: 55,
      pourcentage_proteines: 15,
      pourcentage_lipides: 30,
    },
    {
      nom: "Athlète",
      description:
        "Pour les athlètes qui cherchent à maintenir leurs performances tout en équilibrant leur alimentation avec une proportion adéquate de glucides, protéines et graisses.",
      type: "maintien",
      pourcentage_glucides: 55,
      pourcentage_proteines: 20,
      pourcentage_lipides: 25,
    },
    {
      nom: "Se muscler",
      description:
        "Plan nutritionnel pour ceux qui cherchent à maintenir ou augmenter leur masse musculaire tout en maintenant une alimentation équilibrée.",
      type: "maintien",
      pourcentage_glucides: 50,
      pourcentage_proteines: 25,
      pourcentage_lipides: 25,
    },
  ];
  await prisma.repartitions_nutritionnelles.createMany({
    data: [
      ...repartitionsPerteDePoids,
      ...repartitionsPriseDePoids,
      ...repartitionsMaintien,
    ],
  });

  // Ajout des régimes alimentaires
  const regimesAlimentaires = [
    {
      nom: "Aucun",
      description: "Régime standard équilibré",
    },
    {
      nom: "Végétarien",
      description: "Sans viandes, avec des produits laitiers",
    },
    {
      nom: "Végétalien",
      description: "Aliments d'origine végétale",
    },
    {
      nom: "Sans gluten",
      description: "Sans blé ni céréales",
    },
    {
      nom: "Sans lactose",
      description: "Sans produits laitiers ni dérivés",
    },
  ];
  await prisma.regimes_alimentaires.createMany({ data: regimesAlimentaires });

  // Ajout des activités
  const activites = [
    {
      nom: "🚶‍♂️ Cardio modéré",
      description: "Maintien et bien-être",
    },
    {
      nom: "🔥 HIIT",
      description: "Performance maximale.",
    },
    {
      nom: "🏃‍♂️ Running",
      description: "Endurance et cardio",
    },
    {
      nom: "💪 Musculation",
      description: "Développement musculaire",
    },
    {
      nom: "🧘‍♀️ Yoga/Pilates",
      description: "Équilibre et détente",
    },
  ];
  await prisma.activites.createMany({ data: activites });

  // Ajout des tags
  const tags = [
    // Tags pour les exercices et programmes
    { nom: "Cardio", type: "sport" },
    { nom: "Force", type: "sport" },
    { nom: "Flexibilité", type: "sport" },
    { nom: "HIIT", type: "sport" },
    { nom: "Poids du corps", type: "sport" },
    { nom: "Haut du corps", type: "sport" },
    { nom: "Bas du corps", type: "sport" },
    { nom: "Core", type: "sport" },
    { nom: "Équilibre", type: "sport" },
    { nom: "Mobilité", type: "sport" },

    // Tags pour les aliments
    { nom: "Végétarien", type: "aliment" },
    { nom: "Faible en glucides", type: "aliment" },
    { nom: "Riche en protéines", type: "aliment" },
    { nom: "Sans gluten", type: "aliment" },
    { nom: "Petit-déjeuner", type: "aliment" },
    { nom: "Collation", type: "aliment" },
    { nom: "Dessert", type: "aliment" },
    { nom: "Rapide", type: "aliment" },
  ];
  await prisma.tags.createMany({ data: tags });

  // Récupération des IDs des tags pour les associer aux exercices
  const tagIds = await prisma.tags.findMany({
    where: { type: "sport" },
    select: { id_tag: true, nom: true },
  });

  // Création des exercices avec leurs tags associés
  const exercicesWithTags = [
    {
      exercice: {
        nom: "Pompes classiques",
        gif: "/assets/images/exercises/pushup.gif",
        description:
          "Position de planche, descendez en pliant les coudes puis remontez en les tendant.",
        equipement: "Aucun",
      },
      tags: ["Force", "Poids du corps", "Haut du corps"],
    },
    {
      exercice: {
        nom: "Squats",
        gif: "/assets/images/exercises/squat.gif",
        description:
          "Debout, pieds écartés largeur des épaules, descendez comme pour vous asseoir puis remontez.",
        equipement: "Aucun",
      },
      tags: ["Force", "Poids du corps", "Bas du corps"],
    },
    {
      exercice: {
        nom: "Fentes avant",
        gif: "/assets/images/exercises/lunge.gif",
        description:
          "Faites un grand pas en avant et pliez les genoux à 90 degrés, puis revenez en position initiale.",
        equipement: "Aucun",
      },
      tags: ["Force", "Poids du corps", "Bas du corps"],
    },
    {
      exercice: {
        nom: "Planche",
        gif: "/assets/images/exercises/plank.gif",
        description:
          "En appui sur les avant-bras et la pointe des pieds, maintenez votre corps droit comme une planche.",
        equipement: "Aucun",
      },
      tags: ["Force", "Poids du corps", "Core"],
    },
    {
      exercice: {
        nom: "Burpees",
        gif: "/assets/images/exercises/burpee.gif",
        description:
          "Enchaînez une position accroupie, une planche, une pompe, un retour accroupi et un saut vertical.",
        equipement: "Aucun",
      },
      tags: ["Cardio", "HIIT", "Poids du corps"],
    },
    {
      exercice: {
        nom: "Mountain climbers",
        gif: "/assets/images/exercises/montainclimber.gif",
        description:
          "En position de planche, ramenez alternativement les genoux vers la poitrine.",
        equipement: "Aucun",
      },
      tags: ["Cardio", "HIIT", "Core"],
    },
    {
      exercice: {
        nom: "Jumping jacks",
        gif: "/assets/images/exercises/jumpingjack.gif",
        description:
          "Sautez en écartant jambes et bras simultanément, puis revenez en position initiale.",
        equipement: "Aucun",
      },
      tags: ["Cardio", "HIIT", "Poids du corps"],
    },
    {
      exercice: {
        nom: "Dips sur chaise",
        gif: "/assets/images/exercises/dips.gif",
        description:
          "Mains sur le bord d'une chaise, fléchissez les coudes pour descendre puis remontez.",
        equipement: "Chaise",
      },
      tags: ["Force", "Haut du corps"],
    },
    {
      exercice: {
        nom: "Curl biceps avec haltères",
        gif: "/assets/images/exercises/bicepscurl.gif",
        description:
          "Coudes près du corps, fléchissez les avant-bras pour amener les haltères aux épaules.",
        equipement: "Haltères",
      },
      tags: ["Force", "Haut du corps"],
    },
    {
      exercice: {
        nom: "Développé épaules avec haltères",
        gif: "/assets/images/exercises/shoulderpress.gif",
        description:
          "Poussez les haltères au-dessus de la tête en tendant les bras, puis redescendez.",
        equipement: "Haltères",
      },
      tags: ["Force", "Haut du corps"],
    },
    {
      exercice: {
        nom: "Rowing avec haltères",
        gif: "/assets/images/exercises/rowing.gif",
        description:
          "Incliné en avant, tirez les haltères vers votre abdomen en serrant les omoplates.",
        equipement: "Haltères",
      },
      tags: ["Force", "Haut du corps"],
    },
    {
      exercice: {
        nom: "Superman",
        gif: "/assets/images/exercises/superman.gif",
        description:
          "Allongé sur le ventre, soulevez simultanément bras et jambes du sol.",
        equipement: "Aucun",
      },
      tags: ["Force", "Core", "Poids du corps"],
    },
    {
      exercice: {
        nom: "Bicycle crunch",
        gif: "/assets/images/exercises/crunchbicycle.gif",
        description:
          "Allongé sur le dos, amenez alternativement le coude vers le genou opposé.",
        equipement: "Aucun",
      },
      tags: ["Core", "Poids du corps"],
    },
    {
      exercice: {
        nom: "Russian twist",
        gif: "/assets/images/exercises/russiantwist.gif",
        description:
          "Assis avec le buste incliné en arrière, pivotez le torse d'un côté à l'autre.",
        equipement: "Optionnel: poids léger",
      },
      tags: ["Force", "Core"],
    },
    {
      exercice: {
        nom: "Gainage latéral",
        gif: "/assets/images/exercises/sideplank.gif",
        description:
          "En appui sur un avant-bras et la tranche du pied, maintenez le corps aligné.",
        equipement: "Aucun",
      },
      tags: ["Force", "Core", "Équilibre"],
    },
    {
      exercice: {
        nom: "Extensions des triceps avec haltère",
        gif: "/assets/images/exercises/tricepsextension.gif",
        description:
          "Bras au-dessus de la tête, fléchissez le coude pour descendre l'haltère derrière la tête.",
        equipement: "Haltère",
      },
      tags: ["Force", "Haut du corps"],
    },
    {
      exercice: {
        nom: "Dead bug",
        gif: "/assets/images/exercises/deadbug.gif",
        description:
          "Allongé sur le dos, étendez simultanément le bras droit et la jambe gauche.",
        equipement: "Aucun",
      },
      tags: ["Core", "Mobilité", "Équilibre"],
    },
    {
      exercice: {
        nom: "Vélo",
        gif: "/assets/images/exercises/bicycle.gif",
        description:
          "Allongé sur le dos, amenez alternativement le coude vers le genou opposé.",
        equipement: "Aucun",
      },
      tags: ["Core", "Poids du corps"],
    },
    {
      exercice: {
        nom: "Bird dog",
        gif: "/assets/images/exercises/birddog.gif",
        description:
          "À quatre pattes, étendez simultanément le bras droit et la jambe gauche.",
        equipement: "Aucun",
      },
      tags: ["Core", "Équilibre", "Mobilité"],
    },
    {
      exercice: {
        nom: "Relevés de jambes suspendu",
        gif: "/assets/images/exercises/legraises.gif",
        description:
          "Suspendu à une barre, remontez les jambes tendues jusqu'à l'horizontale.",
        equipement: "Barre de traction",
      },
      tags: ["Force", "Core", "Poids du corps"],
    },
  ];

  // Fonction pour trouver l'ID d'un tag par son nom
  const findTagIdByName = (tagName) => {
    const tag = tagIds.find((tag) => tag.nom === tagName);
    return tag ? tag.id_tag : null;
  };

  // Insertion des exercices avec leurs tags associés
  for (const item of exercicesWithTags) {
    // Création de l'exercice
    const createdExercice = await prisma.exercices.create({
      data: item.exercice,
    });

    // Attribution des tags spécifiques à l'exercice
    for (const tagName of item.tags) {
      const tagId = findTagIdByName(tagName);
      if (tagId) {
        await prisma.exercices_tags.create({
          data: {
            id_exercice: createdExercice.id_exercice,
            id_tag: tagId,
          },
        });
      }
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
