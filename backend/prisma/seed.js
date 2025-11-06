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
  const badges = [
    {
      nom: "Premier Aliment",
      image: "/assets/images/badges/1-premier-aliment.png",
      description: "Obtenu après avoir ajouté le premier aliment à son suivi.",
      condition_obtention: "ADD_FIRST_FOOD",
    },
    {
      nom: "Première Séance",
      image: "/assets/images/badges/2-premiere-seance.png",
      description: "Obtenu après avoir effectué une première séance.",
      condition_obtention: "DO_FIRST_SESSION",
    },
    {
      nom: "1er Jour",
      image: "/assets/images/badges/3-serie-un-jour.png",
      description:
        "Obtenu après avoir complété tous les objectifs du premier jour.",
      condition_obtention: "FIRST_DAY_COMPLETED",
    },
    {
      nom: "7 Jours",
      image: "/assets/images/badges/4-serie-sept-jours.png",
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
      nom: "Cardio modéré",
      description: "Maintien et bien-être",
    },
    {
      nom: "HIIT",
      description: "Performance maximale.",
    },
    {
      nom: "Running",
      description: "Endurance et cardio",
    },
    {
      nom: "Musculation",
      description: "Développement musculaire",
    },
    {
      nom: "Yoga/Pilates",
      description: "Équilibre et détente",
    },
  ];
  await prisma.activites.createMany({ data: activites });

  // Ajout des tags de type "sport"
  const sportTags = [
    "débutant",
    "force",
    "endurance",
    "full-body",
    "intermédiaire",
    "volume",
    "pectoraux",
    "triceps",
    "épaules",
    "dos",
    "biceps",
    "jambes",
    "fessiers",
    "mollets",
    "abdominaux",
    "quadriceps",
    "isolation",
    "activation",
    "préparation",
    "mobilité",
    "sécurité",
    "récupération",
    "souplesse",
    "détente",
    "pull",
    "push",
    "core",
    "stabilité",
    "isométrique",
    "unilatéral",
    "équilibre",
    "avancé",
    "deltoïdes",
  ].map((nom) => ({ nom, type: "sport" }));

  await prisma.tags.createMany({ data: sportTags });

  // Récupération des IDs des tags pour les associations futures
  const tagsByName = {};
  const allTags = await prisma.tags.findMany();
  allTags.forEach((tag) => {
    tagsByName[tag.nom] = tag.id_tag;
  });

  // Ajout des exercices
  const exercices = [
    {
      nom: "Échauffement",
      description:
        "Série de mouvements dynamiques pour préparer les muscles et les articulations. Incluez de légers étirements, rotations des épaules, des poignets, des hanches et mobilisation générale.",
      gif: "/assets/images/exercices/1-warm-up.gif",
      tags: ["préparation", "mobilité", "activation", "sécurité"],
    },
    {
      nom: "Développé couché",
      description:
        "Allongé sur un banc, tenez une barre au-dessus de votre poitrine, bras tendus. Abaissez lentement la barre jusqu'à ce qu'elle touche votre poitrine, puis repoussez-la vers le haut.",
      equipement: "Banc de musculation, barre et poids",
      gif: "/assets/images/exercices/2-bench-press.gif",
      tags: ["pectoraux", "triceps", "force"],
    },
    {
      nom: "Dips sur chaise",
      description:
        "Placez vos mains sur le bord d'une chaise ou d'un banc, jambes tendues devant vous. Pliez les coudes pour descendre le corps, puis remontez en position initiale.",
      equipement: "Chaise stable ou banc",
      gif: "/assets/images/exercices/3-dips.gif",
      tags: ["triceps", "pectoraux", "débutant"],
    },
    {
      nom: "Développé militaire",
      description:
        "Debout ou assis, tenez une barre ou des haltères au niveau des épaules, paumes vers l'avant. Poussez vers le haut jusqu'à l'extension complète des bras, puis redescendez lentement.",
      equipement: "Barre ou haltères",
      gif: "/assets/images/exercices/4-shoulder-press.gif",
      tags: ["épaules", "deltoïdes", "triceps", "push"],
    },
    {
      nom: "Étirements",
      description:
        "Série d'étirements statiques ciblant les principaux groupes musculaires travaillés. Maintenez chaque position 20-30 secondes sans rebondir.",
      gif: "/assets/images/exercices/5-stretching.gif",
      tags: ["récupération", "souplesse", "mobilité", "détente"],
    },
    {
      nom: "Tractions assistées",
      description:
        "Utilisez un élastique ou une machine d'assistance pour vous aider à tirer votre corps vers une barre. Saisissez la barre, bras tendus, et tirez jusqu'à ce que votre menton dépasse la barre.",
      equipement: "Barre de traction, élastique ou machine d'assistance",
      gif: "/assets/images/exercices/6-pull-up-assisted.gif",
      tags: ["dos", "biceps", "débutant"],
    },
    {
      nom: "Rowing haltères",
      description:
        "Penché en avant, un genou et une main sur un banc, tirez l'haltère vers votre hanche en gardant le coude près du corps. Contrôlez la descente et répétez.",
      equipement: "Haltère, banc",
      gif: "/assets/images/exercices/7-rowing.gif",
      tags: ["dos", "biceps", "pull"],
    },
    {
      nom: "Curl biceps",
      description:
        "Debout, bras le long du corps, paumes vers l'avant, fléchissez les coudes pour amener les haltères vers vos épaules. Gardez les coudes près du corps et redescendez lentement.",
      equipement: "Haltères",
      gif: "/assets/images/exercices/8-curl-biceps-dumbell.gif",
      tags: ["biceps", "isolation", "haltères"],
    },
    {
      nom: "Squat",
      description:
        "Debout, pieds écartés à largeur d'épaules, descendez comme pour vous asseoir en poussant les hanches vers l'arrière, genoux alignés avec les orteils. Remontez en poussant sur vos talons.",
      equipement: "Barre et poids (optionnel)",
      gif: "/assets/images/exercices/9-squat.gif",
      tags: ["quadriceps", "fessiers", "jambes"],
    },
    {
      nom: "Presse à jambes",
      description:
        "Assis dans la machine, pieds sur la plateforme à largeur d'épaules, poussez jusqu'à extension presque complète des jambes, puis contrôlez le retour à la position de départ.",
      equipement: "Machine presse à jambes",
      gif: "/assets/images/exercices/10-leg-press.gif",
      tags: ["quadriceps", "fessiers", "cuisses"],
    },
    {
      nom: "Extension mollets debout",
      description:
        "Debout sur le bord d'une marche ou d'une plateforme, talons dans le vide, montez sur la pointe des pieds aussi haut que possible, puis redescendez sous le niveau de départ.",
      equipement:
        "Marche ou plateforme surélevée, barre ou haltères (optionnel)",
      gif: "/assets/images/exercices/11-calf-extensions.gif",
      tags: ["mollets", "isolation"],
    },
    {
      nom: "Curl à la barre",
      description:
        "Debout, tenez une barre droite ou EZ à bout de bras, paumes vers l'avant. Fléchissez les coudes pour amener la barre vers vos épaules, puis redescendez lentement.",
      equipement: "Barre droite ou EZ",
      gif: "/assets/images/exercices/12-curl-biceps-barbell.gif",
      tags: ["biceps", "isolation", "barre"],
    },
    {
      nom: "Gainage",
      description:
        "En position de planche sur les avant-bras et les orteils, maintenez votre corps en ligne droite, abdominaux contractés, sans laisser les hanches s'affaisser.",
      gif: "/assets/images/exercices/13-plank.gif",
      tags: ["abdominaux", "core", "stabilité", "isométrique"],
    },
    {
      nom: "Fentes",
      description:
        "Debout, faites un grand pas en avant, pliez les deux genoux à 90° (genou arrière près du sol), puis poussez sur le pied avant pour revenir à la position initiale.",
      equipement: "Haltères (optionnel)",
      gif: "/assets/images/exercices/14-lunges.gif",
      tags: ["quadriceps", "fessiers", "unilatéral", "équilibre"],
    },
    {
      nom: "Tractions",
      description:
        "Suspendez-vous à une barre, mains en pronation (paumes vers l'avant), tirez votre corps vers le haut jusqu'à ce que votre menton dépasse la barre, puis redescendez lentement.",
      equipement: "Barre de traction",
      gif: "/assets/images/exercices/15-pull-up.gif",
      tags: ["dos", "biceps", "avancé"],
    },
    {
      nom: "Élévations latérales",
      description:
        "Debout, haltères le long du corps, paumes face à vous, soulevez les bras sur les côtés jusqu'à hauteur d'épaule (formant un T), puis redescendez lentement.",
      equipement: "Haltères légers",
      gif: "/assets/images/exercices/16-lateral-raise.gif",
      tags: ["épaules", "deltoïdes", "isolation", "haltères"],
    },
  ];

  // Création des exercices et des associations avec les tags
  for (const exercice of exercices) {
    const { tags: exerciceTags, ...exerciceData } = exercice;

    // Création de l'exercice
    const createdExercice = await prisma.exercices.create({
      data: exerciceData,
    });

    // Création des associations exercice-tag
    for (const tagName of exerciceTags) {
      if (tagsByName[tagName]) {
        await prisma.exercices_tags.create({
          data: {
            id_exercice: createdExercice.id_exercice,
            id_tag: tagsByName[tagName],
          },
        });
      }
    }
  }

  // Définition des séances avec leurs tags et exercices
  const seances = [
    {
      nom: "Push (Pectoraux, triceps, épaules)",
      id_user: admin.id_user,
      tags: ["force", "endurance", "pectoraux", "triceps", "épaules"],
      exercices: [
        {
          id_exercice: 1,
          ordre_exercice: 1,
          duree: 5,
          repetitions: null,
          series: null,
        }, // Échauffement 5min
        {
          id_exercice: 2,
          ordre_exercice: 2,
          duree: 0,
          repetitions: 12,
          series: 3,
        }, // Développé couché
        {
          id_exercice: 3,
          ordre_exercice: 3,
          duree: 0,
          repetitions: 8,
          series: 4,
        }, // Dips sur chaise
        {
          id_exercice: 4,
          ordre_exercice: 4,
          duree: 0,
          repetitions: 10,
          series: 3,
        }, // Développé militaire
        {
          id_exercice: 5,
          ordre_exercice: 5,
          duree: 10,
          repetitions: null,
          series: null,
        }, // Étirements 10min
      ],
    },
    {
      nom: "Pull (Dos, Biceps)",
      id_user: admin.id_user,
      tags: ["force", "endurance", "dos", "biceps"],
      exercices: [
        {
          id_exercice: 1,
          ordre_exercice: 1,
          duree: 5,
          repetitions: null,
          series: null,
        }, // Échauffement 5min
        {
          id_exercice: 6,
          ordre_exercice: 2,
          duree: 0,
          repetitions: 8,
          series: 3,
        }, // Tractions assistées
        {
          id_exercice: 7,
          ordre_exercice: 3,
          duree: 0,
          repetitions: 12,
          series: 3,
        }, // Rowing haltères
        {
          id_exercice: 8,
          ordre_exercice: 4,
          duree: 0,
          repetitions: 14,
          series: 3,
        }, // Curl biceps
        {
          id_exercice: 5,
          ordre_exercice: 5,
          duree: 10,
          repetitions: null,
          series: null,
        }, // Étirements 10min
      ],
    },
    {
      nom: "Legs (Jambes, fessiers, mollets)",
      id_user: admin.id_user,
      tags: ["force", "endurance", "jambes", "fessiers", "mollets"],
      exercices: [
        {
          id_exercice: 1,
          ordre_exercice: 1,
          duree: 5,
          repetitions: null,
          series: null,
        }, // Échauffement 5min
        {
          id_exercice: 9,
          ordre_exercice: 2,
          duree: 0,
          repetitions: 12,
          series: 3,
        }, // Squat
        {
          id_exercice: 10,
          ordre_exercice: 3,
          duree: 0,
          repetitions: 12,
          series: 3,
        }, // Presse à jambes
        {
          id_exercice: 11,
          ordre_exercice: 4,
          duree: 0,
          repetitions: 15,
          series: 3,
        }, // Extension mollets debout
        {
          id_exercice: 5,
          ordre_exercice: 5,
          duree: 10,
          repetitions: null,
          series: null,
        }, // Étirements 10min
      ],
    },
    {
      nom: "Haut du corps (Pectoraux, biceps, abdominaux)",
      id_user: admin.id_user,
      tags: ["force", "volume", "pectoraux", "biceps", "abdominaux"],
      exercices: [
        {
          id_exercice: 1,
          ordre_exercice: 1,
          duree: 5,
          repetitions: null,
          series: null,
        }, // Échauffement 5min
        {
          id_exercice: 2,
          ordre_exercice: 2,
          duree: 0,
          repetitions: 12,
          series: 4,
        }, // Développé couché
        {
          id_exercice: 12,
          ordre_exercice: 3,
          duree: 0,
          repetitions: 14,
          series: 3,
        }, // Curl à la barre
        {
          id_exercice: 13,
          ordre_exercice: 4,
          duree: 1,
          repetitions: null,
          series: 1,
        }, // Gainage 1min
        {
          id_exercice: 5,
          ordre_exercice: 5,
          duree: 10,
          repetitions: null,
          series: null,
        }, // Étirements 10min
      ],
    },
    {
      nom: "Bas du corps (Cuisses, fessiers, mollets)",
      id_user: admin.id_user,
      tags: ["force", "volume", "jambes", "fessiers", "mollets"],
      exercices: [
        {
          id_exercice: 1,
          ordre_exercice: 1,
          duree: 5,
          repetitions: null,
          series: null,
        }, // Échauffement 5min
        {
          id_exercice: 9,
          ordre_exercice: 2,
          duree: 0,
          repetitions: 12,
          series: 4,
        }, // Squat
        {
          id_exercice: 11,
          ordre_exercice: 3,
          duree: 0,
          repetitions: 12,
          series: 4,
        }, // Extension mollets debout
        {
          id_exercice: 14,
          ordre_exercice: 4,
          duree: 0,
          repetitions: 12,
          series: 3,
        }, // Fentes
        {
          id_exercice: 5,
          ordre_exercice: 5,
          duree: 10,
          repetitions: null,
          series: null,
        }, // Étirements 10min
      ],
    },
    {
      nom: "Haut du corps (Dos, épaules, triceps)",
      id_user: admin.id_user,
      tags: ["force", "volume", "dos", "épaules", "triceps"],
      exercices: [
        {
          id_exercice: 1,
          ordre_exercice: 1,
          duree: 5,
          repetitions: null,
          series: null,
        }, // Échauffement 5min
        {
          id_exercice: 15,
          ordre_exercice: 2,
          duree: 0,
          repetitions: 10,
          series: 3,
        }, // Tractions
        {
          id_exercice: 3,
          ordre_exercice: 3,
          duree: 0,
          repetitions: 15,
          series: 4,
        }, // Dips sur chaise
        {
          id_exercice: 16,
          ordre_exercice: 4,
          duree: 0,
          repetitions: 8,
          series: 4,
        }, // Élévations latérales
        {
          id_exercice: 5,
          ordre_exercice: 5,
          duree: 10,
          repetitions: null,
          series: null,
        }, // Étirements 10min
      ],
    },
  ];

  // Création des séances et des associations
  for (const seance of seances) {
    const {
      tags: seanceTags,
      exercices: seanceExercices,
      ...seanceData
    } = seance;

    // Création de la séance
    const createdSeance = await prisma.seances.create({
      data: seanceData,
    });

    // Création des associations séance-tag
    for (const tagName of seanceTags) {
      if (tagsByName[tagName]) {
        await prisma.seances_tags.create({
          data: {
            id_seance: createdSeance.id_seance,
            id_tag: tagsByName[tagName],
          },
        });
      }
    }

    // Création des associations séance-exercice
    for (const exercice of seanceExercices) {
      await prisma.exercices_seances.create({
        data: {
          id_seance: createdSeance.id_seance,
          id_exercice: exercice.id_exercice,
          ordre_exercice: exercice.ordre_exercice,
          repetitions: exercice.repetitions,
          series: exercice.series,
          duree: exercice.duree,
        },
      });
    }
  }

  // Définition des programmes avec leurs tags et séances
  const programmes = [
    {
      nom: "PPL débutant 10|Programme PPL débutant sur 10 semaines pour développer force et endurance musculaire",
      id_user: admin.id_user,
      image: "/assets/images/programmes/1-PPL-Debutant.png",
      duree: 10, // 10 semaines
      tags: ["débutant", "force", "endurance", "full-body"],
      seances: [
        { id_seance: 1, ordre_seance: 1 }, // Push (Pectoraux, triceps, épaules)
        { id_seance: 2, ordre_seance: 2 }, // Pull (Dos, Biceps)
        { id_seance: 3, ordre_seance: 3 }, // Legs (Jambes, fessiers, mollets)
      ],
    },
    {
      nom: "Full Power 8|Routine intermédiaire de 8 semaines ciblant force, volume et équilibre musculaire",
      id_user: admin.id_user,
      image: "/assets/images/programmes/2-Full-Power-8.png",
      duree: 8, // 8 semaines
      tags: ["intermédiaire", "force", "volume", "full-body"],
      seances: [
        { id_seance: 4, ordre_seance: 1 }, // Haut du corps (Pectoraux, biceps, abdominaux)
        { id_seance: 5, ordre_seance: 2 }, // Bas du corps (Cuisses, fessiers, mollets)
        { id_seance: 6, ordre_seance: 3 }, // Haut du corps (Dos, épaules, triceps)
      ],
    },
  ];

  // Création des programmes et des associations
  for (const programme of programmes) {
    const {
      tags: programmeTags,
      seances: programmeSeances,
      ...programmeData
    } = programme;

    // Création du programme
    const createdProgramme = await prisma.programmes.create({
      data: programmeData,
    });

    // Création des associations programme-tag
    for (const tagName of programmeTags) {
      if (tagsByName[tagName]) {
        await prisma.programmes_tags.create({
          data: {
            id_programme: createdProgramme.id_programme,
            id_tag: tagsByName[tagName],
          },
        });
      }
    }

    // Création des associations programme-séance
    for (const seance of programmeSeances) {
      await prisma.seances_programmes.create({
        data: {
          id_programme: createdProgramme.id_programme,
          id_seance: seance.id_seance,
          ordre_seance: seance.ordre_seance,
        },
      });
    }
  }

  // Ajout des tags de type "aliment"
  const alimentTags = [
    "pâte-à-tartiner",
    "chocolat",
    "noisettes",
    "biscuits",
    "goûter",
    "fruits-sec",
    "snack",
    "noix",
    "salé",
    "salade",
    "végétarien",
    "avocat",
    "pâtes",
    "tomates",
    "mozzarella",
    "riz",
    "accompagnement",
    "cuisine-simple",
  ].map((nom) => ({ nom, type: "aliment" }));

  await prisma.tags.createMany({ data: alimentTags });

  // Mettre à jour le dictionnaire des tags avec les nouveaux tags alimentaires
  const allAlimentTags = await prisma.tags.findMany();
  allAlimentTags.forEach((tag) => {
    tagsByName[tag.nom] = tag.id_tag;
  });

  // Ajout des aliments de type "produit"
  const produits = [
    {
      image: "/assets/images/aliments/1-nutella-1kg.png",
      source: "admin",
      type: "produit",
      id_user: admin.id_user,
      nom: "Nutella - Ferrero - 1 kg",
      ingredients:
        "Sucre|Huile de palme|Noisettes 13%|Lait écrémé en poudre 8,7%|Cacao maigre 7,4%|Émulsifiants : lécithines [soja]|Vanilline. Sans gluten",
      calories: 539,
      proteines: 6.3,
      glucides: 57.5,
      lipides: 31.0,
      code_barres: "3017620425035",
      temps_preparation: 1,
      tags: ["pâte-à-tartiner", "chocolat", "noisettes"],
    },
    {
      image: "/assets/images/aliments/2-prince-100g.png",
      source: "admin",
      type: "produit",
      id_user: admin.id_user,
      nom: "Prince Goût Chocolat - LuMondelez - 100g",
      ingredients:
        "Céréale 50,7%(Farine de blé 35%,Farine de blé complète 15,7%)|Sucre|Huiles végétales(Palme,Colza)|Cacao maigre en poudre 4,5%|Sirop de glucose|Amidon de blé|Poudre à lever(Carbonate acide d'ammonium,Carbonate acide de sodium,Diphosphate disodique)|Émulsifiants(Lécithine de soja,Lécithine de tournesol)|Sel|Lait écrémé en poudre|Lactose et protéines de lait|Arômes. Peut contenir œuf.",
      calories: 467,
      proteines: 6.3,
      glucides: 69.0,
      lipides: 17.0,
      code_barres: "7622210449283",
      temps_preparation: 1,
      tags: ["biscuits", "chocolat", "goûter"],
    },
    {
      image: "/assets/images/aliments/3-fruits-secs-alesto-200g.png",
      source: "admin",
      type: "produit",
      id_user: admin.id_user,
      nom: "Mélange de fruits secs - Alesto - 200 g",
      ingredients:
        "25% noix|25% noisettes|25% noix de cajou|25% amandes blanchies",
      calories: 646,
      proteines: 20.4,
      glucides: 6.4,
      lipides: 58.0,
      code_barres: "20047238",
      temps_preparation: 1,
      tags: ["fruits-sec", "snack", "noix"],
    },
    {
      image: "/assets/images/aliments/4-pat-noisettes-bonne-maman-360g.png",
      source: "admin",
      type: "produit",
      id_user: admin.id_user,
      nom: "Pâte à tartiner noisettes et cacao - Bonne Maman - 360 g",
      ingredients:
        "Sucre|Noisettes 20%|Huiles végétales(Tournesol,Colza)|Lait écrémé en poudre|Cacao maigre en poudre 5,5%|Beurre de cacao|Émulsifiant : lécithine de tournesol|Extrait de vanille|Peut contenir d'autres fruits à coque",
      calories: 551,
      proteines: 6.7,
      glucides: 53.0,
      lipides: 34.0,
      code_barres: "3608580065340",
      temps_preparation: 1,
      tags: ["pâte-à-tartiner", "noisettes", "chocolat"],
    },
    {
      image: "/assets/images/aliments/5-tuc-100g.png",
      source: "admin",
      type: "produit",
      id_user: admin.id_user,
      nom: "Original - Tuc - 100 g",
      ingredients:
        "Farine de blé|Huile de palme|Sirop de glucose|Extrait de malt d'orge|Poudres à lever (Carbonates d'ammonium, Carbonates de sodium)|Sel|Œufs|Arôme|Agent de traitement de la farine (Disulfite de sodium)",
      calories: 482,
      proteines: 8.3,
      glucides: 67.0,
      lipides: 19.0,
      code_barres: "5410041001204",
      temps_preparation: 1,
      tags: ["biscuits", "snack", "salé"],
    },
  ];

  // Ajout des aliments de type "recette"
  const recettes = [
    {
      image: "/assets/images/aliments/6-salade-verte-avocat.png",
      source: "admin",
      type: "recette",
      id_user: admin.id_user,
      nom: "Salade verte à l'avocat",
      ingredients:
        "1/6 cuillère à soupe de jus de citron|Une pincée de sel|2/3 cuillère à soupe d'huile d'olive|1/6 petit bouquet de ciboulette finement hachée|33 g de feuilles de salade mélangées|1/3 avocat mûr tranché",
      description:
        "Pressez 1/6 cuillère à soupe de jus de citron dans un pot à confiture avec une pincée de sel|Versez 2/3 cuillère à soupe d'huile d'olive|Ajoutez 1/6 petit bouquet de ciboulette finement ciselée|Fermez le couvercle et secouez bien|Pour servir, mélangez avec 33 g de salade composée et 1/3 avocat mûr coupé en tranches.",
      calories: 193,
      proteines: 1.8,
      glucides: 7.0,
      lipides: 19.0,
      temps_preparation: 10,
      tags: ["salade", "végétarien", "avocat"],
    },
    {
      image: "/assets/images/aliments/7-pates-tomates-mozza.png",
      source: "admin",
      type: "recette",
      id_user: admin.id_user,
      nom: "Pâtes aux tomates et à la mozzarella",
      ingredients:
        "75g penne|83g tomates cerises coupées en 2|20ml de pesto|37g mozzarella fraîche coupée en morceaux|10ml d'huile d'olive|Sel poivre|2,5g de basilic frais déchiré|3,3g de parmesan râpé",
      description:
        "Préchauffer le four à 180°C (th.4)|Beurrer un plat à gratin peu profond de 2,5 à 3 litres|Cuire les penne dans de l'eau bouillante salée|Pendant ce temps, chauffer l'huile d'olive dans une casserole à feu moyen|Ajouter l'oignon et cuire environ 4 minutes jusqu'à ce qu'il devienne translucide|Ajouter l'ail et poursuivre la cuisson 1 minute|Ajouter les tomates, le basilic et l'origan à l'oignon et à l'ail|Cuire en remuant fréquemment jusqu'à ce que le mélange soit bien chaud|Goûter et assaisonner avec du sel et du poivre|Dans un grand saladier, mélanger les penne cuites et égouttées avec la sauce tomate et 16,7g de mozzarella râpée|Remuer pour bien mélanger les ingrédients|Verser le mélange de pâtes et de sauce dans le plat préparé|Saupoudrer avec les 16,7g restants de mozzarella râpée|Enfourner pendant 20 à 25 minutes, jusqu'à ce que les pâtes soient bien chaudes et que le fromage soit fondu et légèrement doré",
      calories: 585,
      proteines: 22.0,
      glucides: 62.0,
      lipides: 27.0,
      temps_preparation: 40,
      tags: ["pâtes", "tomates", "mozzarella"],
    },
    {
      image: "/assets/images/aliments/8-perfect-white-rice.png",
      source: "admin",
      type: "recette",
      id_user: admin.id_user,
      nom: "Riz blanc",
      ingredients:
        "1 tasse de riz blanc à longs grains|1/2 cuillère à café de sel",
      description:
        "Porter 375ml d'eau à ébullition dans une casserole moyenne|Incorporer le riz et le sel, puis porter de nouveau à ébullition à feu moyen-vif|Réduire à feu doux, couvrir et laisser cuire environ 16 minutes|Retirer du feu et laisser reposer à couvert pendant 10 minutes",
      calories: 176,
      proteines: 3.0,
      glucides: 39.0,
      lipides: 0.0,
      temps_preparation: 20,
      tags: ["riz", "accompagnement", "cuisine-simple"],
    },
  ];

  // Combinaison des produits et recettes
  const aliments = [...produits, ...recettes];

  // Création des aliments et des associations avec les tags
  for (const aliment of aliments) {
    const { tags: alimentTags, ...alimentData } = aliment;

    // Création de l'aliment
    const createdAliment = await prisma.aliments.create({
      data: alimentData,
    });

    // Création des associations aliment-tag
    for (const tagName of alimentTags) {
      if (tagsByName[tagName]) {
        await prisma.aliments_tags.create({
          data: {
            id_aliment: createdAliment.id_aliment,
            id_tag: tagsByName[tagName],
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
