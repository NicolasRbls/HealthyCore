const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const adminController = {
  /**
   * Récupérer le nombre d'utilisateurs (hors admin)
   */
  async getUsersCount(req, res) {
    try {
      const count = await prisma.user.count({
        where: {
          role: {
            not: "ADMIN"
          }
        }
      });
      
      res.json({ count });
    } catch (error) {
      res.status(500).json({ 
        message: "Erreur lors de la récupération du nombre d'utilisateurs", 
        error: error.message 
      });
    }
  },

  /**
   * Récupérer tous les utilisateurs avec pagination et recherche
   */
  async getAllUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || "";
      const skip = (page - 1) * limit;

      // Construire les conditions de recherche
      const whereCondition = search 
        ? {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } }
            ]
          }
        : {};

      // Récupérer les utilisateurs avec pagination et filtres
      const users = await prisma.user.findMany({
        where: whereCondition,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          // Omettre le mot de passe et autres données sensibles
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Obtenir le nombre total pour la pagination
      const total = await prisma.user.count({
        where: whereCondition
      });

      // Calculer la pagination
      const totalPages = Math.ceil(total / limit);

      res.json({
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages
        }
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Erreur lors de la récupération des utilisateurs", 
        error: error.message 
      });
    }
  },

  /**
   * Récupérer un utilisateur par ID
   */
  async getUserById(req, res) {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) return res.status(400).json({ message: "ID utilisateur invalide" });

    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération de l'utilisateur", error });
    }
  },

  /**
   * Mettre à jour un utilisateur
   */
  async updateUser(req, res) {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) return res.status(400).json({ message: "ID utilisateur invalide" });

    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: req.body, // Attention à bien valider les entrées
      });

      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur", error });
    }
  },

  /**
   * Supprimer un utilisateur
   */
  async deleteUser(req, res) {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) return res.status(400).json({ message: "ID utilisateur invalide" });

    try {
      await prisma.user.delete({ where: { id: userId } });
      res.json({ message: "Utilisateur supprimé avec succès" });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur", error });
    }
  },
};

module.exports = adminController;
