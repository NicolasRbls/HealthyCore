const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const adminService = require("./admin.service");

const adminController = {
  /**
    * Récupérer tous les utilisateurs avec pagination et recherche
   */
  async getUsers(req, res) {
    const { page = 1, limit = 10, search = "" } = req.query;
    console.log("Query params:", req.query);
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
  
    if (isNaN(pageNumber) || isNaN(limitNumber)) {
      return res.status(400).json({
        message: "Les paramètres de pagination doivent être des nombres valides.",
      });
    }
  
    try {
      // Appel de la logique métier via le service
      const { users, total } = await adminService.getPaginatedUsers({
        page: pageNumber,
        limit: limitNumber,
        search,
      });
  
      res.json({
        users,
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      });
    } catch (error) {
      res.status(500).json({
        message: "Erreur lors de la récupération des utilisateurs paginés",
        error,
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

  // Récupérer le nombre total d'utilisateurs
  async getTotalUserCount(req, res) {
    try {
      const count = await adminService.getUserCount();
      console.log("Total users count:", count);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération du nombre d'utilisateurs", error });
    }
  }

};

module.exports = adminController;
