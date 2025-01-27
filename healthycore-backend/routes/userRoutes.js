const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// Inscription
router.post(
  '/register',
  [
    body('prenom').notEmpty().withMessage('Le prénom est requis.'),
    body('nom').notEmpty().withMessage('Le nom est requis.'),
    body('email').isEmail().withMessage('L’email est invalide.'),
    body('mot_de_passe')
      .isLength({ min: 6 })
      .withMessage('Le mot de passe doit contenir au moins 6 caractères.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { prenom, nom, sexe, date_de_naissance, email, mot_de_passe } = req.body;

    try {
      const userExists = await User.findOne({ where: { email } });
      if (userExists) return res.status(400).json({ message: 'Cet email est déjà utilisé.' });

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(mot_de_passe, salt);

      const user = await User.create({
        prenom,
        nom,
        sexe,
        date_de_naissance,
        email,
        mot_de_passe: hashedPassword,
      });

      res.status(201).json({
        message: 'Utilisateur créé avec succès !',
        user: {
          id_user: user.id_user,
          prenom: user.prenom,
          nom: user.nom,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'Erreur du serveur', error });
    }
  }
);

// Connexion
router.post('/login', async (req, res) => {
  const { email, mot_de_passe } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });

    const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!isMatch) return res.status(401).json({ message: 'Mot de passe incorrect.' });

    const token = generateToken(user.id_user, user.role);
    res.json({ token, message: 'Connexion réussie' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur du serveur', error });
  }
});

router.post('/refresh', protect, (req, res) => {
    const token = generateToken(req.user.id, req.user.role);
    res.json({ token, message: 'Token rafraîchi avec succès.' });
  });
  



// ------------------------------------------Endpoint de test-----------------------------------------------

router.post('/test', async (req, res) => {
    try {
      const user = await User.create({
        prenom: 'John',
        nom: 'Doe',
        sexe: 'M',
        date_de_naissance: '1990-01-01',
        email: 'johndoe@example.com',
        mot_de_passe: 'hashed_password', // Remplacer par un vrai hash
      });
  
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la création de l’utilisateur', error: error.message });
    }
  });


module.exports = router;
