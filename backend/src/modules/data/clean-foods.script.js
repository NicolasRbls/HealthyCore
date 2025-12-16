const { PrismaClient } = require("@prisma/client");
const { isFrenchText, validateNutritionalData } = require("../../utils/language.utils");

const prisma = new PrismaClient();

/**
 * Analyse et nettoyage des aliments en base
 */
async function cleanFoodDatabase() {
  console.log("🔍 Analyse des aliments...\n");

  // Récupérer tous les aliments
  const aliments = await prisma.aliments.findMany({
    select: {
      id_aliment: true,
      nom: true,
      type: true,
      calories: true,
      proteines: true,
      glucides: true,
      lipides: true,
      description: true,
      ingredients: true,
    },
  });

  const toDelete = [];
  const stats = {
    total: aliments.length,
    nomVide: 0,
    nonFrancais: 0,
    nutritionInvalide: 0,
  };

  // Analyser chaque aliment
  aliments.forEach(aliment => {
    let shouldDelete = false;

    // 1. Nom vide
    if (!aliment.nom || aliment.nom.trim() === "") {
      stats.nomVide++;
      shouldDelete = true;
    }
    // 2. Nom non français
    else if (!isFrenchText(aliment.nom)) {
      stats.nonFrancais++;
      shouldDelete = true;
      console.log(`❌ Non FR: "${aliment.nom}"`);
    }
    // 3. Description non française (si présente)
    else if (aliment.description && aliment.description.length > 10 && !isFrenchText(aliment.description)) {
      stats.nonFrancais++;
      shouldDelete = true;
      console.log(`❌ Desc non FR: "${aliment.nom}"`);
    }
    // 4. Données nutritionnelles invalides
    else if (!validateNutritionalData(aliment)) {
      stats.nutritionInvalide++;
      shouldDelete = true;
      console.log(`⚠️  Nutrition invalide: "${aliment.nom}"`);
    }

    if (shouldDelete) {
      toDelete.push(aliment.id_aliment);
    }
  });

  // Rapport
  console.log("\n" + "=".repeat(50));
  console.log("📊 RÉSULTATS");
  console.log("=".repeat(50));
  console.log(`Total aliments: ${stats.total}`);
  console.log(`Noms vides: ${stats.nomVide}`);
  console.log(`Non français: ${stats.nonFrancais}`);
  console.log(`Nutrition invalide: ${stats.nutritionInvalide}`);
  console.log(`\n➡️  À supprimer: ${toDelete.length} aliments`);
  console.log("=".repeat(50));

  // Confirmation
  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    if (toDelete.length === 0) {
      console.log("\n✅ Aucun aliment à supprimer !");
      readline.close();
      resolve();
      return;
    }

    readline.question("\n⚠️  Confirmer la suppression ? (oui/non): ", async (answer) => {
      if (answer.toLowerCase() === "oui") {
        console.log("\n🗑️  Suppression en cours...");
        
        const result = await prisma.aliments.deleteMany({
          where: {
            id_aliment: { in: toDelete },
          },
        });

        console.log(`✅ ${result.count} aliments supprimés avec succès !`);
      } else {
        console.log("❌ Annulé.");
      }

      readline.close();
      resolve();
    });
  });
}

// Exécution
cleanFoodDatabase()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error("❌ Erreur:", error);
    prisma.$disconnect();
    process.exit(1);
  });