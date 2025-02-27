const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const adminController = {
  /**
   * Récupérer tous les utilisateurs
   */
  async getAllUsers(req, res) {
    try {
      const users = await prisma.user.findMany();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs", error });
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
