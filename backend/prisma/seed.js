require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
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

  const objectifs = [
    {
      titre: "Ajouter un aliment à son suivi quotidien",
    },
    {
      titre: "Effectuer la séance du jour",
    },
  ];
  await prisma.objectifs.createMany({ data: objectifs });

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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
