const jwt = require('jsonwebtoken');

// Middleware de protection
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Accès non autorisé. Aucun token fourni.' });
  }

  try {
    // Décodage du token avec la clé secrète
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Ajoute les informations du token (id, rôle) à req.user
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide.' });
  }
};

module.exports = { protect };
