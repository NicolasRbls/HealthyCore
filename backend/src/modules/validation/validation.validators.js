const { body, validationResult } = require("express-validator");
const { ValidationError } = require("../../utils/response.utils");

/**
 * Middleware pour valider l'email lors de la vérification de disponibilité
 */
exports.validateEmailCheck = [
  body("email")
    .notEmpty()
    .withMessage("L'email est requis")
    .isEmail()
    .withMessage("Format d'email invalide"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((err) => err.msg);
      return next(
        new ValidationError("Validation de l'email échouée", {
          email: errorMessages,
        })
      );
    }
    next();
  },
];

/**
 * Middleware pour valider les données du profil
 */
exports.validateProfileData = [
  body("firstName")
    .notEmpty()
    .withMessage("Le prénom est requis")
    .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s-]+$/)
    .withMessage("Format de prénom invalide"),

  body("lastName")
    .notEmpty()
    .withMessage("Le nom est requis")
    .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s-]+$/)
    .withMessage("Format de nom invalide"),

  body("email")
    .notEmpty()
    .withMessage("L'email est requis")
    .isEmail()
    .withMessage("Format d'email invalide"),

  body("password")
    .notEmpty()
    .withMessage("Le mot de passe est requis")
    .isLength({ min: 8 })
    .withMessage("Le mot de passe doit contenir au moins 8 caractères"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = {};
      errors.array().forEach((err) => {
        formattedErrors[err.path] = err.msg;
      });
      return next(
        new ValidationError("Validation du profil échouée", formattedErrors)
      );
    }
    next();
  },
];

/**
 * Fonction auxiliaire pour valider les données physiques
 * Note: Nous utilisons encore le middleware existant dans ./middleware/validation.middleware.js
 * mais nous pourrions migrer cette logique ici à l'avenir
 */
exports.validatePhysicalDataFuture = [
  // Cette fonction est un placeholder pour le moment
  // Le middleware existant validatePhysical est encore utilisé
  body("gender").isIn(["H", "F", "NS"]).withMessage("Genre invalide"),

  body("birthDate")
    .notEmpty()
    .withMessage("La date de naissance est requise")
    .isDate()
    .withMessage("Format de date invalide"),

  body("weight")
    .notEmpty()
    .withMessage("Le poids est requis")
    .isNumeric()
    .withMessage("Le poids doit être un nombre")
    .custom((value) => value > 0 && value < 500)
    .withMessage("Poids invalide (doit être inférieur à 500kg)"),

  body("height")
    .notEmpty()
    .withMessage("La taille est requise")
    .isNumeric()
    .withMessage("La taille doit être un nombre")
    .custom((value) => value > 0 && value < 300)
    .withMessage("Taille invalide (doit être inférieure à 300cm)"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = {};
      errors.array().forEach((err) => {
        formattedErrors[err.path] = err.msg;
      });
      return next(
        new ValidationError(
          "Validation des données physiques échouée",
          formattedErrors
        )
      );
    }
    next();
  },
];

/**
 * Fonction auxiliaire pour valider le poids cible
 * Note: Nous utilisons encore le middleware existant dans ./middleware/validation.middleware.js
 * mais nous pourrions migrer cette logique ici à l'avenir
 */
exports.validateTargetWeightFuture = [
  // Cette fonction est un placeholder pour le moment
  // Le middleware existant validateTargetWeight est encore utilisé
];
