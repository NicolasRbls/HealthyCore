/**
 * Détecte si un texte est en français
 */
const isFrenchText = (text) => {
  if (!text || typeof text !== "string" || text.trim().length < 3) {
    return false;
  }

  const cleanText = text.toLowerCase();
  
  // Caractères français spécifiques
  const hasFrenchChars = /[àâäæçéèêëïîôùûüÿœ]/.test(cleanText);
  
  // Mots français courants
  const frenchWords = ['le', 'la', 'les', 'de', 'des', 'du', 'et', 'avec', 'sans', 'pour', 'au'];
  const hasFrenchWords = frenchWords.some(word => 
    cleanText.includes(` ${word} `) || 
    cleanText.startsWith(`${word} `) || 
    cleanText.endsWith(` ${word}`)
  );

  // Mots anglais courants (exclusion)
  const englishWords = ['the', 'and', 'with', 'from', 'pack', 'organic'];
  const hasEnglishWords = englishWords.some(word => 
    cleanText.includes(` ${word} `)
  );

  // Décision: français si chars spéciaux OU mots français ET pas de mots anglais
  return (hasFrenchChars || hasFrenchWords) && !hasEnglishWords;
};

/**
 * Valide la cohérence nutritionnelle
 */
const validateNutritionalData = (aliment) => {
  const cal = Number(aliment.calories) || 0;
  const prot = Number(aliment.proteines) || 0;
  const carb = Number(aliment.glucides) || 0;
  const fat = Number(aliment.lipides) || 0;

  // Valeurs négatives
  if (cal < 0 || prot < 0 || carb < 0 || fat < 0) {
    return false;
  }

  // Valeurs aberrantes pour produits (base 100g)
  if (aliment.type === "produit") {
    if (prot > 100 || carb > 100 || fat > 100) {
      return false;
    }
  }

  // Cohérence calorique (marge 25%)
  const calCalculees = (prot * 4) + (carb * 4) + (fat * 9);
  const ecart = Math.abs(cal - calCalculees);
  const tolerance = calCalculees * 0.25;

  if (cal > 10 && ecart > tolerance) {
    return false;
  }

  return true;
};

module.exports = { isFrenchText, validateNutritionalData };