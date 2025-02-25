/**
 * Service de calcul nutritionnel et énergétique
 */

// Calcul du BMR (Basal Metabolic Rate) selon la formule de Mifflin-St Jeor
const calculateBMR = (weight, height, gender, age) => {
  if (gender === "H") {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
};

// Calcul du TDEE (Total Daily Energy Expenditure)
const calculateTDEE = (bmr, activityFactor) => {
  return bmr * activityFactor;
};

// Calcul des calories quotidiennes pour la perte de poids
const calculateWeightLossCalories = (tdee, factor = 0.9) => {
  return tdee * factor;
};

// Calcul des calories quotidiennes pour la prise de poids
const calculateWeightGainCalories = (tdee, factor = 1.1) => {
  return tdee * factor;
};

// Calcul du déficit calorique total pour la perte de poids
const calculateTotalCaloricDeficit = (weightLossTarget) => {
  // 1kg de gras correspond environ à 7700 kcal
  return Math.abs(weightLossTarget) * 7700;
};

// Calcul du surplus calorique total pour la prise de poids
const calculateTotalCaloricSurplus = (weightGainTarget) => {
  // 1kg de poids (pas seulement du muscle) correspond environ à 7700 kcal
  return weightGainTarget * 7700;
};

// Calcul du déficit calorique quotidien
const calculateDailyCaloricDeficit = (tdee, dailyCalories) => {
  return tdee - dailyCalories;
};

// Calcul du surplus calorique quotidien
const calculateDailyCaloricSurplus = (dailyCalories, tdee) => {
  return dailyCalories - tdee;
};

// Calcul du nombre de jours nécessaires pour atteindre l'objectif
const calculateDaysToGoal = (totalCaloricChange, dailyCaloricChange) => {
  // Si le changement calorique quotidien est trop petit, éviter division par zéro
  if (Math.abs(dailyCaloricChange) < 1) {
    return 0;
  }
  return Math.ceil(totalCaloricChange / dailyCaloricChange);
};

// Calcul du nombre de semaines nécessaires pour atteindre l'objectif
const calculateWeeksToGoal = (days) => {
  return Math.ceil(days / 7);
};

// Estimation complète pour la perte ou la prise de poids
const calculateWeightChangeEstimation = (
  currentWeight,
  targetWeight,
  height,
  gender,
  age,
  activityFactor
) => {
  // Calcul du BMR
  const bmr = calculateBMR(currentWeight, height, gender, age);

  // Calcul du TDEE
  const tdee = calculateTDEE(bmr, activityFactor);

  // Différence de poids
  const weightDiff = targetWeight - currentWeight;

  // Si le poids cible est égal au poids actuel (maintien)
  if (Math.abs(weightDiff) < 0.1) {
    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      dailyCalories: Math.round(tdee),
      caloricAdjustment: 0,
      estimatedDays: 0,
      estimatedWeeks: 0,
      weeklyChange: 0,
      orientation: "maintain", // Nouvelle valeur pour le maintien
    };
  }

  // Orientation (perte ou gain)
  const isWeightLoss = weightDiff < 0;

  let caloricAdjustment, dailyCalories, totalCaloricChange, dailyCaloricChange;

  if (isWeightLoss) {
    // Perte de poids
    dailyCalories = calculateWeightLossCalories(tdee);
    caloricAdjustment = dailyCalories - tdee; // Sera négatif
    totalCaloricChange = calculateTotalCaloricDeficit(weightDiff);
    dailyCaloricChange = calculateDailyCaloricDeficit(tdee, dailyCalories);
  } else {
    // Prise de poids
    dailyCalories = calculateWeightGainCalories(tdee);
    caloricAdjustment = dailyCalories - tdee; // Sera positif
    totalCaloricChange = calculateTotalCaloricSurplus(weightDiff);
    dailyCaloricChange = calculateDailyCaloricSurplus(dailyCalories, tdee);
  }

  // Nombre de jours et de semaines
  const daysToGoal = calculateDaysToGoal(
    totalCaloricChange,
    Math.abs(dailyCaloricChange)
  );
  const weeksToGoal = calculateWeeksToGoal(daysToGoal);

  // Taux de changement hebdomadaire (en kg)
  const weeklyChange =
    daysToGoal === 0
      ? 0
      : isWeightLoss
      ? -Math.abs(weightDiff) / weeksToGoal
      : Math.abs(weightDiff) / weeksToGoal;

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    dailyCalories: Math.round(dailyCalories),
    caloricAdjustment: Math.round(caloricAdjustment),
    estimatedDays: daysToGoal,
    estimatedWeeks: weeksToGoal,
    weeklyChange: parseFloat(weeklyChange.toFixed(2)),
    orientation: isWeightLoss ? "loss" : "gain",
  };
};

// Calcul de l'IMC (Indice de Masse Corporelle)
const calculateBMI = (weight, height) => {
  // height en cm, convertir en mètres
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};

// Validation du poids cible en fonction de l'IMC
const validateTargetWeight = (targetWeight, height) => {
  const targetBMI = calculateBMI(targetWeight, height);

  // IMC sain entre 18.5 et 30 (ou autre plage selon vos critères)
  const isTargetBMIValid = targetBMI >= 18.5 && targetBMI <= 30;

  return {
    targetBMI: parseFloat(targetBMI.toFixed(1)),
    isValid: isTargetBMIValid,
    message: isTargetBMIValid
      ? "Poids cible valide"
      : "Le poids cible résulterait en un IMC non recommandé",
  };
};

// Calcul de la répartition des macronutriments en fonction des calories quotidiennes
const calculateMacroDistribution = (
  dailyCalories,
  carbsPercentage,
  proteinPercentage,
  fatPercentage
) => {
  // 1g de glucides = 4 calories
  // 1g de protéines = 4 calories
  // 1g de lipides = 9 calories

  const carbsCalories = dailyCalories * (carbsPercentage / 100);
  const proteinCalories = dailyCalories * (proteinPercentage / 100);
  const fatCalories = dailyCalories * (fatPercentage / 100);

  const carbsGrams = Math.round(carbsCalories / 4);
  const proteinGrams = Math.round(proteinCalories / 4);
  const fatGrams = Math.round(fatCalories / 9);

  return {
    carbs: {
      percentage: carbsPercentage,
      calories: Math.round(carbsCalories),
      grams: carbsGrams,
    },
    protein: {
      percentage: proteinPercentage,
      calories: Math.round(proteinCalories),
      grams: proteinGrams,
    },
    fat: {
      percentage: fatPercentage,
      calories: Math.round(fatCalories),
      grams: fatGrams,
    },
  };
};

module.exports = {
  calculateBMR,
  calculateTDEE,
  calculateWeightLossCalories,
  calculateWeightGainCalories,
  calculateTotalCaloricDeficit,
  calculateTotalCaloricSurplus,
  calculateDailyCaloricDeficit,
  calculateDailyCaloricSurplus,
  calculateDaysToGoal,
  calculateWeeksToGoal,
  calculateWeightChangeEstimation,
  calculateBMI,
  validateTargetWeight,
  calculateMacroDistribution,
};
